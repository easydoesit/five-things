import { DocumentData } from "firebase/firestore";

export default function sortOrder(todolist:DocumentData[], sortType:'order' | 'date') {
  
  if(sortType  === 'order') {

  todolist.sort((a:DocumentData, b:DocumentData) => {return a.order - b.order});

  // let count = 0;
  
  // todolist.forEach((todo) => {
  //   todo.order = count;
  //   count += 1;
  // })
  
}

  if (sortType === 'date') {
    todolist.sort((a:DocumentData, b:DocumentData) => {return b.dateUpdated - a.dateUpdated});
  }

  return todolist;
}