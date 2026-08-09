const express = require("express");
const router = express.Router();
const reflectionService = require("../services/reflections");
const { validateReflection } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/reflections - Listar reflexiones
router.get("/", (req, res, next) => {
	try {
		const filters = {};
		if (req.query.activityId) filters.activityId = req.query.activityId;
		if (req.query.attendanceId) filters.attendanceId = req.query.attendanceId;

		const reflections = reflectionService.listReflections(filters);
		res.json({
			ok: true,
			data: reflections,
			meta: { total: reflections.length },
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/reflections/:id - Obtener reflexion
router.get("/:id", (req, res, next) => {
	try {
		const reflection = reflectionService.getReflection(req.params.id);
		res.json({ ok: true, data: reflection });
	} catch (err) {
		next(err);
	}
});

// POST /api/reflections - Crear reflexion
router.post("/", (req, res, next) => {
	try {
		const errors = validateReflection(req.body);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de reflexion no validos", 400, errors);
		}

		const reflection = reflectionService.createReflection(req.body);
		res.status(201).json({ ok: true, data: reflection });
	} catch (err) {
		next(err);
	}
});

// PUT /api/reflections/:id - Actualizar reflexion
router.put("/:id", (req, res, next) => {
	try {
		const errors = validateReflection(req.body, true);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de reflexion no validos", 400, errors);
		}

		const reflection = reflectionService.updateReflection(req.params.id, req.body);
		res.json({ ok: true, data: reflection });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/reflections/:id - Eliminar reflexion
router.delete("/:id", (req, res, next) => {
	try {
		const deleted = reflectionService.deleteReflection(req.params.id);
		res.json({
			ok: true,
			data: deleted,
			message: "Reflexion eliminada correctamente.",
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
