import React, {ChangeEvent, useEffect, useState, SyntheticEvent} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { addDoc, collection, serverTimestamp,} from "firebase/firestore";
import { User} from "firebase/auth";

const db = CheckFirestoreInit();

interface makeTodoI {
  name:string;
  day:makeTodoDayOptions;
  count:number;
  user:User | null;
}

export default function MakeTodo({day, count, user}:makeTodoI) {
  console.log('startday: ', day);
  const maxPerDay = 6;

    const toDoInitialState:makeTodoI = {
      name: "",
      day:day,
      count:count,
      user:user,
    }
  
  const [fieldInfo, setFieldInfo] = useState<makeTodoI>(toDoInitialState);
  const [makeTodo, setMakeTodo] = useState<Boolean>(false);

  const days:makeTodoDayOptions[] = ['today', 'tomorrow', 'week'];

  if (fieldInfo.day !== 'week') {

    if (count >= maxPerDay) {
      const index = days.findIndex(x => x === fieldInfo.day);
      fieldInfo.day = days[index + 1]
    }

  }

  const  defaultRadio = (day:makeTodoDayOptions) => {
    if (day === fieldInfo.day) {
      return true;
    }
  }
  
  

  const disabledRadio = (daycount:number, pickedDay:string) => {
    if (daycount >= maxPerDay && pickedDay === fieldInfo.day) {
      return true;
    } else {
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
          order: count,
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
            {
              days.map((day, index) => ( 
              <>
              <input key={index} type="radio" onChange={onOptionChange} name='days' value={day}  disabled={false} defaultChecked={defaultRadio(day)}/> {day.charAt(0).toUpperCase() + day.slice(1)}
              </>
              ))
            }
          


          {/* <input type="radio" onChange={onOptionChange} name="today" value='today' checked={defaultcheckedToday} disabled={disableToday} /> Today
          <input type="radio" onChange={onOptionChange} name="tomorrow" value='tomorrow' checked={defaultcheckedTomorrow} disabled={disableTomorrow}/> Tomorrow
          <input type='radio' onChange={onOptionChange} name='week' value='week' checked={defaultcheckedWeek} />Week */}
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