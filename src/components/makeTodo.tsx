import React, {ChangeEvent, useEffect, useState, SyntheticEvent} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { User} from "firebase/auth";

const db = CheckFirestoreInit();

type makeTodoOptions = 'today' | 'tomorrow' | 'week' | 'overdue'

interface makeTodoI {
  name:string;
  day:makeTodoOptions;
  count:number;
  user:User | null;
}

export default function MakeTodo({day, count, user}:makeTodoI) {
  const toDoInitialState:makeTodoI = {
    name: "",
    day:day,
    count:count + 1,
    user:user,
  }


  const [fieldInfo, setFieldInfo] = useState<makeTodoI>(toDoInitialState);
  const [makeTodo, setMakeTodo] = useState<Boolean>(false);

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value: typeof fieldInfo[keyof typeof fieldInfo] = event.target.value;
    setFieldInfo({...fieldInfo, [event.target.id]: value})
  }

  const onOptionChange = (event: ChangeEvent<HTMLInputElement>):void => {
    let value = event.target.value as makeTodoOptions;
    setFieldInfo({...fieldInfo, day: value});
  }


  const handleMakeTodo = async(event:SyntheticEvent<HTMLFormElement, SubmitEvent>) =>  {
    event.preventDefault();

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

      try{
        await addDoc(collection(db, 'Todos'), {
          complete:false,
          dateDue: setDate(new Date()),
          dateUpdated:serverTimestamp(),
          name: fieldInfo.name,
          order: 1,
          owner: user.uid,
        })

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
          <input type="radio" onChange={onOptionChange} name="today" value='today' checked={fieldInfo.day === 'today'} /> Today
          <input type="radio" onChange={onOptionChange} name="tomorrow" value='tomorrow' checked={fieldInfo.day === 'tomorrow'} /> Tomorrow
          <input type='radio' onChange={onOptionChange} name='week' value='week' checked={fieldInfo.day === 'week'} />Week
          </div>

          <button type='submit'>Add</button>
        </form>
      </div>
    }
    <div>
      {`${fieldInfo.count} ${fieldInfo.name} ${fieldInfo.user?.uid} ${fieldInfo.day}`}
    </div>

    </>

  )
}