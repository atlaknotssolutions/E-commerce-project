import { FormControlLabel, Radio, RadioGroup, Collapse } from "@mui/material";
import React, { useState, useMemo } from "react";
import { teal } from "@mui/material/colors";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import { price } from "../../../data/Filter/price";
import { discount } from "../../../data/Filter/discount";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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
};

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, defaultOpen = true, children }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-2 text-left">
        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
        {open ? <ExpandLessIcon fontSize="small" className="text-gray-400" /> : <ExpandMoreIcon fontSize="small" className="text-gray-400" />}
      </button>
      <Collapse in={open}>
        <div className="pt-1">{children}</div>
      </Collapse>
    </div>
  );
};

const FilterSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterMetadata } = useAppSelector((store) => store.products);
  const [expandedAttrs, setExpandedAttrs] = useState<Record<string, boolean>>({});
  const [minCustom, setMinCustom] = useState("");
  const [maxCustom, setMaxCustom] = useState("");

  const toggleExpand = (code: string) => setExpandedAttrs((prev) => ({ ...prev, [code]: !prev[code] }));

  const updateFilterParam = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  };

  const handleDynamicFilter = (attrCode: string, value: string) => {
    const paramName = `attr_${attrCode}`;
    const next = new URLSearchParams(searchParams);
    const currentValue = next.get(paramName);
    if (currentValue === value) next.delete(paramName);
    else next.set(paramName, value);
    setSearchParams(next);
  };

  const handleCustomPrice = () => {
    if (minCustom && maxCustom && Number(minCustom) <= Number(maxCustom)) {
      updateFilterParam("price", `${minCustom}-${maxCustom}`);
    }
  };

  const clearAllFilters = () => setSearchParams(new URLSearchParams());

  const hasActiveFilters = useMemo(() => {
    let count = 0;
    searchParams.forEach(() => count++);
    return count > 0;
  }, [searchParams]);

  const getColorHex = (colorName: string): string | undefined => COLOR_HEX_MAP[colorName];

  const INITIAL_VISIBLE_COUNT = 5;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <p className="text-base font-semibold text-gray-800">Filters</p>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Clear all ({hasActiveFilters ? Array.from(searchParams.keys()).length : 0})
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-2">
        {/* DYNAMIC ATTRIBUTES */}
        {filterMetadata?.attributes?.map((attr) => {
          const isExpanded = expandedAttrs[attr.code] || false;
          const visibleValues = isExpanded ? attr.values : attr.values.slice(0, INITIAL_VISIBLE_COUNT);
          const hasMore = attr.values.length > INITIAL_VISIBLE_COUNT;
          const currentParamName = `attr_${attr.code}`;
          const selectedValue = searchParams.get(currentParamName);

          if (attr.type === "color") {
            return (
              <CollapsibleSection key={attr.code} title={attr.name}>
                <RadioGroup onChange={(_, value) => handleDynamicFilter(attr.code, value)} value={selectedValue || ""}>
                  {visibleValues.map((val) => (
                    <FormControlLabel key={val} value={val} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                      label={<div className="flex items-center gap-2 text-sm">
                        <span>{val}</span>
                        {getColorHex(val) && <span style={{ backgroundColor: getColorHex(val) }} className="h-4 w-4 rounded-full border inline-block" />}
                      </div>} />
                  ))}
                </RadioGroup>
                {hasMore && (
                  <button onClick={() => toggleExpand(attr.code)} className="text-xs text-teal-600 hover:text-teal-700 mt-1">
                    {isExpanded ? "Show less" : `+${attr.values.length - INITIAL_VISIBLE_COUNT} more`}
                  </button>
                )}
              </CollapsibleSection>
            );
          }

          return (
            <CollapsibleSection key={attr.code} title={attr.name}>
              <RadioGroup onChange={(_, value) => handleDynamicFilter(attr.code, value)} value={selectedValue || ""}>
                {visibleValues.map((val) => (
                  <FormControlLabel key={val} value={val} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                    label={<span className="text-sm">{val}</span>} />
                ))}
              </RadioGroup>
              {hasMore && (
                <button onClick={() => toggleExpand(attr.code)} className="text-xs text-teal-600 hover:text-teal-700 mt-1">
                  {isExpanded ? "Show less" : `+${attr.values.length - INITIAL_VISIBLE_COUNT} more`}
                </button>
              )}
            </CollapsibleSection>
          );
        })}

        {/* PRICE */}
        <CollapsibleSection title="Price">
          <RadioGroup name="price" onChange={(e) => updateFilterParam("price", e.target.value)}
            value={searchParams.get("price") || ""}>
            {price.map((item) => (
              <FormControlLabel key={item.name} value={item.value} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                label={<span className="text-sm">{item.name}</span>} />
            ))}
          </RadioGroup>
          <div className="flex items-center gap-2 mt-2">
            <input type="number" placeholder="Min" value={minCustom} onChange={(e) => setMinCustom(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-teal-500" />
            <span className="text-gray-400">-</span>
            <input type="number" placeholder="Max" value={maxCustom} onChange={(e) => setMaxCustom(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-teal-500" />
            <button onClick={handleCustomPrice} disabled={!minCustom || !maxCustom}
              className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Go
            </button>
          </div>
        </CollapsibleSection>

        {/* DISCOUNT */}
        <CollapsibleSection title="Discount">
          <RadioGroup name="discount" onChange={(e) => updateFilterParam("discount", e.target.value)}
            value={searchParams.get("discount") || ""}>
            {discount.map((item) => (
              <FormControlLabel key={item.name} value={String(item.value)} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                label={<span className="text-sm">{item.name}</span>} />
            ))}
          </RadioGroup>
        </CollapsibleSection>

        {/* CUSTOMER RATING */}
        <CollapsibleSection title="Customer Rating">
          <RadioGroup name="rating" onChange={(e) => updateFilterParam("rating", e.target.value)}
            value={searchParams.get("rating") || ""}>
            {[
              { name: "4★ & above", value: "4" },
              { name: "3★ & above", value: "3" },
              { name: "2★ & above", value: "2" },
              { name: "1★ & above", value: "1" },
            ].map((item) => (
              <FormControlLabel key={item.name} value={item.value} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                label={<span className="text-sm">{item.name}</span>} />
            ))}
          </RadioGroup>
        </CollapsibleSection>

        {/* AVAILABILITY */}
        <CollapsibleSection title="Availability">
          <RadioGroup name="stock" onChange={(e) => updateFilterParam("stock", e.target.value)}
            value={searchParams.get("stock") || ""}>
            <FormControlLabel value="in_stock" control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
              label={<span className="text-sm">In Stock Only</span>} />
            <FormControlLabel value="" control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
              label={<span className="text-sm">All</span>} />
          </RadioGroup>
        </CollapsibleSection>

        {/* BRAND (from metadata) */}
        {filterMetadata?.brands && filterMetadata.brands.length > 0 && (
          <CollapsibleSection title="Brand">
            <RadioGroup name="brand" onChange={(e) => updateFilterParam("brand", e.target.value)}
              value={searchParams.get("brand") || ""}>
              {filterMetadata.brands.map((brand) => (
                <FormControlLabel key={brand} value={brand} control={<Radio size="small" sx={{ '&.Mui-checked': { color: teal[600] } }} />}
                  label={<span className="text-sm capitalize">{brand}</span>} />
              ))}
            </RadioGroup>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

export default FilterSection;