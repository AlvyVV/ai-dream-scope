import { ItemConfig } from '@/types/item-config';
import { TagIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

// Define alphabet array
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

interface SymbolsAlphabetListProps {
  symbols: ItemConfig[];
  categoryName?: string;
}

export default function SymbolsAlphabetList({ symbols, categoryName = '' }: SymbolsAlphabetListProps) {
  // Group symbols by letter
  const symbolsByLetter = useMemo(() => {
    const result: Record<string, ItemConfig[]> = {};

    // Initialize all letter groups
    alphabet.forEach(letter => {
      result[letter] = [];
    });

    // Group symbols by first letter
    symbols.forEach(symbol => {
      if (symbol.name) {
        const firstLetter = symbol.name.toUpperCase().charAt(0);
        // Check if first letter is in A-Z range
        if (/[A-Z]/.test(firstLetter)) {
          result[firstLetter].push(symbol);
        }
      }
    });

    // Sort symbols within each letter group alphabetically by name
    Object.keys(result).forEach(letter => {
      result[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return result;
  }, [symbols]);

  // Check if there are any symbols
  const hasSymbols = useMemo(() => {
    return Object.values(symbolsByLetter).some(group => group.length > 0);
  }, [symbolsByLetter]);

  if (!hasSymbols) {
    return (
      <div className="text-center py-10 mt-8">
        <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <TagIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Dream Symbols Found</h3>
        <p className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
          We couldn't find any dream symbols {categoryName ? `in the "${categoryName}" category` : ''}. Try searching for a specific symbol or browse other categories.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <h2 className="mb-8 relative inline-block text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/2 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-indigo-500 after:rounded-full">
        {categoryName ? `${categoryName} Dream Symbols A-Z` : 'Dream Symbols A-Z'}
      </h2>

      {alphabet.map((letter, index) => {
        // Only render letters with symbols
        if (!symbolsByLetter[letter] || symbolsByLetter[letter].length === 0) {
          return null;
        }

        return (
          <div key={index} id={`letter-${letter}`} className="scroll-mt-40">
            {/* Letter separator */}
            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-xl font-bold text-white shadow-md ring-2 ring-purple-200 dark:ring-purple-800">
                {letter}
              </div>
              <div className="ml-4 h-px flex-grow bg-gradient-to-r from-purple-300 via-indigo-200 to-transparent dark:from-purple-700 dark:via-indigo-800"></div>
            </div>

            {/* Symbol list */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {symbolsByLetter[letter].map((symbol, index) => (
                <Link
                  key={index + symbol.name}
                  href={`/dream-dictionary/${symbol.code}`}
                  className="flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50 hover:shadow-sm group"
                >
                  <span className="text-sm font-medium tracking-wide group-hover:translate-x-0.5 transition-transform duration-200">{symbol.name}</span>
                  {/* {symbol.img && <Image src={symbol.img} alt={symbol.name} width={40} height={40} />} */}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
