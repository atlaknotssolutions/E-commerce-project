import React from "react";
import { Box, Typography, ToggleButton, ToggleButtonGroup, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ProductVariant, VariantAttributes } from "../../types/productTypes";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedAttributes: Partial<VariantAttributes>;
  onAttributeSelect: (key: string, value: string) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedAttributes,
  onAttributeSelect,
}) => {
  if (!variants || variants.length <= 1) return null;

  const activeVariants = variants.filter((v) => v.isActive);

  const getUniqueValues = (key: keyof VariantAttributes): string[] => {
    const values = new Set<string>();
    activeVariants.forEach((v) => {
      const val = v.attributes[key];
      if (val && typeof val === "string") values.add(val);
    });
    return Array.from(values);
  };

  const getCustomAttributeKeys = (): string[] => {
    const keys = new Set<string>();
    activeVariants.forEach((v) => {
      v.attributes.custom?.forEach((c) => keys.add(c.key));
    });
    return Array.from(keys);
  };

  const getMatchingVariant = (): ProductVariant | null => {
    return activeVariants.find((v) => {
      const attrs = v.attributes;
      return (
        (!selectedAttributes.color || attrs.color === selectedAttributes.color) &&
        (!selectedAttributes.size || attrs.size === selectedAttributes.size) &&
        (!selectedAttributes.storage || attrs.storage === selectedAttributes.storage) &&
        (!selectedAttributes.ram || attrs.ram === selectedAttributes.ram)
      );
    }) || null;
  };

  const matchingVariant = getMatchingVariant();
  const outOfStock = matchingVariant && matchingVariant.quantity <= 0;

  const colors = getUniqueValues("color");
  const sizes = getUniqueValues("size");
  const storages = getUniqueValues("storage");
  const rams = getUniqueValues("ram");
  const customKeys = getCustomAttributeKeys();

  const renderSelector = (
    label: string,
    key: string,
    values: string[]
  ) => {
    if (values.length === 0) return null;

    return (
      <Box className="mb-4">
        <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
          {label}
        </Typography>
        <Box className="flex flex-wrap gap-2">
          {values.map((value) => {
            const isSelected =
              (selectedAttributes as Record<string, string | undefined>)[key] === value;
            const isAvailable = activeVariants.some((v) => {
              const attrs = v.attributes as Record<string, string | undefined>;
              const matchesOthers = Object.entries(selectedAttributes).every(
                ([k, v2]) => k === key || attrs[k] === v2
              );
              return attrs[key] === value && matchesOthers && v.isActive;
            });

            return (
              <ToggleButtonGroup
                key={value}
                value={isSelected ? value : ""}
                exclusive
                onChange={(_, newVal) => {
                  if (newVal) onAttributeSelect(key, newVal);
                }}
                size="small"
              >
                <ToggleButton
                  value={value}
                  disabled={!isAvailable}
                  sx={{
                    textTransform: "none",
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "#e0e0e0",
                    bgcolor: isSelected ? "primary.main" : "white",
                    color: isSelected ? "white" : "inherit",
                    "&.Mui-disabled": {
                      opacity: 0.4,
                    },
                    "&:hover": {
                      bgcolor: isSelected ? "primary.main" : "#f5f5f5",
                    },
                  }}
                >
                  {value}
                  {isSelected && (
                    <CheckCircleIcon sx={{ ml: 0.5, fontSize: "0.9rem" }} />
                  )}
                </ToggleButton>
              </ToggleButtonGroup>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box className="mt-4">
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Select Variant
      </Typography>
      {renderSelector("Color", "color", colors)}
      {renderSelector("Size", "size", sizes)}
      {renderSelector("Storage", "storage", storages)}
      {renderSelector("RAM", "ram", rams)}
      {customKeys.map((key) => {
        const customValues = new Set<string>();
        activeVariants.forEach((v) => {
          v.attributes.custom?.forEach((c) => {
            if (c.key === key) customValues.add(c.value);
          });
        });
        return renderSelector(key, key, Array.from(customValues));
      })}
      {outOfStock && (
        <Chip
          label="Out of Stock"
          color="error"
          size="small"
          sx={{ mt: 1 }}
        />
      )}
      {matchingVariant && !outOfStock && (
        <Chip
          label={`${matchingVariant.quantity} in stock`}
          color="success"
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );
};

export default VariantSelector;
