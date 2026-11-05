const ArticleModel = require("../models/Article");

/**
 * POST /api/articles
 * Save a newly analyzed article to the database.
 */
const createArticle = async (req, res) => {
  try {
    const { text, source, verdict, confidence, result } = req.body;

    // Validation
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return res.status(400).json({
        error: "Validation error",
        message: "Field 'text' is required and must be at least 10 characters.",
      });
    }

    if (verdict && !["REAL", "FAKE", "UNCERTAIN"].includes(verdict)) {
      return res.status(400).json({
        error: "Validation error",
        message: "Field 'verdict' must be one of: REAL, FAKE, UNCERTAIN.",
      });
    }

    if (confidence !== undefined && (typeof confidence !== "number" || confidence < 0 || confidence > 100)) {
      return res.status(400).json({
        error: "Validation error",
        message: "Field 'confidence' must be a number between 0 and 100.",
      });
    }

    const article = await ArticleModel.create({
      text: text.trim(),
      source: source ? source.trim() : null,
      verdict: verdict || null,
      confidence: confidence || null,
      result: result || null,
    });

    return res.status(201).json({
      success: true,
      data: article,
    });
  } catch (err) {
    console.error("createArticle error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

/**
 * GET /api/articles
 * Retrieve all articles, latest first.
 */
const getAllArticles = async (req, res) => {
  try {
    const articles = await ArticleModel.findAll();
    return res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (err) {
    console.error("getAllArticles error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

/**
 * GET /api/articles/:id
 * Retrieve a single article by its ID.
 */
const getArticleById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "Validation error",
        message: "Article ID must be a valid integer.",
      });
    }

    const article = await ArticleModel.findById(id);

    if (!article) {
      return res.status(404).json({
        error: "Not found",
        message: `Article with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (err) {
    console.error("getArticleById error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

/**
 * DELETE /api/articles/:id
 * Delete an article by its ID.
 */
const deleteArticle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "Validation error",
        message: "Article ID must be a valid integer.",
      });
    }

    const deleted = await ArticleModel.deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        error: "Not found",
        message: `Article with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Article with ID ${id} deleted successfully.`,
      data: deleted,
    });
  } catch (err) {
    console.error("deleteArticle error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  deleteArticle,
};
