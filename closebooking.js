const admin = require("firebase-admin");
const fs = require("fs");

// load service account
const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccount.json", "utf8")
);

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://royalgamesproject-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

async function closeBookings() {
  console.log("Checking bookings...");

  const snapshot = await db.ref("bookings").once("value");

  if (!snapshot.exists()) {
    console.log("No bookings found");
    return;
  }

  const today = new Date();
  const todayTime = today.getTime();

  snapshot.forEach(child => {
    const booking = child.val();

    if (booking.status !== "Active") return;

    const startDate = new Date(booking.startDate);
    const days = parseInt(booking.days);

    // booking end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    if (todayTime >= endDate.getTime()) {
      console.log("Completing booking:", booking.customerID);

      db.ref("bookings/" + booking.customerID).update({
        status: "Completed"
      });
    }
  });

  console.log("Done.");
}

closeBookings();





