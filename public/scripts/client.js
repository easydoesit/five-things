$(document).ready(function() {
  let clientData;
  let newID;
  let todayCount = 0;
  let tomorrowCount = 0;
  let nextDayCount = 0;
  let opportunitiesCount = 0;
  let recurringCount = 0;
  
  // renderTodos takes in a array of Todo's and displays them
  const renderTodaysTodos = function(todos) {
    console.log("render", todos);
    for (let i in todos) {
      
      if (todos[i].location === "today" && todos[i].status === "incomplete") {
        $("#today ul.incomplete").append(createTodo(todos[i]));
        todayCount = newTodoOrder(todos[i].order);
      }

      if (todos[i].location === "today" && todos[i].status === "complete") {
        $("#today ul.complete").append(createTodo(todos[i]));
        todayCount = newTodoOrder(todos[i].order);
      }

      if (todos[i].location === "tomorrow") {
        $("#tomorrow ul").append(createTodo(todos[i]));
        tomorrowCount = newTodoOrder(todos[i].order);
      }

      if (todos[i].location === "day-after") {
        $("#day-after ul").append(createTodo(todos[i]));
        nextDayCount = newTodoOrder(todos[i].order);
      }

      if (todos[i].location === "opportunities") {
        $("#opportunities ul").append(createTodo(todos[i]));
        opportunitiesCount = newTodoOrder(todos[i].order);
      }

      if (todos[i].location === "recurring") {
        $("#recurring ul").append(createTodo(todos[i]));
        recurringCount = newTodoOrder(todos[i].order);
      }

    }
  };

  //create and render todo
  const createTodo = function(todo) {
    let checked = "";
    let crossoff = "";

    if (todo.status === "complete") {
      checked = "checked";
      crossoff = "crossoff";
    }

    let checkbox = `<input id="${todo.id}" name="checkbox${todo.id}" type="checkbox" class="checkbox" ${checked}></input>`;

    if (todo.location !== "today") {
      checkbox = "";
    }
    
    const output = `${checkbox}
    <label for="checkbox${todo.id}" name="title" id="${todo.id}" value="${todo.title}" class="${crossoff}">${todo.title}</label>
    <input id="id" type ="hidden" name="id" value="${todo.id}">
    <input id="title" type="hidden" name="title" value="${todo.title}">
    <input id="location" type="hidden" name="location" value="${todo.location}">
    <input id="order" type="hidden" name="order" value="${todo.order}">
    <input id="status" type="hidden" name="status" value="${todo.status}">
    <input id="created_at" type="hidden" name="created_at" value="${todo.created_at}">
    <input id="type" type="hidden" name="type" value="single_task">        
      `;

    const fullTodo = `<li order=${todo.order} status="${todo.status}"><form class="todoItem" id="${todo.id}"><div>
    ${output}
    </div>
    <div>
    <i class="fa fa-pencil" aria-hidden="true"></i>
    <i class="fa fa-arrows" aria-hidden="true"></i>
    <i class="fa fa-trash" aria-hidden="true"></i>
    </div>
    </form>
    </li>`;
    
    return fullTodo;
  
  };

  // load todos and render them
  const loadTodos = function() {
    $.ajax("/todos", { method: "GET" }).then(function(data) {
      clientData = data;
      console.log("clientData", clientData);
      newID = idCheck(clientData);
      console.log('newID', newID);

      if (!$(".window li").length) {

        renderTodaysTodos(clientData);

      } else {
        const lastTodo = [data.find(item => item.id === newID - 1)];
        console.log(lastTodo);
        
        renderTodaysTodos(lastTodo);
      
      }
    
    });
  
  };

  // create a new todo FORM based on type and position
  $("#today h2 a").on("click", (event) => {
    event.preventDefault();
    $("#today ul").append(todoForm(checkFormVal(removeTodoForms()), 'today', todayCount));
  });

  $("#tomorrow h2 a").on("click", (event) => {
    event.preventDefault();
    $("#tomorrow ul").append(todoForm(checkFormVal(removeTodoForms()), 'tomorrow', tomorrowCount));
  });

  $("#day-after h2 a").on("click", (event) => {
    event.preventDefault();
    $("#day-after ul").append(todoForm(checkFormVal(removeTodoForms()), 'day-after', nextDayCount));
  });

  $("#opportunities h2 a").on("click", (event) => {
    event.preventDefault();
    $("#opportunities ul").append(todoForm(checkFormVal(removeTodoForms()), 'opportunities', opportunitiesCount));
  });

  $("#recurring h2 a").on("click", (event) => {
    event.preventDefault();
    $("#recurring ul").append(todoForm(checkFormVal(removeTodoForms()), 'recurring', recurringCount));
  });

  //render newTodo Form
  const todoForm = function(formVal, window, orderCount)  {
    const renderTodoForm = `
    <li order="${orderCount}">
      <form id ="todoForm">
        <input type=TEXT name="title" id="todo-text" value="${formVal}">
        <input type="hidden" name="id" value=${newID}>
        <input type="hidden" name="location" value="${window}">
        <input type="hidden" name="order" value="${orderCount}">
        <input type="hidden" name="status" value="incomplete">
        <button id="new-todo-button" type="submit" class="button"><i class="fa-solid fa-plus"></i></button>
        <button id="cancel-todo-button" type="link" class="button"><i class="fa-solid fa-minus"></i></button>
        </form>     
    </li>`;

    return renderTodoForm;
  
  };

  // remove any todo Form Elements if they are there and return the value.
  const removeTodoForms = function() {

    if ($("#todoForm").length) {
    
      if (!$("#todoForm input").val()) {
        $("#todoForm").parent().remove();
      } else {
        const value = $("#todoForm input").val();
        $("#todoForm").parent().remove();
        return value;
      }
    
    }
  
  };

  //check the form value to carry it over to a different form.
  const checkFormVal = function(value) {
    if (value === undefined) {
      return "";
    } else {
      return value;
    }
  };

  //cancel newTodo
  $(".window").on("click", "#cancel-todo-button", (event) => {
    event.preventDefault();

    $("#todoForm").parent().remove();

  });

  //submit a newTodo
  $(".window").on("click", "#new-todo-button", function(event) {
    event.preventDefault();
    const windowLocation = $(this).parent().parent().parent().parent().attr("id");
    const formData = $("#todoForm").serialize();
    
    console.log(formData);
    
    $.post("/todos", formData, () => {
    });

    $("#todoForm").parent().remove();
    
    loadTodos();

    reorderTodos(windowLocation);

  });

  //put the newTodo at the bottom of the list
  const newTodoOrder = function(orderNum) {
    let count = 0;
    
    if (count < orderNum) {
      count += orderNum - 1;
    }
    
    return count;

  };

  // get the largest ID number and return a larger one.
  const idCheck = function(data) {
    const idArray = [];
    
    for (let i in data) {
      idArray.push(parseInt(data[i].id));
      console.log(idArray);
    }
    
    let idNum = Math.max(...idArray);
    idNum += 1;
    
    return idNum;
  };

  // when a checkbox is checked get it's id and crossoff the label
  $(".window").on("click", "input[type=checkbox]", function() {
    const window = $(this).parent().parent().parent().parent().parent().attr("id");
    //$(this).parent().parent().parent().appendTo("#today ul");
    let checkboxId = $(this).prop('id');
    
    crossOffTodo(checkboxId, window);
    
    const formData = $(`form[id="${checkboxId}"]`).serialize();
    
    console.log(formData);
    
    $.post("/todos", formData, () => {
    });
  });
  
  //crossoff Todo and move it to the bottom
  const crossOffTodo = function(id, window) {
    
    if ($(`.todoItem div input:checkbox[id="${id}"]`).is(":checked")) {

      $(`.todoItem div label[for="checkbox${id}"]`).addClass("crossoff");
      $(`.todoItem div input#status`).val("complete");
      $(`.todoItem#${id}`).parent().attr("status", "complete");
      $(`.todoItem#${id}`).parent().appendTo("#today ul.complete");

    } else {

      $(`.todoItem div label[for="checkbox${id}"]`).removeClass("crossoff");
      $(`.todoItem div input#status`).val("incomplete");
      $(`.todoItem#${id}`).parent().attr("status", "incomplete");
      $(`.todoItem#${id}`).parent().appendTo("#today ul.incomplete");
      sortLIList(window);
    }

  };

  loadTodos();

  ////////////////////////////////////////////////
  // HELPERS
  ////////////////////////////////////////////////

  //Add 1 to all the todos.order and push to DB.

  const reorderTodos = function(windowLocation) {
    
    for (let i in clientData) {

      if (clientData[i].location === windowLocation) {
        clientData[i].order += 1;
        const todoAsArray = [];
        let postString;

        for (let j in clientData[i]) {

          todoAsArray.push(encodeURIComponent(j) + "=" + encodeURIComponent(clientData[i][j]));
          postString = todoAsArray.join("&");
        
        }
        
        $.post("/todos", postString, () => {});
      
      }

    }
  };

  //sort incomplete <li> elements based on the window where they belong
  const sortLIList = function(window) {
    
    const listItems = $(`#${window} ul.incomplete li`);

    listItems.sort(function(a,b) {
      let aVal = parseInt($(a).attr('order'));
      let bVal = parseInt($(b).attr('order'));
  
      return bVal - aVal;
  
    });

    listItems.prependTo(`#${window} ul.incomplete`);
  
  };

});


