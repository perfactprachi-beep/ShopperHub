import { useState, useEffect } from 'react';

export function useFetch(fetcher, deps = []) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(res => { if (!cancelled) setData(res.data); })
      .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error };
}
