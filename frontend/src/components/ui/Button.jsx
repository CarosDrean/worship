import "./Button.css";

export default function Button({
	children,
	variant = "primary",
	size = "md",
	type = "button",
	disabled = false,
	loading = false,
	fullWidth = false,
	onClick,
	...props
}) {
	const cls = [
		"btn",
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth ? "btn--full" : "",
		loading ? "btn--loading" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...props}>
			{loading && <span className="btn__spinner" aria-hidden="true" />}
			<span className={loading ? "btn__label--hidden" : ""}>{children}</span>
		</button>
	);
}
