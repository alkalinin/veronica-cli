const fs = require('fs');
const firebase = require('firebase');

const config = require('./config.json');

/**
 * Firebase: initialize user API
 */
firebase.initializeApp(config);

const auth = firebase.auth();
const firestore = firebase.firestore();

/**
 * Create Documents Test Set
 */
var createDocumentsTest01 = async () => {
  console.log('  01 Non authenticated user cannot create document');

  var passed = false;

  try {
    doc = await firestore.collection('users').add({
      answers: [0, 1, 2, 3, 4, 5]
    });
  } catch (error) {
    if (error.code === 'permission-denied') {
      passed = true;
    }
  }

  if (passed) {
    console.log('  OK');
  } else {
    console.log('  FAILED');
  }

  console.log('');
}

var createDocumentsTest02 = async () => {
  console.log('  02 Authenticated user can create document');

  var passed = false;

  try {
    userRecord = await auth.signInAnonymously();

    await firestore.collection('users').doc(userRecord.user.uid).set({
      answers: [0, 1, 2, 3, 4, 5]
    });

    await auth.signOut();

    passed = true;
  } catch (error) {
    console.log(error);
  }

  if (passed) {
    console.log('  OK');
  } else {
    console.log('  FAILED');
  }

  console.log('');
}

/**
 * Read Documents Test Set
 */
var readDocumentsTest01 = async () => {
  console.log('  01 Non authenticated user cannot read list of all document');

  var passed = false;

  try {
    var collectionRef = firestore.collection('users');
    var snapshot = await collectionRef.get();
  }
  catch (error) {
    if (error.code === 'permission-denied') {
      passed = true;
    }
  }

  if (passed) {
    console.log('  OK');
  } else {
    console.log('  FAILED');
  }

  console.log('');
}

var readDocumentsTest02 = async () => {
  console.log('  02 Authenticated user cannot read list of all document');

  var passed = false;

  try {
    userRecord = await auth.signInAnonymously();

    var collectionRef = firestore.collection('users');
    var snapshot = await collectionRef.get();
  }
  catch (error) {
    if (error.code === 'permission-denied') {
      passed = true;
    }
  }

  if (passed) {
    console.log('  OK');
  } else {
    console.log('  FAILED');
  }

  console.log('');
}

var readDocumentsTest03 = async () => {
  console.log('  03 Authenticard user with \'admin\' role can read list of all document');

  var passed = false;

  // find user with admin rights
  var json = JSON.parse(fs.readFileSync('../veronica-keys/veronica-roma-firebase-users.json'));
  var users = json['users'];
  var admin;
  for (var user of users) {
    if (user.roles.includes('admin')) {
      admin = user;
      break;
    }
  }

  if (! admin) {
    console.log('  FAILED');
    return;
  }

  // test read data
  try {
    userRecord = await auth.signInWithEmailAndPassword(admin.email, admin.password);

    console.log(userRecord.user.uid);

    var collectionRef = firestore.collection('users');
    var snapshot = await collectionRef.get();

    await auth.signOut();

    passed = true;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Execute all tests set
 */
(async () => {
  console.log('TEST: Create Documents');
  await createDocumentsTest01();
  await createDocumentsTest02();

  console.log('TEST: Read Documents');
  await readDocumentsTest01();
  await readDocumentsTest02();
  await readDocumentsTest03();

  process.exit(0);
})();
