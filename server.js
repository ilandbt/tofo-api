var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

//mock DB
var todos = [{
	id: 1,
	desceiption: 'Drink warter',
	completed: false
}, {
	id: 2,
	desceiption: 'Eat stake',
	completed: false
}, {
	id: 3,
	desceiption: 'Sleep',
	completed: true
}];

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

app.listen(PORT, function() {
	console.log('Express listening to port : ' + PORT);
});