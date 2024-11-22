// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy9EsQ9Td4ZXbE4WNKTjfCFDjQVpnzjSY",
  authDomain: "hunt-and-gather-87d08.firebaseapp.com",
  projectId: "hunt-and-gather-87d08",
  storageBucket: "hunt-and-gather-87d08.appspot.com",
  messagingSenderId: "524226195507",
  appId: "1:524226195507:web:abbed7295a1ec89431f346",
  measurementId: "G-CZLRGYD7DZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Search both posts and users in Firebase Firestore
const searchQuery = async (searchTerm) => {
  try {
    const postsRef = firebase.firestore().collection('posts');
    const usersRef = firebase.firestore().collection('users');

    // Search in both posts and users collections
    const postsSnapshot = await postsRef
      .where("title", ">=", searchTerm)
      .where("title", "<=", searchTerm + '\uf8ff') // To get results that match searchTerm
      .get();

    const usersSnapshot = await usersRef
      .where("username", ">=", searchTerm)
      .where("username", "<=", searchTerm + '\uf8ff') // To match the username
      .get();

    // Combine posts and users into a single result array
    const results = [];
    postsSnapshot.forEach(doc => {
      results.push({ type: 'post', data: doc.data() });
    });
    usersSnapshot.forEach(doc => {
      results.push({ type: 'user', data: doc.data() });
    });

    return results;
  } catch (error) {
    console.error("Error occurred during search query:", error); // Detailed error log
    throw new Error("Error searching. Please try again later."); // Propagate error
  }
};

// Function to handle the search input
const handleSearch = async (event) => {
  event.preventDefault();

  const searchTerm = document.getElementById('search-input').value.trim();
  
  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }
};
