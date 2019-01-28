var firebase = require("firebase");
var config = require("./config");

firebase.initializeApp(config);

login()
.then(db_save);

async function login() {
  console.log('A');
  firebase.auth().signInAnonymously()
  .catch(error => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

async function db_save() {
  print('B');
  var db = firebase.firestore();
  
  db.collection("users").add({
    first: "Ada",
    last: "Lovelace",
    born: 1815
  })
  .then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
    process.exit(0);
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  });
}

// firebase.auth().signInAnonymously()
// .then(response => {
//   (async function() {
//     await database();
//     console.log('B');
//   })();
// })
// .catch(error => {
//   var errorCode = error.code;
//   var errorMessage = error.message;
// });

// console.log('A');

// async function database() {
//   var db = firebase.firestore();
//   console.log(firebase.auth().currentUser.uid);
  
//   db.collection("users").add({
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
//   })
//   .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
//     process.exit(0);
//   })
//   .catch(function(error) {
//     console.error("Error adding document: ", error);
//   });
// }