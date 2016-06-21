var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


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
	var queryParams = req.query;
	var where = {};

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed = false;
	}


	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

		where.description = {
			$like: '%' + queryParams.q + '%'
		};
	}

	db.todo.findAll({
			where: where
		})
		.then(function(todos) {
			res.json(todos);
		}, function(error) {

			console.log(error);
			return res.status(500).send();
		});
});

//get todo item by id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId)
		.then(function(todo) {

			if (!!todo) {
				return res.json(todo.toJSON());
			} else {
				return res.status(404).send();
			}


		}, function(error) {
			console.log(error);
			return res.status(500).send();
		});
});

//post new todo item
app.post('/todos', function(req, res) {
	//get only completed, description fields
	var body = _.pick(req.body, "completed", "description");

	db.todo.create(body)
		.then(function(todo) {
			res.json(todo.toJSON());

		}, function(error) {
			console.log(error);
			return res.status(400).json(error);
		});
});


//deleted an item
app.delete('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted){
		if (rowsDeleted === 0) {
			res.status(404).json({
				"message": "no item found"
			});
		} else {
			res.status(204).send();
		}

	}, function() {

	});
});

//update an item
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, "completed", "description");
	var validAttributes = {};

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		return res.status(404).json({
			"message": "no item found"
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({
			"message": "completed"
		});
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).json({
			"message": "description"
		});
	}

	// update
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening to port : ' + PORT);
	});
});