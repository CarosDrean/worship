const express = require("express");
const router = express.Router();
const attendanceService = require("../services/attendance");
const { validateAttendance } = require("../validators");
const { createError } = require("../middleware/errorHandler");

// GET /api/attendance/history - Historial completo
router.get("/history", (_req, res, next) => {
	try {
		const history = attendanceService.getAttendanceHistory();
		res.json({
			ok: true,
			data: history,
			meta: { total: history.length },
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/attendance - Listar registros con filtros
router.get("/", (req, res, next) => {
	try {
		const filters = {};
		if (req.query.activityId) filters.activityId = req.query.activityId;
		if (req.query.status) filters.status = req.query.status;
		if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
		if (req.query.dateTo) filters.dateTo = req.query.dateTo;

		const attendance = attendanceService.listAttendance(filters);
		res.json({
			ok: true,
			data: attendance,
			meta: { total: attendance.length },
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/attendance/:id - Obtener registro por ID
router.get("/:id", (req, res, next) => {
	try {
		const record = attendanceService.getAttendance(req.params.id);
		res.json({ ok: true, data: record });
	} catch (err) {
		next(err);
	}
});

// POST /api/attendance - Crear registro de asistencia
router.post("/", (req, res, next) => {
	try {
		const errors = validateAttendance(req.body);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de asistencia no validos", 400, errors);
		}

		const record = attendanceService.createAttendance(req.body);
		res.status(201).json({ ok: true, data: record });
	} catch (err) {
		next(err);
	}
});

// PUT /api/attendance/:id - Actualizar registro
router.put("/:id", (req, res, next) => {
	try {
		const errors = validateAttendance(req.body, true);
		if (errors.length > 0) {
			throw createError("VALIDATION_ERROR", "Datos de asistencia no validos", 400, errors);
		}

		const record = attendanceService.updateAttendance(req.params.id, req.body);
		res.json({ ok: true, data: record });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
