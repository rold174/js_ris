// src/firebase/config.ts
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, get, query, orderByChild, equalTo, set, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAwmmg7sn1EUhMt5LanR3jZNJEPmL6qXDA",
  authDomain: "risovalka-7cc7c.firebaseapp.com",
  databaseURL: "https://risovalka-7cc7c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "risovalka-7cc7c",
  storageBucket: "risovalka-7cc7c.firebasestorage.app",
  messagingSenderId: "695313886188",
  appId: "1:695313886188:web:0d8ee6363d6141b5282ec9",
  measurementId: "G-CYWTK40462"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
//const analytics = getAnalytics(app);

export { database, ref, push, get, query, orderByChild, equalTo, set, update, remove };


