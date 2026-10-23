
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function promoteOrganizer() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Usage: node promoteOrganizer.js user@example.com"
    );
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "organizer" } },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error(
      "User not found. Register the account before promoting it."
    );
  }

  console.log(`Organizer role assigned to ${user.email}`);
}

promoteOrganizer()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
