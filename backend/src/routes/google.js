const express = require("express");
const router = express.Router();
const googleService = require("../services/google");
const { createError } = require("../middleware/errorHandler");

// GET /api/google/status - Estado de la integracion
router.get("/status", (_req, res, next) => {
	try {
		const status = googleService.getGoogleStatus();
		res.json({ ok: true, data: status });
	} catch (err) {
		next(err);
	}
});

// GET /api/google/auth - Obtener URL de autorizacion
router.get("/auth", (_req, res, next) => {
	try {
		const authData = googleService.getAuthUrl();
		res.json({ ok: true, data: authData });
	} catch (err) {
		next(err);
	}
});

// GET /api/google/oauth-callback - Callback de OAuth
router.get("/oauth-callback", async (req, res, next) => {
	try {
		const { code } = req.query;
		if (!code) {
			throw createError("GOOGLE_AUTH_ERROR", "Codigo de autorizacion no proporcionado.", 400);
		}

		const result = await googleService.exchangeCodeForTokens(code);
		res.json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
});

// GET /api/google/calendars - Listar calendarios
router.get("/calendars", async (_req, res, next) => {
	try {
		const calendars = await googleService.listCalendars();
		res.json({ ok: true, data: calendars });
	} catch (err) {
		next(err);
	}
});

// POST /api/google/select-calendar - Seleccionar calendario
router.post("/select-calendar", (req, res, next) => {
	try {
		const { calendarId } = req.body;
		const result = googleService.selectCalendar(calendarId);
		res.json({ ok: true, data: result });
	} catch (err) {
		next(err);
	}
});

// POST /api/google/sync - Sincronizacion manual
router.post("/sync", async (_req, res, next) => {
	try {
		const result = await googleService.syncCalendar();
		res.json({
			ok: true,
			data: result,
			message: "Sincronizacion completada.",
		});
	} catch (err) {
		next(err);
	}
});

// GET /api/google/sync-history - Historial de sincronizaciones
router.get("/sync-history", (_req, res, next) => {
	try {
		const history = googleService.getSyncHistory();
		res.json({
			ok: true,
			data: history,
			meta: { total: history.length },
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
