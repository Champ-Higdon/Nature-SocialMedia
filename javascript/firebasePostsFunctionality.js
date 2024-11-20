//firebasePostFunctionality.js
// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy9EsQ9Td4ZXbE4WNKTjfCFDjQVpnzjSY",
  authDomain: "hunt-and-gather-87d08.firebaseapp.com",
  projectId: "hunt-and-gather-87d08",
  storageBucket: "hunt-and-gather-87d08.appspot.com",
  messagingSenderId: "524226195507",
  appId: "1:524226195507:web:abbed7295a1ec89431f346",
  measurementId: "G-CZLRGYD7DZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// Post Creation Function
async function createPost(title, description) {
  const user = auth.currentUser;
  if (!user) {
    console.error('You need to be logged in to create a post');
    return;
  }

  const postData = {
    title,
    description,
    authorUid: user.uid,
    authorEmail: user.email,
    likes: 0,
    comments: [],
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    const postRef = await db.collection('posts').add(postData);
    console.log('Post created with ID:', postRef.id);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

// Add event listener for form submission
document.getElementById('submitPost').addEventListener('click', async () => {
  const title = document.getElementById('postTitle').value;
  const description = document.getElementById('postDescription').value;

  // Clear feedback message
  const postMessage = document.getElementById('postMessage');
  postMessage.style.display = 'none';

  if (!title || !description) {
    postMessage.style.color = 'red';
    postMessage.style.display = 'block';
    postMessage.textContent = 'Both fields are required!';
    return;
  }

  try {
    await createPost(title, description);
    postMessage.style.color = 'green';
    postMessage.style.display = 'block';
    postMessage.textContent = 'Post created successfully!';
    document.getElementById('createPostForm').reset();
  } catch (error) {
    postMessage.style.color = 'red';
    postMessage.style.display = 'block';
    postMessage.textContent = `Error creating post: ${error.message}`;
  }
});

// Like Post Function
async function likePost(postId) {
  const user = auth.currentUser;
  if (!user) {
    console.error('You need to be logged in to like a post');
    return;
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();
    if (postSnapshot.exists) {
      const post = postSnapshot.data();
      const likes = post.likes;
      await postRef.update({ likes: likes + 1 });
      console.log(`Post ${postId} liked`);
    } else {
      console.error('Post not found');
    }
  } catch (error) {
    console.error('Error liking post:', error.message);
  }
}

// Comment on Post Function
async function commentOnPost(postId, commentText) {
  const user = auth.currentUser;
  if (!user) {
    console.error('You need to be logged in to comment on a post');
    return;
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const commentData = {
      userUid: user.uid,
      comment: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    await postRef.update({
      comments: firebase.firestore.FieldValue.arrayUnion(commentData)
    });
    console.log('Comment added to post', postId);
  } catch (error) {
    console.error('Error commenting on post:', error.message);
  }
}

// Listen for Auth State Changes
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});

// // Example Usage:
// // Sign up a new user
// signUpUser('user@example.com', 'password123');

// // Sign in an existing user
// signInUser('user@example.com', 'password123');

// // Create a new post
// createPost('My Hiking Adventure', 'Had an amazing hike in the mountains!');

// // Like a post (provide the postId after creating one)
// likePost('post-id-here');

// // Comment on a post (provide the postId and comment text)
// commentOnPost('post-id-here', 'Looks like an amazing adventure!');
