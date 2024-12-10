// hooks/useApi.ts
import { useState, useEffect } from 'react';

// Interfaces matching your Prisma schema
interface RatingCategory {
  id: number;
  keyword: string;
  name: string;
  icon: string;
  description: string;
  weight: number;
  examples: string[];
}

interface NomineeRating {
  id: number;
  userId: number;
  nomineeId: number;
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence?: string;
  ratingCategory: RatingCategory;
}

interface InstitutionRating {
  id: number;
  userId: number;
  institutionId: number;
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence?: string;
  ratingCategory: RatingCategory;
}

interface Position {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  region: string;
}

interface Institution {
  id: number;
  name: string;
  avatar?: string;
  status: boolean;
  rating: InstitutionRating[];
}

interface Nominee {
  id: number;
  name: string;
  avatar?: string;
  positionId: number;
  institutionId: number;
  districtId: number;
  status: boolean;
  evidence?: string;
  position: Position;
  institution: Institution;
  district: District;
  rating: NomineeRating[];
}

interface SearchResults {
  nominees: Nominee[];
  institutions: Institution[];
}

interface StatsData {
  stats: {
    nomineeCount: number;
    institutionCount: number;
    totalRatings: number;
  };
  topNominees: Nominee[];
  topInstitutions: Institution[];
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults>({ nominees: [], institutions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults({ nominees: [], institutions: [] });
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: abortController.signal
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to search');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  return { results, loading, error };
}

export function useStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/stats', {
          signal: abortController.signal
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const stats = await res.json();
        setData(stats);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => {
      abortController.abort();
    };
  }, []);

  return { data, loading, error };
}