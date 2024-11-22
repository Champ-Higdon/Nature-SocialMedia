import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBy9EsQ9Td4ZXbE4WNKTjfCFDjQVpnzjSY",
    authDomain: "hunt-and-gather-87d08.firebaseapp.com",
    projectId: "hunt-and-gather-87d08",
    storageBucket: "hunt-and-gather-87d08.firestorage.app", // Should match your bucket
    messagingSenderId: "524226195507",
    appId: "1:524226195507:web:abbed7295a1ec89431f346",
    measurementId: "G-CZLRGYD7DZ"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    if(loggedInUserId){
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserEmail').innerText=userData.email;
            }
            else{
                console.log("Could not find document matching id")
            }
        });
    }
    else{
        console.log("User id not found in local storage")
    }
  })