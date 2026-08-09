const express = require("express");
const router = express.Router();

router.get("/", (_req, res) => {
	res.json({
		ok: true,
		data: {
			status: "ok",
			timestamp: new Date().toISOString(),
			application: "Worship API",
			version: "1.0.0",
		},
	});
});

module.exports = router;
