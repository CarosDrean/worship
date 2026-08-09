import { useToast } from "../../context/ToastContext";
import "./Toast.css";

export default function ToastContainer() {
	const { toasts, removeToast } = useToast();

	if (toasts.length === 0) return null;

	return (
		<section className="toast-container" aria-live="polite" aria-label="Notificaciones">
			{toasts.map((t) => (
				<div key={t.id} className={`toast toast--${t.type}`} role="alert">
					<span className="toast__icon" aria-hidden="true">
						{t.type === "success"
							? "✓"
							: t.type === "error"
								? "✕"
								: t.type === "warning"
									? "⚠"
									: "ℹ"}
					</span>
					<span className="toast__message">{t.message}</span>
					<button
						className="toast__close"
						onClick={() => removeToast(t.id)}
						aria-label="Cerrar notificacion"
						type="button"
					>
						✕
					</button>
				</div>
			))}
		</section>
	);
}
