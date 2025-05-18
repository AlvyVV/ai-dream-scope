'use client';

import { Loader2, SearchIcon, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ItemConfig } from '@/types/item-config';

interface SymbolsSearchProps {
  className?: string;
  placeholder?: string;
  containerClassName?: string;
}

export default function SymbolsSearch({
  className,
  placeholder = 'Search dream symbols...',
  containerClassName,
}: SymbolsSearchProps) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [symbols, setSymbols] = useState<ItemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Component mount state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Implement debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const searchSymbols = useCallback(async () => {
    if (!debouncedQuery) {
      console.log('Search query is empty, clearing results');
      setSymbols([]);
      setError(null);
      return;
    }

    console.log(`Starting symbol search: "${debouncedQuery}", language: ${locale}`);
    setLoading(true);
    setError(null);

    try {
      const searchUrl = `/api/symbols/search?query=${encodeURIComponent(
        debouncedQuery
      )}&locale=${locale}`;
      console.log('Search request URL:', searchUrl);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      console.log('Search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search response error:', errorText);
        throw new Error(`Search request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`Search results count: ${data.length}`, data);
      setSymbols(data || []);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setError(error instanceof Error ? error.message : 'Search error, please try again later');
      setSymbols([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, locale]);

  useEffect(() => {
    if (debouncedQuery) {
      searchSymbols();
    } else {
      setSymbols([]);
      setError(null);
      setLoading(false);
    }
  }, [debouncedQuery, searchSymbols]);

  const handleSelect = (symbolCode: string) => {
    console.log(`Symbol selected: ${symbolCode}, preparing to navigate`);
    router.push(`/dream-dictionary/${symbolCode}`);
    setOpen(false);
    setQuery('');
  };

  // Handle query input
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    console.log(`Query input changed: "${newQuery}"`);
    setQuery(newQuery);

    if (newQuery) {
      // When there's input content, open the dropdown
      setOpen(true);
    } else {
      // When no input content, close the dropdown
      setOpen(false);
      setSymbols([]);
      setError(null);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setSymbols([]);
    setOpen(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        console.log('Clicked outside area, closing dropdown');
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!containerRef.current) return { top: 0, left: 0, width: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    return {
      top: rect.top + rect.height + window.scrollY + 8, // 8px below search box
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  };

  const { top, left, width } = getDropdownPosition();

  // Render dropdown content
  const renderDropdown = () => {
    if (!open || !query || !mounted) return null;

    const dropdown = (
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top,
          left,
          width,
          zIndex: 9999, // Ultra-high z-index to ensure top layer
          maxHeight: '80vh',
        }}
        className="overflow-y-auto rounded-lg border-2 border-purple-300 bg-white shadow-xl dark:border-purple-700 dark:bg-gray-800"
      >
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-500">{error}</div>
        ) : symbols.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">No dream symbols found</div>
        ) : (
          <div className="flex flex-col">
            <div className="sticky top-0 z-10 bg-purple-100 px-3 py-2 text-xs font-medium text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              Found {symbols.length} dream symbols
            </div>

            <div>
              {symbols.map(symbol => (
                <div
                  key={symbol.id || symbol.code}
                  className="cursor-pointer px-3 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={() => handleSelect(symbol.code)}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {symbol.name}
                    </span>
                    {symbol.category && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {symbol.category}
                      </span>
                    )}
                  </div>
                  {symbol.description && (
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      {symbol.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    // Use Portal to render dropdown at the end of body to ensure it's not hidden by other elements
    return createPortal(dropdown, document.body);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-xl', containerClassName)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          onFocus={() => query && setOpen(true)}
          onClick={() => query && setOpen(true)}
          className={cn(
            'h-12 rounded-full border-0 bg-white/20 pl-5 pr-12 text-white shadow-lg placeholder:text-white/70 focus-visible:ring-purple-400/70 dark:bg-white/10',
            className
          )}
        />

        {/* Display clear or search button based on state */}
        {query ? (
          <Button
            size="icon"
            type="button"
            onClick={handleClearSearch}
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-white/15 text-white shadow-md hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            type="button"
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-white/15 text-white shadow-md hover:bg-white/25"
            onClick={() => {
              if (query) {
                console.log('Search button clicked');
                searchSymbols();
              }
            }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Render dropdown using Portal */}
      {renderDropdown()}
    </div>
  );
}
