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
 * Tests set for non-authenticated users
 */
var nonAuthUsersTest01 = async () => {
  console.log('  01 Cannot create document');

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


/**
 * Tests set for anonymous users
 */
var anonUsersTest01 = async () => {
  console.log('  01 Can create document');

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

var anonUsersTest02 = async () => {
  console.log('  02 Cannot read other documents');

  var passed = false;

  try {
    userRecord = await auth.signInAnonymously();

    var collectionRef = firestore.collection('users');
    var snapshot = await collectionRef.get();

    await auth.signOut();
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

var anonUsersTest03 = async () => {
  console.log('  03 Cannot change roles');

  var passed = false;

  try {
    userRecord = await auth.signInAnonymously();

    await firestore.collection('users-roles').doc(userRecord.user.uid).set({
      roles: ["admin"]
    });

    await auth.signOut();
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

/**
 * Tests set for admin users
 */

var adminUsersTest01 = async () => {
  console.log('  01 Can read all documents');

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

    var collectionRef = firestore.collection('users');
    var snapshot = await collectionRef.get();

    await auth.signOut();

    passed = true;
  } catch (error) {
    passed = false;
  }

  if (passed) {
    console.log('  OK');
  } else {
    console.log('  FAILED');
  }
}

/**
 * Execute all tests set
 */
(async () => {
  console.log('TEST: Non-authenticated users');
  await nonAuthUsersTest01();

  console.log('TEST: Anonymous users');
  await anonUsersTest01();
  await anonUsersTest02();
  await anonUsersTest03();

  console.log('TEST: Admin users');
  await adminUsersTest01();

  process.exit(0);
})();
