"use strict";

// Defines helper functions for saving and getting todos, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    //save a todo to 'db'
    saveTodo: function(newTodo, callback) {
      newTodo.id = parseInt(newTodo.id);
      db.push(newTodo);
      callback(null, true);
    },

    // get sorted Todos
    getTodos: function(callback) {
      const sortedDB = db.sort((a, b) => a.order - b.order);
      callback(null, sortedDB);
    }
  };
};