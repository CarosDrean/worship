const express = require("express");
const router = express.Router();
const activityService = require("../services/activities");
const { validateActivity, validateActivityFilters } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/activities/calendar - Vista de calendario mensual
router.get("/calendar", (req, res, next) => {
	try {
		const now = new Date();
		const year = parseInt(req.query.year, 10) || now.getFullYear();
		const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

		if (month < 1 || month > 12) {
			throw createError("VALIDATION_ERROR", "El mes debe estar entre 1 y 12", 400);
		}

		const data = activityService.getCalendarData(year, month);
		res.json({ ok: true, data });
	} catch (err) {
		next(err);
	}
});

// GET /api/activities - Listar actividades con filtros
router.get("/", (req, res, next) => {
	try {
		const { filters, errors } = validateActivityFilters(req.query);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Filtros no validos", 400, errors);
		}

		const activities = activityService.listActivities(filters);
		res.json({
			ok: true,
			data: activities,
			meta: { total: activities.length },
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/activities/:id - Obtener actividad por ID
router.get("/:id", (req, res, next) => {
	try {
		const activity = activityService.getActivity(req.params.id);
		res.json({ ok: true, data: activity });
	} catch (err) {
		next(err);
	}
});

// POST /api/activities - Crear actividad
router.post("/", (req, res, next) => {
	try {
		const errors = validateActivity(req.body);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de actividad no validos", 400, errors);
		}

		const activity = activityService.createActivity(req.body);
		res.status(201).json({ ok: true, data: activity });
	} catch (err) {
		next(err);
	}
});

// PUT /api/activities/:id - Actualizar actividad
router.put("/:id", (req, res, next) => {
	try {
		const errors = validateActivity(req.body, true);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de actividad no validos", 400, errors);
		}

		const activity = activityService.updateActivity(req.params.id, req.body);
		res.json({ ok: true, data: activity });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/activities/:id - Archivar actividad
router.delete("/:id", (req, res, next) => {
	try {
		const activity = activityService.archiveActivity(req.params.id);
		res.json({
			ok: true,
			data: activity,
			message: "Actividad archivada correctamente.",
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/activities/:id/restore - Restaurar actividad
router.post("/:id/restore", (req, res, next) => {
	try {
		const activity = activityService.restoreActivity(req.params.id);
		res.json({
			ok: true,
			data: activity,
			message: "Actividad restaurada correctamente.",
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
