const fs = require("node:fs");
const path = require("node:path");
const { DATA_DIR, DATA_FILES } = require("../config");

// Cache en memoria para lecturas rapidas
const cache = {};

// Asegura que el directorio de datos exista
function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
}

// Obtiene la ruta completa de un archivo de datos
function getFilePath(fileName) {
	return path.join(DATA_DIR, fileName);
}

// Valores por defecto para cada archivo de datos
const DEFAULTS = {
	activities: [],
	attendance: [],
	quotes: [],
	goals: [],
	reflections: [],
	settings: {
		googleCalendarId: null,
		googleTokens: null,
		theme: "system",
		language: "es",
	},
	googleSync: [],
};

/**
 * Lee un archivo JSON de datos. Si no existe, lo crea con valores por defecto.
 * Si esta corrupto, intenta recuperar desde backup.
 * @param {string} key - Clave del archivo en DATA_FILES
 * @returns {object|array} Datos leidos
 */
function readData(key) {
	ensureDataDir();
	const fileName = DATA_FILES[key];
	if (!fileName) {
		throw new Error(`Clave de datos desconocida: ${key}`);
	}

	const filePath = getFilePath(fileName);

	// Si no existe el archivo, crear con defaults
	if (!fs.existsSync(filePath)) {
		const defaultData = DEFAULTS[key] !== undefined ? DEFAULTS[key] : [];
		writeDataAtomic(key, defaultData);
		cache[key] = JSON.parse(JSON.stringify(defaultData));
		return JSON.parse(JSON.stringify(defaultData));
	}

	try {
		const raw = fs.readFileSync(filePath, "utf-8");
		const data = JSON.parse(raw);

		// Validar que el tipo de dato coincida con el default
		const defaultData = DEFAULTS[key] !== undefined ? DEFAULTS[key] : [];
		if (typeof data !== typeof defaultData) {
			throw new Error("Tipo de dato incompatible con el esperado");
		}

		cache[key] = JSON.parse(JSON.stringify(data));
		return JSON.parse(JSON.stringify(data));
	} catch (_err) {
		// Intentar recuperar desde backup
		const bakPath = `${filePath}.bak`;
		if (fs.existsSync(bakPath)) {
			try {
				const bakRaw = fs.readFileSync(bakPath, "utf-8");
				const bakData = JSON.parse(bakRaw);
				// Restaurar desde backup
				fs.copyFileSync(bakPath, filePath);
				const defaultData = DEFAULTS[key] !== undefined ? DEFAULTS[key] : [];
				if (typeof bakData !== typeof defaultData) {
					throw new Error("Backup corrupto: tipo de dato incompatible");
				}
				cache[key] = JSON.parse(JSON.stringify(bakData));
				console.error(`[PERSISTENCIA] Archivo ${fileName} corrupto. Restaurado desde backup.`);
				return JSON.parse(JSON.stringify(bakData));
			} catch (_bakErr) {
				console.error(
					`[PERSISTENCIA] Archivo ${fileName} y su backup estan corruptos. Creando nuevo.`,
				);
			}
		} else {
			console.error(`[PERSISTENCIA] Archivo ${fileName} corrupto y sin backup. Creando nuevo.`);
		}

		// Crear desde defaults
		const defaultData = DEFAULTS[key] !== undefined ? DEFAULTS[key] : [];
		writeDataAtomic(key, defaultData);
		cache[key] = JSON.parse(JSON.stringify(defaultData));
		return JSON.parse(JSON.stringify(defaultData));
	}
}

/**
 * Escribe datos de forma atomica: temporal + rename + backup .bak
 * @param {string} key - Clave del archivo en DATA_FILES
 * @param {object|array} data - Datos a escribir
 */
function writeDataAtomic(key, data) {
	ensureDataDir();
	const fileName = DATA_FILES[key];
	if (!fileName) {
		throw new Error(`Clave de datos desconocida: ${key}`);
	}

	const filePath = getFilePath(fileName);
	const tmpPath = `${filePath}.tmp`;
	const bakPath = `${filePath}.bak`;

	// Crear backup del archivo existente si es valido
	if (fs.existsSync(filePath)) {
		try {
			const existingRaw = fs.readFileSync(filePath, "utf-8");
			JSON.parse(existingRaw); // validar que es JSON valido
			fs.copyFileSync(filePath, bakPath);
		} catch (_err) {
			// Si el archivo actual es invalido, no hacer backup
			console.error(
				`[PERSISTENCIA] No se pudo crear backup de ${fileName}: archivo actual invalido`,
			);
		}
	}

	// Escribir en archivo temporal
	const jsonStr = JSON.stringify(data, null, 2);
	fs.writeFileSync(tmpPath, jsonStr, "utf-8");

	// Renombrar atomicamente
	fs.renameSync(tmpPath, filePath);

	// Actualizar cache
	cache[key] = JSON.parse(JSON.stringify(data));
}

/**
 * Escribe datos directamente (para operaciones que ya manejan el flujo)
 * @param {string} key - Clave del archivo en DATA_FILES
 * @param {object|array} data - Datos a escribir
 */
function writeData(key, data) {
	writeDataAtomic(key, data);
}

/**
 * Invalida la cache para forzar relectura
 * @param {string} key - Clave del archivo (opcional, si no se pasa limpia toda la cache)
 */
function invalidateCache(key) {
	if (key) {
		delete cache[key];
	} else {
		for (const k of Object.keys(cache)) {
			delete cache[k];
		}
	}
}

/**
 * Obtiene datos desde cache o los lee si no estan en cache
 */
function getData(key) {
	if (cache[key] !== undefined) {
		return JSON.parse(JSON.stringify(cache[key]));
	}
	return readData(key);
}

module.exports = {
	readData,
	writeData,
	writeDataAtomic,
	getData,
	invalidateCache,
	getFilePath,
};
