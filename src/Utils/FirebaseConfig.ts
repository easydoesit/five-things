import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-DW5DiidWCQhTkiuwBeVdLZjJ34irwUg",
  authDomain: "things-58650.firebaseapp.com",
  //authDomain: "localhost:3000",
  projectId: "things-58650",
  storageBucket: "things-58650.appspot.com",
  messagingSenderId: "747079287894",
  appId: "1:747079287894:web:11ca4433adb8a49dcda7f7"
};

//Initialize Firebase
export let firebaseApp:FirebaseApp | undefined;
// Check if firebaseApp is not initialized
if (!firebaseApp || (firebaseApp as any)?.apps?.length === undefined) {
  firebaseApp = initializeApp(firebaseConfig);
}

export const firebaseAuth = getAuth();