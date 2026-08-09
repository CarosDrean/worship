import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Attendance from "./views/Attendance";
import ActivityDetail from "./views/activities/ActivityDetail";
import ActivityList from "./views/activities/ActivityList";
import Calendar from "./views/Calendar";
import Dashboard from "./views/Dashboard";
import Quotes from "./views/Quotes";
import Reflections from "./views/Reflections";
import Settings from "./views/Settings";

export default function App() {
	return (
		<ThemeProvider>
			<ToastProvider>
				<BrowserRouter>
					<Routes>
						<Route element={<Shell />}>
							<Route index element={<Dashboard />} />
							<Route path="actividades" element={<ActivityList />} />
							<Route path="actividades/:id" element={<ActivityDetail />} />
							<Route path="calendario" element={<Calendar />} />
							<Route path="asistencia" element={<Attendance />} />
							<Route path="reflexiones" element={<Reflections />} />
							<Route path="frases" element={<Quotes />} />
							<Route path="ajustes" element={<Settings />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</ToastProvider>
		</ThemeProvider>
	);
}
