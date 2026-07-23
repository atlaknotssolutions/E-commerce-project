import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { CircularProgress, Divider, Alert, Button, Rating } from '@mui/material';
import { fetchMyReviews } from '../../../Redux Toolkit/Customer/ReviewSlice';
import { useNavigate } from 'react-router-dom';

const ReviewHistory = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { review } = useAppSelector(store => store);

    useEffect(() => {
        dispatch(fetchMyReviews());
    }, [dispatch]);

    if (review.fetchLoading) {
        return (
            <div className="flex justify-center py-10">
                <CircularProgress />
            </div>
        );
    }

    if (review.error) {
        return <Alert severity="error" sx={{ mb: 2 }}>{review.error}</Alert>;
    }

    if (review.myReviews.length === 0) {
        return (
            <div className="text-center py-10 space-y-3">
                <p className="text-gray-500">You haven't written any reviews yet.</p>
                <Button variant="contained" onClick={() => navigate("/")}>
                    Browse Products
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="font-semibold text-lg">My Reviews ({review.myReviews.length})</h2>
            {review.myReviews.map((item, i) => {
                const productTitle = typeof item.product === 'object' ? item.product?.title : '';
                const productId = typeof item.product === 'object' ? item.product?.id : '';
                const productImage = typeof item.product === 'object' ? item.product?.images?.[0] : '';

                return (
                    <div key={item.id}>
                        <div className="flex gap-4 py-3">
                            {productImage && (
                                <img
                                    className="w-16 h-16 object-cover rounded cursor-pointer"
                                    src={productImage}
                                    alt={productTitle}
                                    onClick={() => productId && navigate(`/reviews/${productId}`)}
                                />
                            )}
                            <div className="flex-1 space-y-1">
                                <p
                                    className="font-medium text-sm cursor-pointer hover:underline"
                                    onClick={() => productId && navigate(`/reviews/${productId}`)}
                                >
                                    {productTitle}
                                </p>
                                <Rating value={item.rating} readOnly size="small" precision={0.5} />
                                <p className="text-sm text-gray-600">{item.reviewText}</p>
                                <p className="text-xs text-gray-400">{item.createdAt}</p>
                            </div>
                            <div className="flex items-start gap-1">
                                <Button
                                    size="small"
                                    onClick={() => productId && navigate(`/reviews/${productId}/edit/${item.id}`)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                        {review.myReviews.length - 1 !== i && <Divider />}
                    </div>
                );
            })}
        </div>
    );
}

export default ReviewHistory
