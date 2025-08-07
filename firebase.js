// firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyDCUmcdjAwDJ31aomyPD2nEJ7Ge4nzHDII",
  authDomain: "abhiru-apps.firebaseapp.com",
  projectId: "abhiru-apps",
  storageBucket: "abhiru-apps.firebasestorage.app",
  messagingSenderId: "193586722366",
  appId: "1:193586722366:web:3c2313198d7ddd4a15c36f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const userPhoto = document.getElementById("user-photo");
const userName = document.getElementById("user-name");

loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((error) => {
    console.error("Login failed:", error);
    alert("Login failed: " + error.message);
  });
});

logoutBtn.addEventListener("click", () => {
  auth.signOut().catch((error) => {
    console.error("Logout failed:", error);
    alert("Logout failed: " + error.message);
  });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    userInfo.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    userPhoto.src = user.photoURL || "https://via.placeholder.com/40";
    userName.textContent = user.displayName || "No Name";
  } else {
    userInfo.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    userPhoto.src = "";
    userName.textContent = "";
  }
});
