// Import the Firebase modules
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the default app if already initialized
}

const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const realtimeDb = getDatabase();

// Fetch and render posts
const renderPosts = async () => {
  try {
    const postsRef = collection(db, "posts");
    const querySnapshot = await getDocs(postsRef);
    const postsContainer = document.querySelector(".container");

    // Loop through the posts in Firestore
    for (const doc of querySnapshot.docs) {
      const postData = doc.data();
      const imageId = postData.imageId; // Get the image ID

      // Fetch the image URL from Realtime Database
      const imageRef = ref(realtimeDb, 'images/' + imageId);
      const imageSnapshot = await get(imageRef);
      const imageUrl = imageSnapshot.exists() ? imageSnapshot.val().imageUrl : '';

      // Create the post element
      const postElement = document.createElement('div');
      postElement.classList.add('post');
      postElement.innerHTML = `
        <img src="${imageUrl || 'https://via.placeholder.com/800x400'}" alt="Post Image">
        <div class="post-details">
            <span class="caption">${postData.title}</span>
            <span class="location">Location: ${postData.location || 'Unknown'}</span>
        </div>
        <div class="post-details">
            <span class="description"> ${postData.description}</span>
        </div>
        <div class="comments-section">
            <h3>Comments:</h3>
            <input type="text" placeholder="Add a comment...">
        </div>
      `;
      postsContainer.appendChild(postElement);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Load the posts when the page is ready
document.addEventListener("DOMContentLoaded", () => {
  renderPosts();
});
