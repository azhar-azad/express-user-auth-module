const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo
} = require('../controllers/todos.controller');
const { protect, authorize } = require('../middlewares/auth.mw');

const Todo = require('../models/Todo');
const advancedResults = require('../middlewares/advancedResults');

const router = require('express').Router();

router.route('/')
  .get(advancedResults(Todo), getTodos)
  .post(protect, createTodo);

router.route('/:id')
  .get(getTodo)
  .put(protect, updateTodo)
  .delete(protect, deleteTodo);

module.exports = router;