// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Function to convert image to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Post Creation Function with Image and Location
async function createPost(title, description, imageFile, location) {
  const user = auth.currentUser;
  if (!user) {
    console.error("You need to be logged in to create a post");
    return;
  }

  // Initialize post data
  const postData = {
    title,
    description,
    authorUid: user.uid,
    authorEmail: user.email,
    likes: 0,
    comments: [],
    timestamp: serverTimestamp(),
    location: location || "",
  };

  // Convert image to base64 and store it in Realtime Database
  let imageUrl = '';
  if (imageFile) {
    try {
      imageUrl = await toBase64(imageFile);
      // Save image base64 string in Realtime Database
      const imageId = Date.now(); // Using timestamp as unique image ID
      const imageRef = ref(realtimeDb, 'images/' + imageId);
      await set(imageRef, { imageUrl });

      // Store image reference (image ID) in Firestore post data
      postData.imageId = imageId;
    } catch (error) {
      console.error("Error converting image to base64:", error.message);
      throw error;
    }
  }

  // Save post data to Firestore
  try {
    const postsCollection = collection(db, "posts");
    const postRef = await addDoc(postsCollection, postData);
    console.log("Post created with ID:", postRef.id);
  } catch (error) {
    console.error("Error creating post:", error.message);
    throw error;
  }
}

// Event listener for form submission
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submitPost").addEventListener("click", async () => {
    const title = document.getElementById("postTitle").value;
    const description = document.getElementById("postDescription").value;
    const location = document.getElementById("postLocation").value;
    const imageFile = document.getElementById("postImage").files[0];

    // Clear feedback message
    const postMessage = document.getElementById("postMessage");
    postMessage.style.display = "none";

    if (!title || !description) {
      postMessage.style.color = "red";
      postMessage.style.display = "block";
      postMessage.textContent = "Both title and description are required!";
      return;
    }

    try {
      await createPost(title, description, imageFile, location);
      postMessage.style.color = "green";
      postMessage.style.display = "block";
      postMessage.textContent = "Post created successfully!";
      document.getElementById("createPostForm").reset();
    } catch (error) {
      postMessage.style.color = "red";
      postMessage.style.display = "block";
      postMessage.textContent = `Error creating post: ${error.message}`;
    }
  });
});
