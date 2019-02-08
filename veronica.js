const program = require('commander');
const fs = require('fs');

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
  });

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
 * Firebase: Create User
*/

async function createUser(user) {
  console.log(user);
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
