import React, { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../../../Redux Toolkit/Customer/ProductSlice';
import ReviewForm from './ReviewForm';
import { fetchReviewsByProductId, resetReviewState } from '../../../Redux Toolkit/Customer/ReviewSlice';
import { CircularProgress, Alert } from '@mui/material';

const EditReview = () => {
    const dispatch = useAppDispatch();
    const { products, review } = useAppSelector(store => store)
    const { productId, reviewId } = useParams()

    useEffect(() => {
        if (productId) {
            dispatch(resetReviewState());
            dispatch(fetchProductById(productId))
            dispatch(fetchReviewsByProductId({ productId }))
        }
    }, [productId, dispatch])

    const existingReview = useMemo(() => {
        if (!reviewId || !review.reviews.length) return undefined;
        return review.reviews.find(r => r.id === reviewId);
    }, [reviewId, review.reviews]);

    if (review.fetchLoading) {
        return (
            <div className='h-[80vh] flex justify-center items-center'>
                <CircularProgress />
            </div>
        )
    }

    if (!existingReview) {
        return (
            <div className='h-[80vh] flex justify-center items-center'>
                <Alert severity="error">Review not found</Alert>
            </div>
        )
    }

    return (
        <div className='p-5 lg:p-20 flex flex-col lg:flex-row gap-10'>
            <div className='w-full md:w-1/2 lg:w-[30%] space-y-2'>
                <img className='w-full' src={
                    products.product?.images[0]?.url || ""
                } alt="" />
                <div>
                    <div>
                        <p className='font-bold text-xl'> {products.product?.seller?.businessDetails.businessName}
                        </p>
                        <p className='text-lg text-gray-600'>{products.product?.title}</p>
                    </div>

                    <div className='price flex items-center gap-3 mt-5 text-lg'>
                        <span className='font-semibold text-gray-800' > ₹{products.product?.sellingPrice}</span>
                        <span className='text thin-line-through text-gray-400 '>₹{products.product?.mrpPrice}</span>
                        <span className='text-[#00927c] font-semibold'>{products.product?.discountPercent}% off</span>
                    </div>
                </div>
            </div>
            <section className="w-full md:w-1/2 lg:w-[70%]">
                <h1 className="font-semibold text-2xl pb-4 text-gray-700">
                    Edit Your Review
                </h1>
                <ReviewForm existingReview={existingReview} mode="edit" />
            </section>
        </div>
    )
}

export default EditReview
