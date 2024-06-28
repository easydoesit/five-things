import React, {useEffect, useState} from 'react';
import {FcGoogle} from 'react-icons/fc';
import { DocumentData, collection, getDocs} from "firebase/firestore";
import { CheckFirestoreInit } from './Utils/Firestore';
import { signInWithPopup, GoogleAuthProvider,signOut, User } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';

const db = CheckFirestoreInit();

function App() {
  const [todos, setTodos] = useState<DocumentData[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const provider = new GoogleAuthProvider();

  const SIGN_IN_WITH_GOOGLE = () => {

    signInWithPopup(firebaseAuth, provider)
    .then((result) => {

      const user = result.user;

      console.log("user >>> ", user);
      setUser(user);

    }).catch((error) => {
      const errorCode = error.code;
      alert(errorCode);
    });

  };

  const SIGN_OUT = () => {
    signOut(firebaseAuth).then(() => {
      setUser(null);
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  


  useEffect(() => {
    let ignore = false; // needed to only run once in dev
    // Initialize the Firebase Fires with the provided configuration
    if (db) {
    // Function to fetch data from the database
      const fetchData = async () => {
        const querySnapshot = await getDocs(collection(db, 'Todos'));
        if (!ignore) {
          querySnapshot.forEach((doc) => {
            setTodos(oldTodos => [...oldTodos, doc.data()]);
          })
        }
    };
  
    fetchData();

    return () => {
      ignore = true;
    }

    }
 
  }, []);


  return (

  //Login
    <>

      { !user && 
        <div className='googleButtonHolder'>
            <button onClick={SIGN_IN_WITH_GOOGLE} className='googleButton'> 
            Sign In With Google
            <FcGoogle size={22} className='icon' />
          </button>
        </div>
      }

{/* App */}
      
{
        user &&
        <div>
        <button onClick={SIGN_OUT} className='logout'>
        SignOut
        
      </button>



      <h1>Data from database:</h1>
      <ol>
        {todos.map((item, index) => (
          <li key={index}>{item.Action}</li>
        ))}
      </ol>
      </div>
       }
    </>
  );
}

export default App;
