//firestore import
import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./FirebaseConfig";


export function CheckFirestoreInit() {

  if (firebaseApp) {
    const db = getFirestore(firebaseApp);
    return db;
  } else {
    const db = undefined;
    console.log("There is a problem with the Firebase Initialization");
    return db;
  }

}