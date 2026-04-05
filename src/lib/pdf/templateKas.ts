interface KasItem {
  tanggal: Date | string;
  keterangan: string;
  jenis: string;
  jumlah: number;
}

export const generateHTMLKas = (data: KasItem[], bulan: string, tahun: string, totalPemasukan: number, totalPengeluaran: number, saldoAkhir: number) => {
  const tableRows = data.map((item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
      <td>${item.keterangan || '-'}</td>
      <td class="text-right">${item.jenis === 'Pemasukan' ? formatRupiah(item.jumlah) : '-'}</td>
      <td class="text-right">${item.jenis === 'Pengeluaran' ? formatRupiah(item.jumlah) : '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; padding: 25px; font-size: 13px; color: #333; }
        h1, h2, h3 { text-align: center; margin: 5px 0; color: #111; }
        .header { margin-bottom: 25px; border-bottom: 2px solid #222; padding-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f7f9fc; color: #333; font-weight: 600; text-align: center; }
        .text-right { text-align: right; }
        .summary-row { font-weight: bold; background-color: #f7f9fc; }
        .footer { font-size: 10px; color: #777; text-align: right; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Laporan Kas Masjid</h1>
        <h2>Periode: ${bulan} / ${tahun}</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th width="5%">No</th>
            <th width="15%">Tanggal</th>
            <th width="40%">Keterangan</th>
            <th width="20%">Pemasukan</th>
            <th width="20%">Pengeluaran</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="summary-row">
            <td colspan="3" class="text-right">Total Mutasi Bulan Ini</td>
            <td class="text-right">${formatRupiah(totalPemasukan)}</td>
            <td class="text-right">${formatRupiah(totalPengeluaran)}</td>
          </tr>
          <tr class="summary-row">
            <td colspan="4" class="text-right">Saldo Per-Akhir Bulan Ini</td>
            <td class="text-right">${formatRupiah(saldoAkhir)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        Dicetak otomatis oleh Sistem Takmir pada: ${new Date().toLocaleString('id-ID')} WIB
      </div>
    </body>
    </html>
  `;
};

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};
