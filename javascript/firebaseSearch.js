// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy9EsQ9Td4ZXbE4WNKTjfCFDjQVpnzjSY",
  authDomain: "hunt-and-gather-87d08.firebaseapp.com",
  projectId: "hunt-and-gather-87d08",
  storageBucket: "hunt-and-gather-87d08.firestorage.app",
  messagingSenderId: "524226195507",
  appId: "1:524226195507:web:abbed7295a1ec89431f346",
  measurementId: "G-CZLRGYD7DZ",
  databaseURL: "https://hunt-and-gather-87d08-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const realtimeDb = getDatabase();

// Search functionality for posts in Firestore
const searchQuery = async (searchTerm) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where("title", ">=", searchTerm), where("title", "<=", searchTerm + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const posts = [];

    // Fetch posts and their associated images
    for (const doc of querySnapshot.docs) {
      const postData = doc.data();
      const imageId = postData.imageId;

      // Fetch image data from Realtime Database
      const imageRef = ref(realtimeDb, 'images/' + imageId);
      const imageSnapshot = await get(imageRef);
      const imageUrl = imageSnapshot.exists() ? imageSnapshot.val().imageUrl : '';

      posts.push({
        id: doc.id,
        ...postData,
        imageUrl, // Add the image URL to post data
      });
    }

    return posts;
  } catch (error) {
    console.error("Error occurred during search query:", error);
    throw new Error("Error searching posts. Please try again later.");
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

  try {
    const results = await searchQuery(searchTerm);
    console.log("Search results:", results);

    // Example of how to render results (modify according to your needs)
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ""; // Clear existing results
    results.forEach(post => {
      const postElement = document.createElement('div');
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="width:100px;" />` : ''}
      `;
      resultsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error("Search error:", error.message);
  }
};

// Event listener for search form submission
document.getElementById('search-form').addEventListener('submit', handleSearch);
