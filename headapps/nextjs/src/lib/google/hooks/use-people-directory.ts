import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSwr } from 'lib/swr';
import type {
  DirectoryPerson,
  PeopleDirectoryListResponse,
} from 'src/lib/google/types/people-directory';

// ============================================================================
// Types
// ============================================================================

interface UsePeopleDirectoryOptions {
  companyCode: string;
  enabled?: boolean;
}

interface UsePeopleDirectoryReturn {
  /** Users for the current page (server-paginated). */
  paginatedUsers: DirectoryPerson[];
  /** Locations available for the company code (derived server-side). */
  locations: string[];
  /** Departments available for the company code (derived server-side). */
  departments: string[];
  /** Number of users matching the current search/filter set. */
  filteredCount: number;

  loading: boolean;
  error: Error | null;

  /** Raw input value bound to the search field. */
  inputValue: string;
  setSearchInput: (value: string) => void;
  /** Debounced query that has been pushed to the server. */
  searchQuery: string;

  selectedLocations: string[];
  toggleLocation: (location: string) => void;
  clearLocations: () => void;

  selectedDepartments: string[];
  toggleDepartment: (department: string) => void;
  clearDepartments: () => void;

  activePreset: { field: string; value: string } | null;
  clearPreset: () => void;
  clearFilters: () => void;
  applyFilterPreset: (filterValue: string) => void;

  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

// ============================================================================
// Constants
// ============================================================================

const PEOPLE_PER_PAGE = 8;
const SEARCH_DEBOUNCE_MS = 300;
const API_URL = '/api/google/admin/directory/users/list';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Builds the SWR cache key. Locations are sorted so different selection orders
 * produce a stable key (and reuse the same SWR cache entry).
 */
function buildSwrKey(
  companyCode: string,
  page: number,
  selectedLocations: string[],
  selectedDepartments: string[],
  searchQuery: string,
  preset: { field: string; value: string } | null
): string {
  const params = new URLSearchParams();
  params.set('companyCode', companyCode);
  params.set('page', String(page));
  params.set('pageSize', String(PEOPLE_PER_PAGE));

  for (const loc of [...selectedLocations].sort()) {
    params.append('location', loc);
  }

  for (const dept of [...selectedDepartments].sort()) {
    params.append('department', dept);
  }

  if (searchQuery.trim()) {
    params.set('q', searchQuery.trim());
  }

  if (preset) {
    params.set('preset', `${preset.field}:${preset.value}`);
  }

  return `${API_URL}?${params.toString()}`;
}

// ============================================================================
// Hook
// ============================================================================

export function usePeopleDirectory(options: UsePeopleDirectoryOptions): UsePeopleDirectoryReturn {
  const { companyCode, enabled = true } = options;

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<{ field: string; value: string } | null>(null);
  const [page, setPage] = useState(1);

  // Debounce the search input — only the debounced value drives a fetch.
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Reset to page 1 whenever the filter set changes.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedLocations, selectedDepartments, activePreset]);

  const swrKey = useMemo(
    () =>
      enabled && companyCode
        ? buildSwrKey(
            companyCode,
            page,
            selectedLocations,
            selectedDepartments,
            searchQuery,
            activePreset
          )
        : null,
    [enabled, companyCode, page, selectedLocations, selectedDepartments, searchQuery, activePreset]
  );

  const { data, error, isLoading } = useSwr<PeopleDirectoryListResponse>({
    key: swrKey,
    swrConfig: {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 60000,
    },
  });

  const toggleLocation = useCallback((location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]
    );
  }, []);

  const clearLocations = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  const toggleDepartment = useCallback((department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department) ? prev.filter((d) => d !== department) : [...prev, department]
    );
  }, []);

  const clearDepartments = useCallback(() => {
    setSelectedDepartments([]);
  }, []);

  const clearPreset = useCallback(() => {
    setActivePreset(null);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedLocations([]);
    setSelectedDepartments([]);
    setActivePreset(null);
    setInputValue('');
    setSearchQuery('');
    setPage(1);
  }, []);

  /**
   * Parses "field:value" prefix string from a Sitecore Link tooltip and toggles
   * the matching preset filter on or off.
   */
  const applyFilterPreset = useCallback((filterValue: string) => {
    const separatorIndex = filterValue.indexOf(':');
    if (separatorIndex === -1) return;

    const field = filterValue.slice(0, separatorIndex).trim();
    const value = filterValue.slice(separatorIndex + 1).trim();
    if (!field || !value) return;

    setActivePreset((prev) =>
      prev?.field === field && prev?.value === value ? null : { field, value }
    );
    setPage(1);
  }, []);

  return {
    paginatedUsers: data?.users ?? [],
    locations: data?.locations ?? [],
    departments: data?.departments ?? [],
    filteredCount: data?.filteredCount ?? 0,

    loading: isLoading,
    error: error ?? null,

    inputValue,
    setSearchInput: setInputValue,
    searchQuery,

    selectedLocations,
    toggleLocation,
    clearLocations,

    selectedDepartments,
    toggleDepartment,
    clearDepartments,

    activePreset,
    clearPreset,
    clearFilters,
    applyFilterPreset,

    page: data?.page ?? page,
    setPage,
    totalPages: data?.totalPages ?? 1,
  };
}
