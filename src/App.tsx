import React, {useEffect, useState} from 'react';
import { isMobile } from 'react-device-detect';
import {FcGoogle} from 'react-icons/fc';
//import { CheckFirestoreInit } from './Utils/Firestore';
import { signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';
import TodosToday from './components/todosToday';

//const db = CheckFirestoreInit();

function App() {
  const [user, setUser] = useState<User | null>(null);

  const provider = new GoogleAuthProvider();

  const SIGN_IN_WITH_GOOGLE = async () => {

    // if (!isMobile) { 

      await signInWithPopup(firebaseAuth, provider)
      .then((result) => {
      
        setUser(result.user);
      
      }).catch((error) => {
        
        alert(error);
      
      });    

  };

  const SIGN_OUT = () => {
    firebaseAuth.signOut().then(() => {
      
      setUser(null);

    }).catch((error) => {

      alert(error);

    });
  }

  useEffect(() => {

    async function checkLoggedIn() {
      onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setUser(user);
      }
      
    });
    };

    checkLoggedIn();
  }, [user])


  return (
  
  //Login
    <>
    <meta name="keywords" content="React, JavaScript, semantic markup, html" />

      { !user && 
      <div className='startScreen'>
        <img src={process.env.PUBLIC_URL + '/images/5Things_logo.png'} alt='5Thing Logo' className='logoStartScreen'/>
            <button onClick={SIGN_IN_WITH_GOOGLE} className='googleButton'> 
            Sign In With Google
            <FcGoogle size={22} className='icon' />
          </button>
          {user}
        </div>
      }

    {/* App */}
      
      { user &&
        <div>
          <div>
            <button onClick={SIGN_OUT} className='logout'>
            SignOut
            
            </button>
          </div>
      
          <div>
            <TodosToday 
            user = {user}
            />
          </div>
        </div>
      }
    </>
  );
}

export default App;
