import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZWcNCKDtDCPjD1FwF5aOW80w7kEThqTc",
  authDomain: "react-to-do-list-74499.firebaseapp.com",
  projectId: "react-to-do-list-74499",
  storageBucket: "react-to-do-list-74499.firebasestorage.app",
  messagingSenderId: "365139907497",
  appId: "1:365139907497:web:42f60cdbb8f7a45460eab8",
  measurementId: "G-8KY4F2CDV2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };