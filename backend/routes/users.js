/**
 * routes/users.js
 *
 * Mounts user endpoints under the /api/users prefix.
 * Registered in server.js as:  app.use("/api/users", userRoutes);
 */

const express = require("express");
const router  = express.Router();
const { getAllUsers, getUserById, createUser } = require("../controllers/userController");

// GET /api/users        → list all users (safe fields, sorted by id)
router.get("/", getAllUsers);

// GET /api/users/:id    → single user by primary key
router.get("/:id", getUserById);
router.post("/", createUser);

module.exports = router;
