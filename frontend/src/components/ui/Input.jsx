import "./Input.css";

export default function Input({
	label,
	id,
	error,
	hint,
	type = "text",
	required = false,
	...props
}) {
	const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
	return (
		<div className="field">
			{label && (
				<label className="field__label" htmlFor={inputId}>
					{label}
					{required && (
						<span className="field__required" aria-hidden="true">
							{" "}
							*
						</span>
					)}
				</label>
			)}
			{type === "textarea" ? (
				<textarea
					id={inputId}
					className={`field__input ${error ? "field__input--error" : ""}`}
					aria-invalid={!!error}
					aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
					required={required}
					rows={4}
					{...props}
				/>
			) : (
				<input
					id={inputId}
					type={type}
					className={`field__input ${error ? "field__input--error" : ""}`}
					aria-invalid={!!error}
					aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
					required={required}
					{...props}
				/>
			)}
			{hint && !error && (
				<p className="field__hint" id={`${inputId}-hint`}>
					{hint}
				</p>
			)}
			{error && (
				<p className="field__error" id={`${inputId}-error`} role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
