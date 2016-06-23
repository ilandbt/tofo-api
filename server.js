var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = require('./app.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

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

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	var where = {
		userId: req.user.id
	};

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
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findOne({
			where: {
				id: todoId,
				userId: req.user.id
			}
		})
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	//get only completed, description fields
	var body = _.pick(req.body, "completed", "description");

	db.todo.create(body)
		.then(function(todo) {
			//res.json(todo.toJSON());
			req.user.addTodo(todo).then(function() {
				return todo.reload();
			}).then(function(todo) {
				res.json(todo.toJSON());
			});
		}, function(error) {
			console.log(error);
			return res.status(400).json(error);
		});
});


//deleted an item
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
			where: {
				id: todoId,
				userId: req.user.id
			}
		})
		.then(function(rowsDeleted) {
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, "completed", "description");
	var attributes = {};

	var todoId = parseInt(req.params.id, 10);


	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	// update
	db.todo.findOne({
			where: {
				id: todoId,
				userId: req.user.id
			}
		})
		.then(function(todo) {
			if (todo) {
				todo.update(attributes)
					.then(function() {
						res.json(todo.toJSON());
					}, function(e) {
						res.status(400).json(e);
					});
			} else {
				res.status(404).send();
			}
		}, function() {
			res.status(500).send();
		});
});



//USER//
//post new user
app.post('/users', function(req, res) {
	//get only completed, description fields
	var body = _.pick(req.body, "email", "password");

	db.user.create(body)
		.then(function(user) {
			res.json(user.toPublicJSON());

		}, function(error) {
			console.log(error);
			return res.status(400).json(error);
		});
});

//login
app.post('/users/login', function(req, res) {

	var body = _.pick(req.body, "email", "password");
	var userInstance;

	db.user.authenticate(body)
		.then(function(user) {
			var token = user.generateToken('authentication');
			userInstance = user;
			return db.token.create({
				token: token
			});
		}).then(function(token) {
			res.header('Auth', token.token).json(userInstance.toPublicJSON());
		}).catch(function() {
			res.status(401).send();
		});

});

//login
app.post('/users/logout', middleware.requireAuthentication, function(req, res) {
	req.token.destroy()
		.then(function() {
			res.status(204).send();
		}).catch(function() {
			res.status(500).send();
		})
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening to port : ' + PORT);
	});
});