const pool = require("../config/db");

const ArticleModel = {
  /**
   * Insert a new article into the database.
   * @param {object} data - { text, source, verdict, confidence, result }
   * @returns {object} - The newly created article row
   */
  async create({ text, source, verdict, confidence, result }) {
    const query = `
      INSERT INTO articles (text, source, verdict, confidence, result)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      text,
      source || null,
      verdict || null,
      confidence || null,
      result ? JSON.stringify(result) : null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Get all articles, latest first.
   * @returns {Array} - Array of article rows
   */
  async findAll() {
    const query = `SELECT * FROM articles ORDER BY created_at DESC`;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Get a single article by ID.
   * @param {number} id
   * @returns {object|null} - Article row or null
   */
  async findById(id) {
    const query = `SELECT * FROM articles WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Delete an article by ID.
   * @param {number} id
   * @returns {object|null} - Deleted row or null
   */
  async deleteById(id) {
    const query = `DELETE FROM articles WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },
};

module.exports = ArticleModel;
