const { v4: uuidv4 } = require("uuid");
const { getData, writeData } = require("../persistence/store");
const { createError } = require("../middleware/errorHandler");

// Catalogo inicial de frases (semilla)
const SEED_QUOTES = [
	{
		text: "La fe es la certeza de lo que se espera, la conviccion de lo que no se ve.",
		author: "Hebreos 11:1",
		category: "fe",
		source: "Biblia",
	},
	{
		text: "Todo lo puedo en Cristo que me fortalece.",
		author: "Filipenses 4:13",
		category: "fe",
		source: "Biblia",
	},
	{
		text: "El Señor es mi pastor, nada me faltara.",
		author: "Salmo 23:1",
		category: "fe",
		source: "Biblia",
	},
	{
		text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.",
		author: "Isaias 41:10",
		category: "fe",
		source: "Biblia",
	},
	{
		text: "Clama a mi, y yo te respondere, y te enseñare cosas grandes y ocultas que tu no conoces.",
		author: "Jeremias 33:3",
		category: "oracion",
		source: "Biblia",
	},
	{
		text: "Orad sin cesar.",
		author: "1 Tesalonicenses 5:17",
		category: "oracion",
		source: "Biblia",
	},
	{
		text: "La oracion eficaz del justo puede mucho.",
		author: "Santiago 5:16",
		category: "oracion",
		source: "Biblia",
	},
	{
		text: "Pedid, y se os dara; buscad, y hallareis; llamad, y se os abrira.",
		author: "Mateo 7:7",
		category: "oracion",
		source: "Biblia",
	},
	{
		text: "Pero los que esperan en el Señor tendran nuevas fuerzas; levantaran alas como las aguilas.",
		author: "Isaias 40:31",
		category: "perseverancia",
		source: "Biblia",
	},
	{
		text: "No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos, si no desmayamos.",
		author: "Galatas 6:9",
		category: "perseverancia",
		source: "Biblia",
	},
	{
		text: "He peleado la buena batalla, he acabado la carrera, he guardado la fe.",
		author: "2 Timoteo 4:7",
		category: "perseverancia",
		source: "Biblia",
	},
	{
		text: "Sean firmes y constantes, creciendo en la obra del Señor siempre.",
		author: "1 Corintios 15:58",
		category: "perseverancia",
		source: "Biblia",
	},
	{
		text: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.",
		author: "Eclesiastes 3:1",
		category: "disciplina",
		source: "Biblia",
	},
	{
		text: "El hombre diligente gobernara, pero el perezoso sera tributario.",
		author: "Proverbios 12:24",
		category: "disciplina",
		source: "Biblia",
	},
	{
		text: "Encomienda al Señor tus obras, y tus pensamientos seran afirmados.",
		author: "Proverbios 16:3",
		category: "disciplina",
		source: "Biblia",
	},
	{
		text: "Asi que, hermanos mios amados, estad firmes y constantes.",
		author: "1 Corintios 15:58",
		category: "disciplina",
		source: "Biblia",
	},
	{
		text: "Cada uno ponga al servicio de los demas el don que ha recibido.",
		author: "1 Pedro 4:10",
		category: "servicio",
		source: "Biblia",
	},
	{
		text: "El Hijo del Hombre no vino para ser servido, sino para servir.",
		author: "Mateo 20:28",
		category: "servicio",
		source: "Biblia",
	},
	{
		text: "Servid al Señor con alegria; venid ante su presencia con regocijo.",
		author: "Salmo 100:2",
		category: "servicio",
		source: "Biblia",
	},
	{
		text: "El mayor entre vosotros sera vuestro servidor.",
		author: "Mateo 23:11",
		category: "servicio",
		source: "Biblia",
	},
	{
		text: "Porque yo se los pensamientos que tengo acerca de vosotros, dice el Señor, pensamientos de paz, y no de mal.",
		author: "Jeremias 29:11",
		category: "esperanza",
		source: "Biblia",
	},
	{
		text: "El Dios de esperanza os llene de todo gozo y paz en el creer.",
		author: "Romanos 15:13",
		category: "esperanza",
		source: "Biblia",
	},
	{
		text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.",
		author: "Romanos 8:28",
		category: "esperanza",
		source: "Biblia",
	},
	{
		text: "Venid a mi todos los que estais trabajados y cargados, y yo os hare descansar.",
		author: "Mateo 11:28",
		category: "esperanza",
		source: "Biblia",
	},
];

/**
 * Inicializa el catalogo de frases con las semillas si esta vacio
 */
function seedQuotesIfNeeded() {
	const quotes = getData("quotes");
	if (quotes.length === 0) {
		const now = new Date().toISOString();
		const seedData = SEED_QUOTES.map((q) => ({
			id: uuidv4(),
			text: q.text,
			author: q.author,
			category: q.category,
			source: q.source,
			favorite: false,
			activityId: null,
			reflectionId: null,
			isCustom: false,
			createdAt: now,
			updatedAt: now,
		}));
		writeData("quotes", seedData);
		return seedData;
	}
	return quotes;
}

/**
 * Lista frases con filtros opcionales
 */
function listQuotes(filters = {}) {
	let quotes = getData("quotes");

	// Asegurar que hay datos semilla
	if (quotes.length === 0) {
		quotes = seedQuotesIfNeeded();
	}

	let result = [...quotes];

	if (filters.category) {
		result = result.filter((q) => q.category === filters.category);
	}

	if (filters.favorite === true || filters.favorite === "true") {
		result = result.filter((q) => q.favorite);
	}

	if (filters.search) {
		const s = filters.search.toLowerCase();
		result = result.filter(
			(q) =>
				q.text.toLowerCase().includes(s) ||
				q.author.toLowerCase().includes(s) ||
				q.source?.toLowerCase().includes(s),
		);
	}

	// Ordenar: favoritos primero, luego por fecha
	result.sort((a, b) => {
		if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
		return b.createdAt.localeCompare(a.createdAt);
	});

	return result;
}

/**
 * Obtiene una frase por ID
 */
function getQuote(id) {
	const quotes = getData("quotes");
	const quote = quotes.find((q) => q.id === id);
	if (!quote) {
		throw createError("NOT_FOUND", "Frase no encontrada", 404);
	}
	return quote;
}

/**
 * Obtiene la frase diaria (basada en el dia del año)
 */
function getDailyQuote() {
	let quotes = getData("quotes");
	if (quotes.length === 0) {
		quotes = seedQuotesIfNeeded();
	}

	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now - start;
	const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
	const index = dayOfYear % quotes.length;

	return quotes[index];
}

/**
 * Obtiene una frase aleatoria
 */
function getRandomQuote(category) {
	let quotes = getData("quotes");
	if (quotes.length === 0) {
		quotes = seedQuotesIfNeeded();
	}

	let pool = [...quotes];
	if (category) {
		pool = pool.filter((q) => q.category === category);
		if (pool.length === 0) {
			pool = [...quotes];
		}
	}

	const index = Math.floor(Math.random() * pool.length);
	return pool[index];
}

/**
 * Crea una frase personalizada
 */
function createQuote(data) {
	const quotes = getData("quotes");
	const now = new Date().toISOString();

	const quote = {
		id: uuidv4(),
		text: data.text.trim(),
		author: data.author || "Anonimo",
		category: data.category || "personalizada",
		source: data.source || "",
		favorite: data.favorite === true,
		activityId: data.activityId || null,
		reflectionId: data.reflectionId || null,
		isCustom: true,
		createdAt: now,
		updatedAt: now,
	};

	quotes.push(quote);
	writeData("quotes", quotes);

	return quote;
}

/**
 * Actualiza una frase personalizada
 */
function updateQuote(id, data) {
	const quotes = getData("quotes");
	const index = quotes.findIndex((q) => q.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Frase no encontrada", 404);
	}

	// Solo se pueden editar frases personalizadas
	if (!quotes[index].isCustom) {
		throw createError("VALIDATION_ERROR", "Solo se pueden editar frases personalizadas", 400);
	}

	const allowedFields = ["text", "author", "category", "source", "activityId", "reflectionId"];
	for (const field of allowedFields) {
		if (data[field] !== undefined) {
			quotes[index][field] = data[field];
		}
	}

	quotes[index].updatedAt = new Date().toISOString();
	writeData("quotes", quotes);

	return quotes[index];
}

/**
 * Elimina una frase personalizada
 */
function deleteQuote(id) {
	const quotes = getData("quotes");
	const index = quotes.findIndex((q) => q.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Frase no encontrada", 404);
	}

	if (!quotes[index].isCustom) {
		throw createError("VALIDATION_ERROR", "Solo se pueden eliminar frases personalizadas", 400);
	}

	const deleted = quotes[index];
	quotes.splice(index, 1);
	writeData("quotes", quotes);

	return deleted;
}

/**
 * Alterna el estado de favorito de una frase
 */
function toggleFavorite(id) {
	const quotes = getData("quotes");
	const index = quotes.findIndex((q) => q.id === id);

	if (index === -1) {
		throw createError("NOT_FOUND", "Frase no encontrada", 404);
	}

	quotes[index].favorite = !quotes[index].favorite;
	quotes[index].updatedAt = new Date().toISOString();
	writeData("quotes", quotes);

	return quotes[index];
}

module.exports = {
	seedQuotesIfNeeded,
	listQuotes,
	getQuote,
	getDailyQuote,
	getRandomQuote,
	createQuote,
	updateQuote,
	deleteQuote,
	toggleFavorite,
};
