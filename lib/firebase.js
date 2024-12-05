import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDOM4QyZ-E46QYgkZ2G0QgvmK7g0JWGo3E",
  authDomain: "bed-management-system-sansani.firebaseapp.com",
  projectId: "bed-management-system-sansani",
  storageBucket: "bed-management-system-sansani.firebasestorage.app",
  messagingSenderId: "56062433281",
  appId: "1:56062433281:web:5a45f880d250b58c1ac800",
  measurementId: "G-DHRVMKJT5N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

export { auth, db };
