import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook generico para llamadas API con estados de carga, error, datos y exito.
 * Maneja automaticamente la cancelacion de peticiones cuando el componente se desmonta.
 */
export function useApi(apiCall, { immediate = true, deps = [] } = {}) {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(immediate);
	const mountedRef = useRef(true);

	const execute = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				const result = await apiCall(...args);
				if (mountedRef.current) {
					setData(result.data !== undefined ? result.data : result);
					setError(null);
				}
				return result;
			} catch (err) {
				if (mountedRef.current) {
					setError(err.message || "Error desconocido");
					setData(null);
				}
				throw err;
			} finally {
				if (mountedRef.current) {
					setLoading(false);
				}
			}
		},
		[apiCall],
	);

	useEffect(() => {
		mountedRef.current = true;
		if (immediate) {
			execute();
		}
		return () => {
			mountedRef.current = false;
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: deps se pasan dinamicamente via opciones del hook
	}, deps);

	const refresh = useCallback(() => execute(), [execute]);

	return { data, error, loading, execute, refresh, setData };
}

/**
 * Hook para operaciones de mutacion (POST, PUT, DELETE).
 * No se ejecuta automaticamente.
 */
export function useMutation(apiCall) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const execute = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			setSuccess(false);
			try {
				const result = await apiCall(...args);
				setSuccess(true);
				setLoading(false);
				return result;
			} catch (err) {
				setError(err.message || "Error desconocido");
				setLoading(false);
				throw err;
			}
		},
		[apiCall],
	);

	const reset = useCallback(() => {
		setLoading(false);
		setError(null);
		setSuccess(false);
	}, []);

	return { loading, error, success, execute, reset };
}
