import {
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React, { useState, useMemo } from "react";
import { teal } from "@mui/material/colors";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import { price } from "../../../data/Filter/price";
import { discount } from "../../../data/Filter/discount";

// Color hex lookup for color-type attributes (subset of common colors)
const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000", White: "#FFFFFF", Red: "#FF0000", Blue: "#0000FF",
  Green: "#008000", Yellow: "#FFFF00", Orange: "#FFA500", Pink: "#FFC0CB",
  Purple: "#800080", Brown: "#A52A2A", Grey: "#808080", Gray: "#808080",
  Navy: "#000080", Beige: "#F5F5DC", Maroon: "#800000", Olive: "#808000",
  Teal: "#008080", Coral: "#FF7F50", Peach: "#FFDAB9", Lavender: "#E6E6FA",
  Mint: "#98FF98", Ivory: "#FFFFF0", Crimson: "#DC143C", Cyan: "#00FFFF",
  Magenta: "#FF00FF", Burgundy: "#800020", Charcoal: "#36454F", Khaki: "#F0E68C",
  Turquoise: "#40E0D0", Gold: "#FFD700", Silver: "#C0C0C0", Bronze: "#CD7F32",
  Indigo: "#4B0082", Violet: "#EE82EE", Tan: "#D2B48C", Rust: "#B7410E",
  Cream: "#FFFDD0", Plum: "#8E4585", Rose: "#FF007F", Lime: "#00FF00",
  Aqua: "#00FFFF", Salmon: "#FA8072", Tomato: "#FF6347", Chocolate: "#D2691E",
};

const FilterSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterMetadata } = useAppSelector((store) => store.products);

  // Track expand/collapse per dynamic attribute
  const [expandedAttrs, setExpandedAttrs] = useState<Record<string, boolean>>({});

  const toggleExpand = (code: string) => {
    setExpandedAttrs((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Update a URL search param (set or delete)
  const updateFilterParam = (name: string, value: string) => {
    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
    setSearchParams(searchParams);
  };

  // Toggle a dynamic attribute value (single-select radio behavior)
  const handleDynamicFilter = (attrCode: string, value: string) => {
    const paramName = `attr_${attrCode}`;
    const currentValue = searchParams.get(paramName);
    if (currentValue === value) {
      searchParams.delete(paramName);
    } else {
      searchParams.set(paramName, value);
    }
    setSearchParams(searchParams);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const keysToDelete: string[] = [];
    searchParams.forEach((_value: any, key: any) => {
      keysToDelete.push(key);
    });
    keysToDelete.forEach((key) => searchParams.delete(key));
    setSearchParams(searchParams);
  };

  // Determine which filters are currently active
  const hasActiveFilters = useMemo(() => {
    let count = 0;
    searchParams.forEach(() => count++);
    return count > 0;
  }, [searchParams]);

  // Color hex lookup helper
  const getColorHex = (colorName: string): string | undefined => {
    return COLOR_HEX_MAP[colorName] || undefined;
  };

  // Number of visible items before "show more"
  const INITIAL_VISIBLE_COUNT = 5;

  return (
    <div className="space-y-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between h-[40px] px-9 lg:border-r">
        <p className="text-lg font-semibold">Filters</p>
        <Button
          onClick={clearAllFilters}
          size="small"
          disabled={!hasActiveFilters}
          className="text-teal-600 cursor-pointer font-semibold"
        >
          clear all
        </Button>
      </div>
      <Divider />

      <div className="px-9 space-y-6">
        {/* ============================== */}
        {/* DYNAMIC ATTRIBUTE FILTERS      */}
        {/* ============================== */}
        {filterMetadata?.attributes?.map((attr) => {
          const isExpanded = expandedAttrs[attr.code] || false;
          const visibleValues = isExpanded
            ? attr.values
            : attr.values.slice(0, INITIAL_VISIBLE_COUNT);
          const hasMore = attr.values.length > INITIAL_VISIBLE_COUNT;
          const currentParamName = `attr_${attr.code}`;
          const selectedValue = searchParams.get(currentParamName);

          // Color-type: render with swatches
          if (attr.type === "color") {
            return (
              <section key={attr.code}>
                <FormControl sx={{ zIndex: 0 }}>
                  <FormLabel
                    sx={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      pb: "14px",
                      color: teal[600],
                    }}
                    id={`filter-${attr.code}`}
                  >
                    {attr.name}
                  </FormLabel>
                  <RadioGroup
                    onChange={(_e, value) => handleDynamicFilter(attr.code, value)}
                    aria-labelledby={`filter-${attr.code}`}
                    value={selectedValue || ""}
                  >
                    {visibleValues.map((val) => (
                      <FormControlLabel
                        sx={{ fontSize: "12px" }}
                        key={val}
                        value={val}
                        control={<Radio size="small" />}
                        label={
                          <div className="flex items-center gap-3">
                            <p>{val}</p>
                            {getColorHex(val) && (
                              <span
                                style={{ backgroundColor: getColorHex(val) }}
                                className="h-5 w-5 rounded-full border"
                              />
                            )}
                          </div>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                {hasMore && (
                  <button
                    onClick={() => toggleExpand(attr.code)}
                    className="text-teal-600 cursor-pointer hover:text-teal-900 flex items-center"
                  >
                    {isExpanded
                      ? "hide"
                      : `+ ${attr.values.length - INITIAL_VISIBLE_COUNT} more`}
                  </button>
                )}
                <Divider sx={{ mt: 1 }} />
              </section>
            );
          }

          // Select/multi_select/text/number types: render as radio list
          return (
            <section key={attr.code}>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    pb: "14px",
                    color: teal[600],
                  }}
                  id={`filter-${attr.code}`}
                >
                  {attr.name}
                </FormLabel>
                <RadioGroup
                  onChange={(_e, value) => handleDynamicFilter(attr.code, value)}
                  aria-labelledby={`filter-${attr.code}`}
                  value={selectedValue || ""}
                >
                  {visibleValues.map((val) => (
                    <FormControlLabel
                      key={val}
                      value={val}
                      control={<Radio size="small" />}
                      label={val}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              {hasMore && (
                <button
                  onClick={() => toggleExpand(attr.code)}
                  className="text-teal-600 cursor-pointer hover:text-teal-900 flex items-center"
                >
                  {isExpanded
                    ? "hide"
                    : `+ ${attr.values.length - INITIAL_VISIBLE_COUNT} more`}
                </button>
              )}
              <Divider sx={{ mt: 1 }} />
            </section>
          );
        })}

        {/* ============================== */}
        {/* PRICE FILTER (hardcoded ranges) */}
        {/* ============================== */}
        <section>
          <FormControl>
            <FormLabel
              sx={{
                fontSize: "16px",
                fontWeight: "bold",
                pb: "14px",
                color: teal[600],
              }}
              id="filter-price"
            >
              Price
            </FormLabel>
            <RadioGroup
              name="price"
              onChange={(e) => updateFilterParam("price", e.target.value)}
              aria-labelledby="filter-price"
              value={searchParams.get("price") || ""}
            >
              {price.map((item) => (
                <FormControlLabel
                  key={item.name}
                  value={item.value}
                  control={<Radio size="small" />}
                  label={item.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </section>
        <Divider />

        {/* ============================== */}
        {/* DISCOUNT FILTER (hardcoded)     */}
        {/* ============================== */}
        <section>
          <FormControl>
            <FormLabel
              sx={{
                fontSize: "16px",
                fontWeight: "bold",
                pb: "14px",
                color: teal[600],
              }}
              id="filter-discount"
            >
              Discount
            </FormLabel>
            <RadioGroup
              name="discount"
              onChange={(e) => updateFilterParam("discount", e.target.value)}
              aria-labelledby="filter-discount"
              value={searchParams.get("discount") || ""}
            >
              {discount.map((item) => (
                <FormControlLabel
                  key={item.name}
                  value={item.value}
                  control={<Radio size="small" />}
                  label={item.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </section>
      </div>
    </div>
  );
};

export default FilterSection;
