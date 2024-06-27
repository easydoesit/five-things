import React, {useEffect, useState} from 'react';
import { DocumentData, collection, getDocs} from "firebase/firestore";
import { CheckFirestoreInit } from './Utils/Firestore';

const db = CheckFirestoreInit();

function App() {
  const [todos, setTodos] = useState<DocumentData[]>([]);

  useEffect(() => {
    let ignore = false; // needed to only run once in dev
    // Initialize the Firebase Fires with the provided configuration
    if (db) {
          // Function to fetch data from the database
      const fetchData = async () => {
        const querySnapshot = await getDocs(collection(db, 'Todos'));
        if (!ignore) {
          querySnapshot.forEach((doc) => {
            setTodos(oldTodos => [...oldTodos, doc.data()]);
          })
        }
    };
  
    fetchData();

    return () => {
      ignore = true;
    }

    }
 
  }, []);


  return (
    <div>
      <h1>Data from database:</h1>
      <ol>
        {todos.map((item, index) => (
          <li key={index}>{item.Action}</li>
        ))}
      </ol>
    </div>
  );
}

export default App;
