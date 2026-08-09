import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
	{ to: "/", label: "Inicio", icon: "🏠" },
	{ to: "/actividades", label: "Actividades", icon: "📋" },
	{ to: "/calendario", label: "Calendario", icon: "📅" },
	{ to: "/asistencia", label: "Asistencia", icon: "✅" },
	{ to: "/reflexiones", label: "Reflexiones", icon: "📝" },
	{ to: "/frases", label: "Frases", icon: "💬" },
	{ to: "/ajustes", label: "Ajustes", icon: "⚙️" },
];

export default function Sidebar() {
	const _location = useLocation();

	return (
		<aside className="sidebar" aria-label="Navegacion principal">
			<div className="sidebar__brand">
				<span className="sidebar__logo" aria-hidden="true">
					✝
				</span>
				<span className="sidebar__name">Worship</span>
			</div>
			<nav className="sidebar__nav">
				<ul>
					{NAV_ITEMS.map((item) => (
						<li key={item.to}>
							<NavLink
								to={item.to}
								end={item.to === "/"}
								className={({ isActive }) =>
									`sidebar__link ${isActive ? "sidebar__link--active" : ""}`
								}
							>
								<span className="sidebar__icon" aria-hidden="true">
									{item.icon}
								</span>
								<span>{item.label}</span>
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
