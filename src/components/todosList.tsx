import { User} from "firebase/auth";
import { DocumentData} from "firebase/firestore";
import OfficialTodo from "./officialTodo";

interface TodosListI {
  todos:DocumentData[]; 
  title:string
  day:makeTodoDayOptions;
  user:User | null;
}

export default function TodosList({todos, title, day, user}:TodosListI) {
 
  return (
    <div className='listHolder'>
      <h1>{title}</h1>
      <ol>
        {todos.map((todo, index) => (
          <OfficialTodo
          key={index}
          name={todo.name}
          day={todo.day}     
          complete={todo.complete}
          />
        ))}
      </ol>
    </div>
  )
}