import React, {useEffect, useState} from 'react';
import {FcGoogle} from 'react-icons/fc';
import { CheckFirestoreInit } from './Utils/Firestore';
import { DocumentData, collection, getDocs, orderBy, query, where, limit, QuerySnapshot, serverTimestamp, Timestamp} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';
import TodosList from './components/todosList';
import MakeTodo from './components/makeTodo';

const db = CheckFirestoreInit();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [firstIncompleteTodos, setFirstIncompleteTodos] = useState<DocumentData[]>([]);
  const [initialCompleteTodos, setInitialCompleteTodos] = useState<DocumentData[]>([]);
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

  const updateTodoList = (list:makeTodoDayOptions, todo:DocumentData) => {
    
    if (list === 'today') {
    setTodaysTodos((oldTodaysTodos) => [...oldTodaysTodos, todo]);
    }

    if (list === 'tomorrow') {
    setTomorrowsTodos((oldTomorrowsTodos) => [...oldTomorrowsTodos, todo])
    }

    if (list === 'week') {
      setWeeksTodos((oldWeeksTodos) => [...oldWeeksTodos, todo]);
    }

    if (list === 'complete') {
      setCompleteTodos((oldCompleteTodos) => [...oldCompleteTodos, todo]);
    }

    if (list === 'overdue') {
      setOverDueTodos((oldOverDueTodos) => [...oldOverDueTodos, todo]);
    }

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
    setFirstIncompleteTodos([]);
    setInitialCompleteTodos([]);
    // Function to fetch data from the database
      const fetchDataIncomplete = async () => {
        
        try {
          const queryIncomplete = query(collection(db, 'Todos'), where("owner", "==", user.uid), where("complete", "==", false));
          const querySnapshot = await getDocs(queryIncomplete);

          return querySnapshot;

        } catch (error) {
          console.log(error);
        }

      };

      const fetchDataComplete = async () => {

        try {
          const today = new Date();
          const dateLimit = new Date(new Date().setDate(today.getDate() - 90));
          const queryComplete = query(collection(db,'Todos'), where ('owner', '==', user.uid), where('complete', '==', true), where('dateUpdated', '>=', dateLimit), limit(700));
          const querySnapshot = await getDocs(queryComplete);

          return querySnapshot;
          

        } catch (error) {
          console.log(error);
        }

      }
      
  
      fetchDataIncomplete().then((querySnapshot) => {

        if (!ignore && querySnapshot) {//this is for the repeat in dev mode

          querySnapshot.forEach((doc) => {

            setFirstIncompleteTodos((oldFirstIncompleteTodos) => [...oldFirstIncompleteTodos, doc.data()]);
          
          });

        }
      });

      fetchDataComplete().then((querySnapshot) => {
        if(!ignore && querySnapshot) {

          querySnapshot.forEach((doc) => {

            setInitialCompleteTodos((oldInitialCompleteTodos) => [...oldInitialCompleteTodos, doc.data()]);

          });

        }

      })

    }
 
  }, [user]);

  useEffect(() => {
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
    

      firstIncompleteTodos.forEach((todo) => {
        const dueDate = todo.dateDue.toDate();
      
        if(dueDate.getTime() < currentDay.getTime() && todo.complete === false) {
          
          updateTodoList('overdue', todo);
        
        } else if(dueDate.getTime() ===  currentDay.getTime() && todo.complete === false) {
          
          updateTodoList('today', todo);
        
        } else if(dueDate.getTime() === nextDay.getTime() && todo.complete === false) {
          
          updateTodoList('tomorrow', todo);
        
        } else if(dueDate.getTime() >  nextDay.getTime() && todo.complete === false) {
          
          updateTodoList('week', todo);
        
        } 

      });       
  
  },[firstIncompleteTodos]);

  useEffect(() => {
    setCompleteTodos([]);

    initialCompleteTodos.forEach((todo) =>
    {
      updateTodoList('complete', todo);
    }
    )

  }, [initialCompleteTodos]);



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
        updateTodo = {updateTodoList}
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
