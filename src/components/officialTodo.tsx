interface IOfficialTodo {
  day:makeTodoDayOptions;
  name:string;
  complete:boolean
}

export default function OfficialTodo({day, name, complete}:IOfficialTodo) {
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
        <button className="officialTodoMoveUp"><img src={process.env.PUBLIC_URL + '/images/icons_up.png'} alt="Move up Button"/></button>
        <button className="officialTodoMoveDown"><img src={process.env.PUBLIC_URL + '/images/icons_down.png'} alt="Move down Button"/></button>
        </div>
      }
      <div className={`officialTodoName`}>{name}</div>
      <button className={`officialTodoComplete`}>{complete === true ? <img src={process.env.PUBLIC_URL + '/images/icons_restore.png'} alt="Restore Button"/> : <img src={process.env.PUBLIC_URL + '/images/icons_complete.png'} alt="Complete Button"/>}</button>
    </div>
  )
}