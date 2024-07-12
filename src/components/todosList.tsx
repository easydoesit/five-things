import { DocumentData} from "firebase/firestore";
import OfficialTodo from "./officialTodo";
import { useEffect } from "react";
import sortOrder from "../Utils/sortOrder";

interface TodosListI {
  todos:DocumentData[]; 
  title:string
  day:makeTodoDayOptions;
}

export default function TodosList({todos, title, day}:TodosListI) {
 console.log('day: ', day)


useEffect(() => {
  
  if(day !== 'complete') {
    sortOrder(todos,'order');
  } else {
    sortOrder(todos, 'date');
  }

  
}, [todos, day]);

  return (
    <div className="listInfo">
      <h1>{title}</h1>
      <ol>
        {
        todos.map((todo, index) => (
          <>
          {index <= 4 &&
          <OfficialTodo
          key={index}
          name={todo.name}
          day={day}     
          complete={todo.complete}
          />
          }
          </>
        ))
        }
        {
          todos.length > 0 ? 
        <hr className={`hr${day}`}></hr>
        :
        <>
          Nothing to see here.
        </>
        }
      </ol>
      <ol>
        {
        todos.map((todo, index) => (
          <>
          {index > 4 && index <= 6 &&
          <OfficialTodo
          key={index}
          name={todo.name}
          day={todo.day}     
          complete={todo.complete}
          />
          }
          </>
          
        ))
        }
      </ol>
        {
            todos.length > 7 && day === 'overdue' &&
          <div>There's Even More</div>
        }
    
        
    
      
    </div>
  )
}