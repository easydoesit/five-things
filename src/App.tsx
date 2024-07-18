import React, {useEffect, useState} from 'react';
import {FcGoogle} from 'react-icons/fc';
import { CheckFirestoreInit } from './Utils/Firestore';
import { DocumentData, collection, getDocs, doc, updateDoc, orderBy, query, where, limit, QuerySnapshot, serverTimestamp, Timestamp, writeBatch} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from './Utils/FirebaseConfig';
import TodosList from './components/todosList';
import MakeTodo from './components/makeTodo';
import {firstLetterToUpperCase} from './Utils/changeCase';
import { currentDayStart, nextDayStart, thisWeekStart } from './Utils/makeCleanDays';
import sortOrder  from './Utils/sortOrder';
import reNumberOrder from './Utils/reNumberOrder';
import { maxPerDay } from './Utils/constants';


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

  const provider = new GoogleAuthProvider();
  const dayOptions:makeTodoDayOptions[] = ['overdue', 'today', 'tomorrow', 'week', 'complete'] 

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

  const checkListandUpdateTodos = (todoListName:makeTodoDayOptions, newTodoList:DocumentData[]) => {
    if (todoListName === 'today') {
          
      setTodaysTodos([]);
      
      newTodoList.forEach((todo) => {

        updateTodoList(todoListName, todo);
      
      })
    
    } 

    if (todoListName === 'tomorrow') {
    
      setTomorrowsTodos([]);
    
      newTodoList.forEach((todo) => {

        updateTodoList(todoListName, todo);
    
      })
      
    }

    if (todoListName === 'week') {
      
      setWeeksTodos([]);
    
      newTodoList.forEach((todo) => {

        updateTodoList(todoListName, todo);
    
      })
    
    }

    if (todoListName === 'overdue') {
      
      setOverDueTodos([]);
    
      newTodoList.forEach((todo) => {

        updateTodoList(todoListName, todo);
    
      })
    
    }

  }

  const pickTodos = (day:makeTodoDayOptions) => {
    
    if(day === 'complete') {
       return completeTodos;
    }

    if(day === 'overdue') {
      return overDueTodos;
    }

    if(day === 'tomorrow') {
      return tomorrowsTodos;
    }
    
    if (day === 'week') {
      return weeksTodos;
    }

    return todaysTodos;

  }

  const countTodos = (day:makeTodoDayOptions) => {
    if(day === 'complete') {
      return completeTodos.length;
   }

   if(day === 'overdue') {
     return overDueTodos.length;
   }

   if(day === 'tomorrow') {
     return tomorrowsTodos.length;
   }
   
   if (day === 'week') {
     return weeksTodos.length;
   }

   return todaysTodos.length;
  }

  const reOrderTodo = async(todoListName:makeTodoDayOptions, todoList:DocumentData[], direction:'down' | 'up', todoId:string) => {
    
    const updateRenderAndDB = async(direction:'up' | 'down', swapTodoIndex:number, mainTodoIndex:number, newTodoList:DocumentData[]) => {

      sortOrder(newTodoList, 'order');

      checkListandUpdateTodos(todoListName, newTodoList);

      try {
        if(db && user) {
          const batch = writeBatch(db);

          const mainTodoRef = doc(db, 'Todos', newTodoList[mainTodoIndex].id);

          batch.update(mainTodoRef, {
            order: newTodoList[mainTodoIndex].order,
            dateUpdated: serverTimestamp() })

          const swapTodoRef = doc(db, 'Todos', newTodoList[swapTodoIndex].id);

          batch.update(swapTodoRef, {
            order: newTodoList[swapTodoIndex].order,
            dateUpdated: serverTimestamp() })

          await batch.commit();
        
        }

      } catch (error) {

        console.log(error);
      
      }

    }

    const newTodoList = todoList;
    const mainTodoIndex = todoList.findIndex((doc) => doc.id === todoId);
    

    switch (direction){

      case 'down': {
        const swapTodoIndex = todoList.findIndex((doc) => doc.order === todoList[mainTodoIndex].order + 1);
        
        newTodoList[mainTodoIndex].order += 1;
        newTodoList[swapTodoIndex].order -= 1;

        await updateRenderAndDB('down', swapTodoIndex, mainTodoIndex, newTodoList);

      } 

      break;

      case 'up': {
        const swapTodoIndex = todoList.findIndex((doc) => doc.order === todoList[mainTodoIndex].order - 1);
        
        newTodoList[mainTodoIndex].order -= 1;
        newTodoList[swapTodoIndex].order += 1;

        await updateRenderAndDB('up', swapTodoIndex, mainTodoIndex, newTodoList);

      }
      break;
    }

  }

  const changeDayTodo = (fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], moveToListName:'today' |'tomorrow' | 'week' | 'complete', todoId:string) => {
    console.log("🚀 ~ changeDayTodo ~ fromTodoListName:", fromTodoListName)
    
    const newFromTodoList = fromTodoList;
    console.log("🚀 ~ changeDayTodo ~ newFromTodoList:", newFromTodoList)
    
    const todoIndex = fromTodoList.findIndex((doc) => doc.id === todoId);
    const workingTodo =  fromTodoList[todoIndex];
   
    newFromTodoList.splice(todoIndex, 1);

    reNumberOrder(newFromTodoList, workingTodo.order);

    let finalMoveToList:DocumentData[];

    const updateDBMoveDay = async(workingTodo:DocumentData, fromList:DocumentData[]) => {

      try {

        if(db && user) {
          const batchWorkingTodo = writeBatch(db);
          const batchFromList = writeBatch(db);

          fromList.forEach((todo) => {
            batchFromList.update(doc(db, 'Todos', todo.id), {
              order: todo.order,
              dateUpdated: serverTimestamp(),
            });

          })

          const workingTodoRef = doc(db, 'Todos', workingTodo.id);

          if (moveToListName !== 'complete') {
          
            batchWorkingTodo.update(workingTodoRef , {
              order: workingTodo.order,
              dateDue: workingTodo.dateDue,
              dateUpdated: serverTimestamp() 
            });
  
          } else {
            batchWorkingTodo.update(workingTodoRef, {
              order: completeTodos.length,
              complete: true,
              dateUpdated: serverTimestamp(),
            })
          }

          await batchWorkingTodo.commit();
          await batchFromList.commit();
        
        }

      } catch (error) {

        console.log(error);
      
      }

    }
    
    switch(moveToListName) {
      
      case 'today':
        finalMoveToList = todaysTodos;

        workingTodo.dateDue = currentDayStart();
        
        if (todaysTodos.length < maxPerDay) {

          workingTodo.order = todaysTodos.length;
          finalMoveToList.push(workingTodo);
      }
      break;

      case 'tomorrow':
        finalMoveToList = tomorrowsTodos;

        workingTodo.dateDue = nextDayStart();

        if (tomorrowsTodos.length < maxPerDay) {

          workingTodo.order = tomorrowsTodos.length;
          finalMoveToList.push(workingTodo);
      
        }

      break;

      case 'week':
        finalMoveToList = weeksTodos;

        workingTodo.dateDue = thisWeekStart();

        if (weeksTodos.length < maxPerDay) {

          workingTodo.order = weeksTodos.length;
          finalMoveToList.push(workingTodo);
      
      }      
      break;

      case 'complete':
        finalMoveToList = completeTodos;

        workingTodo.order = completeTodos.length;
        workingTodo.complete = true;

        finalMoveToList.push(workingTodo);

        break;

    }
    
    checkListandUpdateTodos(moveToListName, finalMoveToList);
    checkListandUpdateTodos(fromTodoListName, newFromTodoList);
    updateDBMoveDay(workingTodo, newFromTodoList);

  }

  const deleteTodo = (fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[],todoId:string) => {
    const newFromTodoList = fromTodoList;
    const todoIndex = fromTodoList.findIndex((doc) => doc.id === todoId);
    const workingTodo =  fromTodoList[todoIndex];


    const updateDBDelete = async(todoToDelete:DocumentData) => {
      try {
        if(db && user) {
          const batch = writeBatch(db);

          const deleteTodoRef = doc(db, 'Todos', todoToDelete.id);

          batch.delete(deleteTodoRef);

          await batch.commit();
        
        }

      } catch (error) {

        console.log(error);
      
      }


    }


    newFromTodoList.splice(todoIndex, 1);

    checkListandUpdateTodos(fromTodoListName, newFromTodoList);
    updateDBDelete(workingTodo);

  }

  const restoreTodo = (todoId:string) => {
    const newFromTodoList = completeTodos;
    const finalMoveToList = weeksTodos;
    const todoIndex = completeTodos.findIndex((doc) => doc.id === todoId);
    const workingTodo =  completeTodos[todoIndex];
    
    workingTodo.complete = false;
    workingTodo.order = weeksTodos.length;
    
    finalMoveToList.push(workingTodo);
    
    newFromTodoList.splice(todoIndex, 1);
    
    reNumberOrder(newFromTodoList, workingTodo.order);

    const updateDBRestoreTodo = async(workingTodo:DocumentData, fromList:DocumentData[]) => {

      try {
        if(db && user) {
          const workingTodoBatch = writeBatch(db);
          const batchFromList = writeBatch(db);

          fromList.forEach((todo) => {
            batchFromList.update(doc(db, 'Todos', todo.id), {
              order: todo.order,
              dateUpdated: serverTimestamp(),
            });

          })

          const workingTodoRef = doc(db, 'Todos', workingTodo.id);

          workingTodoBatch.update(workingTodoRef , {
            order: weeksTodos.length,
            complete: false,
            dateDue: thisWeekStart(),
            dateUpdated: serverTimestamp() })

          await workingTodoBatch.commit();
        
        }

      } catch (error) {

        console.log(error);
      
      }

    }

    checkListandUpdateTodos('week', finalMoveToList);
    checkListandUpdateTodos('complete', newFromTodoList);
    updateDBRestoreTodo(workingTodo, newFromTodoList);

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
    setOverDueTodos([]);
    setTodaysTodos([]);
    setTomorrowsTodos([]);
    setWeeksTodos([]);
    
    const currentDay = currentDayStart();
    const nextDay =  nextDayStart();

    sortOrder(firstIncompleteTodos, 'order');

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

    sortOrder(initialCompleteTodos, 'date');

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
        <img src={process.env.PUBLIC_URL + '/images/5Things_logo.png'} alt='5Things Logo' className='logoStartScreen'/>
            <button onClick={SIGN_IN_WITH_GOOGLE} className='googleButton'> 
            Sign In With Google
            <FcGoogle size={22} className='icon' />
          </button>
          {user}
        </div>
      }

    {/* App */}
      
      { user &&
        <div className='appWrapper'>
          <div className='menuTop'>
            <img className='menuTopLogo' src={process.env.PUBLIC_URL + '/images/5Things_logo.png'} alt='5Things Logo'></img>
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
              updateTodo = {updateTodoList}
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
