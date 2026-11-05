/**
 * models/User.js
 *
 * Data-access layer for the `users` table.
 * All SQL lives here — controllers stay clean.
 *
 * ⚠️  SECURITY NOTE: password_hash is NEVER included in any query
 *     that feeds the API response. Omit it at the SQL level so it
 *     can't accidentally slip through later in the stack.
 */

const pool = require("../config/db");

// ── Safe columns — password_hash is intentionally excluded ───────────────────
const SAFE_COLUMNS = "id, name, email, role, is_active, created_at, updated_at";

const User = {
  /**
   * Fetch every user, sorted by id ASC.
   * Returns only safe columns (no password_hash).
   *
   * @returns {Promise<Array>} Array of user objects
   */
  async findAll() {
    const query = `
      SELECT ${SAFE_COLUMNS}
      FROM   users
      ORDER  BY id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Fetch a single user by primary key.
   * Returns only safe columns (no password_hash).
   *
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const query = `
      SELECT ${SAFE_COLUMNS}
      FROM   users
      WHERE  id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Count total users (useful for summary stats on the demo UI).
   *
   * @returns {Promise<number>}
   */
  async count() {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM users");
    return rows[0].total;
  },
};

module.exports = User;
