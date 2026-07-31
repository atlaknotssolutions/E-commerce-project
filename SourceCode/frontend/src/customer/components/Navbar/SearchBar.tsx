import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";

const TRENDING_SEARCHES = [
  "Sarees",
  "Kurtis",
  "T-Shirts",
  "Jeans",
  "Electronics",
  "Shoes",
  "Watches",
  "Headphones",
];

const POPULAR_CATEGORIES = [
  "Men's Fashion",
  "Women's Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty & Health",
];

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 8;
const DEBOUNCE_MS = 300;

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_RECENT_SEARCHES);
      }
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveRecentSearch(query: string): string[] {
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  const suggestions = useMemo(
    () =>
      debouncedQuery
        ? TRENDING_SEARCHES.filter((item) =>
            item.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
        : [],
    [debouncedQuery]
  );

  const hasQuery = query.trim().length > 0;
  const showSuggestions = hasQuery && suggestions.length > 0;
  const showNoResults = hasQuery && !showSuggestions && !isLoading;
  const showRecentAndTrending = !hasQuery;

  const performSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      const updated = saveRecentSearch(trimmed);
      setRecentSearches(updated);
      setIsOpen(false);
      setQuery(trimmed);
      navigate(`/search-products?q=${encodeURIComponent(trimmed)}`);
    },
    [navigate]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setQuery(value);
      performSearch(value);
    },
    [performSearch]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  }, []);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const getActiveItems = useCallback((): string[] => {
    const items: string[] = [];
    if (hasQuery && suggestions.length > 0) {
      items.push(...suggestions);
    } else if (!hasQuery) {
      items.push(...recentSearches);
      items.push(...TRENDING_SEARCHES.filter((t) => !recentSearches.includes(t)));
    }
    return items;
  }, [hasQuery, suggestions, recentSearches]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (activeIndex >= 0) {
        const items = getActiveItems();
        if (items[activeIndex]) {
          performSearch(items[activeIndex]);
          return;
        }
      }
      performSearch(query);
    },
    [query, activeIndex, performSearch, getActiveItems]
  );

  useEffect(() => {
    if (debouncedQuery && isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [debouncedQuery, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getActiveItems();
      if (!isOpen || items.length === 0) {
        if (e.key === "Escape") {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case "Enter":
          if (activeIndex >= 0 && items[activeIndex]) {
            e.preventDefault();
            performSearch(items[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [isOpen, activeIndex, getActiveItems, performSearch]
  );

  return (
    <div ref={containerRef} className="relative w-full lg:w-[420px]">
      <form onSubmit={handleSubmit} className="w-full">
        <TextField
          fullWidth
          size="small"
          placeholder="Search for products, brands and more"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#00927c", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#00927c" }} />
                ) : query ? (
                  <IconButton size="small" onClick={handleClear} sx={{ p: 0.5 }}>
                    <CloseIcon sx={{ fontSize: 18, color: "gray" }} />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              backgroundColor: "#f9fafb",
              fontSize: "14px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e5e7eb",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00927c",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00927c",
                borderWidth: 1,
              },
              "& input::placeholder": {
                fontSize: "13px",
                color: "#9ca3af",
              },
            },
          }}
        />
      </form>

      {isOpen && (
        <Paper
          elevation={4}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-[420px] overflow-y-auto"
          sx={{ borderRadius: "8px" }}
        >
          {showSuggestions && !isLoading && (
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 2 }}>
                <ListItemText
                  primary="Suggestions"
                  primaryTypographyProps={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                />
              </ListItem>
              {suggestions.map((item, index) => (
                <ListItem
                  key={item}
                  sx={{
                    py: 1,
                    px: 2,
                    cursor: "pointer",
                    backgroundColor: activeIndex === index ? "#f0fdf4" : "transparent",
                    "&:hover": { backgroundColor: "#f0fdf4" },
                  }}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {showNoResults && !isLoading && (
            <div className="py-8 px-4 text-center">
              <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-gray-400 text-xs mt-1">
                Try searching with different keywords
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <CircularProgress size={24} sx={{ color: "#00927c" }} />
            </div>
          )}

          {showRecentAndTrending && !isLoading && (
            <>
              {recentSearches.length > 0 && (
                <>
                  <ListItem sx={{ py: 1, px: 2 }}>
                    <ListItemText
                      primary="Recent Searches"
                      primaryTypographyProps={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    />
                    <IconButton size="small" onClick={handleClearRecent} sx={{ p: 0.5 }}>
                      <ClearIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                    </IconButton>
                  </ListItem>
                  {recentSearches.map((item, index) => (
                    <ListItem
                      key={`recent-${item}-${index}`}
                      sx={{
                        py: 1,
                        px: 2,
                        cursor: "pointer",
                        backgroundColor: activeIndex === index ? "#f0fdf4" : "transparent",
                        "&:hover": { backgroundColor: "#f0fdf4" },
                      }}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <HistoryIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 0.5 }} />
                </>
              )}

              <ListItem sx={{ py: 1, px: 2 }}>
                <ListItemText
                  primary="Trending Searches"
                  primaryTypographyProps={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                />
              </ListItem>
              <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    icon={<TrendingUpIcon sx={{ fontSize: "14px !important", color: "#00927c !important" }} />}
                    onClick={() => handleSelect(item)}
                    sx={{
                      fontSize: "12px",
                      height: "28px",
                      borderRadius: "14px",
                      backgroundColor: "#f0fdf4",
                      color: "#374151",
                      "& .MuiChip-label": { px: 1 },
                      "&:hover": { backgroundColor: "#e0f5f0" },
                      border: "1px solid #e5e7eb",
                    }}
                  />
                ))}
              </div>

              <Divider sx={{ my: 0.5 }} />

              <ListItem sx={{ py: 1, px: 2 }}>
                <ListItemText
                  primary="Popular Categories"
                  primaryTypographyProps={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                />
              </ListItem>
              {POPULAR_CATEGORIES.map((category) => (
                <ListItem
                  key={category}
                  sx={{
                    py: 0.8,
                    px: 2,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f9fafb" },
                  }}
                  onClick={() => handleSelect(category)}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-[#00927c] to-[#00c4aa] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">
                        {category.charAt(0)}
                      </span>
                    </div>
                  </ListItemIcon>
                  <ListItemText
                    primary={category}
                    primaryTypographyProps={{
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;
