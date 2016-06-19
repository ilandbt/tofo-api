var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/bsic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});


sequelize.sync({
	// force: true
}).then(function() {
	console.log('Everything is synced');



	Todo.findById(5).then(function(todo) {

		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log('no item found');
		}
	});

	// Todo.create({
	// 	description: 'Eat'
	// }).then(function(todo){
	// 	return Todo.create({
	// 		description: 'Sleep'
	// 	})
	// }).then(function() {
	// 	// return Todo.findById(1)
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%ee%'
	// 			}
	// 		}
	// 	});
	// }).then(function(todos) {
	// 	if (todos) {
	// 		todos.forEach(function(todo){ 
	// 			console.log(todo.toJSON());
	// 		});
	// 		// 
	// 	} else {
	// 		console.log('not todo found');
	// 	}
	// }).catch(function(error) {
	// 	console.log(error);
	// });
});