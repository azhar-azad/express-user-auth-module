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
  .get(advancedResults(Todo, 'user'), getTodos)
  .post(protect, authorize('user', 'admin'), createTodo);

router.route('/:id')
  .get(getTodo)
  .put(protect, authorize('user', 'admin'), updateTodo)
  .delete(protect, authorize('user', 'admin'), deleteTodo);

module.exports = router;