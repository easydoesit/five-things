import { DocumentData } from "firebase/firestore";

export default function sortOrder(todolist:DocumentData[], sortType:'order' | 'date') {
  
  switch(sortType){
    case 'order': {
    
      todolist.sort((a:DocumentData, b:DocumentData) => {return a.order - b.order});
      return todolist;
    
    }

    case 'date': {
      
      todolist.sort((a:DocumentData, b:DocumentData) => {return b.dateUpdated - a.dateUpdated});
      return todolist;
    
    }
  }
}