import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const timersRef = useRef({});

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
		if (timersRef.current[id]) {
			clearTimeout(timersRef.current[id]);
			delete timersRef.current[id];
		}
	}, []);

	const addToast = useCallback(
		(message, type = "info", duration = 4000) => {
			const id = ++toastId;
			setToasts((prev) => [...prev, { id, message, type }]);
			if (duration > 0) {
				timersRef.current[id] = setTimeout(() => removeToast(id), duration);
			}
			return id;
		},
		[removeToast],
	);

	const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
	const error = useCallback((msg) => addToast(msg, "error", 6000), [addToast]);
	const warning = useCallback((msg) => addToast(msg, "warning", 5000), [addToast]);
	const info = useCallback((msg) => addToast(msg, "info", 4000), [addToast]);

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
			{children}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
	return ctx;
}
