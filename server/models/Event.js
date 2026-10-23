const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        venue: { type: String, required: true, trim: true },
        capacity: { type: Number, required: true, min: 1, max: 10000 },
        registeredCount: { type: Number, default: 0, min: 0 },
        isCancelled: { type: Boolean, default: false },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        readinessChecklist: {
            venueConfirmed: { type: Boolean, default: false },
            volunteersAssigned: { type: Boolean, default: false },
            schedulePrepared: { type: Boolean, default: false },
            registrationReady: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
