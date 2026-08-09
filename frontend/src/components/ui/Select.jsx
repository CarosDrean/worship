import "./Select.css";

export default function Select({ label, id, error, options = [], required = false, ...props }) {
	const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
	return (
		<div className="field">
			{label && (
				<label className="field__label" htmlFor={selectId}>
					{label}
					{required && (
						<span className="field__required" aria-hidden="true">
							{" "}
							*
						</span>
					)}
				</label>
			)}
			<select
				id={selectId}
				className={`field__input field__select ${error ? "field__input--error" : ""}`}
				aria-invalid={!!error}
				required={required}
				{...props}
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value} disabled={opt.disabled}>
						{opt.label}
					</option>
				))}
			</select>
			{error && (
				<p className="field__error" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
