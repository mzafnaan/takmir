import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { adminDb, adminAuth } from '@/services/firebase/admin';
import { generateHTMLKas } from '@/lib/pdf/templateKas';

// Konfigurasi limit render (Proteksi memory dan timeout Serverless)
const MAX_RECORDS = 300;

interface KasRecord {
  id: string;
  tanggal: Date;
  keterangan: string;
  jenis: string;
  jumlah: number;
  kategori?: string;
}

export async function GET(request: Request) {
  try {
    // === 1. VERIFIKASI KEAMANAN (TOKEN & ROLE) ===
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Harap sertakan Access Token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err: unknown) {
      return NextResponse.json({ error: 'Unauthorized: Token invalid atau expired' }, { status: 401 });
    }

    // Role Validation: Mengecek apakah UID/email ada di collection 'users' dan rolenya memiliki akses
    // Di project ini, doc ID di firestore bukan berarti sama dengan Firebase Auth UID. Harus di-query.
    let isAllowed = false;
    if (decodedToken.email) {
      const userQuery = await adminDb.collection('users').where('email', '==', decodedToken.email).get();
      if (!userQuery.empty) {
        const userData = userQuery.docs[0].data();
        const role = userData?.role?.toLowerCase();
        isAllowed = role === 'admin' || role === 'ketua' || role === 'bendahara'; 
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden: Hubungi Ketua atau Bendahara untuk akses mencetak laporan' }, { status: 403 });
    }

    // === 2. VALIDASI PARAMETER ===
    const { searchParams } = new URL(request.url);
    const bln = searchParams.get('bulan');
    const thn = searchParams.get('tahun');

    if (!bln || !thn) {
      return NextResponse.json({ error: 'Parameter bulan dan tahun wajb diisi' }, { status: 400 });
    }

    const bulan = parseInt(bln, 10);
    const tahun = parseInt(thn, 10);
    if (isNaN(bulan) || isNaN(tahun) || bulan < 1 || bulan > 12) {
      return NextResponse.json({ error: 'Format bulan/tahun tidak valid' }, { status: 400 });
    }

    // === 3. KONEKSI & OPTIMASI QUERY FIRESTORE ===
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

    const snapshot = await adminDb.collection('kas')
      .where('tanggal', '>=', startDate)
      .where('tanggal', '<=', endDate)
      .orderBy('tanggal', 'asc')
      .limit(MAX_RECORDS + 1) // Cek apakah melebihi batas (MAX+1)
      .get();
      
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Tidak ada data transaksi kas pada periode tersebut' }, { status: 404 });
    }

    if (snapshot.size > MAX_RECORDS) {
      return NextResponse.json({ 
        error: `Data terlalu besar untuk di-render. Maksimal ${MAX_RECORDS} record dalam 1 bulan pada Server.` 
      }, { status: 413 }); // Payload Too Large
    }

    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    const kasData: KasRecord[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // admin sdk menggunakan Timestamp
      const dateVal = data.tanggal?.toDate ? data.tanggal.toDate() : new Date(data.tanggal);
      
      kasData.push({
        id: doc.id,
        tanggal: dateVal,
        keterangan: data.keterangan ?? '',
        jenis: data.jenis ?? '',
        jumlah: data.jumlah ?? 0,
        kategori: data.kategori,
      });
      if (data.jenis === 'Pemasukan') totalPemasukan += data.jumlah;
      if (data.jenis === 'Pengeluaran') totalPengeluaran += data.jumlah;
    });

    const saldoAkhir = totalPemasukan - totalPengeluaran;

    // === 4. SETUP GENERASI TEMPLATE & PUPPETEER ===
    const htmlContent = generateHTMLKas(kasData, bln, thn, totalPemasukan, totalPengeluaran, saldoAkhir);

    // Dynamic Executable - Untuk mendukung local env vs serverless Vercel
    const executablePath = process.env.NODE_ENV === 'development' 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Sesuaikan path lokasi chrome di setup lokal Anda
      : await chromium.executablePath(); 

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    // Tunggu sampai DOM selesai dirender
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); 
    
    // Konversi langsung PDF dan tampung dalam memory buffer 
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
    });

    await browser.close();

    // === 5. RESPON KE USER (STREAMING) & CACHING ===
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Laporan_Kas_${bln}_${thn}.pdf"`,
        // CDN Edge Caching: PDF valid disimpan Vercel 1 Hari
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200', 
      },
    });

  } catch (error: unknown) {
    console.error('API Laporan Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Gagal membuat Laporan PDF', details: message }, { status: 500 });
  }
}
