import { DocumentData } from "firebase/firestore";
import { useState } from "react";
import { maxPerDay } from "../Utils/constants";
import downIcon from "../images/icons_down.png";
import upIcon from '../images/icons_up.png'
import restoreIcon from '../images/icons_restore.png';
import completeIcon from '../images/icons_complete.png'


interface IOfficialTodo {
  day:makeTodoDayOptions;
  id:string;
  name:string;
  complete:boolean;
  first:boolean;
  last:boolean;
  order:number;
  reOrderTodo(todoListName:makeTodoDayOptions, todoList:DocumentData[], direction:'down' | 'up', todoId:string):void;
  changeDayTodo(fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], moveToListName:'today' |'tomorrow' | 'week' | 'complete', todoId:string): void;
  deleteTodo(fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], todoId:string):void;
  todoList:DocumentData[];
  owner:string;
  dateDue:Date;
  restoreTodo(todoId:string):void;
  todaysTodos: DocumentData[];
  tomorrowsTodos: DocumentData[];
  weeksTodos:DocumentData[];
  styles:'black' | 'yellow';
}

export default function OfficialTodo({day, dateDue, owner, id, name, complete, first, last, order, reOrderTodo, todoList, changeDayTodo, deleteTodo, restoreTodo ,todaysTodos, tomorrowsTodos, weeksTodos, styles}:IOfficialTodo) {
  
  const [listChange, setListChange]= useState<boolean>(false);

  const checkDayRender = (day:makeTodoDayOptions) => {
    if (day === 'today') {
      return true;
    } 
    if ( day === 'tomorrow'){
      return true;
    }
  
    if (day === 'week') {
      return true;
    }
  
    return false;
  }

  const checkMoveToRender = (day:makeTodoDayOptions, list:DocumentData[], compareToDay:makeTodoDayOptions) => {
    console.log('day: ', day);
    console.log('compareToDay: ', compareToDay);
    console.log(list.length);

    let compare = true;

    if(list.length >= maxPerDay) {
      compare = false;
    }

    if(day === compareToDay) {
      compare = false;
    }
  
    return compare;

    }
  
  return (
    <div className={`officialTodo  ${day}`}>
      { checkDayRender(day)   && 
      <div className="moveButtons">
        <button className={`officialTodoMoveUp ${first === true && 'blackout'}`} onClick={() => {first !== true && reOrderTodo(day, todoList, 'up', id)}}>{first !== true && <img src={upIcon} alt="Move up Button"/>}</button>
        <button className={`officialTodoMoveDown ${last === true && 'blackout'}`} onClick={() => {last !== true && reOrderTodo(day, todoList, 'down', id)}}>{last !== true && <img src={downIcon} alt="Move down Button"/>}</button>
        </div>
      }
      { !listChange ?
      <>  
        <button className={`officialTodoName ${styles}`} onClick={() => {if(day !== 'complete'){ setListChange(true) }}}>{`${name}`}</button>
      </>
      :
      <div className="officialTodoChangeList">
        <div className="officialTodoChangeListHeading">Move Day?</div>
        <div>
        <button className="buttonCancel" onClick={()=> {setListChange(false)}}>Cancel</button>
           {checkMoveToRender(day, todaysTodos, 'today') &&
          <button className="buttontoday" onClick={()=> {changeDayTodo(day, todoList,'today', id); setListChange(false)}}>Today</button>
          }
          {checkMoveToRender(day, tomorrowsTodos, 'tomorrow')  &&
          <button className="buttontomorrow" onClick={()=> {changeDayTodo(day, todoList, 'tomorrow', id); setListChange(false)}}>Tomorrow</button>
          }
          {checkMoveToRender(day, weeksTodos, 'week')  &&
          <button className="buttonweek" onClick={()=> {changeDayTodo(day, todoList, 'week', id); setListChange(false)}}>Week</button>
          }
          <button className="buttonDelete" onClick={()=> {deleteTodo(day, todoList, id); setListChange(false)}}>Delete</button>
        </div>
      </div>
      }
        {complete === true ? 
        <button className="officialTodoComplete" onClick={() => restoreTodo(id)}><img src={restoreIcon} alt="Restore Button" /></button>
          :
        <button className="officialTodoComplete" onClick={() => changeDayTodo(day, todoList, 'complete', id)}><img src={completeIcon} alt="Complete Button"/></button>
        }
      </div>
  )
}