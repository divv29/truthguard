/**
 * controllers/userController.js
 */

const User = require("../models/User");
const pool = require("../config/db"); // ✅ always at top

// ── GET /api/users ─────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const total = users.length;

    res.status(200).json({
      success: true,
      count: total,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id — must be a number",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with id ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users ────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, role, is_active, password_hash)
       VALUES ($1, $2, 'user', true, $3)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, password]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ✅ EXPORT MUST BE LAST
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};