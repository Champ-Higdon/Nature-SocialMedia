// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

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
const storage = getStorage();

// Post Creation Function with Image and Location
async function createPost(title, description, imageFile, location) {
  const user = auth.currentUser;
  if (!user) {
    console.error('You need to be logged in to create a post');
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
    location: location || '', // Optional location
  };

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `post_images/${imageFile.name}`);
    try {
      // Upload the image to Firebase Storage
      await uploadBytes(imageRef, imageFile);
      // Get the image URL
      const imageURL = await getDownloadURL(imageRef);
      postData.imageUrl = imageURL; // Add image URL to post data
    } catch (error) {
      console.error('Error uploading image:', error.message);
      return;
    }
  }

  // Save post data to Firestore
  try {
    const postRef = await addDoc(collection(db, 'posts'), postData);
    console.log('Post created with ID:', postRef.id);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', () => {
  const submitPostBtn = document.getElementById('submitPost');
  if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async () => {
      const title = document.getElementById('postTitle').value;
      const description = document.getElementById('postDescription').value;
      const location = document.getElementById('postLocation').value || null;
      const imageFile = document.getElementById('postImage').files[0];

      // Clear feedback message
      const postMessage = document.getElementById('postMessage');
      postMessage.style.display = 'none';

      if (!title || !description) {
        postMessage.style.color = 'red';
        postMessage.style.display = 'block';
        postMessage.textContent = 'Both title and description are required!';
        return;
      }

      try {
        await createPost(title, description, imageFile, location);
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
  }
});

// Comment on Post Function
async function commentOnPost(postId, commentText) {
  const user = auth.currentUser;
  if (!user) {
    console.error('You need to be logged in to comment on a post');
    return;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    const commentData = {
      userUid: user.uid,
      comment: commentText,
      timestamp: serverTimestamp()
    };
    await updateDoc(postRef, {
      comments: arrayUnion(commentData)
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
