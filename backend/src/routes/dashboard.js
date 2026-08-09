const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboard");

// GET /api/dashboard - Metricas del dashboard
router.get("/", (req, res, next) => {
	try {
		const period = req.query.period || "month";
		if (!["week", "month"].includes(period)) {
			return res.status(400).json({
				ok: false,
				error: {
					code: "VALIDATION_ERROR",
					message: 'El periodo debe ser "week" o "month"',
				},
			});
		}

		const metrics = dashboardService.getDashboardMetrics(period);
		res.json({ ok: true, data: metrics });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
