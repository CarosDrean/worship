/**
 * Middleware de manejo centralizado de errores.
 * Formato consistente: { ok: false, error: { code, message, details? } }
 * No revela stack traces ni tokens en produccion.
 */
function errorHandler(err, _req, res, _next) {
	// Log del error completo solo en el servidor
	console.error(`[ERROR] ${err.code || "INTERNO"}: ${err.message}`);
	if (err.stack) {
		console.error(err.stack);
	}

	// Determinar codigo HTTP
	let statusCode = err.statusCode || 500;
	let errorCode = err.code || "ERROR_INTERNO";
	let message = err.message || "Error interno del servidor";

	// Clasificar errores conocidos
	if (err.name === "ValidationError" || err.code === "VALIDATION_ERROR") {
		statusCode = 400;
		errorCode = "VALIDATION_ERROR";
	} else if (err.code === "NOT_FOUND") {
		statusCode = 404;
	} else if (err.code === "DUPLICATE") {
		statusCode = 409;
	} else if (err.code === "GOOGLE_AUTH_ERROR") {
		statusCode = 401;
	} else if (err.code === "GOOGLE_PERMISSION_ERROR") {
		statusCode = 403;
	} else if (err.code === "GOOGLE_NETWORK_ERROR") {
		statusCode = 502;
	} else if (err.code === "SYNC_CONFLICT") {
		statusCode = 409;
	} else if (err.code === "RATE_LIMIT") {
		statusCode = 429;
		errorCode = "RATE_LIMIT";
		message = "Demasiadas solicitudes. Intenta de nuevo mas tarde.";
	}

	// Nunca revelar el stack en la respuesta
	const response = {
		ok: false,
		error: {
			code: errorCode,
			message,
		},
	};

	if (err.details) {
		response.error.details = err.details;
	}

	res.status(statusCode).json(response);
}

/**
 * Crea un error con codigo y detalles estructurados
 */
function createError(code, message, statusCode = 400, details = null) {
	const err = new Error(message);
	err.code = code;
	err.statusCode = statusCode;
	if (details) err.details = details;
	return err;
}

/**
 * Middleware para rutas no encontradas
 */
function notFoundHandler(_req, res) {
	res.status(404).json({
		ok: false,
		error: {
			code: "NOT_FOUND",
			message: "La ruta solicitada no existe",
		},
	});
}

module.exports = {
	errorHandler,
	createError,
	notFoundHandler,
};
