import React, {ChangeEvent, useState, SyntheticEvent, useEffect} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { DocumentData, addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { User} from "firebase/auth";
import {firstLetterToUpperCase} from '../Utils/changeCase';
import { maxPerDay } from '../Utils/constants';

const db = CheckFirestoreInit();

interface MakeTodoI {
  user:User | null;
  todaysTodos: DocumentData[];
  tomorrowsTodos: DocumentData[];
  weeksTodos:DocumentData[];
  updateTodo(list:makeTodoDayOptions, todo: DocumentData):void;
  displayDay:makeTodoDayOptions;
}

interface TodoFieldI {
  name:string | undefined;
  day:makeTodoDayOptions;
  count:number;
  user:User | null;
}

export default function MakeTodo({user, todaysTodos, tomorrowsTodos, weeksTodos, updateTodo, displayDay}:MakeTodoI) {
    
  const toDoInitialState:TodoFieldI = {
      name: "",
      day:'today',
      count:0,
      user:user,
    }
  
  const [fieldInfo, setFieldInfo] = useState<TodoFieldI>(toDoInitialState);//fieldvalues
  const thisListDay = displayDay;
  const [defaultDay, setDefaultDay] = useState<'today' | 'tomorrow' | 'week' >("today");

  const days:makeTodoDayOptions[] = ['today', 'tomorrow', 'week'];
  //let defaultDay:makeTodoDayOptions = 'today';

  useEffect(() => {
  
    if (thisListDay === 'today' || thisListDay === 'overdue') {
      setDefaultDay('today');
    }
  
    if (thisListDay === 'tomorrow') {
      setDefaultDay('tomorrow');
    }
    
    if (thisListDay === 'week' || thisListDay === 'complete') {
      setDefaultDay('week');
    }
  
  }, [thisListDay]);

  console.log(defaultDay);


  const  defaultRadio = (day:makeTodoDayOptions) => {

    if(defaultDay === 'today' && day === 'today' && todaysTodos.length >= maxPerDay) {
      setDefaultDay('tomorrow');
      return false;
    } else if(defaultDay === 'today' && day === 'today' && todaysTodos.length < maxPerDay) {
      return true;
    } else if (defaultDay !== 'today' && day === 'today') {
      return false;
    }

    if(defaultDay === 'tomorrow' && day === 'tomorrow' && tomorrowsTodos.length >= maxPerDay) {
      setDefaultDay('week');
      return false;
    } else if(defaultDay === 'tomorrow' && day === 'tomorrow' && tomorrowsTodos.length < maxPerDay) {
      return true;
    } else if (defaultDay !== 'tomorrow' && day === 'tomorrow') {
      return false;
    }
   
    if(defaultDay === 'week' && day === 'week' && weeksTodos.length >= maxPerDay) {
      return false;
    } else if (defaultDay === 'week' && day === 'week' && weeksTodos.length < maxPerDay) {
      return true;
    } else if (defaultDay !== 'week' && day === 'week') {
      return false;
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
    
    if(day === 'week' && weeksTodos.length >= maxPerDay) {
      return true;
    } else if (day === 'week' && weeksTodos.length < maxPerDay) {
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

      setFieldInfo(toDoInitialState); 
      let resetForm:HTMLFormElement | null;
      resetForm = document.getElementById('makeTodoForm') as HTMLFormElement;
        if(resetForm) {
          resetForm.reset();
        }

    }

  }

  return (

    <div className='makeTodoHolder'>

      <div className='makeTodoFormWrapper'>
        <form className='makeTodoForm' id='makeTodoForm' name="make_todo" onSubmit={handleMakeTodo}>
          <div className='makeTodoColumn'>
            <input className='makeTodoTextBox'
            id='name'
            type='text'
            placeholder='What you Gonna Do?'
            value={fieldInfo.name}
            onChange={onFieldChange}
            />  
          

          <div className='makeTodoRadioButtonsGroup'>
              {
                days.map((day, index) => ( 
              
                <label key={index} className={disableRadio(day) ? "makeTodoButtonTransparent" : 'makeTodoButtonOpaque'}>
                  <input type="radio" className={`radio${day}`}onChange={onOptionChange} name='days' value={day}  checked={defaultRadio(day)} defaultChecked={defaultRadio(day)} disabled={disableRadio(day)}/> {firstLetterToUpperCase(day)}
                </label>
                
                
                ))
              }

            </div>
            </div>
          <button className='makeTodoAddButton' type='submit'>Add</button>
        </form>
  
      </div>
    
   
    </div>

  )
}