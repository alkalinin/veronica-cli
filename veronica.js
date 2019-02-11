const program = require('commander');
const fs = require('fs');
const admin = require('firebase-admin');

const secretKeys = require("../veronica-keys/veronica-roma-firebase-keys.json");
const config = require("./config.json");


/**
 * Firebase: initialize admin API
 */
admin.initializeApp({
  credential: admin.credential.cert(secretKeys),
  databaseURL: config['databaseURL']
});

const settings = {timestampsInSnapshots: true};
admin.firestore().settings(settings);

/**
 * CLI: Create Users
 */
program
  .command('create <entity>')
  .description('Create specified <entity> in firebase database')
  .action(async function(entity, args) {
    hasCmd = true;

    var json = JSON.parse(fs.readFileSync('../veronica-keys/veronica-roma-firebase-users.json'))
    var users = json['users']
    for (var i in users) {
      await createUser(users[i]);
    }
    process.exit(0);
  });

/**
 * CLI: Clear all users and records from database
 */
program
  .command('clear')
  .description('Remove all users and records from database')
  .action(async function(args) {
    hasCmd = true;

    await clear();
    console.log('Done clear');
    process.exit(0);
  });

var hasCmd = false;
program.parse(process.argv);

if (! hasCmd) {
  console.error('ERROR: Invalid command or no command was given');
  process.exit(1);
}

/**
 * Firebase: create user
 */
async function createUser(user) {
  console.log('User: ' + user['email']);
  var userRecord;
  var errCode;

  // Remove user record if user already exists
  try {
    userRecord = await admin.auth().getUserByEmail(user['email']);
  } catch (err) {
    errCode = err['code'];
  }

  if (errCode != 'auth/user-not-found') {
    console.log('Warning: user already exists');
    console.log(userRecord['uid']);
    removeUser(userRecord);
  }
  console.log('');

  // Create user
  try {
    userRecord = await admin.auth().createUser({
      email: user['email'],
      emailVerified: false,
      password: user['password'],
      displayName: user['displayName'],
      disable: false
    });
  } catch (err) {
    console.log(err);
  }

  console.log(userRecord);
  // Create user role
  var dataRecord = {
    roles: user['roles']
  };
}

/**
 * Remove all records for the given user
 */
async function deleteUser(user) {
  try {
    await admin.auth().deleteUser(user['uid']);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Firebase: cleare database
 */
async function clear() {
  const usersPerPage = 25;
  var nextPageToken;
  var usersUids = [];

  // get list of all users
  try {
    do {
      result = await admin.auth().listUsers(usersPerPage, nextPageToken);
      result.users.forEach(userRecord => {
        usersUids.push(userRecord.uid)
      });
      nextPageToken = result.pageToken;
    } while (nextPageToken);
  } catch (err) {
    console.log(err);
  }

  // remove users
  const firebaseDelay = 200;
  const pauseFor = (delay) => new Promise(resolve => setTimeout(resolve, delay));

  for (let uid of usersUids) {
    // var deleteUser = async (uid) => {
    //   await pauseFor(firebaseDelay);
    //   console.log(`User Id: ${uid}`);
    // }
    // await deleteUser(uid);
    await (async () => {
      await pauseFor(firebaseDelay);
      await admin.auth().deleteUser(uid);
      console.log(`User Id: ${uid}`);
    })();
  }
}
