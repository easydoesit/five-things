"use strict";

// Defines helper functions for saving and getting todos, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    //save a todo to 'db'
    saveTodo: function(todo, callback) {
      let match = false;
      console.log(todo);
      todo.id = parseInt(todo.id);
      for (let i in db) {
        if (db[i].id === todo.id) {
          match = true;
        }
      }
      //if the todo doesn't exist add it, otherwise updated it.
      if (match !== true) {
        db.push(todo);
      } else {
        const todoIndex = db.findIndex((obj => obj.id === todo.id));
        console.log("index", todoIndex);

      }
      callback(null, true);
    },

    // get sorted Todos
    getTodos: function(callback) {
      const sortedDB = db.sort((a, b) => a.order - b.order);
      callback(null, sortedDB);
    }

  };
};