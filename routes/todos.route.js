const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo
} = require('../controllers/todos.controller');

const Todo = require('../models/Todo');
const advancedResults = require('../middlewares/advancedResults');

const router = require('express').Router();

router.route('/')
  .get(advancedResults(Todo), getTodos)
  .post(createTodo);

router.route('/:id')
  .get(getTodo)
  .put(updateTodo)
  .delete(deleteTodo);

module.exports = router;