import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, serverTimestamp, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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

// Function to handle search
async function searchPosts(searchQuery) {
  if (!searchQuery.trim()) {
    console.log("No search query provided");
    displayResults([]); // Clear results if no search query
    return;
  }

  const postsCollection = collection(db, "posts");

  // Search query for title
  const titleQuery = query(
    postsCollection,
    where("title", ">=", searchQuery),
    where("title", "<=", searchQuery + "\uf8ff")
  );

  // Search query for description
  const descriptionQuery = query(
    postsCollection,
    where("description", ">=", searchQuery),
    where("description", "<=", searchQuery + "\uf8ff")
  );

  try {
    // Fetch documents for title query
    const titleSnapshot = await getDocs(titleQuery);
    const postsByTitle = [];
    titleSnapshot.forEach(doc => {
      const post = doc.data();
      postsByTitle.push({
        id: doc.id,
        title: post.title,
        description: post.description,
        location: post.location,
        imageId: post.imageId,
        authorEmail: post.authorEmail,
        comments: post.comments || [],
      });
    });

    // Fetch documents for description query
    const descriptionSnapshot = await getDocs(descriptionQuery);
    const postsByDescription = [];
    descriptionSnapshot.forEach(doc => {
      const post = doc.data();
      postsByDescription.push({
        id: doc.id,
        title: post.title,
        description: post.description,
        location: post.location,
        imageId: post.imageId,
        authorEmail: post.authorEmail,
        comments: post.comments || [],
      });
    });

    // Combine both results, removing duplicates
    const allPosts = [...postsByTitle, ...postsByDescription];
    const uniquePosts = Array.from(new Set(allPosts.map(a => a.id))).map(id => {
      return allPosts.find(a => a.id === id);
    });

    // Display the search results
    displayResults(uniquePosts);
  } catch (error) {
    console.error("Error searching posts:", error.message);
    displayResults([]); // Clear results on error
  }
}

// Function to render comments
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

// Function to display results
function displayResults(posts) {
  const resultsContainer = document.getElementById("posts-results");

  // Clear previous results
  resultsContainer.innerHTML = "";

  if (posts.length === 0) {
    resultsContainer.innerHTML = "<p>No posts found matching your search.</p>";
    return;
  }

  posts.forEach(async (post) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");
    const imageUrl = post.imageId ? `images/${post.imageId}` : null;

    // Render the post using innerHTML (with added image and post details)
    postElement.innerHTML = `
      <div class="post-image">
        ${imageUrl ? `<img src="${imageUrl}" alt="Post Image">` : ""}
      </div>
      <div class="post-details">
        <span class="caption">${post.title}</span>
        <br>
        <span class="description">${post.authorEmail}</span>
        <br>
        <span class="location">Location: ${post.location || "Unknown"}</span>
      </div>
      <div class="post-description">
        <span>${post.description || "No description provided"}</span>
      </div>
      <div class="comments-section">
        <h3>Comments:</h3>
        <input type="text" class="comment-input" placeholder="Add a comment...">
        <button class="submit-comment" type="button">Send</button>
        <div class="comments-container"></div>
      </div>
    `;

    // Append post element to the results container
    resultsContainer.appendChild(postElement);

    // Render comments for each post
    const commentsContainer = postElement.querySelector(".comments-container");
    renderComments(post.comments, commentsContainer);

    // Add functionality to submit a comment
    const commentInput = postElement.querySelector(".comment-input");
    const submitCommentButton = postElement.querySelector(".submit-comment");
    submitCommentButton.addEventListener("click", async () => {
      const commentText = commentInput.value.trim();
      if (commentText) {
        try {
          const postRef = doc(db, "posts", post.id);
          await updateDoc(postRef, {
            comments: arrayUnion(commentText),
          });

          // Clear the input
          commentInput.value = "";

          // Dynamically add the comment to the UI
          renderComments([...post.comments, commentText], commentsContainer);
        } catch (error) {
          console.error("Error adding comment:", error);
        }
      } else {
        alert("Comment cannot be empty");
      }
    });

    // Real-time listener for comments
    const postRef = doc(db, "posts", post.id);
    onSnapshot(postRef, (snapshot) => {
      const updatedData = snapshot.data();
      renderComments(updatedData.comments || [], commentsContainer);
    });
  });
}

// Event listener for the search input or button
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  // Handle the search on input change
  searchInput.addEventListener("input", (e) => {
    const searchQuery = e.target.value.trim();
    searchPosts(searchQuery); // Call the search function with the query
  });
});
