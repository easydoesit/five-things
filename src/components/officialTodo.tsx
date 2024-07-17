import { DocumentData } from "firebase/firestore";

import { useState } from "react";

interface IOfficialTodo {
  day:makeTodoDayOptions;
  id:string;
  name:string;
  complete:boolean;
  first:boolean;
  last:boolean;
  order:number;
  reOrderTodo(todoListName:makeTodoDayOptions, todoList:DocumentData[], direction:'down' | 'up', todoId:string):void;
  changeDayTodo(fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], moveToListName:'today' |'tomorrow' | 'week', todoId:string): void;
  todoList:DocumentData[];
  owner:string;
  dateDue:Date;

}

export default function OfficialTodo({day, dateDue, owner, id, name, complete, first, last, order, reOrderTodo, todoList, changeDayTodo}:IOfficialTodo) {
  
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
  
  console.log('todoList :', todoList);
  
  return (
    <div className={`officialTodo  ${day}`}>
      { checkDayRender(day)   && 
      <div className="moveButtons">
        <button className={`officialTodoMoveUp ${first === true && 'blackout'}`} onClick={() => {first !== true && reOrderTodo(day, todoList, 'up', id)}}><img src={process.env.PUBLIC_URL + '/images/icons_up.png'} alt="Move up Button"/></button>
        <button className={`officialTodoMoveDown ${last === true && 'blackout'}`} onClick={() => {last !== true && reOrderTodo(day, todoList, 'down', id)}}><img src={process.env.PUBLIC_URL + '/images/icons_down.png'} alt="Move down Button"/></button>
        </div>
      }
      { !listChange ?
      <>  
        <button className={`officialTodoName`} onClick={() => {if(day !== 'complete'){ setListChange(true) }}}>{`${name} ${order}`}</button>
      </>
      :
      <div className="officialTodoChangeList">
        <div className="officialTodoChangeListHeading">Move Day?</div>
        <div>
          <button className="buttontoday" onClick={()=> changeDayTodo(day, todoList,'today', id)}>Today</button>
          <button className="buttontomorrow" onClick={()=> changeDayTodo(day, todoList, 'tomorrow', id)}>Tomorrow</button>
          <button className="buttonweek" onClick={()=> changeDayTodo(day, todoList, 'week', id)}>Week</button>
          <button className="button">Delete</button>
        </div>
      </div>
      }
       <button className={`officialTodoComplete`}>{complete === true ? <img src={process.env.PUBLIC_URL + '/images/icons_restore.png'} alt="Restore Button"/> : <img src={process.env.PUBLIC_URL + '/images/icons_complete.png'} alt="Complete Button"/>}</button>
      </div>
  )
}