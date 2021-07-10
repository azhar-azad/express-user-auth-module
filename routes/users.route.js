const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users.controller');
const { protect, authorize } = require('../middlewares/auth.mw');

const User = require('../models/User');
const advancedResults = require('../middlewares/advancedResults');

const router = express.Router();

router.use(protect); // have to logged in to access the following routes.
router.use(authorize('admin')); // have to be admin, too.

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;