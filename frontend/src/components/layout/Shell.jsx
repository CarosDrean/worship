import { Outlet } from "react-router-dom";
import ToastContainer from "../ui/Toast";
import Header from "./Header";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import "./Shell.css";

export default function Shell() {
	return (
		<div className="shell">
			<Sidebar />
			<div className="shell__main">
				<Header />
				<main className="shell__content" id="main-content">
					<Outlet />
				</main>
			</div>
			<MobileNav />
			<ToastContainer />
		</div>
	);
}
