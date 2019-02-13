const program = require('commander');
const fs = require('fs');
const admin = require('firebase-admin');

const secretKeys = require('../veronica-keys/veronica-roma-firebase-keys.json');
const config = require('./config.json');

/**
 * Firebase: initialize admin API
 */
admin.initializeApp({
  credential: admin.credential.cert(secretKeys),
  databaseURL: config['databaseURL']
});

const auth = admin.auth();
const firestore = admin.firestore();

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

/**
 * CLI: Create Users
 */
program
  .command('create <object>')
  .description('Create specified <object> in firebase database')
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

  // remove user record if user already exists
  try {
    userRecord = await auth.getUserByEmail(user['email']);
  } catch (err) {
    errCode = err['code'];
  }

  if (errCode != 'auth/user-not-found') {
    console.log('Warning: user already exists');
    console.log(userRecord['uid']);
    deleteUser(userRecord);
  }
  console.log('');

  // create user
  try {
    // add user to firebase.authentication
    userRecord = await auth.createUser({
      email: user['email'],
      emailVerified: false,
      password: user['password'],
      displayName: user['displayName'],
      disable: false
    });

    // add user roles to firebase.firestore
    await firestore.collection('roles').doc(userRecord['uid']).set({
      roles: user['roles']
    });
  } catch (err) {
    console.log(err);
  }
}

/**
 * Remove all records for the given user
 */
async function deleteUser(user) {
  try {
    await auth.deleteUser(user['uid']);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Firebase: clear database
 */
async function clear() {
  const usersPerPage = 25;
  const firebaseDelay = 200;

  var nextPageToken;
  var usersIds = [];
  var docsIds = [];

  // delay function in order do not overload firebase quota
  const pauseFor = (delay) => new Promise(resolve => setTimeout(resolve, delay));

  try {
    // get list of all users
    do {
      result = await auth.listUsers(usersPerPage, nextPageToken);
      result.users.forEach(userRecord => {
        usersIds.push(userRecord.uid)
      });
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    // remove users
    for (let userId of usersIds) {
      // var deleteUser = async (userId) => {
      //   await pauseFor(firebaseDelay);
      //   console.log(`User Id: ${userId}`);
      // }
      // await deleteUser(userId);
      await (async () => {
        await pauseFor(firebaseDelay);
        await admin.auth().deleteUser(userId);
        console.log(`User Id: ${userId}`);
      })();
    }

    // get list of all documents
    var collectionRef = firestore.collection('users');
    snapshot = await collectionRef.get();
    for (let doc of snapshot.docs) {
      docsIds.push(doc.id);
    }

    // remove documents
    for (let docId of docsIds) {
      await (async () => {
        await pauseFor(firebaseDelay);
        await firestore.collection('users').doc(docId).delete();
        console.log(`Document Id: ${docId}`);
      })();
    }
  } catch (err) {
    console.log(err);
  }
}
