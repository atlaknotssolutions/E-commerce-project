import * as React from "react";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Typography,
  Autocomplete,
  Box,
  Paper,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { updateHomeCategory } from "../../../Redux Toolkit/Admin/AdminSlice";
import { fetchCategoryTree } from "../../../Redux Toolkit/Customer/Customer/AsyncThunk";
import { HomeCategory } from "../../../types/homeDataTypes";
import { Category } from "../../../types/categoryTypes";
import ImageUpload from "../../components/ImageUpload";

const validationSchema = Yup.object({
  image: Yup.string().required("Image is required"),
  category: Yup.string().required("Level 1 category is required"),
  category2: Yup.string().required("Level 2 category is required"),
  category3: Yup.string().required("Leaf category is required"),
});

function getLeafBreadcrumb(tree: Category[], categoryId: string): Category[] {
  for (const c1 of tree) {
    if (c1.children) {
      for (const c2 of c1.children) {
        if (c2.children) {
          for (const c3 of c2.children) {
            if (c3.categoryId === categoryId) return [c1, c2, c3];
          }
        }
        if (c2.categoryId === categoryId) return [c1, c2];
      }
    }
    if (c1.categoryId === categoryId) return [c1];
  }
  return [];
}

const UpdateHomeCategoryForm = ({
  category,
  handleClose,
}: {
  category: HomeCategory | undefined;
  handleClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { categoryTree } = useAppSelector((store) => store.homePage);

  useEffect(() => {
    if (categoryTree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, categoryTree.length]);

  const initialBreadcrumb = React.useMemo(() => {
    if (category?.categoryId) {
      return getLeafBreadcrumb(categoryTree, category.categoryId);
    }
    return [];
  }, [categoryTree, category?.categoryId]);

  const formik = useFormik({
    initialValues: {
      image: category?.image || "",
      category: initialBreadcrumb[0]?.categoryId || "",
      category2: initialBreadcrumb[1]?.categoryId || "",
      category3: category?.categoryId || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      if (category?.id) {
        dispatch(
          updateHomeCategory({
            id: category.id,
            data: { image: values.image, categoryId: values.category3 },
          })
        );
      }
      handleClose();
    },
  });

  const level1Categories = categoryTree.filter((c: Category) => c.level === 1);
  const selectedLevel1 = level1Categories.find(
    (c: Category) => c.categoryId === formik.values.category
  );
  const level2Categories = selectedLevel1?.children || [];
  const selectedLevel2 = level2Categories.find(
    (c: Category) => c.categoryId === formik.values.category2
  );
  const level3Categories = selectedLevel2?.children || [];
  const selectedLevel3 = level3Categories.find(
    (c: Category) => c.categoryId === formik.values.category3
  );

  const isLeafValid =
    !!selectedLevel3 && selectedLevel3.isActive !== false && selectedLevel3.level === 3;

  const handleLevel1Change = (_: React.SyntheticEvent, value: Category | null) => {
    formik.setFieldValue("category", value?.categoryId || "");
    formik.setFieldValue("category2", "");
    formik.setFieldValue("category3", "");
  };
  const handleLevel2Change = (_: React.SyntheticEvent, value: Category | null) => {
    formik.setFieldValue("category2", value?.categoryId || "");
    formik.setFieldValue("category3", "");
  };
  const handleLevel3Change = (_: React.SyntheticEvent, value: Category | null) => {
    formik.setFieldValue("category3", value?.categoryId || "");
  };

  const breadcrumb = React.useMemo(() => {
    const result: Category[] = [];
    if (selectedLevel1) result.push(selectedLevel1);
    if (selectedLevel2) result.push(selectedLevel2);
    if (selectedLevel3) result.push(selectedLevel3);
    return result;
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ maxWidth: 500, margin: "auto", padding: 3 }}
      className="space-y-6"
    >
      <Typography variant="h4" gutterBottom>
        Update Category
      </Typography>

      <ImageUpload
        value={formik.values.image}
        onChange={(url) => formik.setFieldValue("image", url)}
      />
      {formik.touched.image && formik.errors.image && (
        <Typography variant="caption" color="error">{formik.errors.image}</Typography>
      )}

      {category && (
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Created: {category.createdAt ? new Date(category.createdAt).toLocaleString() : "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Updated: {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : "N/A"}
          </Typography>
        </Paper>
      )}

      <Autocomplete
        fullWidth
        options={level1Categories}
        getOptionLabel={(option: Category) => `${option.name} (Parent)`}
        value={selectedLevel1 || null}
        onChange={handleLevel1Change}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Level 1"
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          />
        )}
        isOptionEqualToValue={(option, value) => option.categoryId === value.categoryId}
        clearOnEscape
        blurOnSelect
      />

      <Autocomplete
        fullWidth
        options={level2Categories}
        getOptionLabel={(option: Category) => `  ${option.name} (Parent)`}
        value={selectedLevel2 || null}
        onChange={handleLevel2Change}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Level 2"
            error={formik.touched.category2 && Boolean(formik.errors.category2)}
            helperText={formik.touched.category2 && formik.errors.category2}
          />
        )}
        isOptionEqualToValue={(option, value) => option.categoryId === value.categoryId}
        clearOnEscape
        blurOnSelect
        disabled={!selectedLevel1}
      />

      <Autocomplete
        fullWidth
        options={level3Categories}
        getOptionLabel={(option: Category) => `    ${option.name}`}
        value={selectedLevel3 || null}
        onChange={handleLevel3Change}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Level 3 (Leaf)"
            error={formik.touched.category3 && Boolean(formik.errors.category3)}
            helperText={formik.touched.category3 && formik.errors.category3}
          />
        )}
        isOptionEqualToValue={(option, value) => option.categoryId === value.categoryId}
        clearOnEscape
        blurOnSelect
        disabled={!selectedLevel2}
      />

      {breadcrumb.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Selected Category
          </Typography>
          {breadcrumb.map((c, i) => (
            <Typography key={c.categoryId} variant="body2" sx={{ ml: i * 2 }}>
              {i > 0 ? "→ " : ""}{c.name}
            </Typography>
          ))}
        </Paper>
      )}

      {formik.values.category3 && !isLeafValid && (
        <Typography variant="caption" color="error">
          Please select a valid leaf category.
        </Typography>
      )}

      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        sx={{ py: ".9rem" }}
        disabled={!isLeafValid}
      >
        Submit
      </Button>
    </Box>
  );
};

export default UpdateHomeCategoryForm;
