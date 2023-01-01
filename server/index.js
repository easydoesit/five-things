"use strict";

// express setup

const PORT = 8080;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// parse data in buffer to make it readable.
app.use(bodyParser.urlencoded({extended: true}));

// make the public directory the startpoint
app.use(express.static("public"));

// the database
const db = require("./data-files/todos.json");

// data-helpers
const dataHelpers = require("../public/scripts/data-helpers")(db);

////////////////////////////////////////////////////
// Routes
////////////////////////////////////////////////////

const todoRoutes = require("./routes/todos")(dataHelpers);

app.use("/todos", todoRoutes);

app.listen(PORT, () => {
  console.log("Agile-Todo listening on port " + PORT);
});