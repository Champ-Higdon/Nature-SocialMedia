// Import the Firebase modules
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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

// Populate logged-in user info
const loadUserInfo = async () => {
  onAuthStateChanged(auth, async (user) => {
    const loggedInUserId = localStorage.getItem("loggedInUserId");
    if (loggedInUserId) {
      const docRef = doc(db, "users", loggedInUserId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById("loggedUserEmail").innerText = userData.email;
      } else {
        console.error("Could not find document matching ID");
      }
    } else {
      console.error("User ID not found in local storage");
    }
  });
};

// Fetch and render posts
const renderPosts = async () => {
  try {
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, orderBy("timestamp", "desc")); // Order by timestamp
    const querySnapshot = await getDocs(postsQuery);
    const postsContainer = document.querySelector(".container");

    // Nested function to render comments
    const renderComments = (comments, commentsContainer) => {
      commentsContainer.innerHTML = ""; // Clear previous comments
      if (comments && comments.length > 0) {
        comments.forEach((comment) => {
          const commentElement = document.createElement("div");
          commentElement.classList.add("comment");
          commentElement.innerText = comment; // Each comment is a string
          commentsContainer.appendChild(commentElement);
        });
      } else {
        commentsContainer.innerHTML = "<p>No comments yet</p>";
      }
    };

    // Clear posts container (NO)
    //postsContainer.innerHTML = "";

    querySnapshot.docs.forEach(async (postDoc) => {
      const postData = postDoc.data();
      const postId = postDoc.id; // Get post ID
      const imageId = postData.imageId;

      // Fetch the image URL from Realtime Database
      const imageRef = ref(realtimeDb, "images/" + imageId);
      const imageSnapshot = await get(imageRef);
      const imageUrl = imageSnapshot.exists() ? imageSnapshot.val().imageUrl : null;

      // Create the post element
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="Post Image">`
            : ""
        }
        <div class="post-details">
            <span class="caption">${postData.title}</span>
            <br>
            <span class="description">${postData.authorEmail}</span>
            <br>
            <span class="location">Location: ${postData.location || "Unknown"}</span>
        </div>
        <div class="post-details">
            <span class="description">${postData.description || "No description provided"}</span>
        </div>
        <div class="comments-section">
            <h3>Comments:</h3>
            <input type="text" class="comment-input" placeholder="Add a comment...">
            <button class="submit-comment" type="button">Send</button>
            <div class="comments-container"></div>
        </div>
      `;

      // Append post element to the container
      postsContainer.appendChild(postElement);

      // Render comments
      const commentsContainer = postElement.querySelector(".comments-container");
      renderComments(postData.comments || [], commentsContainer);

      // Add comment functionality
      const commentInput = postElement.querySelector(".comment-input");
      const submitCommentButton = postElement.querySelector(".submit-comment");
      submitCommentButton.addEventListener("click", async () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
          try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, {
              comments: arrayUnion(commentText),
            });

            // Clear the input
            commentInput.value = "";

            // Dynamically add the comment to UI
            renderComments([...postData.comments || [], commentText], commentsContainer);
          } catch (error) {
            console.error("Error adding comment:", error);
          }
        } else {
          alert("Comment cannot be empty");
        }
      });

      // Real-time listener for comments
      const postRef = doc(db, "posts", postId);
      onSnapshot(postRef, (snapshot) => {
        const updatedData = snapshot.data();
        renderComments(updatedData.comments || [], commentsContainer);
      });
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// Load the page
document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  renderPosts();
});
