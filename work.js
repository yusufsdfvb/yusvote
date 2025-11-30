// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLsKA8pYd27ffc5nWKReoX3XGgGfwKKEg",
  authDomain: "yusvote-66f52.firebaseapp.com",
  projectId: "yusvote-66f52",
  storageBucket: "yusvote-66f52.firebasestorage.app",
  messagingSenderId: "928161949172",
  appId: "1:928161949172:web:9197ba8517b4c784f145a1",
  measurementId: "G-E8PM4E8NZ9"
};


const app = firebase.initializeApp(firebaseConfig);

if(app){
    console.log("firebase init done")

}
else{
    console.log("firebase init error")
}
