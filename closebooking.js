const admin = require("firebase-admin");

// load firebase key
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function closeBookings() {
  const today = new Date().getTime();

  const ref = db.ref("bookings");

  const snapshot = await ref.once("value");

  if (!snapshot.exists()) {
    console.log("No bookings found");
    return;
  }

  const updates = {};

  snapshot.forEach(child => {
    const data = child.val();

    if (!data.endDate || data.status !== "Active") return;

    const endDate = new Date(data.endDate).getTime();

    if (today > endDate) {
      updates[child.key + "/status"] = "Completed";
      updates[child.key + "/autoClosed"] = true;
      console.log("Closed:", child.key);
    }
  });

  await ref.update(updates);

  console.log("Finished checking bookings");
}

closeBookings();



