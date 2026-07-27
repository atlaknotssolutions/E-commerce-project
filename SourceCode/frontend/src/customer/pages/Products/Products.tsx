import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard/ProductCard";
import FilterSection from "./FilterSection";
import {
  Box,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  getAllProducts,
  fetchFilterMetadata,
  clearFilterMetadata,
} from "../../../Redux Toolkit/Customer/ProductSlice";

const Products = () => {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const [showFilter, setShowFilter] = useState(false);
  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const { products: productList, totalPages, totalElements } = useAppSelector((store) => store.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  // Sort is persisted in URL
  const sort = searchParams.get("sort") || "";

  const handleSortProduct = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value) {
      searchParams.set("sort", value);
    } else {
      searchParams.delete("sort");
    }
    setSearchParams(searchParams);
  };

  const handleShowFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handlePageChange = (_event: any, value: number) => {
    setPage(value);
  };

  // Fetch filter metadata when category changes
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchFilterMetadata(categoryId));
    } else {
      dispatch(clearFilterMetadata());
    }
  }, [categoryId, dispatch]);

  // Fetch products whenever filters, category, sort, or page changes
  useEffect(() => {
    const [minPrice, maxPrice] = searchParams.get("price")?.split("-") || [];

    // Extract dynamic attribute filters from URL (attr_* params)
    const dynamicFilters: Record<string, string> = {};
    searchParams.forEach((value: string, key: string) => {
      if (key.startsWith("attr_") && value) {
        dynamicFilters[key.substring(5)] = value;
      }
    });

    const newFilters: Record<string, any> = {
      brand: searchParams.get("brand") || "",
      color: searchParams.get("color") || "",
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      pageNumber: page - 1,
      minDiscount: searchParams.get("discount")
        ? Number(searchParams.get("discount"))
        : undefined,
    };

    // Include dynamic filters if any exist
    if (Object.keys(dynamicFilters).length > 0) {
      newFilters.dynamicFilters = dynamicFilters;
    }

    dispatch(getAllProducts({ category: categoryId, sort, ...newFilters }));
  }, [searchParams, categoryId, sort, page, dispatch]);

  return (
    <div className="-z-10 mt-10">
      <div className="">
        <h1 className="text-3xl text-center font-bold text-gray-700 pb-5 px-9 uppercase space-x-2">
          {categoryId?.split("_").map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </h1>
      </div>
      <div className="lg:flex">
        <section className="hidden lg:block w-[20%]">
          <FilterSection />
        </section>
        <div className="w-full lg:w-[80%] space-y-5">
          <div className="flex justify-between items-center px-9 h-[40px]">
            <div className="relative w-[50%] flex items-center gap-2">
              {!isLarge && (
                <IconButton onClick={handleShowFilter}>
                  <FilterAltIcon />
                </IconButton>
              )}
              {showFilter && !isLarge && (
                <>
                  <div className="fixed inset-0 bg-black/40 z-40" onClick={handleShowFilter} />
                  <Box sx={{ zIndex: 50 }} className="fixed top-[68px] left-0 bottom-0 w-[85vw] max-w-[360px] overflow-y-auto bg-white shadow-xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
                      <p className="font-semibold">Filters</p>
                      <button onClick={handleShowFilter} className="text-gray-500 text-2xl leading-none">&times;</button>
                    </div>
                    <FilterSection />
                  </Box>
                </>
              )}
              {totalElements > 0 && (
                <Chip
                  label={`${totalElements} product${totalElements !== 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </div>
            <FormControl size="small" sx={{ width: "200px" }}>
              <InputLabel id="sort">Sort</InputLabel>
              <Select
                labelId="sort"
                id="sort"
                value={sort}
                label="Sort"
                onChange={handleSortProduct}
              >
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
          <Divider />

          {productList?.length > 0 ? (
            <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 px-5 justify-center">
              {productList.map((item: any, index: number) => (
                <div key={item.id || index * 9} className="">
                  <ProductCard item={item} />
                </div>
              ))}
            </section>
          ) : (
            <section className="items-center flex flex-col gap-5 justify-center h-[67vh] border">
              <img
                className="w-80"
                src="https://cdn.pixabay.com/photo/2022/05/28/10/45/oops-7227010_960_720.png"
                alt=""
              />
              <h1 className="font-bold text-xl text-center flex items-center gap-2">
                Product Not Found For{" "}
                <p className="text-primary-color flex gap-2 uppercase">
                  {" "}
                  {categoryId?.split("_").map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}{" "}
                </p>{" "}
              </h1>
            </section>
          )}
          <div className="flex justify-center pt-10">
            <Pagination
              page={page}
              onChange={handlePageChange}
              color="primary"
              count={totalPages}
              shape="rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
