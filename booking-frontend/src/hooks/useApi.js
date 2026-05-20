import { useState, useCallback } from 'react';

/**
 * Hook genérico para llamadas API con estados de loading, error y data.
 * Evita repetir try/catch/setLoading en cada componente.
 *
 * Uso:
 *   const { data, loading, error, execute } = useApi(alojamientosApi.getAll);
 *   useEffect(() => { execute(); }, [execute]);
 */
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const message =
          err.backendMessage || err.message || 'Error inesperado';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook para ejecutar mutaciones (POST, PUT, DELETE) sin cache.
 * Retorna solo execute + estados.
 */
export function useMutation(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        return response.data;
      } catch (err) {
        const message =
          err.backendMessage || err.message || 'Error inesperado';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { loading, error, execute };
}
