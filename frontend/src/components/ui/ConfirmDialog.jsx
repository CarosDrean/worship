import { useEffect, useRef } from "react";
import Button from "./Button";
import "./Modal.css";

export default function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = "Confirmar",
	cancelLabel = "Cancelar",
	variant = "primary",
	loading = false,
	onConfirm,
	onCancel,
}) {
	const overlayRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handleKey = (e) => {
			if (e.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", handleKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.body.style.overflow = "";
		};
	}, [open, onCancel]);

	if (!open) return null;

	return (
		<div
			className="modal-overlay"
			ref={overlayRef}
			onClick={(e) => {
				if (e.target === overlayRef.current) onCancel();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onCancel();
			}}
			role="dialog"
			aria-modal="true"
			aria-label={title || "Confirmacion"}
		>
			<div className="modal modal--sm">
				<div className="modal__header">
					<h2 className="modal__title">{title || "Confirmar"}</h2>
				</div>
				<div className="modal__body">
					<p style={{ marginBottom: "1.25rem" }}>{message}</p>
					<div
						style={{
							display: "flex",
							gap: "0.75rem",
							justifyContent: "flex-end",
						}}
					>
						<Button variant="ghost" onClick={onCancel} disabled={loading}>
							{cancelLabel}
						</Button>
						<Button
							variant={variant === "danger" ? "danger" : "primary"}
							onClick={onConfirm}
							loading={loading}
						>
							{confirmLabel}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
