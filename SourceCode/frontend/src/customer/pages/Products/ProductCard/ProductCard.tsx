import React, { useState, useEffect, MouseEvent, useMemo } from "react";
import "./ProductCard.css";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { IconButton, Rating, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Product } from "../../../../types/productTypes";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { addProductToWishlist } from "../../../../Redux Toolkit/Customer/WishlistSlice";
import { isWishlisted } from "../../../../util/isWishlisted";

interface ProductCardProps {
  item: Product;
  viewMode?: "grid" | "list";
  onAiChat?: (product: Product) => void;
}

const isTouchDevice = typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const ProductCard: React.FC<ProductCardProps> = ({ item, viewMode = "grid", onAiChat }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { wishlist } = useAppSelector((store) => store);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const images = useMemo(() => (item.images || []).filter((img) => img.url), [item.images]);
  const hasMultipleImages = images.length > 1;

  const primaryImage = images[0]?.url || "";

  const isFav = wishlist?.wishlist ? isWishlisted(wishlist.wishlist, item) : false;

  const handleAddWishlist = (event: MouseEvent) => {
    event.stopPropagation();
    if (item.id) dispatch(addProductToWishlist({ productId: item.id }));
  };

  const handleAiChat = (event: MouseEvent) => {
    event.stopPropagation();
    onAiChat?.(item);
  };

  const handleCardClick = () => {
    navigate(`/product-details/${item.category?.categoryId}/${item.title}/${item.id}`);
  };

  const discount = item.discountPercent || (item.mrpPrice > item.sellingPrice
    ? Math.round(((item.mrpPrice - item.sellingPrice) / item.mrpPrice) * 100) : 0);

  const isMultiVariant = item.variantCount != null && item.variantCount > 1
    && item.minPrice != null && item.maxPrice != null && item.minPrice !== item.maxPrice;

  // Carousel: cycle images every 2s while hovered
  useEffect(() => {
    if (!isHovered || !hasMultipleImages || isTouchDevice) {
      setActiveImageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovered, hasMultipleImages, images.length]);

  if (viewMode === "list") {
    return (
      <div onClick={handleCardClick} className="flex bg-white rounded-lg border overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-48 h-48 flex-shrink-0 bg-gray-50 relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <img className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            src={imageError ? primaryImage : (!isTouchDevice && isHovered && images[activeImageIndex]?.url ? images[activeImageIndex].url : primaryImage)}
            alt={item.title}
            onError={() => setImageError(true)} />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {item.brand && <p className="text-xs text-gray-400 uppercase tracking-wide">{item.brand}</p>}
            <p className="font-medium text-gray-800 line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Rating value={4} readOnly size="small" precision={0.5} />
              <span className="text-xs text-gray-400">({item.numRatings || 0})</span>
            </div>
            {item.seller?.businessDetails?.businessName && (
              <p className="text-xs text-gray-400 mt-1">by {item.seller.businessDetails.businessName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {isMultiVariant ? (
              <span className="font-bold text-gray-900">₹{item.minPrice} - ₹{item.maxPrice}</span>
            ) : (
              <>
                <span className="font-bold text-gray-900 text-lg">₹{item.sellingPrice}</span>
                {item.mrpPrice > item.sellingPrice && (
                  <span className="text-gray-400 line-through text-sm">₹{item.mrpPrice}</span>
                )}
                {discount > 0 && <span className="text-teal-600 font-semibold text-sm">{discount}% off</span>}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleCardClick}
      className="group bg-white rounded-lg border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-square bg-gray-50 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Image carousel stack */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          {hasMultipleImages ? (
            images.map((img, i) => (
              <img key={i}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: i === activeImageIndex ? 1 : 0 }}
                src={img.url} alt={item.title}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ))
          ) : (
            <img className="w-full h-full object-cover"
              src={primaryImage} alt={item.title}
              onError={() => setImageError(true)} />
          )}
        </div>

        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            {discount}% OFF
          </span>
        )}

        {/* Hover overlay */}
        <div className="product-card-hover-overlay">
          {/* Indicator dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, i) => (
                <span key={i}
                  className={`product-card-dot ${i === activeImageIndex ? "active" : "inactive"}`} />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="product-card-hover-btn product-card-hover-btn-delay-1">
              <Tooltip title={isFav ? "Remove from wishlist" : "Add to wishlist"} placement="top">
                <IconButton onClick={handleAddWishlist} size="small"
                  aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                    width: 38, height: 38, boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                    "&:hover": { bgcolor: "#fff", transform: "scale(1.12)" },
                    transition: "all 0.2s ease"
                  }}>
                  {isFav
                    ? <FavoriteIcon sx={{ color: "#e91e63", fontSize: 20 }} />
                    : <FavoriteBorderIcon sx={{ color: "#555", fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
            </div>
            <div className="product-card-hover-btn product-card-hover-btn-delay-2">
              <Tooltip title="Ask AI" placement="top">
                <button onClick={handleAiChat} aria-label="Ask AI about this product"
                  className="flex items-center justify-center w-[38px] h-[38px] rounded-full shadow-md transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: "#00927c", color: "white" }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {item.brand && <p className="text-xs text-gray-400 uppercase tracking-wide">{item.brand}</p>}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{item.title}</p>

        <div className="flex items-center gap-1">
          <Rating value={4} readOnly size="small" precision={0.5} />
          <span className="text-xs text-gray-400">({item.numRatings || 0})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isMultiVariant ? (
            <span className="font-bold text-gray-900">₹{item.minPrice} - ₹{item.maxPrice}</span>
          ) : (
            <>
              <span className="font-bold text-gray-900">₹{item.sellingPrice}</span>
              {item.mrpPrice > item.sellingPrice && (
                <span className="text-gray-400 line-through text-xs">₹{item.mrpPrice}</span>
              )}
              {discount > 0 && <span className="text-teal-600 font-semibold text-xs">{discount}% off</span>}
            </>
          )}
        </div>

        {item.seller?.businessDetails?.businessName && (
          <p className="text-xs text-gray-400 truncate">by {item.seller.businessDetails.businessName}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;