const { getData, writeData } = require("../persistence/store");
const { createError } = require("../middleware/errorHandler");

/**
 * Exporta todos los datos de la aplicacion
 */
function exportAllData() {
	const activities = getData("activities");
	const attendance = getData("attendance");
	const quotes = getData("quotes");
	const goals = getData("goals");
	const reflections = getData("reflections");
	const settings = getData("settings");
	const googleSync = getData("googleSync");

	// Limpiar tokens de la exportacion
	const safeSettings = { ...settings };
	delete safeSettings.googleTokens;

	const exportData = {
		version: "1.0.0",
		exportedAt: new Date().toISOString(),
		application: "Worship",
		data: {
			activities,
			attendance,
			quotes,
			goals,
			reflections,
			settings: safeSettings,
			googleSync,
		},
		counts: {
			activities: activities.length,
			attendance: attendance.length,
			quotes: quotes.length,
			goals: goals.length,
			reflections: reflections.length,
			syncRecords: googleSync.length,
		},
	};

	return exportData;
}

/**
 * Importa datos desde un archivo de exportacion
 * @param {object} importData - Datos a importar
 * @param {string} mode - 'merge' | 'replace' (por defecto 'merge')
 */
function importData(importData, mode = "merge") {
	const { data } = importData;

	if (!data) {
		throw createError(
			"VALIDATION_ERROR",
			"El archivo de importacion no contiene datos validos.",
			400,
		);
	}

	if (mode === "replace") {
		// Reemplazo completo: sobreescribir todos los archivos
		const filesToImport = [
			{ key: "activities", value: "activities" },
			{ key: "attendance", value: "attendance" },
			{ key: "quotes", value: "quotes" },
			{ key: "goals", value: "goals" },
			{ key: "reflections", value: "reflections" },
			{ key: "googleSync", value: "googleSync" },
		];

		for (const { key, value } of filesToImport) {
			if (data[value] !== undefined) {
				writeData(key, data[value]);
			}
		}

		// Settings: mantener tokens actuales
		if (data.settings) {
			const currentSettings = getData("settings");
			const newSettings = { ...data.settings };
			// Preservar tokens actuales
			newSettings.googleTokens = currentSettings.googleTokens;
			writeData("settings", newSettings);
		}

		return {
			mode: "replace",
			imported: {
				activities: data.activities?.length || 0,
				attendance: data.attendance?.length || 0,
				quotes: data.quotes?.length || 0,
				goals: data.goals?.length || 0,
				reflections: data.reflections?.length || 0,
				googleSync: data.googleSync?.length || 0,
			},
		};
	}

	// Modo merge: agregar registros que no existan
	const merged = {};

	const mergeableFiles = ["activities", "attendance", "quotes", "reflections", "googleSync"];
	for (const key of mergeableFiles) {
		if (data[key] && Array.isArray(data[key])) {
			const existing = getData(key);
			const existingIds = new Set(existing.map((item) => item.id));
			const toAdd = data[key].filter((item) => !existingIds.has(item.id));
			const mergedData = [...existing, ...toAdd];
			writeData(key, mergedData);
			merged[key] = toAdd.length;
		} else {
			merged[key] = 0;
		}
	}

	// Goals: merge tambien
	if (data.goals && Array.isArray(data.goals)) {
		const existing = getData("goals");
		const existingIds = new Set(existing.map((item) => item.id));
		const toAdd = data.goals.filter((item) => !existingIds.has(item.id));
		writeData("goals", [...existing, ...toAdd]);
		merged.goals = toAdd.length;
	}

	return {
		mode: "merge",
		imported: merged,
	};
}

module.exports = {
	exportAllData,
	importData,
};
