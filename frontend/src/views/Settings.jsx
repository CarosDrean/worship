import { useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useApi } from "../hooks/useApi";
import { api } from "../lib/api";
import "./Settings.css";

const TABS = [
	{ id: "general", label: "General" },
	{ id: "datos", label: "Datos" },
	{ id: "google", label: "Google Calendar" },
];

export default function Settings() {
	const { theme, toggle } = useTheme();
	const { toast } = useToast();
	const { success, error: showError, info } = toast || {};
	const [activeTab, setActiveTab] = useState("general");
	const fileInputRef = useRef(null);

	// Google status
	const { data: googleStatus, loading: googleLoading } = useApi(() => api.google.status(), {
		immediate: true,
	});

	// Export
	const [exportLoading, setExportLoading] = useState(false);
	const handleExport = async () => {
		setExportLoading(true);
		try {
			const result = await api.data.export();
			const blob = new Blob([JSON.stringify(result.data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `worship-backup-${new Date().toISOString().slice(0, 10)}.json`;
			a.click();
			URL.revokeObjectURL(url);
			success?.("Datos exportados correctamente");
		} catch (err) {
			showError?.(err.message || "Error al exportar datos");
		} finally {
			setExportLoading(false);
		}
	};

	// Import
	const [importLoading, setImportLoading] = useState(false);
	const handleImport = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImportLoading(true);
		try {
			const text = await file.text();
			let jsonData;
			try {
				jsonData = JSON.parse(text);
			} catch {
				showError?.("El archivo no es un JSON valido");
				setImportLoading(false);
				return;
			}
			await api.data.import(jsonData);
			success?.("Datos importados correctamente");
		} catch (err) {
			showError?.(err.message || "Error al importar datos");
		} finally {
			setImportLoading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	// Google connect
	const handleGoogleConnect = async () => {
		try {
			const result = await api.google.authUrl();
			if (result.data?.authUrl) {
				window.open(result.data.authUrl, "_blank", "noopener,noreferrer");
				info?.("Completa la autorizacion en la ventana de Google");
			}
		} catch (err) {
			showError?.(err.message || "Error al obtener URL de autenticacion");
		}
	};

	return (
		<div className="settings-view">
			<h1>Ajustes</h1>

			{/* Tabs */}
			<div className="settings-tabs" role="tablist">
				{TABS.map((tab) => (
					<button
						type="button"
						key={tab.id}
						className={`settings-tab ${activeTab === tab.id ? "settings-tab--active" : ""}`}
						onClick={() => setActiveTab(tab.id)}
						role="tab"
						aria-selected={activeTab === tab.id}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab: General */}
			{activeTab === "general" && (
				<Card className="settings-section">
					<h2>Tema</h2>
					<p className="settings-section__desc">Selecciona el tema visual de la aplicacion.</p>
					<div className="theme-switcher">
						<button
							type="button"
							className={`theme-option ${theme === "light" ? "theme-option--active" : ""}`}
							onClick={() => theme !== "light" && toggle()}
						>
							<span className="theme-option__icon">☀️</span>
							<span>Claro</span>
						</button>
						<button
							type="button"
							className={`theme-option ${theme === "dark" ? "theme-option--active" : ""}`}
							onClick={() => theme !== "dark" && toggle()}
						>
							<span className="theme-option__icon">🌙</span>
							<span>Oscuro</span>
						</button>
					</div>
				</Card>
			)}

			{/* Tab: Datos */}
			{activeTab === "datos" && (
				<>
					<Card className="settings-section">
						<h2>Exportar datos</h2>
						<p className="settings-section__desc">
							Descarga una copia de seguridad de todos tus datos (actividades, asistencia,
							reflexiones, frases y ajustes).
						</p>
						<Button onClick={handleExport} loading={exportLoading} variant="secondary">
							📥 Exportar JSON
						</Button>
					</Card>

					<Card className="settings-section">
						<h2>Importar datos</h2>
						<p className="settings-section__desc">
							Restaura una copia de seguridad anterior.{" "}
							<strong>Los datos actuales seran reemplazados.</strong>
						</p>
						<div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json,application/json"
								onChange={handleImport}
								className="settings-file-input"
								id="import-file"
								disabled={importLoading}
							/>
							<label
								htmlFor="import-file"
								className={`settings-file-label ${importLoading ? "settings-file-label--loading" : ""}`}
							>
								{importLoading ? "Importando..." : "📤 Seleccionar archivo"}
							</label>
						</div>
					</Card>
				</>
			)}

			{/* Tab: Google Calendar */}
			{activeTab === "google" && (
				<Card className="settings-section">
					<h2>Google Calendar</h2>

					{googleLoading && <Spinner size="sm" />}

					{!googleLoading && googleStatus && (
						<div className="google-status">
							<div className="google-status__indicator">
								<span
									className={`google-dot ${googleStatus.connected ? "google-dot--connected" : "google-dot--disconnected"}`}
								/>
								<span className="google-status__label">
									{googleStatus.connected ? "Conectado" : "Desconectado"}
								</span>
							</div>

							{googleStatus.connected && googleStatus.calendarName && (
								<p className="google-status__calendar">
									Calendario: <strong>{googleStatus.calendarName}</strong>
								</p>
							)}

							{googleStatus.connected && googleStatus.lastSync && (
								<p className="google-status__sync">
									Ultima sincronizacion: {new Date(googleStatus.lastSync).toLocaleString("es-ES")}
								</p>
							)}

							{!googleStatus.connected && (
								<div className="google-connect-area">
									<p className="settings-section__desc">
										Conecta tu cuenta de Google para sincronizar actividades con un calendario
										especifico. La sincronizacion es manual y tu decides cuando ejecutarla.
									</p>
									<Button onClick={handleGoogleConnect} variant="secondary">
										Conectar con Google
									</Button>
								</div>
							)}
						</div>
					)}

					{!googleLoading && !googleStatus && (
						<div className="google-connect-area">
							<p className="settings-section__desc">
								Conecta tu cuenta de Google para sincronizar tus actividades espirituales con tu
								calendario. La sincronizacion es <strong>manual</strong> y{" "}
								<strong>bidireccional</strong>.
							</p>
							<p className="settings-section__desc">
								En caso de conflictos, podras elegir entre conservar la version local, la de Google
								o combinar campos.
							</p>
							<Button onClick={handleGoogleConnect} variant="secondary">
								Conectar con Google
							</Button>
						</div>
					)}

					{!googleLoading && googleStatus?.connected && (
						<div className="google-info-box">
							<h4>ℹ️ Sincronizacion</h4>
							<ul>
								<li>La sincronizacion es manual: tu decides cuando sincronizar.</li>
								<li>Solo se sincroniza el calendario que hayas seleccionado.</li>
								<li>Los eventos eliminados en Google se conservan como historial local.</li>
								<li>
									Los conflictos se muestran explicitamente para que decidas como resolverlos.
								</li>
							</ul>
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
