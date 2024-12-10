import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useHomeData() {
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [nomineeStats, institutionStats] = await Promise.all([
          fetch('/api/nominees/stats').then(res => res.json()),
          fetch('/api/institutions/stats').then(res => res.json())
        ]);

        setStats({
          nominees: nomineeStats,
          institutions: institutionStats
        });
      } catch (error) {
        setError('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const searchData = async () => {
      if (!debouncedSearch) return;

      try {
        const response = await fetch(`/api/search?q=${debouncedSearch}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        setError('Search failed');
      }
    };

    searchData();
  }, [debouncedSearch]);

  return {
    stats,
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error
  };
}