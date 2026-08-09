const express = require("express");
const router = express.Router();
const dataService = require("../services/data");
const { validateImportData } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/data/export - Exportar todos los datos
router.get("/export", (_req, res, next) => {
	try {
		const exportData = dataService.exportAllData();
		const filename = `worship-backup-${new Date().toISOString().slice(0, 10)}.json`;

		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.json({
			ok: true,
			data: exportData,
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/data/import - Importar datos
router.post("/import", (req, res, next) => {
	try {
		const importData = req.body;

		// Validar estructura
		const errors = validateImportData(importData.data || importData);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de importacion no validos", 400, errors);
		}

		const mode = req.query.mode || "merge";
		if (!["merge", "replace"].includes(mode)) {
			throw createError("VALIDATION_ERROR", 'El modo debe ser "merge" o "replace"', 400);
		}

		const result = dataService.importData({ data: importData.data || importData }, mode);

		res.json({
			ok: true,
			data: result,
			message: `Importacion completada en modo "${mode}".`,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
