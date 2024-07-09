import React, {ChangeEvent, useState, SyntheticEvent} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { DocumentData, addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { User} from "firebase/auth";

const db = CheckFirestoreInit();

interface MakeTodoI {
  user:User | null;
  todaysTodos: DocumentData[];
  tomorrowsTodos: DocumentData[];
  updateTodo(list:makeTodoDayOptions, todo: DocumentData):void;
}

interface TodoFieldI {
  name:string | undefined;
  day:makeTodoDayOptions;
  count:number;
  user:User | null;
}

export default function MakeTodo({user, todaysTodos, tomorrowsTodos, updateTodo}:MakeTodoI) {
    
  const toDoInitialState:TodoFieldI = {
      name: "",
      day:'today',
      count:0,
      user:user,
    }
  
  const [fieldInfo, setFieldInfo] = useState<TodoFieldI>(toDoInitialState);//fieldvalues
  const [makeTodo, setMakeTodo] = useState<Boolean>(false);//button

  const maxPerDay = 6;

  const days:makeTodoDayOptions[] = ['today', 'tomorrow', 'week'];
  let defaultDay:makeTodoDayOptions = 'today';

  const  defaultRadio = (day:makeTodoDayOptions) => {

    if(defaultDay === 'today' && day === 'today' && todaysTodos.length >= maxPerDay) {
      defaultDay = 'tomorrow'
      return false;
    } else if(defaultDay === 'today' && day === 'today' && todaysTodos.length < maxPerDay) {
      return true;
    }
    
    if(defaultDay === 'tomorrow' && day === 'tomorrow' && tomorrowsTodos.length >= maxPerDay) {
      defaultDay = 'week'
      return false;
    } else if(defaultDay === 'tomorrow' && day === 'tomorrow' && tomorrowsTodos.length < maxPerDay) {
      return true;
    }
    
    if(defaultDay === 'week' && day === 'week') {
      return true;
    } 
  }
  
  const disableRadio = (day:makeTodoDayOptions) => {
    
    if(day === 'today' && todaysTodos.length >= maxPerDay) {
      return true;
    } else if(defaultDay === 'today' && day === 'today' && todaysTodos.length < maxPerDay) {
      return false;
    }
    
    if(day === 'tomorrow' && tomorrowsTodos.length >= maxPerDay) {
      return true;
    } else if(day === 'tomorrow' && tomorrowsTodos.length < maxPerDay) {
      return false;
    }
    
    if(day === 'week') {
      return false;
    } 
  }

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value: typeof fieldInfo[keyof typeof fieldInfo] = event.target.value;
    setFieldInfo({...fieldInfo, [event.target.id]: value})
  }

  const onOptionChange = (event: ChangeEvent<HTMLInputElement>):void => {
    let value = event.target.value as makeTodoDayOptions;
    setFieldInfo({...fieldInfo, day: value});
  }

  const handleMakeTodo = async(event:SyntheticEvent<HTMLFormElement, SubmitEvent>) =>  {
    event.preventDefault();

    const setTodoCount = (day:makeTodoDayOptions) =>{
      if (day === 'today') {
        return todaysTodos.length;
      }

      if (day === 'tomorrow') {
        return tomorrowsTodos.length;
      }

      if (day === 'week') {
        return 0;
      }

    }

    if (!fieldInfo.name) {
      alert("You need to input your todo.");
      return;
    }

    if (db && user && fieldInfo.name) {
      
      const setDate = (inputDate:Date) => {
        const dueDate = inputDate;
        dueDate.setHours(0,0,0,0);

        switch (fieldInfo.day) {
          
          case 'tomorrow': {
            dueDate.setDate(dueDate.getDate() + 1); 
            return dueDate;   
          
          }
  
          case 'week': {
            dueDate.setDate(dueDate.getDate() + 5); 
            return dueDate;
          }
  
          default: {
            return dueDate;
          }
  
        };
      }

      const todo = {
        complete:false,
        dateDue: setDate(new Date()),
        dateUpdated:serverTimestamp(),
        name: fieldInfo.name,
        order: setTodoCount(fieldInfo.day),
        owner: user.uid,
      }

      updateTodo(fieldInfo.day, todo);

      try {
        
        await addDoc(collection(db, 'Todos'), todo);

      } catch (error) {

        console.log(error);
      
      }

    }

  }

  return (

    <>
  
    { !makeTodo ?
      <button onClick={() => setMakeTodo(true)} className='makeTodoButton'>Add A Todo</button>
      : 
      <div className='makeTodoFormWrapper'>
        <form className='makeTodoForm' name="make_todo" onSubmit={handleMakeTodo}>
          <label>Add Your Todo
          <input className='makeTodoTextBox'
          id='name'
          type='text'
          placeholder='What you Gonna Do?'
          value={fieldInfo.name}
          onChange={onFieldChange}
          />  
          </label>

          <div className='makeTodoRadioButtons'>
            {
              days.map((day, index) => ( 
              <div key={index}>
              { <div  className={disableRadio(day) ? "makeTodoButtonTransparent" : 'makeTodoButtonOpaque'}>
                  <input type="radio" onChange={onOptionChange} name='days' value={day}  defaultChecked={defaultRadio(day)} disabled={disableRadio(day)}/> {day.charAt(0).toUpperCase() + day.slice(1)}
                </div>
              }
              </div>
              ))
            }

          </div>

          <button type='submit'>Add</button>
        </form>
      </div>
    }
   
    </>

  )
}