import {DocumentData, writeBatch, doc,serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckFirestoreInit } from "./Firestore";
import { User } from "firebase/auth";

const db = CheckFirestoreInit();

export async function UpdateEntireTodoListFirestore(user:User, todoList:DocumentData[]) {
  
  try {
    
    if(db && user) {
      const batchList = writeBatch(db);

      todoList.forEach((todo) => {
      
        batchList.update(doc(db, 'Todos', todo.id), {
          owner: user.uid,
          name: todo.name,
          order: todo.order,
          dateDue: todo.dateDue,
          complete: todo.complete,
          dateUpdated: serverTimestamp(),
        });
      
      });

      await batchList.commit();

    } 

  } catch(error) {
    
    alert(error);

  }

}

export async function updateSingleTodoFirestore(user:User, todo:DocumentData) {

  try {

    if(db && user) {
      const todoRef = doc(db, 'Todos', todo.id);

      const response = await updateDoc(todoRef, {
        owner: user.uid,
        name: todo.name,
        order: todo.order,
        dateDue: todo.dateDue,
        complete: todo.complete,
        dateUpdated: serverTimestamp(),
      });

      return response;
    }

  } catch(error) {
    
    alert(error);
  
  }


}