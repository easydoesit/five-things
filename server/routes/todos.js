"use strict";

const express     = require('express');
const todoRoutes  = express.Router();

module.exports = function(dataHelpers) {

  todoRoutes.get("/", function(req, res) {
    dataHelpers.getTodos((err, todos) => {
      //console.log(todos);
      if (err) {
        res.status(500).json({error: err.message});
      } else {
        res.json(todos);
      }
    });
  });

  todoRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({error: 'invalid request: no data in post body'});
      return;
    }

    const todo = {
      id: req.body.id,
      title: req.body.text,
      status: req.body.status,
      location: req.body.location,
      type: "single_task",
      order:req.body.order,
      created_at: Date.now()
    };

    dataHelpers.saveTodo(todo, (err) => {
      if (err) {
        res.status(500).json({error: err.message});
      } else {
        res.status(201).send();
      }
    });

  });

  return todoRoutes;
};