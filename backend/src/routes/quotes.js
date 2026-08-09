const express = require("express");
const router = express.Router();
const quoteService = require("../services/quotes");
const { validateQuote } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/quotes/daily - Frase del dia
router.get("/daily", (_req, res, next) => {
	try {
		const quote = quoteService.getDailyQuote();
		res.json({ ok: true, data: quote });
	} catch (err) {
		next(err);
	}
});

// GET /api/quotes/random - Frase aleatoria
router.get("/random", (req, res, next) => {
	try {
		const category = req.query.category || null;
		const quote = quoteService.getRandomQuote(category);
		res.json({ ok: true, data: quote });
	} catch (err) {
		next(err);
	}
});

// GET /api/quotes - Listar frases con filtros
router.get("/", (req, res, next) => {
	try {
		const filters = {};
		if (req.query.category) filters.category = req.query.category;
		if (req.query.favorite) filters.favorite = req.query.favorite;
		if (req.query.search) filters.search = req.query.search;

		const quotes = quoteService.listQuotes(filters);
		res.json({
			ok: true,
			data: quotes,
			meta: { total: quotes.length },
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/quotes/:id - Obtener frase por ID
router.get("/:id", (req, res, next) => {
	try {
		const quote = quoteService.getQuote(req.params.id);
		res.json({ ok: true, data: quote });
	} catch (err) {
		next(err);
	}
});

// POST /api/quotes - Crear frase personalizada
router.post("/", (req, res, next) => {
	try {
		const errors = validateQuote(req.body);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de frase no validos", 400, errors);
		}

		const quote = quoteService.createQuote(req.body);
		res.status(201).json({ ok: true, data: quote });
	} catch (err) {
		next(err);
	}
});

// PUT /api/quotes/:id - Actualizar frase personalizada
router.put("/:id", (req, res, next) => {
	try {
		const errors = validateQuote(req.body, true);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de frase no validos", 400, errors);
		}

		const quote = quoteService.updateQuote(req.params.id, req.body);
		res.json({ ok: true, data: quote });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/quotes/:id - Eliminar frase personalizada
router.delete("/:id", (req, res, next) => {
	try {
		const deleted = quoteService.deleteQuote(req.params.id);
		res.json({
			ok: true,
			data: deleted,
			message: "Frase eliminada correctamente.",
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/quotes/:id/favorite - Alternar favorito
router.post("/:id/favorite", (req, res, next) => {
	try {
		const quote = quoteService.toggleFavorite(req.params.id);
		res.json({
			ok: true,
			data: quote,
			message: quote.favorite ? "Frase marcada como favorita." : "Frase removida de favoritos.",
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
