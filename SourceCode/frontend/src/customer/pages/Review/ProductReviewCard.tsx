import React from "react";
import { Avatar, IconButton, CircularProgress } from "@mui/material";
import { Rating, Box, Grid } from "@mui/material";
import { Review } from "../../../types/reviewTypes";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { red, blue } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { deleteReview } from "../../../Redux Toolkit/Customer/ReviewSlice";
import { useNavigate } from "react-router-dom";

interface ProductReviewCardProps {
  item: Review;
}

const ProductReviewCard = ({ item }: ProductReviewCardProps) => {
  const { user, review } = useAppSelector(store => store);
  const dispatch = useAppDispatch()
  const navigate = useNavigate();
  const reviewerName = item.user?.fullName || "Anonymous";
  const isOwner = item.user?.id === user.user?.id;

  const handleDeleteReview = () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReview({ reviewId: item.id }))
    }
  };

  const handleEditReview = () => {
    const productId = typeof item.product === 'string' ? item.product : item.product?.id;
    if (productId) {
      navigate(`/reviews/${productId}/edit/${item.id}`);
    }
  };

  return (
    <div className="flex justify-between">
      <Grid container spacing={2} gap={3}>
        <Grid item xs={1}>
          <Box>
            <Avatar
              className="text-white"
              sx={{ width: 56, height: 56, bgcolor: "#9155FD" }}
              alt={reviewerName}
              src=""
            >
              {reviewerName[0].toUpperCase()}
            </Avatar>
          </Box>
        </Grid>
        <Grid item xs={9}>
          <div className="space-y-2">
            <div className="">
              <p className="font-semibold text-lg">{reviewerName}</p>
              <p className="opacity-70">{item.createdAt}</p>
            </div>
            <div>

              <Rating
                readOnly
                value={item.rating}
                name="half-rating"
                defaultValue={2.5}
                precision={0.5}
              />

            </div>
            <p>
              {item.reviewText}
            </p>
            <div>
              {item.productImages.map((image) => <img key={image} className="w-24 h-24 object-cover" src={image} alt="" />)}
            </div>
          </div>
        </Grid>
      </Grid>
      {isOwner && <div className="flex items-center gap-1">
        <IconButton onClick={handleEditReview} size="small">
          <EditIcon sx={{ color: blue[700] }} />
        </IconButton>
        <IconButton onClick={handleDeleteReview} disabled={review.deleteLoading}>
          {review.deleteLoading ? (
            <CircularProgress size={24} sx={{ color: red[700] }} />
          ) : (
            <DeleteIcon sx={{ color: red[700] }} />
          )}
        </IconButton>
      </div>}
    </div>
  );
};

export default ProductReviewCard;
