
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");

async function fixLegacyEvents() {
    try {
        const email = process.argv[2]?.trim().toLowerCase();

        if (!email) {
            throw new Error(
                "Provide your organizer email: node fixLegacyEvents.js your@email.com"
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        const organizer = await User.findOne({
            email,
            role: "organizer",
        });

        if (!organizer) {
            throw new Error(
                "Organizer account not found. Check the email and role."
            );
        }

        const result = await Event.updateMany(
            {
                $or: [
                    { createdBy: { $exists: false } },
                    { createdBy: null },
                ],
            },
            {
                $set: { createdBy: organizer._id },
            }
        );

        console.log(`Events assigned: ${result.modifiedCount}`);
        console.log("Legacy event ownership migration completed.");
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

fixLegacyEvents();
