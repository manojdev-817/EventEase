const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Event = require("./models/Event");
const User = require("./models/User");
const Registration = require("./models/Registration");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

app.get("/", (req, res) => {
  res.send("EventEase API is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "EventEase API" });
});

// Register a new participant account. Public registration cannot assign organizer role.
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Name and email are required. Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "participant",
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to create account." });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to log in." });
  }
});

// Verify the current session and return the current database role.
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "_id name email role"
    );

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists." });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    return res.status(401).json({ message: "Unable to verify account." });
  }
});

// Create event — organizers only. Whitelist accepted fields and set ownership server-side.
app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        message: "Only organizers can create events.",
      });
    }

    const { title, description, date, venue, capacity } = req.body;

    const parsedDate = new Date(date);
    const parsedCapacity = Number(capacity);

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !date ||
      Number.isNaN(parsedDate.getTime()) ||
      typeof venue !== "string" ||
      !venue.trim() ||
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < 1 ||
      parsedCapacity > 10000
    ) {
      return res.status(400).json({
        message:
          "Provide a title, description, valid date, venue, and capacity between 1 and 10000.",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: parsedDate,
      venue: venue.trim(),
      capacity: parsedCapacity,
      createdBy: req.user.userId,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Public event listing allows participants to browse available events.
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.json(events);
  } catch (error) {
    console.error("Load events error:", error.message);
    return res.status(500).json({ message: "Unable to load events." });
  }
});

// Check whether the signed-in participant is registered for an event.
app.get(
  "/api/events/:id/registration",
  authenticateToken,
  async (req, res) => {
    try {
      if (!validObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }

      const event = await Event.findById(req.params.id).select("_id");
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      const registration = await Registration.findOne({
        event: req.params.id,
        participant: req.user.userId,
      }).select("_id createdAt");

      return res.json({
        isRegistered: Boolean(registration),
        registration: registration || null,
      });
    } catch (error) {
      console.error("Registration status error:", error.message);
      return res.status(500).json({
        message: "Unable to check registration status.",
      });
    }
  }
);

// Register for an event. A MongoDB transaction keeps the registration and seat count in sync.
// MongoDB Atlas supports transactions; a standalone local MongoDB server does not.
app.post(
  "/api/events/:id/register",
  authenticateToken,
  async (req, res) => {
    if (req.user.role !== "participant") {
      return res.status(403).json({
        message: "Only participant accounts can register for events.",
      });
    }

    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const session = await mongoose.startSession();
    let createdRegistration = null;
    let updatedEvent = null;

    try {
      await session.withTransaction(async () => {
        const event = await Event.findById(req.params.id).session(session);

        if (!event) {
          const error = new Error("Event not found.");
          error.code = "EVENT_NOT_FOUND";
          throw error;
        }

        if (event.isCancelled) {
          const error = new Error("Registration is closed because this event was cancelled.");
          error.code = "EVENT_CANCELLED";
          throw error;
        }

        if (new Date(event.date).getTime() <= Date.now()) {
          const error = new Error("Registration is closed for this event.");
          error.code = "REGISTRATION_CLOSED";
          throw error;
        }

        const existingRegistration = await Registration.findOne({
          event: event._id,
          participant: req.user.userId,
        }).session(session);

        if (existingRegistration) {
          const error = new Error("You are already registered for this event.");
          error.code = "ALREADY_REGISTERED";
          throw error;
        }

        // The conditional update prevents the count exceeding capacity under concurrent requests.
        updatedEvent = await Event.findOneAndUpdate(
          {
            _id: event._id,
            $expr: { $lt: ["$registeredCount", "$capacity"] },
          },
          { $inc: { registeredCount: 1 } },
          { new: true, session, runValidators: true }
        );

        if (!updatedEvent) {
          const error = new Error("This event is full.");
          error.code = "EVENT_FULL";
          throw error;
        }

        const registrations = await Registration.create(
          [
            {
              event: event._id,
              participant: req.user.userId,
            },
          ],
          { session }
        );

        createdRegistration = registrations[0];
      });

      return res.status(201).json({
        message: "You are registered for this event.",
        registration: createdRegistration,
        registeredCount: updatedEvent.registeredCount,
        capacity: updatedEvent.capacity,
      });
    } catch (error) {
      if (error.code === "EVENT_NOT_FOUND") {
        return res.status(404).json({ message: error.message });
      }

      if (error.code === "EVENT_CANCELLED") {
        return res.status(409).json({ message: error.message });
      }

      if (error.code === "REGISTRATION_CLOSED") {
        return res.status(409).json({ message: error.message });
      }

      if (error.code === "EVENT_FULL") {
        return res.status(409).json({ message: error.message });
      }

      if (
        error.code === "ALREADY_REGISTERED" ||
        error.code === 11000
      ) {
        return res.status(409).json({
          message: "You are already registered for this event.",
        });
      }

      console.error("Event registration error:", error.message);
      return res.status(500).json({
        message:
          "Unable to complete registration. Please try again.",
      });
    } finally {
      await session.endSession();
    }
  }
);


// Edit event — only the owning organizer can edit it.
app.patch("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Only organizers can edit events." });
    }
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }
    const { title, description, date, venue, capacity } = req.body;
    const parsedDate = new Date(date);
    const parsedCapacity = Number(capacity);
    if (typeof title !== "string" || !title.trim() || title.trim().length > 100 ||
        typeof description !== "string" || !description.trim() || description.trim().length > 1000 ||
        !date || Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now() ||
        typeof venue !== "string" || !venue.trim() || venue.trim().length > 150 ||
        !Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 10000) {
      return res.status(400).json({ message: "Enter a valid future date, title, description, venue, and capacity (1–10000)." });
    }
    const existing = await Event.findOne({ _id: req.params.id, createdBy: req.user.userId });
    if (!existing) {
      return res.status(404).json({ message: "Event not found or you do not own this event." });
    }
    if (parsedCapacity < existing.registeredCount) {
      return res.status(400).json({ message: `Capacity cannot be lower than the ${existing.registeredCount} existing registrations.` });
    }
    if (existing.isCancelled) {
      return res.status(409).json({ message: "Cancelled events cannot be edited." });
    }
    existing.title = title.trim();
    existing.description = description.trim();
    existing.date = parsedDate;
    existing.venue = venue.trim();
    existing.capacity = parsedCapacity;
    await existing.save();
    return res.json(existing);
  } catch (error) {
    console.error("Edit event error:", error.message);
    return res.status(400).json({ message: "Unable to update event." });
  }
});

// Cancel an event without deleting registration history.
app.patch("/api/events/:id/cancel", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Only organizers can cancel events." });
    }
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId, isCancelled: { $ne: true } },
      { $set: { isCancelled: true } },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found, already cancelled, or you do not own this event." });
    }
    return res.json({ message: "Event cancelled. Registration history has been preserved.", event });
  } catch (error) {
    console.error("Cancel event error:", error.message);
    return res.status(500).json({ message: "Unable to cancel event." });
  }
});

// List participants for an event. Only the organizer who owns the event can access this list.
app.get("/api/events/:id/participants", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Only organizers can view event participants." });
    }
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.userId,
    }).select("_id title capacity registeredCount");

    if (!event) {
      return res.status(404).json({ message: "Event not found or you do not own this event." });
    }

    const registrations = await Registration.find({ event: event._id })
      .sort({ createdAt: 1 })
      .populate("participant", "name email");

    const participants = registrations
      .filter((registration) => registration.participant)
      .map((registration) => ({
        registrationId: String(registration._id),
        name: registration.participant.name,
        email: registration.participant.email,
        registeredAt: registration.createdAt,
      }));

    return res.json({
      event: { id: event._id, title: event.title, capacity: event.capacity },
      participants,
      count: participants.length,
    });
  } catch (error) {
    console.error("Load event participants error:", error.message);
    return res.status(500).json({ message: "Unable to load event participants." });
  }
});

// Update readiness — organizers can update only events they own.
app.patch(
  "/api/events/:id/readiness",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "organizer") {
        return res.status(403).json({
          message: "Only organizers can update event readiness.",
        });
      }

      if (!validObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID." });
      }

      const allowedFields = [
        "venueConfirmed",
        "volunteersAssigned",
        "schedulePrepared",
        "registrationReady",
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (typeof req.body[field] === "boolean") {
          updates[`readinessChecklist.${field}`] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "No valid readiness fields provided.",
        });
      }

      const event = await Event.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user.userId,
          isCancelled: { $ne: true },
        },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!event) {
        return res.status(409).json({
          message: "Event not found, you do not own this event, or the event has been cancelled.",
        });
      }

      return res.json(event);
    } catch (error) {
      console.error("Readiness update error:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }
);

// Return JSON for unknown API routes instead of Express HTML error pages.
app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be set in server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
