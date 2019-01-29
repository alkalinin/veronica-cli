var admin = require("firebase-admin");

var serviceAccount = require("../veronica-keys/veronica-roma-firebase-adminsdk-xhn2g-261def52ac.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://veronica-roma.firebaseio.com"
});
