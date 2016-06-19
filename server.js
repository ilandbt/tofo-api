var express = require('express');
var bodyParser = require('body-parser');


var app = express();
var PORT = process.env.PORT || 3000;

//mock DB
var todos = [];
var todoNextId = 1;

//application level middleware for parsing all json body received
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo api root');
});

//get all todos list

app.get('/todos', function(req, res) {
	res.json(todos);
});

//get todo item by id
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo;
	
	todos.forEach(function(todoItem){
		if (todoId === todoItem.id) {
			matchedTodo = todoItem;
		}
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

//post new todo item
app.post('/todos', function(req, res) {
	var body = req.body;
	body.id = todoNextId++;

	todos.push(body);

	res.send(body);
});

app.listen(PORT, function() {
	console.log('Express listening to port : ' + PORT);
});