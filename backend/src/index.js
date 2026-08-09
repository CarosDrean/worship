const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { PORT } = require("./config");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { seedQuotesIfNeeded } = require("./services/quotes");

// Importar rutas
const healthRoutes = require("./routes/health");
const activityRoutes = require("./routes/activities");
const attendanceRoutes = require("./routes/attendance");
const reflectionRoutes = require("./routes/reflections");
const quoteRoutes = require("./routes/quotes");
const dashboardRoutes = require("./routes/dashboard");
const dataRoutes = require("./routes/data");
const settingsRoutes = require("./routes/settings");
const googleRoutes = require("./routes/google");

const app = express();

// ============================================================
// Middleware de seguridad
// ============================================================

// Helmet con configuracion compatible con desarrollo local y Vite
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
		crossOriginOpenerPolicy: { policy: "unsafe-none" },
		contentSecurityPolicy: false, // Vite maneja su propio CSP en desarrollo
		xXssProtection: false, // Obsoleto, usar CSP
	}),
);

// CORS: solo permitir origenes locales
const allowedOrigins = [
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	"http://localhost:3001",
	"http://127.0.0.1:3001",
];

app.use(
	cors({
		origin(origin, callback) {
			// Permitir peticiones sin origin (herramientas, curl)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				console.warn(`[CORS] Origen bloqueado: ${origin}`);
				callback(new Error("Origen no permitido por CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
		maxAge: 86400,
	}),
);

// Body parser con limites de tamaño
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate limiting para mutaciones
const mutationLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minuto
	max: 30, // maximo 30 peticiones de mutacion por minuto
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		ok: false,
		error: {
			code: "RATE_LIMIT",
			message: "Demasiadas solicitudes. Intenta de nuevo mas tarde.",
		},
	},
	skip: (req) => req.method === "GET", // Solo limitar mutaciones
});

// Rate limiting general (mas laxo)
const generalLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		ok: false,
		error: {
			code: "RATE_LIMIT",
			message: "Demasiadas solicitudes. Intenta de nuevo mas tarde.",
		},
	},
});

// Aplicar rate limiting
app.use(generalLimiter);
app.use(mutationLimiter);

// ============================================================
// Logging basico en español
// ============================================================
app.use((req, _res, next) => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
	next();
});

// ============================================================
// Rutas API
// ============================================================
app.use("/api/health", healthRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/google", googleRoutes);

// Ruta de bienvenida
app.get("/", (_req, res) => {
	res.json({
		ok: true,
		data: {
			application: "Worship API",
			version: "1.0.0",
			message: "Bienvenido a la API de Worship. Usa /api/health para verificar el estado.",
			docs: "Consulta los endpoints disponibles en la documentacion del proyecto.",
		},
	});
});

// ============================================================
// Manejo de errores
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// Inicializacion e inicio del servidor
// ============================================================
function initialize() {
	try {
		console.log("[INICIO] Inicializando Worship backend...");

		// Asegurar que los datos semilla de frases existen
		seedQuotesIfNeeded();
		console.log("[INICIO] Catalogo de frases inicializado.");

		console.log("[INICIO] Backend inicializado correctamente.");
	} catch (err) {
		console.error("[INICIO] Error durante la inicializacion:", err.message);
		// No detener el servidor por errores de inicializacion
	}
}

app.listen(PORT, () => {
	console.log(`[SERVIDOR] Worship backend ejecutandose en http://localhost:${PORT}`);
	console.log(`[SERVIDOR] Health check: http://localhost:${PORT}/api/health`);
	initialize();
});

module.exports = app;
