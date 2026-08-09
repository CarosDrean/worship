import "./StateView.css";
import Button from "./Button";

export function EmptyState({ icon = "📭", title, description, action, actionLabel, onAction }) {
	return (
		<div className="state-view" role="status">
			<div className="state-view__icon" aria-hidden="true">
				{icon}
			</div>
			{title && <h3 className="state-view__title">{title}</h3>}
			{description && <p className="state-view__desc">{description}</p>}
			{action && onAction && (
				<Button variant="primary" onClick={onAction}>
					{actionLabel || action}
				</Button>
			)}
		</div>
	);
}

export function ErrorState({
	icon = "⚠️",
	title = "Error",
	description,
	action,
	actionLabel,
	onAction,
}) {
	return (
		<div className="state-view state-view--error" role="alert">
			<div className="state-view__icon" aria-hidden="true">
				{icon}
			</div>
			<h3 className="state-view__title">{title}</h3>
			{description && <p className="state-view__desc">{description}</p>}
			{action && onAction && (
				<Button variant="secondary" onClick={onAction}>
					{actionLabel || action}
				</Button>
			)}
		</div>
	);
}
