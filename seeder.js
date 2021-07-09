/**
 * Run command: node seeder.js -flag
 * Flags:
 * -i: to import data
 * -d: to delete data
 * */
const fs = require('fs');
const dotenv = require('dotenv');
const colors = require('colors');
const mongoose = require('mongoose');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Todo = require('./models/Todo');
const User = require('./models/User');

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read JSON files
const todos = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/todos.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Todo.create(todos);
    await User.create(users);

    console.log('Data Imported ...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Todo.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed ...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') { // import
  importData();
} else if (process.argv[2] === '-d') { // destroy
  deleteData();
} else {
  console.log('wrong command');
}