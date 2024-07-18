import { DocumentData } from "firebase/firestore";

export default function reNumberOrder(list:DocumentData[], startNumber:number) {
  
  list.forEach((doc) => {
    if (doc.order > startNumber) {
      doc.order -= 1;
    } 
  })

}