var firebase = require("firebase");
var config = require("./config");

firebase.initializeApp(config);
var db = firebase.firestore();

var createTestDocument = async () => {
  try {
    auth = await firebase.auth().signInAnonymously()
    console.log("User ID: "+ auth.user.uid);
    
    docRef = await db.collection("documents").add({
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    console.log("Document ID: "+ docRef.id);

    process.exit(0);
  }
  catch (error) {
    console.log(error);
  }
};

var readTestDocument = async () => {
  var usersRef = db.collection("documents");
  usersRef.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      })
    })
    .catch(err => {
      console.log(error);
    })
}

createTestDocument();
//readTestDocument();
