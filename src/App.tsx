import React, {useCallback, useEffect, useState} from 'react';
import {FcGoogle} from 'react-icons/fc';
import { CheckFirestoreInit } from './Utils/Firestore';
import { DocumentData, collection, getDocs, query, where, limit} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';
import TodosList from './components/todosList';
import MakeTodo from './components/makeTodo';
import {firstLetterToUpperCase} from './Utils/changeCase';
import { currentDayStart, nextDayStart, thisWeekStart } from './Utils/makeCleanDays';
import sortOrder  from './Utils/sortOrder';
import reNumberOrder from './Utils/reNumberOrder';
import { maxPerDay } from './Utils/constants';
import logo from './images/5Things_logo.png';
import spinner from './images/loading-gif.gif';
import { UpdateEntireTodoListFirestore, updateSingleTodoFirestore, deleteSingleTodoFirestore } from './Utils/FirestoreFunctions';

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
  const [displayDay, setDisplayDay] = useState<makeTodoDayOptions>('today');
  const [transition, setTransition] = useState<boolean>(false);
  const [revealSignIn, setRevealSignIn] = useState<boolean>(false);

  const provider = new GoogleAuthProvider();
  const dayOptions:makeTodoDayOptions[] = ['overdue', 'today', 'tomorrow', 'week', 'complete'] 

  const SIGN_IN_WITH_GOOGLE = async () => {

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

  const updateTodoListRender = (list:makeTodoDayOptions, todo:DocumentData) => {
    
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

  const checkListandUpdateTodosRender = useCallback((todoListName:makeTodoDayOptions, newTodoList:DocumentData[]) => {
    
    switch(todoListName) {
      
      case 'today':
        setTodaysTodos([]);
      
        newTodoList.forEach((todo) => {
          updateTodoListRender(todoListName, todo);
        
        });
      break;

      case 'tomorrow':
        setTomorrowsTodos([]);
    
        newTodoList.forEach((todo) => {

          updateTodoListRender(todoListName, todo);
      
        });
      break;
  
      case 'week':
        setWeeksTodos([]);
    
        newTodoList.forEach((todo) => {
  
          updateTodoListRender(todoListName, todo);
      
        })
      break;
  
      case 'overdue':
        setOverDueTodos([]);
    
        newTodoList.forEach((todo) => {

          updateTodoListRender(todoListName, todo);
      
        })
      break;
  
      case 'complete':
        setCompleteTodos([]);
    
        newTodoList.forEach((todo) => {

          updateTodoListRender(todoListName, todo);
      
        })
      break;
    
    }
    
  }, [])

  const pickTodos = (day:makeTodoDayOptions) => {

    switch (day){
      case 'complete':
        return completeTodos;

      case 'overdue':
        return overDueTodos;

      case 'tomorrow':
        return tomorrowsTodos

      case 'week':
        return weeksTodos;
      
      default:
        return todaysTodos;
    }

  }

  const countTodos = (day:makeTodoDayOptions) => {
    switch (day){
      case 'complete':
        return completeTodos.length;

      case 'overdue':
        return overDueTodos.length;

      case 'tomorrow':
        return tomorrowsTodos.length
      case 'week':
        return weeksTodos.length;
      
      default:
        return todaysTodos.length;
    }
  }

  /////////////////////////////
  //////REORDER TODOS ////////
  ///////////////////////////

  const reOrderTodo = async(todoListName:makeTodoDayOptions, todoList:DocumentData[], direction:'down' | 'up', todoId:string) => {
    setTransition(true);
    const newTodoList:DocumentData[] = [];
    
    todoList.forEach((todo) => {
      newTodoList.push(todo);
    })

    const mainTodoIndex = newTodoList.findIndex((doc) => doc.id === todoId);
    const mainTodo = newTodoList[mainTodoIndex];
    
    let swapTodo:DocumentData; 
    
   const sendSwapDB = async(mainTodo:DocumentData, swapTodo:DocumentData) => {

    const mainPromise = updateSingleTodoFirestore(user!, mainTodo);
    const swapPromise = updateSingleTodoFirestore(user!, swapTodo)
  
    Promise.all([mainPromise, swapPromise]);

   }
    
    switch (direction){

      case 'down': {
        const swapTodoIndex = mainTodoIndex + 1;
        swapTodo = newTodoList[swapTodoIndex];

        mainTodo.order += 1;
        swapTodo.order -= 1;

      } 

      break;

      case 'up': {
        const swapTodoIndex = mainTodoIndex - 1;
        swapTodo = newTodoList[swapTodoIndex];
        
        mainTodo.order -= 1;
        swapTodo.order += 1;

      }
      break;
    }
    
    await sendSwapDB(mainTodo, swapTodo)
      .then(() => {
        const sortedNewTodoList = sortOrder(newTodoList, 'order');
        checkListandUpdateTodosRender(todoListName, sortedNewTodoList);
        setTransition(false)
      });

  }

  ////////////////////////////  
  ///// CHANGEDAYTODOS //////
  //////////////////////////
  
  const changeDayTodo = async(fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], moveToListName:'today' |'tomorrow' | 'week' | 'complete', todoId:string) => {
    setTransition(true);

    const newFromTodoList:DocumentData[] = [];
     
    fromTodoList.forEach((todo) => {
      newFromTodoList.push(todo);
    })

    const todoIndex = newFromTodoList.findIndex((doc) => doc.id === todoId);
    const workingTodo =  newFromTodoList[todoIndex];
   
    newFromTodoList.splice(todoIndex, 1);

    reNumberOrder(newFromTodoList, workingTodo.order);

    let finalMoveToList:DocumentData[];

    const updateDBMoveDay = async(workingTodo:DocumentData, fromList:DocumentData[]) => {

      try {

        if(db && user) {
        
          const listUpdate = UpdateEntireTodoListFirestore(user, fromList);
          const todoUpdate = updateSingleTodoFirestore(user, workingTodo);
        
          Promise.all([listUpdate, todoUpdate]);

        }

      } catch (error) {

        alert(error);
      
      }

    }
    
    switch(moveToListName) {
      
      case 'today':
        finalMoveToList = todaysTodos;
        workingTodo.dateDue = currentDayStart();
        workingTodo.order = todaysTodos.length;
        
      break;

      case 'tomorrow':
        finalMoveToList = tomorrowsTodos;
        workingTodo.dateDue = nextDayStart();
        workingTodo.order = tomorrowsTodos.length;

      break;

      case 'week':
        finalMoveToList = weeksTodos;
        workingTodo.dateDue = thisWeekStart();
        workingTodo.order = weeksTodos.length;

      break;

      case 'complete':
        finalMoveToList = completeTodos;
        workingTodo.complete = true;
        workingTodo.dateUpdated = new Date();
      
      break;

    }


    await updateDBMoveDay(workingTodo, newFromTodoList)
    .then(() => {
      finalMoveToList.push(workingTodo);
      let sortedFinalMoveToList:DocumentData[]  = [];///only used for complete list
  
      if (moveToListName === 'complete') {
        sortedFinalMoveToList = sortOrder(finalMoveToList, 'date');
        checkListandUpdateTodosRender(moveToListName, sortedFinalMoveToList);
      } else {
        checkListandUpdateTodosRender(moveToListName, finalMoveToList);
      }
      
      checkListandUpdateTodosRender(fromTodoListName, newFromTodoList);
      setTransition(false);
    });

  }

  ////////////////////////////  
  ///// DELETE TODO /////////
  //////////////////////////
  

  const deleteTodo = async (fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[],todoId:string) => {
    setTransition(true); 
    const newFromTodoList:DocumentData[] = [];
     
    fromTodoList.forEach((todo) => {
      newFromTodoList.push(todo);
    })
   
    const todoIndex = newFromTodoList.findIndex((doc) => doc.id === todoId);
    const workingTodo =  newFromTodoList[todoIndex];

    
    await deleteSingleTodoFirestore(user!, workingTodo)
    .then(() => {
      newFromTodoList.splice(todoIndex, 1);
      checkListandUpdateTodosRender(fromTodoListName, newFromTodoList);
      setTransition(false);
    });
    
  }

  ////////////////////////////  
  ///// RESTORE TODO ////////
  //////////////////////////

  const restoreTodo = async(todoId:string) => {

    if(weeksTodos.length < maxPerDay) {
      setTransition(true);
      
      const newFromTodoList:DocumentData[] = [];
      const finalMoveToList:DocumentData[] = [];

      completeTodos.forEach((todo) => {
        newFromTodoList.push(todo);
      })

      weeksTodos.forEach((todo) => {
        finalMoveToList.push(todo);
      })

      const workingTodoIndex = newFromTodoList.findIndex((doc) => doc.id === todoId);
      const workingTodo =  newFromTodoList[workingTodoIndex];
      
      workingTodo.complete = false;
      workingTodo.order = weeksTodos.length;
      
      updateSingleTodoFirestore(user!, workingTodo)
      .then(() => {
        finalMoveToList.push(workingTodo);
      
        newFromTodoList.splice(workingTodoIndex, 1);
      
        reNumberOrder(newFromTodoList, workingTodo.order);

        checkListandUpdateTodosRender('week', finalMoveToList);
        checkListandUpdateTodosRender('complete', newFromTodoList);
        
        setTransition(false)});

    } else {
      alert('Sorry The Week is Full.\n\n Recommend you reorganize.')
    }

  }

  /////////////////////////////////////  
  ///// USEEFFECTS START HERE ////////
  ///////////////////////////////////

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
          alert(error);
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
          alert(error);
        }

      }
      
  
      fetchDataIncomplete().then((querySnapshot) => {

        if (!ignore && querySnapshot) {//this is for the repeat in dev mode

          querySnapshot.forEach((doc) => {
            const docObject = doc.data();
            docObject.id = doc.id;

            setFirstIncompleteTodos((oldFirstIncompleteTodos) => [...oldFirstIncompleteTodos, docObject]);
          
          });

        }
      });

      fetchDataComplete().then((querySnapshot) => {
        if(!ignore && querySnapshot) {

          querySnapshot.forEach((doc) => {
            const docObject = doc.data();
            docObject.id = doc.id;

            setInitialCompleteTodos((oldInitialCompleteTodos) => [...oldInitialCompleteTodos, docObject]);

          });

        }

      })

    }
 
  }, [user]);

  useEffect(() => {
    setTransition(true);

    setOverDueTodos([]);
    setTodaysTodos([]);
    setTomorrowsTodos([]);
    setWeeksTodos([]);

    const cleanSortInitialList = (listName:makeTodoDayOptions, list:DocumentData[]) => {
      const workingList:DocumentData[] = [];

      list.forEach((todo) => {
        workingList.push(todo);
      }) 

      const sortedList = sortOrder(workingList, 'order');
       checkListandUpdateTodosRender(listName, sortedList);
    }

    const currentDay = currentDayStart();
    const nextDay =  nextDayStart();

    const unsortedOverDueTodos:DocumentData[] = [];
    const unsortedTodaysTodos:DocumentData[] = [];
    const unsortedTomorrowsTodos:DocumentData[] = [];
    const unsortedWeeksTodos:DocumentData[] = [];

    firstIncompleteTodos.forEach((todo) => {
      const dueDate = todo.dateDue.toDate();
    
      if(dueDate.getTime() < currentDay.getTime() && todo.complete === false) {
    
        unsortedOverDueTodos.push(todo);
        //updateTodoListRender('overdue', todo);

      } else if(dueDate.getTime() ===  currentDay.getTime() && todo.complete === false) {
        
        unsortedTodaysTodos.push(todo);
        //updateTodoListRender('today', todo);        
      
      } else if(dueDate.getTime() === nextDay.getTime() && todo.complete === false) {
        
        unsortedTomorrowsTodos.push(todo);
        //updateTodoListRender('tomorrow', todo);       
      
      } else if(dueDate.getTime() >  nextDay.getTime() && todo.complete === false) {
        
        unsortedWeeksTodos.push(todo);
        //updateTodoListRender('week', todo);   
      
      }

      cleanSortInitialList('overdue', unsortedOverDueTodos);
      cleanSortInitialList('today', unsortedTodaysTodos);
      cleanSortInitialList('tomorrow', unsortedTomorrowsTodos);
      cleanSortInitialList('week', unsortedWeeksTodos);
      
    });
  
  },[firstIncompleteTodos, checkListandUpdateTodosRender]);

  useEffect(() => {

    setCompleteTodos([]);

    sortOrder(initialCompleteTodos, 'date');

    initialCompleteTodos.forEach((todo) =>
    {
      updateTodoListRender('complete', todo);
    }
    )

    setTransition(false);

  }, [initialCompleteTodos]);

  return (
  
  //Login
    <>
    <meta name="keywords" content="Todo, Todo List, 5Things, Todo App," />

      {transition &&
        <div className='spinner'>
          <img src={spinner} alt='spinner' />

        </div>
      }

      { !user && 
      <div className='startScreen'>
        <img src={logo} alt='5Things Logo' className='logoStartScreen'/>
        {revealSignIn ?  
            <button onClick={SIGN_IN_WITH_GOOGLE} className='googleButton'> 
            Sign In With Google
            <FcGoogle size={22} className='icon' />
          </button>
        
      :
      <button onClick={() => setRevealSignIn(true)} className='googleButton'> 
      Login
    </button>
      }
        </div>
      }

    {/* App */}
      
      { user &&
        <div className='appWrapper'>
          <div className='menuTop'>
            <img className='menuTopLogo' src={logo} alt='5Things Logo'></img>
            <button onClick={SIGN_OUT} className='buttonLogout'>
            Sign Out
            
            </button>
          </div>

          <div>
            <MakeTodo 
              user ={user}
              todaysTodos = {todaysTodos}
              tomorrowsTodos = {tomorrowsTodos}
              weeksTodos = {weeksTodos}
              updateTodo = {updateTodoListRender}
              displayDay = {displayDay}
            /> 
          </div>

            <div className='listMenuButtons' >
              {dayOptions.map((day) => (                
                <button key={day} className={`button${day}`} onClick={() => {setDisplayDay(day)}}><div className='listMenuTodoCount'>{countTodos(day).toString()}</div>{firstLetterToUpperCase(day)}</button>
              ))}
              
            </div>
          
          <div className='listHolder'>
                <div id="here" key={displayDay} className={`list${displayDay} specificList`}>
                <TodosList
                title = {firstLetterToUpperCase(displayDay)}
                day = {displayDay}
                todos={pickTodos(displayDay)}
                reOrderTodo= {reOrderTodo}
                changeDayTodo = {changeDayTodo}
                deleteTodo = {deleteTodo}     
                restoreTodo = {restoreTodo}         
                todaysTodos = {todaysTodos}
                tomorrowsTodos = {tomorrowsTodos}
                weeksTodos = {weeksTodos}
                />
              </div>

          </div>
        </div>
      }
    </>
  );
}

export default App;
