import React, {useEffect, useState} from 'react';
import { CheckFirestoreInit } from '../Utils/Firestore';
import { User} from "firebase/auth";
import MakeTodo from './makeTodo';
import { DocumentData} from "firebase/firestore";

const db = CheckFirestoreInit();

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
      {(day !== 'complete' && day !== 'overdue') &&
      <MakeTodo 
      name = ""
      user ={user}
      day = {day}
      count = {todos.length}
      /> 
    }
      <ol>
        {todos.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ol>
    </>
  )
}