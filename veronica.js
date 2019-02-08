const program = require('commander');
const fs = require('fs');
const admin = require('firebase-admin');


/**
 * Firebase: initialize  admin API
 */
const secretKeys = require("../veronica-keys/veronica-roma-firebase-keys.json");

admin.initializeApp({
  credential: admin.credential.cert(secretKeys),
  databaseURL: "https://veronica-roma.firebaseio.com"
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
    cmdValue = entity;

    var json = JSON.parse(fs.readFileSync('../veronica-keys/veronica-roma-firebase-users.json'))
    var users = json['users']
    for (var i in users) {
      await createUser(users[i]);
    }
    process.exit(0);
  });

/**
 * CLI: Process Errors
 */

program
  .command('*')
  .action(function(env) {
    cmdValue = env
    console.log('Error: unknown command.');
  });

program.parse(process.argv);

if (typeof cmdValue === 'undefined') {
  console.error('Error: no command given.');
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
 * Remove all records for the givem user
 * @param {*} user
 */
async function removeUser(user) {
  try {
    await admin.auth().deleteUser(user['uid']);
  } catch (err) {
    console.log(err);
  }
}


// const admin = require('firebase-admin');

// const secret_keys = require("../veronica-keys/veronica-roma-firebase-keys.json");

// const settings = {timestampsInSnapshots: true};

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://veronica-roma.firebaseio.com"
// });
// admin.firestore().settings(settings);

// var db = admin.firestore();

// db.collection('users').get()
//   .then((snapshot) => {
//     snapshot.forEach((doc) => {
//       console.log(doc.id, '=>', doc.data());
//     });
//   })
//   .catch((err) => {
//     console.log('Error getting documents', err);
//   });


// function listAllUsers(nextPageToken) {
//   // List batch of users, 1000 at a time.
//   admin.auth().listUsers(1000, nextPageToken)
//     .then(function(listUsersResult) {
//       listUsersResult.users.forEach(function(userRecord) {
//         //console.log("user", userRecord.toJSON());
//         console.log("user", userRecord.uid);
//       });
//       if (listUsersResult.pageToken) {
//         // List next batch of users.
//         listAllUsers(listUsersResult.pageToken)
//       }
//     })
//     .catch(function(error) {
//       console.log("Error listing users:", error);
//     });
// }
//   // Start listing users from the beginning, 1000 at a time.
// listAllUsers();

// //process.exit(0);
