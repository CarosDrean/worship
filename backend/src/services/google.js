const { getData, writeData } = require("../persistence/store");
const { getGoogleTokens, saveGoogleTokens, setGoogleCalendarId } = require("./settings");
const { createError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Estados de la integracion con Google
const GOOGLE_STATUS = {
	NOT_CONFIGURED: "not_configured", // Sin credenciales ni configuracion
	DISCONNECTED: "disconnected", // Sin token de acceso
	CONNECTED: "connected", // Token valido pero sin calendario
	READY: "ready", // Listo para sincronizar
	ERROR: "error", // Error de autenticacion o red
};

/**
 * Obtiene el estado de la integracion con Google Calendar
 */
function getGoogleStatus() {
	const tokens = getGoogleTokens();
	const settings = getData("settings");

	// Verificar si hay variables de entorno para Google OAuth
	const hasCredentials = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

	if (!hasCredentials) {
		return {
			status: GOOGLE_STATUS.NOT_CONFIGURED,
			message:
				"Google Calendar no esta configurado. Se requieren credenciales OAuth (GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET).",
			calendarId: settings.googleCalendarId || null,
			connected: false,
			configured: false,
		};
	}

	if (!tokens?.access_token) {
		return {
			status: GOOGLE_STATUS.DISCONNECTED,
			message: "No hay sesion activa de Google. Inicia sesion para continuar.",
			calendarId: settings.googleCalendarId || null,
			connected: false,
			configured: true,
		};
	}

	// Verificar si el token expiro
	if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
		return {
			status: GOOGLE_STATUS.DISCONNECTED,
			message: "La sesion de Google ha expirado. Vuelve a iniciar sesion.",
			calendarId: settings.googleCalendarId || null,
			connected: false,
			configured: true,
			expired: true,
		};
	}

	if (!settings.googleCalendarId) {
		return {
			status: GOOGLE_STATUS.CONNECTED,
			message: "Sesion activa pero no se ha seleccionado un calendario.",
			calendarId: null,
			connected: true,
			configured: true,
			calendarSelected: false,
		};
	}

	return {
		status: GOOGLE_STATUS.READY,
		message: "Listo para sincronizar.",
		calendarId: settings.googleCalendarId,
		connected: true,
		configured: true,
		calendarSelected: true,
	};
}

/**
 * Genera URL de autorizacion OAuth (mock seguro)
 */
function getAuthUrl() {
	const status = getGoogleStatus();

	if (status.status === GOOGLE_STATUS.NOT_CONFIGURED) {
		throw createError(
			"GOOGLE_NOT_CONFIGURED",
			"Google Calendar no esta configurado. Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno.",
			400,
		);
	}

	// En un entorno real, esto generaria la URL de OAuth
	// Por ahora devolvemos una URL de ejemplo segura
	const redirectUri = `http://localhost:3001/api/google/oauth-callback`;
	const authUrl =
		`https://accounts.google.com/o/oauth2/v2/auth?` +
		`client_id=${process.env.GOOGLE_CLIENT_ID}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}&` +
		`response_type=code&` +
		`scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly")}&` +
		`access_type=offline&` +
		`prompt=consent`;

	return { authUrl, redirectUri };
}

/**
 * Intercambia codigo de autorizacion por tokens (mock seguro)
 */
async function exchangeCodeForTokens(_code) {
	const status = getGoogleStatus();

	if (status.status === GOOGLE_STATUS.NOT_CONFIGURED) {
		throw createError("GOOGLE_NOT_CONFIGURED", "Google Calendar no esta configurado.", 400);
	}

	// En produccion, aqui se intercambia el codigo por tokens reales
	// Por ahora guardamos un token mock para desarrollo
	const mockTokens = {
		access_token: `mock_access_${uuidv4().slice(0, 8)}`,
		refresh_token: `mock_refresh_${uuidv4().slice(0, 8)}`,
		expiry_date: Date.now() + 3600 * 1000,
		token_type: "Bearer",
	};

	saveGoogleTokens(mockTokens);

	return {
		connected: true,
		message: "Sesion iniciada correctamente (modo simulacion).",
	};
}

/**
 * Lista calendarios disponibles (mock seguro)
 */
async function listCalendars() {
	const status = getGoogleStatus();

	if (status.status === GOOGLE_STATUS.NOT_CONFIGURED) {
		throw createError("GOOGLE_NOT_CONFIGURED", "Google Calendar no esta configurado.", 400);
	}

	if (status.status === GOOGLE_STATUS.DISCONNECTED) {
		throw createError("GOOGLE_AUTH_ERROR", "No hay sesion activa de Google.", 401);
	}

	// En produccion se consultaria la API de Google Calendar
	return {
		calendars: [
			{
				id: "primary",
				summary: "Calendario Principal (simulacion)",
				description: "Calendario principal de Google",
			},
		],
		message: "Lista de calendarios en modo simulacion.",
	};
}

/**
 * Selecciona un calendario para sincronizar
 */
function selectCalendar(calendarId) {
	const status = getGoogleStatus();

	if (status.status === GOOGLE_STATUS.NOT_CONFIGURED) {
		throw createError("GOOGLE_NOT_CONFIGURED", "Google Calendar no esta configurado.", 400);
	}

	if (!calendarId || typeof calendarId !== "string") {
		throw createError("VALIDATION_ERROR", "El ID del calendario es obligatorio.", 400);
	}

	setGoogleCalendarId(calendarId);

	return {
		calendarId,
		message: "Calendario seleccionado correctamente (modo simulacion).",
	};
}

/**
 * Ejecuta sincronizacion manual bidireccional (mock seguro)
 */
async function syncCalendar() {
	const status = getGoogleStatus();

	if (status.status === GOOGLE_STATUS.NOT_CONFIGURED) {
		throw createError("GOOGLE_NOT_CONFIGURED", "Google Calendar no esta configurado.", 400);
	}

	if (status.status !== GOOGLE_STATUS.READY) {
		throw createError(
			"GOOGLE_NOT_READY",
			"Completa la configuracion antes de sincronizar: inicia sesion y selecciona un calendario.",
			400,
		);
	}

	// En produccion, aqui se comparan eventos locales y remotos
	// Por ahora devolvemos un resultado simulado

	const syncRecord = {
		id: uuidv4(),
		timestamp: new Date().toISOString(),
		calendarId: status.calendarId,
		status: "completed",
		changes: {
			created: 0,
			updated: 0,
			deleted: 0,
			conflicts: 0,
		},
		message: "Sincronizacion simulada completada.",
	};

	// Guardar registro de sincronizacion
	const syncData = getData("googleSync");
	syncData.push(syncRecord);
	writeData("googleSync", syncData);

	return syncRecord;
}

/**
 * Obtiene historial de sincronizaciones
 */
function getSyncHistory() {
	const syncData = getData("googleSync");
	return syncData.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

module.exports = {
	GOOGLE_STATUS,
	getGoogleStatus,
	getAuthUrl,
	exchangeCodeForTokens,
	listCalendars,
	selectCalendar,
	syncCalendar,
	getSyncHistory,
};
