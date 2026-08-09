import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "worship-theme";

export function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "dark" || saved === "light") return saved;
		} catch {
			/* localStorage no disponible */
		}
		if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
		return "light";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			/* ignorar */
		}
	}, [theme]);

	const toggle = useCallback(() => {
		setThemeState((prev) => (prev === "light" ? "dark" : "light"));
	}, []);

	const setTheme = useCallback((t) => {
		if (t === "light" || t === "dark") setThemeState(t);
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
	return ctx;
}
