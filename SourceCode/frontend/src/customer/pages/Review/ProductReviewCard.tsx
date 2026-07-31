import React, { useState } from "react";
import { Avatar, CircularProgress, Box, Modal } from "@mui/material";
import { Rating } from "@mui/material";
import { Review } from "../../../types/reviewTypes";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { red } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { deleteReview } from "../../../Redux Toolkit/Customer/ReviewSlice";
import { useNavigate } from "react-router-dom";

interface ProductReviewCardProps {
  item: Review;
}

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e", "#14b8a6", "#0ea5e9", "#f59e0b"];

const formatDate = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const ProductReviewCard = ({ item }: ProductReviewCardProps) => {
  const { user, review } = useAppSelector(store => store);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const reviewerName = item.user?.fullName || "Anonymous";
  const isOwner = item.user?.id === user.user?.id;
  const profileImage = item.user?.profileImage;

  const avatarColor = AVATAR_COLORS[reviewerName.length % AVATAR_COLORS.length];

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

  const handleImgError = (idx: number) => {
    setImgErrors(prev => new Set(prev).add(idx));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-3 lg:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={reviewerName}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border border-gray-200" />
          ) : (
            <Avatar sx={{
              width: { xs: 40, lg: 48 }, height: { xs: 40, lg: 48 },
              bgcolor: avatarColor, fontSize: { xs: 16, lg: 18 }, fontWeight: 600
            }}>
              {reviewerName[0].toUpperCase()}
            </Avatar>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm lg:text-base">{reviewerName}</span>
            <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
          </div>

          {/* Rating */}
          <div className="mt-1">
            <Rating readOnly value={item.rating} precision={0.5}
              sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconHover': { color: '#f59e0b' }, fontSize: { xs: '1.1rem', lg: '1.25rem' } }} />
          </div>

          {/* Review text */}
          {item.reviewText && (
            <p className="mt-2 text-sm lg:text-[15px] text-gray-700 leading-relaxed max-w-3xl">
              {item.reviewText}
            </p>
          )}

          {/* Review images */}
          {item.productImages && item.productImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.productImages.map((url, idx) => (
                !imgErrors.has(idx) && (
                  <button key={idx} onClick={() => setLightboxImg(url)}
                    className="group relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={url} alt=""
                      onError={() => handleImgError(idx)}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110" />
                  </button>
                )
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <button disabled
              className="flex items-center gap-1.5 text-xs text-gray-400 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed">
              <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />
              Helpful
            </button>

            {isOwner && (
              <>
                <button onClick={handleEditReview}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  <EditIcon sx={{ fontSize: 15 }} />
                  Edit
                </button>
                <button onClick={handleDeleteReview} disabled={review.deleteLoading}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  {review.deleteLoading ? (
                    <CircularProgress size={14} sx={{ color: red[500] }} />
                  ) : (
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  )}
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <Modal open={!!lightboxImg} onClose={() => setLightboxImg(null)}
        aria-labelledby="review-image-lightbox">
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          outline: 'none', maxWidth: '90vw', maxHeight: '90vh',
        }}>
          <button onClick={() => setLightboxImg(null)}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100">
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
          {lightboxImg && (
            <img src={lightboxImg} alt=""
              className="max-w-[85vw] max-h-[85vh] rounded-xl object-contain bg-black/5" />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ProductReviewCard;