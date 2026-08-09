import { NavLink } from "react-router-dom";
import "./MobileNav.css";

const NAV_ITEMS = [
	{ to: "/", label: "Inicio", icon: "🏠" },
	{ to: "/actividades", label: "Actividades", icon: "📋" },
	{ to: "/calendario", label: "Calendario", icon: "📅" },
	{ to: "/asistencia", label: "Asistencia", icon: "✅" },
	{ to: "/reflexiones", label: "Reflexiones", icon: "📝" },
	{ to: "/frases", label: "Frases", icon: "💬" },
	{ to: "/ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function MobileNav() {
	return (
		<nav className="mobile-nav" aria-label="Navegacion movil">
			{NAV_ITEMS.map((item) => (
				<NavLink
					key={item.to}
					to={item.to}
					end={item.to === "/"}
					className={({ isActive }) =>
						`mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`
					}
				>
					<span className="mobile-nav__icon" aria-hidden="true">
						{item.icon}
					</span>
					<span className="mobile-nav__label">{item.label}</span>
				</NavLink>
			))}
		</nav>
	);
}
