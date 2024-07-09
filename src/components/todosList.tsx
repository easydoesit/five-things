import { User} from "firebase/auth";
import { DocumentData} from "firebase/firestore";

interface TodosListI {
  todos:DocumentData[]; 
  title:string
  day:makeTodoDayOptions;
  user:User | null;
}

export default function TodosList({todos, title, day, user}:TodosListI) {
 
  return (
    <>
      <h1>{title}</h1>
      <ol>
        {todos.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ol>
    </>
  )
}