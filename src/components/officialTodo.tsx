interface IOfficialTodo {
  day:makeTodoDayOptions;
  name:string;
  complete:boolean
}

export default function OfficialTodo({day, name, complete}:IOfficialTodo) {
  return (
    <div className={`officialTodo  ${day}`}>
      <button className="officialTodo move"></button>
      <div className={`officialTodo  name`}>{name}</div>
      <button className={`officialTodo complete`}>{complete === true ? 'restore' : 'complete'}</button>
    </div>
  )
}