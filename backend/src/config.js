const path = require("node:path");

// Puerto del servidor
const PORT = process.env.PORT || 3001;

// Directorio raiz del backend
const ROOT_DIR = path.resolve(__dirname, "..");

// Directorio de datos persistentes
const DATA_DIR = path.join(ROOT_DIR, "data");

// Archivos JSON de persistencia
const DATA_FILES = {
	activities: "activities.json",
	attendance: "attendance.json",
	quotes: "quotes.json",
	goals: "goals.json",
	reflections: "reflections.json",
	settings: "settings.json",
	googleSync: "google-sync.json",
};

// Tipos de actividad validos
const ACTIVITY_TYPES = [
	"culto",
	"ayuno",
	"vigilia",
	"estudio_biblico",
	"reunion",
	"evangelismo",
	"otro",
];

// Estados de asistencia validos
const ATTENDANCE_STATUSES = ["pendiente", "asisti", "no_asisti", "asistencia_parcial"];

// Categorias de frases
const QUOTE_CATEGORIES = [
	"fe",
	"perseverancia",
	"oracion",
	"disciplina",
	"servicio",
	"esperanza",
	"personalizada",
];

// Formato de fecha de negocio
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

module.exports = {
	PORT,
	ROOT_DIR,
	DATA_DIR,
	DATA_FILES,
	ACTIVITY_TYPES,
	ATTENDANCE_STATUSES,
	QUOTE_CATEGORIES,
	DATE_FORMAT,
};
