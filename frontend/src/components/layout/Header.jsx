import { useTheme } from "../../context/ThemeContext";
import "./Header.css";

export default function Header() {
	const { theme, toggle } = useTheme();

	return (
		<header className="header">
			<div className="header__left">
				<span className="header__mobile-brand">✝ Worship</span>
			</div>
			<div className="header__right">
				<button
					className="header__theme-btn"
					onClick={toggle}
					aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
					type="button"
					title={theme === "light" ? "Modo oscuro" : "Modo claro"}
				>
					{theme === "light" ? "🌙" : "☀️"}
				</button>
			</div>
		</header>
	);
}
