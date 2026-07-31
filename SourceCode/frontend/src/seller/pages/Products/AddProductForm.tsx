import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { notification } from "../../../services/notificationService";
import
{
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Grid,
  CircularProgress,
} from "@mui/material";
import "tailwindcss/tailwind.css";
import { colors } from "../../../data/Filter/color";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useParams, useNavigate } from "react-router-dom";
import { createProduct, updateProduct } from "../../../Redux Toolkit/Seller/sellerProductSlice";
import { fetchCategoryTree } from "../../../Redux Toolkit/Customer/Customer/AsyncThunk";
import { fetchMyRequests } from "../../../Redux Toolkit/Seller/sellerCategoryRequestSlice";
import { fetchActiveBrands } from "../../../Redux Toolkit/Customer/publicBrandSlice";
import { Category } from "../../../types/categoryTypes";
import { ProductImage, AttributeDefinition } from "../../../types/productTypes";
import ProductImageUpload from "../../components/ProductImageUpload";
import VariantManager from "../../components/VariantManager";

const ProductForm = () =>
{
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const dispatch = useAppDispatch();
  const { sellerProduct, homePage, sellerCategoryRequest, publicBrand } = useAppSelector(store => store);
  const { categoryTree } = homePage;
  const { brands: activeBrands } = publicBrand;
  const pendingRequests = sellerCategoryRequest?.requests?.filter(
    (r: any) => r.status === 'PENDING'
  ) || [];

  const productToEdit = isEditMode
    ? sellerProduct.products?.find((p: any) => p.id === id || p._id === id)
    : null;

  useEffect(() =>
  {
    if (categoryTree.length === 0)
    {
      dispatch(fetchCategoryTree());
    }
    dispatch(fetchMyRequests());
    dispatch(fetchActiveBrands({ limit: 100 }));
  }, [dispatch, categoryTree.length]);

  const formik = useFormik({
    initialValues: {
      title: productToEdit?.title || "",
      description: productToEdit?.description || "",
      mrpPrice: productToEdit?.mrpPrice || "",
      sellingPrice: productToEdit?.sellingPrice || "",
      quantity: productToEdit?.quantity || "",
      color: productToEdit?.color || "",
      images: productToEdit?.images || [],
      sizes: productToEdit?.sizes || "",
      brand: productToEdit?.brand || "",

      // Safe Extracting String IDs from Backend Nested Object
      category: productToEdit?.category?.parentCategory?.parentCategory?.categoryId || productToEdit?.category?.parentCategory?.categoryId || productToEdit?.category?.categoryId || "",
      category2: productToEdit?.category?.parentCategory?.categoryId || productToEdit?.category?.categoryId || "",
      category3: productToEdit?.category?.categoryId || "",
    },
    enableReinitialize: true,
    onSubmit: (values) =>
    {
      if (isEditMode && id)
      {
        dispatch(
          updateProduct({
            productId: id!,
            product: values as any,
            jwt: localStorage.getItem("jwt")
          })
        );
      } else
      {
        dispatch(
          createProduct({
            request: values,
            jwt: localStorage.getItem("jwt")
          })
        );
      }
      console.log(values);
    },
  });

  const selectedLevel1 = categoryTree.find(
    (c: Category) => c.categoryId === formik.values.category
  );
  const selectedLevel2 = selectedLevel1?.children?.find(
    (c: Category) => c.categoryId === formik.values.category2
  );
  const selectedLevel3 = selectedLevel2?.children?.find(
    (c: Category) => c.categoryId === formik.values.category3
  );

  const leafCategory = selectedLevel3 || selectedLevel2 || selectedLevel1;
  const supportedAttributes: AttributeDefinition[] = useMemo(() =>
  {
    if (!leafCategory) return [];
    const attrs = (leafCategory as any).supportedAttributes || [];
    return attrs.filter((a: AttributeDefinition) => a.active !== false);
  }, [leafCategory]);

  const hasDynamicAttributes = supportedAttributes.length > 0;

  const handleCategoryChange = (field: string, value: string) =>
  {
    formik.setFieldValue(field, value);
    if (field === "category")
    {
      formik.setFieldValue("category2", "");
      formik.setFieldValue("category3", "");
    } else if (field === "category2")
    {
      formik.setFieldValue("category3", "");
    }
  };

  const handleImagesChange = (images: ProductImage[]) =>
  {
    formik.setFieldValue("images", images);
  };

  useEffect(() =>
  {
    if (sellerProduct.productCreated)
    {
      notification.success(isEditMode ? "Product updated successfully" : "Product created successfully");
    }
    if (sellerProduct.error)
    {
      notification.error(sellerProduct.error);
    }
  }, [sellerProduct.productCreated, sellerProduct.productUpdated, sellerProduct.error, isEditMode]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-4">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ProductImageUpload
              images={formik.values.images}
              onChange={handleImagesChange}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              required
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              multiline
              rows={4}
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={formik.touched.description && formik.errors.description}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <TextField
              fullWidth
              id="mrp_price"
              name="mrpPrice"
              label="MRP Price"
              type="number"
              value={formik.values.mrpPrice}
              onChange={formik.handleChange}
              error={formik.touched.mrpPrice && Boolean(formik.errors.mrpPrice)}
              helperText={formik.touched.mrpPrice && formik.errors.mrpPrice}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <TextField
              fullWidth
              id="sellingPrice"
              name="sellingPrice"
              label="Selling Price"
              type="number"
              value={formik.values.sellingPrice}
              onChange={formik.handleChange}
              error={
                formik.touched.sellingPrice &&
                Boolean(formik.errors.sellingPrice)
              }
              helperText={
                formik.touched.sellingPrice && formik.errors.sellingPrice
              }
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <TextField
              fullWidth
              id="quantity"
              name="quantity"
              label="Quantity"
              type="number"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              required
            />
          </Grid>

          {/* Dynamic attribute fields based on category supportedAttributes */}
          {hasDynamicAttributes
            ? supportedAttributes.map((attr) =>
              {
                const fieldName = `attr_${attr.code}`;
                const fieldValue = (formik.values as any)[fieldName] || "";

                if (attr.type === "select" && attr.options && attr.options.length > 0)
                {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={attr.code}>
                      <FormControl fullWidth>
                        <InputLabel id={`${fieldName}-label`}>{attr.name}</InputLabel>
                        <Select
                          labelId={`${fieldName}-label`}
                          id={fieldName}
                          value={fieldValue}
                          onChange={(e) =>
                          {
                            formik.setFieldValue(fieldName, e.target.value);
                            if (attr.code === "color")
                            {
                              formik.setFieldValue("color", e.target.value);
                            } else if (attr.code === "size")
                            {
                              formik.setFieldValue("sizes", e.target.value);
                            }
                          }}
                          label={attr.name}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {attr.options.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  );
                }

                return (
                  <Grid item xs={12} sm={6} lg={3} key={attr.code}>
                    <TextField
                      fullWidth
                      id={fieldName}
                      name={fieldName}
                      label={attr.name}
                      type={attr.type === "number" ? "number" : "text"}
                      value={fieldValue}
                      onChange={(e) =>
                      {
                        formik.setFieldValue(fieldName, e.target.value);
                        if (attr.code === "color")
                        {
                          formik.setFieldValue("color", e.target.value);
                        } else if (attr.code === "size")
                        {
                          formik.setFieldValue("sizes", e.target.value);
                        }
                      }}
                    />
                  </Grid>
                );
              })
            : <>
                {/* Legacy hardcoded Color dropdown */}
                <Grid item xs={12} sm={6} lg={3}>
                  <FormControl
                    fullWidth
                    error={formik.touched.color && Boolean(formik.errors.color)}
                  >
                    <InputLabel id="color-label">Color</InputLabel>
                    <Select
                      labelId="color-label"
                      id="color"
                      name="color"
                      value={formik.values.color}
                      onChange={formik.handleChange}
                      label="Color"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {colors.map((color, index) => <MenuItem key={index} value={color.name}>
                        <div className="flex gap-3">
                          <span style={{ backgroundColor: color.hex }} className={`h-5 w-5 rounded-full ${color.name === "White" ? "border" : ""}`}></span>
                          <p>{color.name}</p>
                        </div>
                      </MenuItem>)}
                    </Select>
                    {formik.touched.color && formik.errors.color && (
                      <FormHelperText>{formik.errors.color}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {/* Legacy hardcoded Sizes dropdown */}
                <Grid item xs={12} sm={6} lg={3}>
                  <FormControl
                    fullWidth
                    error={formik.touched.sizes && Boolean(formik.errors.sizes)}
                  >
                    <InputLabel id="sizes-label">Sizes</InputLabel>
                    <Select
                      labelId="sizes-label"
                      id="sizes"
                      name="sizes"
                      value={formik.values.sizes}
                      onChange={formik.handleChange}
                      label="Sizes"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="FREE">FREE</MenuItem>
                      <MenuItem value="S">S</MenuItem>
                      <MenuItem value="M">M</MenuItem>
                      <MenuItem value="L">L</MenuItem>
                      <MenuItem value="XL">XL</MenuItem>
                    </Select>
                    {formik.touched.sizes && formik.errors.sizes && (
                      <FormHelperText>{formik.errors.sizes}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
          }

          <Grid item xs={12} sm={6} lg={4}>
            <FormControl
              fullWidth
              error={formik.touched.category && Boolean(formik.errors.category)}
              required
            >
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category}
                onChange={(e) => handleCategoryChange("category", e.target.value)}
                label="Category"
              >
                {categoryTree.map((item: Category) => (
                  <MenuItem key={item.categoryId} value={item.categoryId || ""}>
                    {item.name}
                  </MenuItem>
                ))}
                {!selectedLevel1 && pendingRequests
                  .filter((r: any) => !r.parentCategory)
                  .map((req: any) => (
                    <MenuItem key={req._id} disabled>
                      {req.requestedName} ⏳ Pending Approval
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.category && formik.errors.category && (
                <FormHelperText>{formik.errors.category as string}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} lg={4}>
            <FormControl
              fullWidth
              error={formik.touched.category && Boolean(formik.errors.category)}
              required
            >
              <InputLabel id="category2-label">Second Category</InputLabel>
              <Select
                labelId="category2-label"
                id="category2"
                name="category2"
                value={formik.values.category2}
                onChange={(e) => handleCategoryChange("category2", e.target.value)}
                label="Second Category"
              >
                {selectedLevel1?.children?.map((item: Category) => (
                  <MenuItem key={item.categoryId} value={item.categoryId || ""}>
                    {item.name}
                  </MenuItem>
                ))}
                {selectedLevel1 && pendingRequests
                  .filter((r: any) => r.parentCategory?._id === selectedLevel1._id)
                  .map((req: any) => (
                    <MenuItem key={req._id} disabled>
                      {req.requestedName} ⏳ Pending Approval
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.category2 && formik.errors.category2 && (
                <FormHelperText>{formik.errors.category2 as string}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <FormControl
              fullWidth
              error={formik.touched.category && Boolean(formik.errors.category)}
              required
            >
              <InputLabel id="category-label">Third Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category3"
                value={formik.values.category3}
                onChange={(e) => handleCategoryChange("category3", e.target.value)}
                label="Third Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {selectedLevel2?.children?.map((item: Category) => (
                  <MenuItem key={item.categoryId} value={item.categoryId || ""}>
                    {item.name}
                  </MenuItem>
                ))}
                {selectedLevel2 && pendingRequests
                  .filter((r: any) => r.parentCategory?._id === selectedLevel2._id)
                  .map((req: any) => (
                    <MenuItem key={req._id} disabled>
                      {req.requestedName} ⏳ Pending Approval
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.category3 && formik.errors.category3 && (
                <FormHelperText>{formik.errors.category3 as string}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={() =>
                navigate("/seller/request-category", {
                  state: {
                    parentCategoryId: selectedLevel2?._id || selectedLevel1?._id || "",
                    parentCategoryName: selectedLevel2?.name || selectedLevel1?.name || "",
                  },
                })
              }
            >
              Category not found? Request New Category
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <FormControl fullWidth>
              <InputLabel id="brand-label">Brand</InputLabel>
              <Select
                labelId="brand-label"
                id="brand"
                name="brand"
                value={formik.values.brand}
                onChange={formik.handleChange}
                label="Brand"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {activeBrands.map((b) => (
                  <MenuItem key={b._id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the brand for this product</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              onClick={() => navigate("/seller/request-brand")}
            >
              Brand not found? Request New Brand
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              sx={{ p: "14px" }}
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={sellerProduct.loading}
            >
              {sellerProduct.loading ? (
                <CircularProgress size="small" sx={{ width: "27px", height: "27px" }} />
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Variant Manager — Only shown in edit mode after product is created */}
      {isEditMode && productToEdit && (
        <div className="mt-6 p-4 border-t">
          <VariantManager
            product={productToEdit}
            jwt={localStorage.getItem("jwt")}
          />
        </div>
      )}

    </div>

  );
};

export default ProductForm;
