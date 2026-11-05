const express = require("express");
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  deleteArticle,
} = require("../controllers/articleController");

// POST   /api/articles       — Save an analyzed article
router.post("/", createArticle);

// GET    /api/articles       — Get all articles (latest first)
router.get("/", getAllArticles);

// GET    /api/articles/:id   — Get a single article
router.get("/:id", getArticleById);

// DELETE /api/articles/:id   — Delete an article
router.delete("/:id", deleteArticle);

module.exports = router;
