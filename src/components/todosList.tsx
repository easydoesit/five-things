import { DocumentData} from "firebase/firestore";
import OfficialTodo from "./officialTodo";
import { useEffect, useState } from "react";
import sortOrder from "../Utils/sortOrder";
import { maxPerDay } from "../Utils/constants";

interface TodosListI {
  todos:DocumentData[]; 
  title:string
  day:makeTodoDayOptions;
  reOrderTodo(todoListName:makeTodoDayOptions, todoList:DocumentData[], direction:'down' | 'up', todoId:string):void;
  changeDayTodo(fromTodoListName:makeTodoDayOptions, fromTodoList:DocumentData[], moveToListName:'today' |'tomorrow' | 'week', todoId:string): void;
}

export default function TodosList({todos, title, day, reOrderTodo, changeDayTodo}:TodosListI) {

  return (

    <div className="listInfo">
      <h1>{title}</h1>
      <ol>
        {
        todos.map((todo, index) => (
          <div key={index}>
          {index <= 4 &&
          <OfficialTodo
          key={index}
          id={todo.id}
          name={todo.name}
          day={day}     
          complete={todo.complete}
          first={index === 0 && true}
          last={(index === todos.length -1) ? true : false}
          order={todo.order}
          reOrderTodo = {reOrderTodo}
          todoList = {todos}
          dateDue={todo.dueDate}
          owner={todo.owner}
          changeDayTodo={changeDayTodo}
          />
          }
          </div>
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
          <div key={index}>
          {index > 4 && index < maxPerDay &&
          <OfficialTodo
          key={index}
          id={todo.id}
          name={todo.name}
          day={day}     
          complete={todo.complete}
          first={false}
          last= {((index === 6) || (index === todos.length -1)) ? true : false}
          order={todo.order}
          reOrderTodo = {reOrderTodo}
          todoList ={todos}
          dateDue={todo.dueDate}
          owner={todo.owner}
          changeDayTodo={changeDayTodo}
          />
          }
          </div>
          
        ))
        }
      </ol>
        {
            todos.length > maxPerDay && day === 'overdue' &&
          <div>There's Even More</div>
        }
    
        
    
      
    </div>
  )
}