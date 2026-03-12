const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBU57wvc0jbI1YQwbx4NzpWzk2OIhr2hIc",
  authDomain: "takmirmasjid-f2864.firebaseapp.com",
  projectId: "takmirmasjid-f2864",
  storageBucket: "takmirmasjid-f2864.firebasestorage.app",
  messagingSenderId: "284396758440",
  appId: "1:284396758440:web:7ba95d8fa4d0032781e99d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Fetching users...");
    const querySnapshot = await getDocs(collection(db, 'users'));
    console.log('Got docs:', querySnapshot.size);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
