import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Collapse,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux Toolkit/Store";
import {
  addVariant,
  updateVariant,
  removeVariant,
} from "../../Redux Toolkit/Seller/sellerProductSlice";
import { Product, ProductVariant, ProductImage } from "../../types/productTypes";
import ProductImageUpload from "./ProductImageUpload";

interface VariantManagerProps {
  product: Product;
  jwt: string | null;
}

const ATTRIBUTE_PRESETS: Record<string, string[]> = {
  color: [],
  size: [],
  storage: [],
  ram: [],
};

const createEmptyVariant = (): Omit<ProductVariant, "id"> => ({
  sku: "",
  attributes: {
    color: "",
    size: "",
    storage: "",
    ram: "",
    custom: [],
  },
  price: 0,
  mrpPrice: 0,
  discountPercent: 0,
  quantity: 0,
  images: [],
  weight: undefined,
  isActive: true,
});

const VariantManager: React.FC<VariantManagerProps> = ({ product, jwt }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState(createEmptyVariant());
  const [addingNew, setAddingNew] = useState(false);
  const [customAttrKey, setCustomAttrKey] = useState("");
  const [customAttrValue, setCustomAttrValue] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const variants = product.variants || [];

  const toggleExpand = (variantId: string) => {
    setExpandedId(expandedId === variantId ? null : variantId);
  };

  const handleAddVariant = async () => {
    if (!newVariant.sku.trim()) {
      setSnackbar({
        open: true,
        message: "SKU is required",
        severity: "error",
      });
      return;
    }
    if (newVariant.price <= 0) {
      setSnackbar({
        open: true,
        message: "Price must be greater than 0",
        severity: "error",
      });
      return;
    }

    try {
      await dispatch(
        addVariant({
          productId: product.id!,
          variantData: newVariant,
          jwt,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Variant added successfully",
        severity: "success",
      });
      setNewVariant(createEmptyVariant());
      setAddingNew(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to add variant",
        severity: "error",
      });
    }
  };

  const handleUpdateVariant = async (
    variantId: string,
    updateData: Partial<ProductVariant>
  ) => {
    try {
      await dispatch(
        updateVariant({
          productId: product.id!,
          variantId,
          updateData,
          jwt,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Variant updated",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to update variant",
        severity: "error",
      });
    }
  };

  const handleRemoveVariant = async (variantId: string) => {
    if (!window.confirm("Remove this variant? This cannot be undone.")) return;
    try {
      await dispatch(
        removeVariant({
          productId: product.id!,
          variantId,
          jwt,
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Variant removed",
        severity: "success",
      });
      if (expandedId === variantId) setExpandedId(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to remove variant",
        severity: "error",
      });
    }
  };

  const handleDuplicateVariant = (variant: ProductVariant) => {
    const { id: _id, ...rest } = variant;
    setNewVariant({
      ...rest,
      sku: `${variant.sku}-COPY`,
    });
    setAddingNew(true);
  };

  const handleAddCustomAttribute = () => {
    if (!customAttrKey.trim() || !customAttrValue.trim()) return;
    setNewVariant({
      ...newVariant,
      attributes: {
        ...newVariant.attributes,
        custom: [
          ...(newVariant.attributes.custom || []),
          { key: customAttrKey.trim(), value: customAttrValue.trim() },
        ],
      },
    });
    setCustomAttrKey("");
    setCustomAttrValue("");
  };

  const getVariantLabel = (variant: ProductVariant) => {
    const parts: string[] = [];
    if (variant.attributes.color) parts.push(variant.attributes.color);
    if (variant.attributes.size) parts.push(variant.attributes.size);
    if (variant.attributes.storage) parts.push(variant.attributes.storage);
    if (variant.attributes.ram) parts.push(variant.attributes.ram);
    if (variant.attributes.custom?.length) {
      variant.attributes.custom.forEach((c) => parts.push(`${c.key}: ${c.value}`));
    }
    return parts.length > 0 ? parts.join(" / ") : "Default Variant";
  };

  return (
    <Box className="space-y-4">
      <Typography variant="h6" fontWeight="bold">
        Product Variants ({variants.length})
      </Typography>

      {/* Existing Variants */}
      {variants.map((variant) => (
        <Paper
          key={variant.id}
          variant="outlined"
          sx={{ p: 2, opacity: variant.isActive ? 1 : 0.6 }}
        >
          {/* Variant Header Row */}
          <Box className="flex items-center justify-between gap-2">
            <Box className="flex items-center gap-2 flex-1 min-w-0">
              <IconButton
                size="small"
                onClick={() => variant.id && toggleExpand(variant.id)}
                aria-label={`Expand variant ${getVariantLabel(variant)}`}
              >
                {expandedId === variant.id ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </IconButton>
              <Typography
                variant="body2"
                fontWeight="bold"
                className="truncate"
              >
                {getVariantLabel(variant)}
              </Typography>
              <Chip
                size="small"
                label={variant.sku}
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
              {!variant.isActive && (
                <Chip size="small" label="Inactive" color="default" sx={{ fontSize: "0.7rem" }} />
              )}
            </Box>
            <Box className="flex items-center gap-1">
              <Typography variant="caption" className="font-semibold whitespace-nowrap">
                ₹{variant.price} | Stock: {variant.quantity}
              </Typography>
              <Tooltip title="Duplicate variant">
                <IconButton
                  size="small"
                  onClick={() => handleDuplicateVariant(variant)}
                  aria-label={`Duplicate variant ${getVariantLabel(variant)}`}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove variant">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => variant.id && handleRemoveVariant(variant.id)}
                  aria-label={`Remove variant ${getVariantLabel(variant)}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Expanded Detail Panel */}
          {variant.id && (
            <Collapse in={expandedId === variant.id}>
              <Box className="mt-3 space-y-3 border-t pt-3">
                {/* SKU */}
                <TextField
                  fullWidth
                  size="small"
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) =>
                    handleUpdateVariant(variant.id!, { sku: e.target.value })
                  }
                />

                {/* Attributes */}
                <Box className="flex flex-wrap gap-2">
                  <TextField
                    size="small"
                    label="Color"
                    value={variant.attributes.color || ""}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        attributes: { ...variant.attributes, color: e.target.value },
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Size"
                    value={variant.attributes.size || ""}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        attributes: { ...variant.attributes, size: e.target.value },
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Storage"
                    value={variant.attributes.storage || ""}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        attributes: { ...variant.attributes, storage: e.target.value },
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="RAM"
                    value={variant.attributes.ram || ""}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        attributes: { ...variant.attributes, ram: e.target.value },
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Weight (g)"
                    type="number"
                    value={variant.weight || ""}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        weight: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </Box>

                {/* Custom Attributes Display */}
                {variant.attributes.custom && variant.attributes.custom.length > 0 && (
                  <Box className="flex flex-wrap gap-1">
                    {variant.attributes.custom.map((attr, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        label={`${attr.key}: ${attr.value}`}
                        onDelete={() => {
                          const updatedCustom = variant.attributes.custom!.filter(
                            (_, i) => i !== idx
                          );
                          handleUpdateVariant(variant.id!, {
                            attributes: { ...variant.attributes, custom: updatedCustom },
                          });
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Pricing */}
                <Box className="flex flex-wrap gap-2">
                  <TextField
                    size="small"
                    label="MRP Price"
                    type="number"
                    value={variant.mrpPrice}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        mrpPrice: Number(e.target.value),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Selling Price"
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        price: Number(e.target.value),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Stock"
                    type="number"
                    value={variant.quantity}
                    onChange={(e) =>
                      handleUpdateVariant(variant.id!, {
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </Box>

                {/* Active Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={variant.isActive}
                      onChange={(e) =>
                        handleUpdateVariant(variant.id!, {
                          isActive: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
                />

                {/* Variant Images */}
                <Box>
                  <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                    Variant Images (optional)
                  </Typography>
                  <ProductImageUpload
                    images={variant.images || []}
                    onChange={(images: ProductImage[]) =>
                      handleUpdateVariant(variant.id!, { images })
                    }
                  />
                </Box>
              </Box>
            </Collapse>
          )}
        </Paper>
      ))}

      {/* Add New Variant */}
      {addingNew ? (
        <Paper variant="outlined" sx={{ p: 2 }} className="space-y-3">
          <Typography variant="subtitle2" fontWeight="bold">
            New Variant
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <TextField
              size="small"
              label="SKU"
              required
              value={newVariant.sku}
              onChange={(e) =>
                setNewVariant({ ...newVariant, sku: e.target.value })
              }
            />
            <TextField
              size="small"
              label="Color"
              value={newVariant.attributes.color || ""}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  attributes: { ...newVariant.attributes, color: e.target.value },
                })
              }
            />
            <TextField
              size="small"
              label="Size"
              value={newVariant.attributes.size || ""}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  attributes: { ...newVariant.attributes, size: e.target.value },
                })
              }
            />
            <TextField
              size="small"
              label="Storage"
              value={newVariant.attributes.storage || ""}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  attributes: { ...newVariant.attributes, storage: e.target.value },
                })
              }
            />
            <TextField
              size="small"
              label="RAM"
              value={newVariant.attributes.ram || ""}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  attributes: { ...newVariant.attributes, ram: e.target.value },
                })
              }
            />
          </Box>

          {/* Custom Attributes */}
          <Box className="flex items-center gap-2">
            <TextField
              size="small"
              label="Custom Key"
              value={customAttrKey}
              onChange={(e) => setCustomAttrKey(e.target.value)}
              sx={{ width: 120 }}
            />
            <TextField
              size="small"
              label="Custom Value"
              value={customAttrValue}
              onChange={(e) => setCustomAttrValue(e.target.value)}
              sx={{ width: 120 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleAddCustomAttribute}
            >
              Add
            </Button>
          </Box>
          {newVariant.attributes.custom && newVariant.attributes.custom.length > 0 && (
            <Box className="flex flex-wrap gap-1">
              {newVariant.attributes.custom.map((attr, idx) => (
                <Chip
                  key={idx}
                  size="small"
                  label={`${attr.key}: ${attr.value}`}
                  onDelete={() => {
                    const updated = newVariant.attributes.custom!.filter(
                      (_, i) => i !== idx
                    );
                    setNewVariant({
                      ...newVariant,
                      attributes: { ...newVariant.attributes, custom: updated },
                    });
                  }}
                />
              ))}
            </Box>
          )}

          {/* Pricing */}
          <Box className="flex flex-wrap gap-2">
            <TextField
              size="small"
              label="MRP Price"
              type="number"
              required
              value={newVariant.mrpPrice || ""}
              onChange={(e) =>
                setNewVariant({ ...newVariant, mrpPrice: Number(e.target.value) })
              }
            />
            <TextField
              size="small"
              label="Selling Price"
              type="number"
              required
              value={newVariant.price || ""}
              onChange={(e) =>
                setNewVariant({ ...newVariant, price: Number(e.target.value) })
              }
            />
            <TextField
              size="small"
              label="Stock"
              type="number"
              value={newVariant.quantity || ""}
              onChange={(e) =>
                setNewVariant({ ...newVariant, quantity: Number(e.target.value) })
              }
            />
            <TextField
              size="small"
              label="Weight (g)"
              type="number"
              value={newVariant.weight || ""}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  weight: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </Box>

          {/* Variant Images */}
          <ProductImageUpload
            images={newVariant.images || []}
            onChange={(images: ProductImage[]) =>
              setNewVariant({ ...newVariant, images })
            }
          />

          <Box className="flex gap-2">
            <Button variant="contained" size="small" onClick={handleAddVariant}>
              Save Variant
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setAddingNew(false);
                setNewVariant(createEmptyVariant());
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      ) : (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddingNew(true)}
        >
          Add Variant
        </Button>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VariantManager;
