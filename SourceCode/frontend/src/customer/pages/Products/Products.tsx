import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard/ProductCard";
import FilterSection from "./FilterSection";
import { Product } from "../../../types/productTypes";
import {
  Box, Chip, Divider, FormControl, IconButton, InputLabel,
  MenuItem, Pagination, Select, SelectChangeEvent, Skeleton,
  useMediaQuery, useTheme, ToggleButton, ToggleButtonGroup,
} from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  getAllProducts, fetchFilterMetadata, clearFilterMetadata,
} from "../../../Redux Toolkit/Customer/ProductSlice";
import ChatBot from "../ChatBot/ChatBot";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

const formatCategoryName = (id: string): string =>
  id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const SKELETON_COUNT = 8;

const Products = () => {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const isMedium = useMediaQuery(theme.breakpoints.up("md"));
  const isSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [selectedAiProduct, setSelectedAiProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleOpenAIAssistant = useCallback((product: Product) => {
    setSelectedAiProduct(product);
    setShowChatBot(true);
  }, []);

  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const { products: productList, totalPages, totalElements, loading, error } =
    useAppSelector((store) => store.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const sort = searchParams.get("sort") || "";

  const gridCols = viewMode === "list" ? "grid-cols-1"
    : isLarge ? "lg:grid-cols-4"
    : isMedium ? "md:grid-cols-3"
    : isSmall ? "grid-cols-2" : "grid-cols-2";

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  const handleSortProduct = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("sort", value);
    else next.delete("sort");
    setSearchParams(next);
  };

  const handleShowFilter = () => setShowFilter((prev) => !prev);

  const handlePageChange = (_event: any, value: number) => setPage(value);

  // Build active filters list for chips
  const activeFilters = useMemo(() => {
    const chips: { label: string; key: string }[] = [];
    searchParams.forEach((value, key) => {
      if (key === "sort") return;
      chips.push({ label: `${key.replace("attr_", "")}: ${value}`, key });
    });
    return chips;
  }, [searchParams]);

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Fetch filter metadata when category changes
  useEffect(() => {
    if (categoryId) dispatch(fetchFilterMetadata(categoryId));
    else dispatch(clearFilterMetadata());
  }, [categoryId, dispatch]);

  // Fetch products
  useEffect(() => {
    const [minPrice, maxPrice] = searchParams.get("price")?.split("-") || [];
    const dynamicFilters: Record<string, string> = {};
    searchParams.forEach((value: string, key: string) => {
      if (key.startsWith("attr_") && value) dynamicFilters[key.substring(5)] = value;
    });

    const newFilters: Record<string, any> = {
      brand: searchParams.get("brand") || "",
      color: searchParams.get("color") || "",
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      pageNumber: page - 1,
      minDiscount: searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined,
    };

    if (Object.keys(dynamicFilters).length > 0) newFilters.dynamicFilters = dynamicFilters;

    dispatch(getAllProducts({ category: categoryId, sort, ...newFilters }));
  }, [searchParams, categoryId, sort, page, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate("/")}>Home</span>
          {categoryId && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{formatCategoryName(categoryId)}</span>
            </>
          )}
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 capitalize">
            {categoryId ? formatCategoryName(categoryId) : "All Products"}
          </h1>
          {totalElements > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {totalElements} product{totalElements !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="lg:flex lg:gap-8">
          {/* Filter Sidebar */}
          <section className={`${isLarge ? "block w-[18%] flex-shrink-0" : "hidden"}`}>
            <div className="sticky top-24">
              <FilterSection />
            </div>
          </section>

          {/* Mobile Filter Drawer */}
          {showFilter && !isLarge && (
            <>
              <div className="fixed inset-0 bg-black/40 z-40" onClick={handleShowFilter} />
              <Box sx={{ zIndex: 50 }} className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[360px] overflow-y-auto bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
                  <p className="font-semibold text-lg">Filters</p>
                  <IconButton onClick={handleShowFilter}><CloseIcon /></IconButton>
                </div>
                <FilterSection />
              </Box>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!isLarge && (
                  <IconButton onClick={handleShowFilter} size="small">
                    <FilterAltIcon />
                  </IconButton>
                )}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  size="small"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModuleIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>

              <div className="flex items-center gap-3">
                {totalElements > 0 && (
                  <Chip label={`${totalElements} product${totalElements !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                )}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-label">Sort</InputLabel>
                  <Select labelId="sort-label" value={sort} label="Sort" onChange={handleSortProduct}>
                    <MenuItem value="">Relevance</MenuItem>
                    <MenuItem value="popularity">Popularity</MenuItem>
                    <MenuItem value="price_low">Price: Low to High</MenuItem>
                    <MenuItem value="price_high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                    <MenuItem value="discount">Discount</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <Chip key={f.key} label={f.label} size="small" onDelete={() => removeFilter(f.key)}
                    deleteIcon={<CloseIcon fontSize="small" />} sx={{ borderRadius: "4px" }} />
                ))}
                <button onClick={clearAllFilters} className="text-xs text-teal-600 hover:text-teal-700 font-medium ml-1">
                  Clear all
                </button>
              </div>
            )}

            <Divider />

            {/* Loading State */}
            {loading && productList.length === 0 && (
              <section className={`grid ${gridCols} gap-4`}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border overflow-hidden">
                    <Skeleton variant="rectangular" className="w-full aspect-square" />
                    <div className="p-3 space-y-2">
                      <Skeleton width="40%" height={14} />
                      <Skeleton width="80%" height={16} />
                      <Skeleton width="30%" height={14} />
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Error State */}
            {error && !loading && (
              <section className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-red-500 text-lg font-semibold">Something went wrong</p>
                <p className="text-gray-400 mt-2 text-sm">{error}</p>
                <button onClick={() => dispatch(getAllProducts({ category: categoryId, sort, pageNumber: page - 1 }))}
                  className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                  Retry
                </button>
              </section>
            )}

            {/* Product Grid */}
            {!error && productList?.length > 0 && (
              <section className={`grid ${gridCols} gap-4 ${viewMode === "list" ? "gap-y-4" : "gap-y-6"}`}>
                {productList.map((item: any) => (
                  <div key={item.id} className={viewMode === "list" ? "col-span-full" : ""}>
                    <ProductCard item={item} viewMode={viewMode} onAiChat={handleOpenAIAssistant} />
                  </div>
                ))}
              </section>
            )}

            {/* Empty State */}
            {!loading && !error && productList?.length === 0 && (
              <section className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border">
                <SearchOffIcon sx={{ fontSize: 64, color: "#d0d0d0" }} />
                <h2 className="text-xl font-bold text-gray-600 mt-4">No products found</h2>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or browse a different category
                </p>
                {activeFilters.length > 0 && (
                  <button onClick={clearAllFilters}
                    className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                    Clear Filters
                  </button>
                )}
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && productList?.length > 0 && (
              <div className="flex justify-center py-8">
                <Pagination page={page} onChange={handlePageChange}
                  color="primary" count={totalPages} shape="rounded" showFirstButton showLastButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Shopping Assistant */}
      <section className="fixed bottom-6 right-6 z-40">
        {showChatBot ? (
          <div className="relative">
            <ChatBot handleClose={() => { setShowChatBot(false); setSelectedAiProduct(null); }} productId={selectedAiProduct?.id} />
          </div>
        ) : (
          <button onClick={() => { setShowChatBot(true); setSelectedAiProduct(null); }}
            aria-label="Open AI Shopping Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center">
            <ChatBubbleIcon sx={{ fontSize: "1.6rem" }} />
          </button>
        )}
      </section>
    </div>
  );
};

export default Products;
