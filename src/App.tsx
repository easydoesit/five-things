import React, {useEffect, useState} from 'react';
import { isMobile } from 'react-device-detect';
import {FcGoogle} from 'react-icons/fc';
import { CheckFirestoreInit } from './Utils/Firestore';
import { DocumentData, collection, getDocs, orderBy, query, where, limit, QuerySnapshot} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';
import TodosList from './components/todosList';
import MakeTodo from './components/makeTodo';

const db = CheckFirestoreInit();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [allTodos, setAllTodos] = useState<DocumentData[]>([]);
  const [todaysTodos, setTodaysTodos] = useState<DocumentData[]>([]);
  const [tomorrowsTodos, setTomorrowsTodos] = useState<DocumentData[]>([]);
  const [weeksTodos, setWeeksTodos] = useState<DocumentData[]>([]);
  const [overDueTodos, setOverDueTodos] = useState<DocumentData[]>([]);
  const [completeTodos, setCompleteTodos] = useState<DocumentData[]>([]);

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
      onAuthStateChanged(firebaseAuth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      }
      
    });
    };
    checkLoggedIn();
  }, [])

  useEffect(() => {    
    let ignore = false; // needed to only run once in dev

    if (db && user) {
    setAllTodos([]);
    // Function to fetch data from the database
      const fetchData = async () => {
        try {
          const q = query(collection(db, 'Todos'), where("owner", "==", user.uid), orderBy("order", "asc"), limit(1000));
          const querySnapshot = await getDocs(q);

          return querySnapshot;

        } catch (error) {
          console.log(error);
        }
      };
  
      fetchData().then((querySnapshot) => {

        if (!ignore && querySnapshot) {//this is for the repeat in dev mode

          querySnapshot.forEach((doc) => {
  
            setAllTodos((oldAllTodos) => [...oldAllTodos, doc.data()]);
          
          });

        }
      });

    }
 
  }, [user]);

  useEffect(() => {
    setCompleteTodos([]);
    setOverDueTodos([]);
    setTodaysTodos([]);
    setTomorrowsTodos([]);
    setWeeksTodos([]);
    
    const currentDay = new Date();
    currentDay.setHours(0,0,0,0);

    const nextDay = new Date();
    nextDay.setHours(0,0,0,0);
    nextDay.setTime(nextDay.getTime() + (24*60*60*1000));
    
    const thisWeek = new Date();
    thisWeek.setHours(0,0,0,0);
    thisWeek.setTime(thisWeek.getTime() + (5*(24*60*60*1000)));
    

      allTodos.forEach((todo) => {
        const dueDate = todo.dateDue.toDate();
      
        if(dueDate.getTime() < currentDay.getTime() && todo.complete === false) {
          
          setOverDueTodos((oldOverDueTodos) => [...oldOverDueTodos, todo]);
        
        } else if(dueDate.getTime() ===  currentDay.getTime() && todo.complete === false) {
          
          setTodaysTodos((oldTodaysTodos) => [...oldTodaysTodos, todo]);
        
        } else if(dueDate.getTime() === nextDay.getTime() && todo.complete === false) {
          
          setTomorrowsTodos((oldTomorrowsTodos) => [...oldTomorrowsTodos, todo]);
        
        } else if(dueDate.getTime() >  nextDay.getTime() && todo.complete === false) {
          
          setWeeksTodos((oldWeeksTodos) => [...oldWeeksTodos, todo]);
        
        } else if(todo.complete === true) {
          
          setCompleteTodos((oldCompleteTodos) => [...oldCompleteTodos, todo]);
        
        }

      });       
  
  },[allTodos]);


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
         
      <MakeTodo 
        user ={user}
        todaysTodos = {todaysTodos}
        tomorrowsTodos = {tomorrowsTodos}
      /> 
    </div>
          <div>
            <TodosList 
            key={1}
            title = "Overdue"
            day = 'overdue'
            todos={overDueTodos}
            user = {user}
            />
          </div>
          <div>
            <TodosList 
            key={2}
            title = "Today"
            day = 'today'
            todos={todaysTodos}
            user = {user}
            />
          </div>
          <div>
            <TodosList 
            key={3}
            title = "Tomorrow"
            day = 'tomorrow'
            todos={tomorrowsTodos}
            user = {user}
            />
          </div>
          <div>
            <TodosList 
            key={4}
            title = "This Week"
            day = 'week'
            todos={weeksTodos}
            user = {user}
            />
          </div>
          <div>
            <TodosList 
            key={5}
            title = "Completed"
            day = 'complete'
            todos={completeTodos}
            user = {user}
            />
          </div>
        </div>
      }
    </>
  );
}

export default App;
