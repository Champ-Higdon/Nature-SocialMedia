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

// Sign Up Functionality
const signUpButton = document.getElementById('submitSignUp');
signUpButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('emailSignUp').value;
    const password = document.getElementById('passwordSignUp').value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        const userData = { email: email };

        setDoc(doc(db, 'users', user.uid), userData)
        .then(() => {
            showMessage("User signed up successfully!", "confirmationMessage");
            localStorage.setItem('loggedInUserId', userCredential.user.uid);
            window.location.href = 'feed.html';
        })
        .catch((error) => {
            console.error("Error saving user data: ", error);
            showMessage("Error saving user data.", "errorMessage");
        });
    })
    .catch((error) => {
        console.error("Error during sign-up: ", error);
        showMessage("Error during sign-up.", "errorMessage");
    });
});
/*
// Sign In Functionality
const signInButton = document.getElementById('submitSignIn');
signInButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('emailSignIn').value;
    const password = document.getElementById('passwordSignIn').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        showMessage('Login is successful', 'signInMessage');
        localStorage.setItem('loggedInUserId', userCredential.user.uid);
        window.location.href = 'index.html';
    })
    .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
            showMessage('Incorrect Email or Password', 'signInMessage');
        } else {
            showMessage('Error logging in', 'signInMessage');
        }
    });
});*/

// Function to Display Messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
    }
}
