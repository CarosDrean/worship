const { getData } = require("../persistence/store");

/**
 * Calcula todas las metricas del dashboard
 * @param {string} period - 'week' | 'month' (por defecto 'month')
 */
function getDashboardMetrics(period = "month") {
	const activities = getData("activities").filter((a) => !a.archived);
	const attendance = getData("attendance");

	const now = new Date();
	const today = now.toISOString().slice(0, 10);

	// Calcular rango del periodo
	let startDate;
	if (period === "week") {
		const dayOfWeek = now.getDay();
		const monday = new Date(now);
		monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
		startDate = monday.toISOString().slice(0, 10);
	} else {
		// mes actual
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		startDate = firstDay.toISOString().slice(0, 10);
	}

	// Actividades del periodo actual
	const periodActivities = activities.filter((a) => a.date >= startDate && a.date <= today);

	// Proxima actividad (futura mas cercana)
	const upcomingActivities = activities
		.filter((a) => a.date >= today)
		.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));

	const nextActivity = upcomingActivities.length > 0 ? upcomingActivities[0] : null;

	// Actividades pendientes (sin registro de asistencia y fecha pasada o hoy)
	const pendingActivities = activities.filter((a) => {
		if (a.date > today) return false;
		return !attendance.some((att) => att.activityId === a.id);
	});

	// Asistencias del periodo
	const periodAttendance = attendance.filter((att) => {
		const activity = activities.find((a) => a.id === att.activityId);
		return activity && activity.date >= startDate && activity.date <= today;
	});

	// Total de actividades con asistencia registrada en el periodo
	const attendedCount = periodAttendance.filter((a) => a.status === "asisti").length;
	const partialCount = periodAttendance.filter((a) => a.status === "asistencia_parcial").length;
	const missedCount = periodAttendance.filter((a) => a.status === "no_asisti").length;
	const totalRegistered = periodAttendance.length;

	// Porcentaje de asistencia (considera parcial como 0.5)
	const attendanceRate =
		totalRegistered > 0
			? Math.round(((attendedCount + partialCount * 0.5) / totalRegistered) * 100)
			: 0;

	// Rachas (streak actual y mejor)
	const streaks = calculateStreaks(activities, attendance);

	// Ayunos completados (total)
	const fastsCompleted = attendance.filter(
		(a) => a.fastingDuration !== null && a.fastingDuration > 0,
	).length;

	// Vigilias completadas
	const vigilsCompleted = attendance.filter((a) => a.vigilCompleted === true).length;

	// Actividades por categoria
	const byCategory = countByCategory(periodActivities);

	// Porcentaje de asistencia por tipo
	const attendanceByType = calculateAttendanceByType(activities, attendance);

	return {
		period: {
			type: period,
			startDate,
			endDate: today,
		},
		nextActivity,
		pendingActivities: pendingActivities.length,
		pendingList: pendingActivities.slice(0, 5),
		periodStats: {
			totalActivities: periodActivities.length,
			attended: attendedCount,
			partial: partialCount,
			missed: missedCount,
			registered: totalRegistered,
			attendanceRate,
		},
		streaks,
		fastsCompleted,
		vigilsCompleted,
		byCategory,
		attendanceByType,
		totalActivities: activities.length,
		totalAttendance: attendance.length,
	};
}

/**
 * Calcula rachas de asistencia
 */
function calculateStreaks(activities, attendance) {
	// Actividades con fecha pasada o hoy
	const now = new Date();
	const today = now.toISOString().slice(0, 10);

	const pastActivities = activities
		.filter((a) => a.date <= today)
		.sort((a, b) => a.date.localeCompare(b.date));

	// Crear mapa de asistencia por actividad
	const attMap = new Map();
	attendance.forEach((att) => {
		attMap.set(att.activityId, att.status);
	});

	// Calcular secuencia de dias con asistencia
	let currentStreak = 0;
	let bestStreak = 0;
	let tempStreak = 0;

	// Agrupar actividades por fecha
	const activitiesByDate = new Map();
	pastActivities.forEach((a) => {
		if (!activitiesByDate.has(a.date)) {
			activitiesByDate.set(a.date, []);
		}
		activitiesByDate.get(a.date).push(a);
	});

	// Ordenar fechas
	const sortedDates = [...activitiesByDate.keys()].sort();

	for (const date of sortedDates) {
		const dayActivities = activitiesByDate.get(date);
		const hasAttended = dayActivities.some((a) => {
			const status = attMap.get(a.id);
			return status === "asisti" || status === "asistencia_parcial";
		});

		if (hasAttended) {
			tempStreak++;
			if (tempStreak > bestStreak) {
				bestStreak = tempStreak;
			}
		} else {
			tempStreak = 0;
		}
	}

	// Calcular racha actual (desde la fecha mas reciente hacia atras)
	currentStreak = 0;
	for (let i = sortedDates.length - 1; i >= 0; i--) {
		const date = sortedDates[i];
		const dayActivities = activitiesByDate.get(date);
		const hasAttended = dayActivities.some((a) => {
			const status = attMap.get(a.id);
			return status === "asisti" || status === "asistencia_parcial";
		});

		if (hasAttended) {
			currentStreak++;
		} else {
			break;
		}
	}

	return {
		current: currentStreak,
		best: bestStreak,
	};
}

function countByCategory(activities) {
	const counts = {};
	activities.forEach((a) => {
		counts[a.type] = (counts[a.type] || 0) + 1;
	});
	return counts;
}

function calculateAttendanceByType(activities, attendance) {
	const attMap = new Map();
	attendance.forEach((att) => {
		attMap.set(att.activityId, att.status);
	});

	const byType = {};
	activities.forEach((a) => {
		if (!byType[a.type]) {
			byType[a.type] = { total: 0, attended: 0, partial: 0, missed: 0 };
		}
		byType[a.type].total++;
		const status = attMap.get(a.id);
		if (status === "asisti") byType[a.type].attended++;
		else if (status === "asistencia_parcial") byType[a.type].partial++;
		else if (status === "no_asisti") byType[a.type].missed++;
	});

	// Calcular porcentajes
	const result = {};
	Object.keys(byType).forEach((type) => {
		const stats = byType[type];
		result[type] = {
			...stats,
			rate:
				stats.total > 0
					? Math.round(((stats.attended + stats.partial * 0.5) / stats.total) * 100)
					: 0,
		};
	});

	return result;
}

module.exports = {
	getDashboardMetrics,
};
