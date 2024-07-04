import React, {useEffect, useState} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { DocumentData, collection, getDocs, orderBy, query, where, limit} from "firebase/firestore";
import { User} from "firebase/auth";
import MakeTodo from './makeTodo';

const db = CheckFirestoreInit();

interface TodosTodayI {
  user:User | null;
}

export default function TodosToday({user}:TodosTodayI) {
  const [todos, setTodos] = useState<DocumentData[]>([]);

  useEffect(() => {    
    let ignore = false; // needed to only run once in dev

    if (db && user) {
    // Function to fetch data from the database
      const fetchData = async () => {
        try {
        const q = query(collection(db, 'Todos'), where("owner", "==", user.uid), orderBy("order", "asc"), limit(7));
        const querySnapshot = await getDocs(q);
        
        if (!ignore) {
          querySnapshot.forEach((doc) => {
            setTodos((oldTodos) => [...oldTodos, doc.data()]);
          })
          }

        } catch (error) {
          console.log(error);
        }
      };
  
    fetchData();

    }

    return () => {
      ignore = true;
    }
 
  }, [user]);

  console.log("todos:", todos);


  return (
    <>
      <h1>Data from database:</h1>
      <MakeTodo 
      name = ""
      user ={user}
      day = 'today'
      count = {todos.length}
      />
      <ol>
        {todos.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ol>
    </>
  )
}