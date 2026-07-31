import React, { useMemo } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  ProductVariant,
  AttributeDefinition,
} from "../../types/productTypes";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onAttributeSelect: (key: string, value: string) => void;
  supportedAttributes?: AttributeDefinition[];
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedAttributes,
  onAttributeSelect,
  supportedAttributes,
}) => {
  const activeVariants = useMemo(
    () => (variants || []).filter((v) => v.isActive),
    [variants]
  );

  const variantAttrs = useMemo(() => {
    if (supportedAttributes && supportedAttributes.length > 0) {
      return supportedAttributes.filter(
        (a) => a.active !== false && a.variantAttribute
      );
    }
    return [];
  }, [supportedAttributes]);

  if (!variants || variants.length <= 1) return null;

  const hasDynamicSystem = variantAttrs.length > 0;

  const getUniqueValuesForKey = (key: string): string[] => {
    const values = new Set<string>();
    activeVariants.forEach((v) => {
      if (hasDynamicSystem) {
        const dynamic = v.attributes.dynamic || [];
        const match = dynamic.find((d) => d.name === key);
        if (match?.value) values.add(match.value);
      } else {
        const attrs = v.attributes as Record<string, unknown>;
        const val = attrs[key];
        if (val && typeof val === "string") values.add(val);
      }
    });
    return Array.from(values);
  };

  const getUniqueValuesLegacy = (key: string): string[] => {
    const values = new Set<string>();
    activeVariants.forEach((v) => {
      const attrs = v.attributes as Record<string, unknown>;
      const val = attrs[key];
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
    return (
      activeVariants.find((v) => {
        if (!v.isActive) return false;
        const attrs = v.attributes;

        if (hasDynamicSystem) {
          const dynamic = attrs.dynamic || [];
          return variantAttrs.every((attrDef) => {
            const selectedVal =
              selectedAttributes[attrDef.code] ||
              selectedAttributes[attrDef.name];
            if (!selectedVal) return true;
            const variantVal = dynamic.find(
              (d) => d.name === attrDef.code
            )?.value;
            return variantVal === selectedVal;
          });
        }

        return (
          (!selectedAttributes.color ||
            attrs.color === selectedAttributes.color) &&
          (!selectedAttributes.size ||
            attrs.size === selectedAttributes.size) &&
          (!selectedAttributes.storage ||
            attrs.storage === selectedAttributes.storage) &&
          (!selectedAttributes.ram || attrs.ram === selectedAttributes.ram)
        );
      }) || null
    );
  };

  const matchingVariant = getMatchingVariant();
  const outOfStock = matchingVariant && matchingVariant.quantity <= 0;

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
            const isSelected = selectedAttributes[key] === value;
            const isAvailable = activeVariants.some((v) => {
              const matchesOthers = Object.entries(selectedAttributes).every(
                ([k, v2]) => k === key || (v.attributes[k] as string) === v2
              );
              return (v.attributes[key] as string) === value && matchesOthers && v.isActive;
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

  const renderDynamicSelector = (attr: AttributeDefinition) => {
    const values = getUniqueValuesForKey(attr.code);
    if (values.length === 0) return null;

    const label = attr.name;
    const key = attr.code;

    return (
      <Box key={attr.code} className="mb-4">
        <Typography
          variant="caption"
          fontWeight="bold"
          display="block"
          mb={1}
        >
          {label}
          {attr.required && (
            <Typography component="span" color="error" ml={0.5}>
              *
            </Typography>
          )}
        </Typography>
        <Box className="flex flex-wrap gap-2">
          {values.map((value) => {
            const selectedVal =
              selectedAttributes[key] ||
              selectedAttributes[label];
            const isSelected = selectedVal === value;

            const isAvailable = activeVariants.some((v) => {
              const dynamic = v.attributes.dynamic || [];
              const matchesOthers = variantAttrs.every((otherAttr) => {
                if (otherAttr.code === key) return true;
                const otherSelected =
                  selectedAttributes[otherAttr.code] ||
                  selectedAttributes[otherAttr.name];
                if (!otherSelected) return true;
                const otherVal = dynamic.find(
                  (d) => d.name === otherAttr.code
                )?.value;
                return otherVal === otherSelected;
              });
              const thisVal = dynamic.find(
                (d) => d.name === key
              )?.value;
              return thisVal === value && matchesOthers && v.isActive;
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

  const colors = getUniqueValuesLegacy("color");
  const sizes = getUniqueValuesLegacy("size");
  const storages = getUniqueValuesLegacy("storage");
  const rams = getUniqueValuesLegacy("ram");
  const customKeys = getCustomAttributeKeys();

  return (
    <Box className="mt-4">
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Select Variant
      </Typography>

      {hasDynamicSystem
        ? variantAttrs.map((attr) => renderDynamicSelector(attr))
        : <>
            {renderSelector("Color", "color", colors)}
            {renderSelector("Size", "size", sizes)}
            {renderSelector("Storage", "storage", storages)}
            {renderSelector("RAM", "ram", rams)}
          </>
      }

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
