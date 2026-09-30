import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5haTZYxE6yTZ7GVtkyTUUIUea32jhU3M",
  authDomain: "waste-management-roorkee.firebaseapp.com",
  projectId: "waste-management-roorkee",
  storageBucket: "waste-management-roorkee.firebasestorage.app",
  messagingSenderId: "463404426700",
  appId: "1:463404426700:web:2cc7b2cb60f82fa6e02969",
  measurementId: "G-PHY4ZS71C9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
