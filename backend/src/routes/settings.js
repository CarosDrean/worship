const express = require("express");
const router = express.Router();
const settingsService = require("../services/settings");
const { validateSettings } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/settings - Obtener configuracion
router.get("/", (_req, res, next) => {
	try {
		const settings = settingsService.getSettings();
		res.json({ ok: true, data: settings });
	} catch (err) {
		next(err);
	}
});

// PUT /api/settings - Actualizar configuracion
router.put("/", (req, res, next) => {
	try {
		const errors = validateSettings(req.body);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de configuracion no validos", 400, errors);
		}

		const settings = settingsService.updateSettings(req.body);
		res.json({ ok: true, data: settings });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
