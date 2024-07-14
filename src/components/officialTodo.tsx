import { useState } from "react";

interface IOfficialTodo {
  day:makeTodoDayOptions;
  name:string;
  complete:boolean;
  first:boolean;
  last:boolean;
}

export default function OfficialTodo({day, name, complete, first, last}:IOfficialTodo) {
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
  

  
  return (
    <div className={`officialTodo  ${day}`}>
      { checkDayRender(day)   && 
      <div className="moveButtons">
        <button className={`officialTodoMoveUp ${first === true && 'blackout'}`}><img src={process.env.PUBLIC_URL + '/images/icons_up.png'} alt="Move up Button"/></button>
        <button className={`officialTodoMoveDown ${last === true && 'blackout'}`}><img src={process.env.PUBLIC_URL + '/images/icons_down.png'} alt="Move down Button"/></button>
        </div>
      }
      { !listChange ?
      <>  
        <button className={`officialTodoName`} onClick={() => setListChange(true)}>{name}</button>
      </>
      :
      <div className="officialTodoChangeList">
        <div className="officialTodoChangeListHeading">Move Day?</div>
        <div>
          <button className="buttontoday">Today</button>
          <button className="buttontomorrow">Tomorrow</button>
          <button className="buttonweek">Week</button>
        </div>
      </div>
      }
       <button className={`officialTodoComplete`}>{complete === true ? <img src={process.env.PUBLIC_URL + '/images/icons_restore.png'} alt="Restore Button"/> : <img src={process.env.PUBLIC_URL + '/images/icons_complete.png'} alt="Complete Button"/>}</button>
      </div>
  )
}