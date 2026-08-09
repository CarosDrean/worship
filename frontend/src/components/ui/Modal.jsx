import { useEffect, useRef } from "react";
import "./Modal.css";

export default function Modal({ open, onClose, title, children, size = "md" }) {
	const overlayRef = useRef(null);
	const contentRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const prev = document.activeElement;
		const handleKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "Tab" && contentRef.current) {
				const focusable = contentRef.current.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", handleKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.body.style.overflow = "";
			prev?.focus?.();
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="modal-overlay"
			ref={overlayRef}
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<div className={`modal modal--${size}`} ref={contentRef}>
				<div className="modal__header">
					<h2 className="modal__title">{title}</h2>
					<button className="modal__close" onClick={onClose} aria-label="Cerrar" type="button">
						✕
					</button>
				</div>
				<div className="modal__body">{children}</div>
			</div>
		</div>
	);
}
