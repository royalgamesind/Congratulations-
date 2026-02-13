const admin = require("firebase-admin");

// get firebase key from github secret
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function closeBookings() {
  const today = new Date();
  
  const snapshot = await db.collection("bookings")
    .where("status", "==", "Active")
    .get();

  if (snapshot.empty) {
    console.log("No active bookings");
    return;
  }

  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();

    if (!data.endDate) return;

    const endDate = new Date(data.endDate);

    // if booking finished
    if (today > endDate) {
      const ref = db.collection("bookings").doc(doc.id);
      batch.update(ref, {
        status: "Completed",
        autoClosed: true
      });
      console.log("Closed booking:", doc.id);
    }
  });

  await batch.commit();
  console.log("Finished checking bookings");
}

closeBookings();
