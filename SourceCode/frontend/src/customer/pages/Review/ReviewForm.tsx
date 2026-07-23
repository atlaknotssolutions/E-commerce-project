import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Box,
    Rating,
    InputLabel,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { uploadToCloudinary } from '../../../util/uploadToCloudinary';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    createReview,
    updateReview,
    resetReviewState,
    clearError,
    setUploadLoading,
} from '../../../Redux Toolkit/Customer/ReviewSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateReviewRequest, Review } from '../../../types/reviewTypes';

interface ReviewFormProps {
    existingReview?: Review;
    mode?: 'create' | 'edit';
}

const ReviewForm: React.FC<ReviewFormProps> = ({ existingReview, mode = 'create' }) => {
    const dispatch = useAppDispatch();
    const { productId } = useParams();
    const navigate = useNavigate();
    const { review } = useAppSelector(store => store);

    const formik = useFormik<CreateReviewRequest>({
        initialValues: {
            reviewText: existingReview?.reviewText || '',
            rating: existingReview?.rating || 0,
            productImages: existingReview?.productImages || [],
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            reviewText: Yup.string()
                .required('Review text is required')
                .min(10, 'Review must be at least 10 characters long'),
            rating: Yup.number()
                .required('Rating is required')
                .min(1, 'Rating must be at least 1')
                .max(5, 'Rating cannot be more than 5'),
        }),
        onSubmit: (values) => {
            if (mode === 'edit' && existingReview) {
                dispatch(updateReview({
                    reviewId: existingReview.id,
                    review: values,
                }));
            } else if (productId) {
                dispatch(createReview({
                    productId,
                    review: values,
                }));
            }
        },
    });

    const { resetForm } = formik;

    useEffect(() => {
        if (mode === 'create' && review.reviewCreated && productId) {
            resetForm();
            dispatch(resetReviewState());
            navigate(`/reviews/${productId}`);
        } else if (mode === 'edit' && review.reviewUpdated && productId) {
            dispatch(resetReviewState());
            navigate(`/reviews/${productId}`);
        }
    }, [review.reviewCreated, review.reviewUpdated, mode, productId, resetForm, dispatch, navigate]);

    const handleImageChange = async (event: any) => {
        const file = event.target.files[0];
        dispatch(setUploadLoading(true));
        try {
            const image = await uploadToCloudinary(file);
            formik.setFieldValue("productImages", [...formik.values.productImages, image]);
        } finally {
            dispatch(setUploadLoading(false));
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = [...formik.values.productImages];
        updatedImages.splice(index, 1);
        formik.setFieldValue("productImages", updatedImages);
    };

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 3 }}
            className='space-y-5'
        >
            {review.error && (
                <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
                    {review.error}
                </Alert>
            )}

            <TextField
                fullWidth
                id="reviewText"
                name="reviewText"
                label="Review Text"
                variant="outlined"
                multiline
                rows={4}
                value={formik.values.reviewText}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reviewText && Boolean(formik.errors.reviewText)}
                helperText={formik.touched.reviewText && formik.errors.reviewText}
            />

            <div className='space-y-2'>
                <InputLabel>Rating</InputLabel>
                <Rating
                    id="rating"
                    name="rating"
                    value={formik.values.rating}
                    onChange={(event, newValue) =>
                        formik.setFieldValue('rating', newValue)
                    }
                    onBlur={formik.handleBlur}
                    precision={0.5}
                />
            </div>
            {formik.touched.rating && formik.errors.rating && (
                <Typography color="error" variant="body2">
                    {formik.errors.rating}
                </Typography>
            )}

            <div className="flex flex-wrap gap-5 py-3">
                <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                />

                <label className="relative" htmlFor="fileInput">
                    <span className="w-24 h-24 cursor-pointer flex items-center justify-center p-3 border rounded-md border-gray-400">
                        <AddPhotoAlternateIcon className="text-gray-700" />
                    </span>
                    {review.uploadLoading && (
                        <div className="absolute left-0 right-0 top-0 bottom-0 w-24 h-24 flex justify-center items-center">
                            <CircularProgress />
                        </div>
                    )}
                </label>

                <div className="flex flex-wrap gap-2">
                    {formik.values.productImages.map((image, index) => (
                        <div key={index} className="relative">
                            <img
                                className="w-24 h-24 object-cover"
                                src={image}
                                alt={`ProductImage ${index + 1}`}
                            />
                            <IconButton
                                onClick={() => handleRemoveImage(index)}
                                size="small"
                                color="error"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    outline: "none",
                                }}
                            >
                                <CloseIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={review.createLoading || review.updateLoading || review.uploadLoading}
                startIcon={(review.createLoading || review.updateLoading) ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
                {mode === 'edit'
                    ? (review.updateLoading ? 'Updating...' : 'Update Review')
                    : (review.createLoading ? 'Submitting...' : 'Submit Review')
                }
            </Button>
        </Box>
    );
};

export default ReviewForm;
