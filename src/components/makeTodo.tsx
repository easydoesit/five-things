import React, {ChangeEvent, useState, SyntheticEvent, useEffect, useCallback} from 'react';
import { DocumentData, serverTimestamp, query, collection, where, getDocs} from "firebase/firestore";
import { User} from "firebase/auth";
import {firstLetterToUpperCase} from '../Utils/changeCase';
import { maxPerDay } from '../Utils/constants';
import { createTodoFirestore } from '../Utils/FirestoreFunctions';
import { setDate } from '../Utils/dates';
import sortOrder from '../Utils/sortOrder';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { setDayFromDateDue } from '../Utils/dates';

const db = CheckFirestoreInit();

interface MakeTodoI {
  user:User | null;
  todaysTodos: DocumentData[];
  tomorrowsTodos: DocumentData[];
  weeksTodos:DocumentData[];
  checkListandUpdateTodosRender(list:makeTodoDayOptions, newTodoList:DocumentData[]):void;
  displayDay:makeTodoDayOptions;
  toggleTransition(on:boolean):void;
}

interface TodoFieldI {
  name:string | undefined;
  day:makeTodoDayOptions;
  count:number;
  user:User | null;
  order:number,
  dateUpdated:Date;
  dateDue:Date;
}

export default function MakeTodo({user, todaysTodos, tomorrowsTodos, weeksTodos, checkListandUpdateTodosRender, displayDay, toggleTransition}:MakeTodoI) {
    
  const toDoInitialState:TodoFieldI = {
      name: "",
      day:displayDay,
      count:0,
      user:user,
      order: 0,
      dateUpdated: new Date(),
      dateDue: new Date(),
    }
  
  const [fieldInfo, setFieldInfo] = useState<TodoFieldI>(toDoInitialState);//fieldvalues
  const [radioToday, setRadioToday] = useState<boolean>(false);
  const [radioTomorrow, setRadioTomorrow] = useState<boolean>(false);
  const [radioWeek, setRadioWeek] = useState<boolean>(false);
  const [disabledRadioToday, setDisabledRadioToday] = useState<boolean>(false);
  const [disabledRadioTomorrow, setDisabledRadioTomorrow] = useState<boolean>(false);
  const [disabledRadioWeek, setDisabledRadioWeek] = useState<boolean>(false);

  const thisListDay = displayDay;
  const days:makeTodoDayOptions[] = ['today', 'tomorrow', 'week'];

  const checkedRadio = (day:makeTodoDayOptions) => {

    switch(day) {
      case 'complete': {
        return radioToday;
      }

      case 'today': {
        return radioToday;
      }

      case 'tomorrow': {
        return radioTomorrow;
      }

      case 'week':{
        return radioWeek;
      }

      case 'overdue': {
        return radioWeek;
      }

    }
  }

  //Disable radio buttons based on conditions
  const disableRadio = (day:makeTodoDayOptions) => {
    
    switch(day) {
      case 'today':{
        return disabledRadioToday;
      }
      case 'tomorrow':{
        return disabledRadioTomorrow;
      }
      case 'week':{
        return disabledRadioWeek;
      }
   }
  } 

  //this updates the changes to the MakeTodo Fields
  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
  
    let value: typeof fieldInfo[keyof typeof fieldInfo] = event.target.value;
    setFieldInfo({...fieldInfo, [event.target.id]: value})
  
  }

  //this changes the day based on user input
  const onOptionChange = (event: ChangeEvent<HTMLInputElement>):void => {

    let day = event.target.value as makeTodoDayOptions;

    switch(day){
      case 'today':
        setRadioToday(true);
        setRadioTomorrow(false);
        setRadioWeek(false);
      
      break;

      case 'tomorrow':
        setRadioToday(false);
        setRadioTomorrow(true);
        setRadioWeek(false);
      
      break;
        
      case 'week': {
        setRadioToday(false);
        setRadioTomorrow(false);
        setRadioWeek(true);
      }
    }
    
    setFieldInfo({...fieldInfo, day: day});
  }

    //this is to figure out the lists total todo's
    const setTodoCount = (day:makeTodoDayOptions) =>{
      
      if (day === 'today') {
        return todaysTodos.length;
      }

      if (day === 'tomorrow') {
        return tomorrowsTodos.length;
      }

      if (day === 'week') {
        return weeksTodos.length;
      }

    }

  const handleMakeTodo = async(event:SyntheticEvent<HTMLFormElement, SubmitEvent>) =>  {
    event.preventDefault();
    
    if (!fieldInfo.name) {

      alert("You need to input your todo.");
      
      return;
    
    } else {
      toggleTransition(true);


      const todoFirestore = {
        complete:false,
        dateDue: setDate(fieldInfo.day),
        dateUpdated:serverTimestamp(),
        name: fieldInfo.name,
        order: setTodoCount(fieldInfo.day),
        owner: user!.uid,
      }

      const fetchDataTodoList = async() => {
        
        if (db && user) { 

          try {
            
            const queryThisTodoList = query(collection(db, 'Todos'), where('owner', '==', user.uid), where('dateDue', '==', setDate(fieldInfo.day)));
            const querySnapshot = await getDocs(queryThisTodoList);

            return querySnapshot;


          } catch (error) {
            alert(error);
          }
        }
      }
    

      await createTodoFirestore(user!, todoFirestore)
      .then(() => {
        fetchDataTodoList()
          .then((querySnapshot)=> {
            const unsortedTodos:DocumentData[] = [];

            querySnapshot?.forEach((doc) => {
              const docObject = doc.data();
              docObject.id = doc.id;

              if (docObject.complete === false) {

                unsortedTodos.push(docObject);
              }
              
            })
            const sortedTodos = sortOrder(unsortedTodos, 'order');

            checkListandUpdateTodosRender(setDayFromDateDue(todoFirestore.dateDue),sortedTodos);
            
              //resetSetFieldInfo
            setFieldInfo(toDoInitialState); 

            let resetForm:HTMLFormElement | null;
            
            resetForm = document.getElementById('makeTodoForm') as HTMLFormElement;
              if(resetForm) {
                resetForm.reset();
              }

            toggleTransition(false);
          });

      });

    }

  }

  const setCheckedList = useCallback(() => {

    const updateField = (day:makeTodoDayOptions) => {
      setFieldInfo({
        name: "",
        day:day,
        count:0,
        user:user,
        order: 0,
        dateUpdated: new Date(),
        dateDue: new Date(),
      })
    }

    if ((thisListDay === 'today' || thisListDay === 'overdue') && todaysTodos.length < maxPerDay) {
      setRadioToday(true);
      setRadioTomorrow(false);
      setRadioWeek(false);
      updateField('today');
    }

    if (thisListDay === 'tomorrow' && tomorrowsTodos.length < maxPerDay) {
      setRadioToday(false);
      setRadioTomorrow(true);
      setRadioWeek(false);
      updateField('tomorrow');
    }
    
    
    if ((thisListDay === 'week' || thisListDay === 'complete') && weeksTodos.length < maxPerDay) {
      setRadioToday(false);
      setRadioTomorrow(false);
      setRadioWeek(true);
      updateField('week');
    }

  }, [thisListDay, todaysTodos.length, tomorrowsTodos.length, weeksTodos.length, user]);
  

  ///This picks the list
  useEffect(() => {
    
    setCheckedList();

  }, [setCheckedList]);

  useEffect(() => {

    if(todaysTodos.length < maxPerDay) {
      setDisabledRadioToday(false);
    } else {
      setDisabledRadioToday(true);
    }

    if(tomorrowsTodos.length < maxPerDay) {
      setDisabledRadioTomorrow(false);
    } else {
      setDisabledRadioTomorrow(true);
    }

    if(weeksTodos.length < maxPerDay) {
      setDisabledRadioWeek(false);
    } else {
      setDisabledRadioWeek(true);
    }

  },[todaysTodos.length, tomorrowsTodos.length, weeksTodos.length])

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
                  <input type="radio" className={`radio${day}`} onChange={onOptionChange} name='days' value={day}  checked={checkedRadio(day)} disabled={disableRadio(day)}/> {firstLetterToUpperCase(day)}
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