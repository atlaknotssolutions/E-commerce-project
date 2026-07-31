import React, { ChangeEvent, useState, useEffect, useMemo } from 'react'
import { searchProduct } from '../../../Redux Toolkit/Customer/ProductSlice';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import ProductCard from '../Products/ProductCard/ProductCard';
import { useSearchParams } from 'react-router-dom';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { IconButton } from '@mui/material';

const PAGE_SIZE = 12;

const SearchProducts = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(0);
  const dispatch = useAppDispatch();
  const { products } = useAppSelector(store => store);

  useEffect(() => {
    if (initialQuery) {
      dispatch(searchProduct(initialQuery));
      setPage(0);
    }
  }, [initialQuery, dispatch]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProductSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchProduct(searchQuery.trim()));
      setPage(0);
    }
  };

  const handleRetry = () => {
    dispatch(searchProduct(initialQuery || searchQuery));
  };

  const totalResults = products.searchProduct?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const paginatedResults = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return (products.searchProduct || []).slice(start, start + PAGE_SIZE);
  }, [products.searchProduct, safePage]);

  useEffect(() => {
    setPage(0);
  }, [products.searchProduct]);

  const Skeleton = () => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className='min-h-screen px-5 lg:px-20 py-6'>
      {/* Search bar */}
      <div className="flex justify-center mb-6">
        <div className="w-full lg:w-1/2 flex items-center bg-white border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
          <div className="pl-4 text-gray-400">
            <SearchIcon fontSize="small" />
          </div>
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleProductSearch();
              }
            }}
            onChange={handleSearchChange}
            value={searchQuery}
            className="flex-1 px-3 py-3 outline-none text-sm"
            type="text"
            placeholder="Search for products, brands and more..."
          />
          <button
            onClick={handleProductSearch}
            disabled={products.loading}
            className="px-5 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error state */}
      {products.error && !products.loading && (
        <div className='flex flex-col justify-center items-center gap-4 py-20'>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <SearchOffIcon sx={{ fontSize: 32, color: '#ef4444' }} />
          </div>
          <h1 className='font-bold text-xl text-gray-600'>Something went wrong</h1>
          <p className="text-gray-400 text-sm">{products.error}</p>
          <button onClick={handleRetry}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Try again
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {products.loading && <Skeleton />}

      {/* Results */}
      {!products.loading && !products.error && paginatedResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {safePage * PAGE_SIZE + 1} - {Math.min((safePage + 1) * PAGE_SIZE, totalResults)} of <strong>{totalResults}</strong> results for "<strong>{initialQuery || searchQuery}</strong>"
            </p>
          </div>
          <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedResults.map((item: any, index: number) => (
              <ProductCard key={item.id || index} item={item} viewMode="grid" />
            ))}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 pb-8">
              <IconButton size="small" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
                sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', '&:hover': { borderColor: '#00927c' } }}>
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = totalPages <= 5 ? i : Math.max(0, Math.min(safePage - 2, totalPages - 5)) + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${safePage === pageNum
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}>
                    {pageNum + 1}
                  </button>
                );
              })}
              <IconButton size="small" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
                sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', '&:hover': { borderColor: '#00927c' } }}>
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!products.loading && !products.error && paginatedResults.length === 0 && initialQuery && (
        <div className='flex flex-col justify-center items-center gap-4 py-20'>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <SearchOffIcon sx={{ fontSize: 32, color: '#9ca3af' }} />
          </div>
          <h1 className='font-bold text-2xl text-gray-600'>
            No results found for "<span className="text-teal-600">{initialQuery}</span>"
          </h1>
          <p className="text-gray-400 text-sm">Try different keywords or check the spelling</p>
        </div>
      )}

      {/* Initial state - no search yet */}
      {!products.loading && !products.error && paginatedResults.length === 0 && !initialQuery && !searchQuery && (
        <div className='flex flex-col justify-center items-center gap-4 py-20'>
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <SearchIcon sx={{ fontSize: 32, color: '#00927c' }} />
          </div>
          <h1 className='font-bold text-2xl text-gray-600'>Search for Products</h1>
          <p className="text-gray-400 text-sm">Find the best products from thousands of items</p>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;