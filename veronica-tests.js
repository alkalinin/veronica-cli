const firebase = require("firebase");

const config = require("./config.json");

/**
 * Firebase: initialize user API
 */
firebase.initializeApp(config);

const db = firebase.firestore();

var createTestDocument = async () => {
  try {
    auth = await firebase.auth().signInAnonymously()
    console.log("User ID: "+ auth.user.uid);
    
    docRef = await db.collection("users").add({
      answers: [0, 1, 2, 3, 4, 5]
    });
    console.log("Document ID: "+ docRef.id);

    process.exit(0);
  }
  catch (error) {
    console.log(error);
  }
};

var readTestDocument = async () => {
  var usersRef = db.collection("users");
  usersRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch(err => {
      console.log(error);
    });
}

createTestDocument();
readTestDocument();
