const { getData, writeData } = require("../persistence/store");

/**
 * Obtiene la configuracion actual (sin tokens)
 */
function getSettings() {
	const settings = getData("settings");

	// Nunca devolver tokens en la respuesta
	const safeSettings = { ...settings };
	delete safeSettings.googleTokens;

	return safeSettings;
}

/**
 * Actualiza la configuracion
 */
function updateSettings(data) {
	const settings = getData("settings");
	const now = new Date().toISOString();

	const allowedFields = ["theme", "language", "googleCalendarId"];

	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			settings[field] = data[field];
		}
	}

	settings.updatedAt = now;
	writeData("settings", settings);

	// Devolver sin tokens
	const safeSettings = { ...settings };
	delete safeSettings.googleTokens;

	return safeSettings;
}

/**
 * Guarda los tokens de Google OAuth (nunca se exponen en API)
 */
function saveGoogleTokens(tokens) {
	const settings = getData("settings");
	settings.googleTokens = tokens;
	settings.updatedAt = new Date().toISOString();
	writeData("settings", settings);
}

/**
 * Obtiene los tokens de Google (solo uso interno)
 */
function getGoogleTokens() {
	const settings = getData("settings");
	return settings.googleTokens || null;
}

/**
 * Guarda el calendarId de Google
 */
function setGoogleCalendarId(calendarId) {
	const settings = getData("settings");
	settings.googleCalendarId = calendarId;
	settings.updatedAt = new Date().toISOString();
	writeData("settings", settings);
}

module.exports = {
	getSettings,
	updateSettings,
	saveGoogleTokens,
	getGoogleTokens,
	setGoogleCalendarId,
};
