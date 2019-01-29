const admin = require('firebase-admin');

const serviceAccount = require("../veronica-keys/veronica-roma-firebase-adminsdk-xhn2g-261def52ac.json");

const settings = {timestampsInSnapshots: true};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://veronica-roma.firebaseio.com"
});
admin.firestore().settings(settings);

var db = admin.firestore();

db.collection('users').get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });


function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin.auth().listUsers(1000, nextPageToken)
    .then(function(listUsersResult) {
      listUsersResult.users.forEach(function(userRecord) {
        //console.log("user", userRecord.toJSON());
        console.log("user", userRecord.uid);
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken)
      }
    })
    .catch(function(error) {
      console.log("Error listing users:", error);
    });
}
  // Start listing users from the beginning, 1000 at a time.
listAllUsers();

//process.exit(0);
