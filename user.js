var firebase = require("firebase");
var config = require("./config");

firebase.initializeApp(config);
var db = firebase.firestore();

(async function() {
  try {
    auth = await firebase.auth().signInAnonymously()
    console.log("User ID: "+ auth.user.uid);
    
    document = await db.collection("users").add({
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    console.log("Document ID: "+ document.id);
    
    process.exit(0);
  }
  catch (error) {
    console.log(error);
  }
})();

console.log('A');