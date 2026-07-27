import React, { ChangeEvent, useState, useEffect } from 'react'
import { searchProduct } from '../../../Redux Toolkit/Customer/ProductSlice';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import ProductCard from '../Products/ProductCard/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { CircularProgress, Chip } from '@mui/material';

const SearchProducts = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const dispatch = useAppDispatch();
  const { products } = useAppSelector(store => store);

  useEffect(() => {
    if (initialQuery) {
      dispatch(searchProduct(initialQuery));
    }
  }, [initialQuery, dispatch]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProductSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchProduct(searchQuery.trim()));
    }
  };

  return (
    <div className='min-h-screen px-5 lg:px-20'>
      <div className="flex justify-center py-6">
        <div className="w-full lg:w-1/2 flex items-center bg-white border rounded-lg overflow-hidden shadow-sm">
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleProductSearch();
              }
            }}
            onChange={handleSearchChange}
            value={searchQuery}
            className="flex-1 px-5 py-3 outline-none text-sm"
            type="text"
            placeholder="Search for products, brands and more..."
          />
          <button
            onClick={handleProductSearch}
            className="px-5 py-3 bg-[#00927c] text-white hover:bg-[#007a6a] transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {products.loading ? (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      ) : products.searchProduct?.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Showing {products.searchProduct.length} results for "<strong>{initialQuery || searchQuery}</strong>"
          </p>
          <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 justify-center">
            {products.searchProduct.map((item: any, index: number) => (
              <div key={item.id || index} className="">
                <ProductCard item={item} />
              </div>
            ))}
          </section>
        </div>
      ) : initialQuery ? (
        <div className='h-[50vh] flex flex-col justify-center items-center gap-4'>
          <h1 className='font-bold text-2xl text-gray-600'>
            No results found for "<span className="text-[#00927c]">{initialQuery}</span>"
          </h1>
          <p className="text-gray-400 text-sm">Try different keywords or check the spelling</p>
        </div>
      ) : (
        <div className='h-[50vh] flex flex-col justify-center items-center gap-4'>
          <h1 className='font-bold text-2xl text-gray-600'>Search for Products</h1>
          <p className="text-gray-400 text-sm">Find the best products from thousands of items</p>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;