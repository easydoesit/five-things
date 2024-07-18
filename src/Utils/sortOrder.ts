import { DocumentData } from "firebase/firestore";

export default function sortOrder(todolist:DocumentData[], sortType:'order' | 'date') {
  
  if(sortType  === 'order') {

  todolist.sort((a:DocumentData, b:DocumentData) => {return a.order - b.order});
  
}

  if (sortType === 'date') {
    todolist.sort((a:DocumentData, b:DocumentData) => {return b.dateUpdated - a.dateUpdated});
  }
}