const firebase = require('firebase');

const config = require('./config.json');

/**
 * Firebase: initialize user API
 */
firebase.initializeApp(config);

const db = firebase.firestore();

var createTestDocument = async () => {
  console.log('TEST: Create Document');
  try {
    auth = await firebase.auth().signInAnonymously()
    console.log('User Id: ' + auth.user.uid);
    
    docRef = await db.collection('users').add({
      answers: [0, 1, 2, 3, 4, 5]
    });
    console.log('Document Id: ' + docRef.id);
  }
  catch (error) {
    console.log(error);
  }
  console.log('');
};

var readTestDocument = async () => {
  console.log('TEST: Read Document');

  console.log('User Id: ' + auth.user.uid);
  try {
    var usersRef = db.collection('users');
    snapshot = await usersRef.get();
    snapshot.forEach(doc => {
      console.log('Document Id: ' + doc.id);
    });
  } catch(error) {
    console.log(error);
  }
  console.log('');
}

(async () => {
  await createTestDocument();
  await readTestDocument();
  process.exit(0);
})();
