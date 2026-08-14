import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button, Chip, Divider, IconButton, Tooltip, Skeleton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Wallet } from '@mui/icons-material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShareIcon from '@mui/icons-material/Share';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

import SmilarProduct from '../SimilarProduct/SmilarProduct';
import ChatBot from '../../ChatBot/ChatBot';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, getAllProducts } from '../../../../Redux Toolkit/Customer/ProductSlice';
import { addItemToCart } from '../../../../Redux Toolkit/Customer/CartSlice';
import { addProductToWishlist } from '../../../../Redux Toolkit/Customer/WishlistSlice';
import { fetchCustomerCoupons } from '../../../../Redux Toolkit/Customer/CouponSlice';
import ProductReviewCard from '../../Review/ProductReviewCard';
import { fetchReviewsByProductId } from '../../../../Redux Toolkit/Customer/ReviewSlice';
import { computeReviewStatistics } from '../../../../util/reviewStatistics';
import { normalizeSizes } from '../../../../util/normalizeSizes';
import VariantSelector from '../../../components/VariantSelector';
import { ProductImage, Product } from '../../../../types/productTypes';
import { isAuthenticated, requireAuthentication } from '../../../../util/requireAuth';
import { notification } from '../../../../services/notificationService';

const ProductDetails = () => {
  const dispatch = useAppDispatch();
  const { products, review, wishlist, coupone } = useAppSelector(store => store)
  const navigate = useNavigate()
  const location = useLocation()
  const { productId, categoryId } = useParams<{
    productId: string;
    categoryId: string;
  }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [imageZoomPos, setImageZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [galleryHovered, setGalleryHovered] = useState(false);
  const galleryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const [selectedAiProduct, setSelectedAiProduct] = useState<Product | null>(null);

  const handleOpenAIAssistant = useCallback((product: Product) => {
    setSelectedAiProduct(product);
    setShowChatBot(true);
  }, []);

  const product = products.product;
  const pageLoading = products.loading && (!product || product.id !== productId);
  const pageError = products.error;
  const variants = useMemo(() => product?.variants || [], [product]);
  const supportedAttributes = product?.category?.supportedAttributes || [];
  const variantAttrs = supportedAttributes.filter(
    (a) => a.active !== false && a.variantAttribute
  );
  const hasDynamicSystem = variantAttrs.length > 0;

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find((v) => {
      if (!v.isActive) return false;
      const attrs = v.attributes;
      if (hasDynamicSystem) {
        const dynamic = attrs.dynamic || [];
        return variantAttrs.every((attrDef) => {
          const selectedVal = selectedAttributes[attrDef.code] || selectedAttributes[attrDef.name];
          if (!selectedVal) return true;
          const variantVal = dynamic.find((d) => d.name === attrDef.code)?.value;
          return variantVal === selectedVal;
        });
      }
      return (
        (!selectedAttributes.color || attrs.color === selectedAttributes.color) &&
        (!selectedAttributes.size || attrs.size === selectedAttributes.size) &&
        (!selectedAttributes.storage || attrs.storage === selectedAttributes.storage) &&
        (!selectedAttributes.ram || attrs.ram === selectedAttributes.ram)
      );
    }) || null;
  }, [variants, selectedAttributes, hasDynamicSystem, variantAttrs]);

  useEffect(() => { setQuantity(1); }, [selectedVariant]);

  const effectivePrice = selectedVariant
    ? { selling: selectedVariant.price, mrp: selectedVariant.mrpPrice, discount: selectedVariant.discountPercent || 0 }
    : { selling: product?.sellingPrice || 0, mrp: product?.mrpPrice || 0, discount: product?.discountPercent || 0 };

  const effectiveImages: ProductImage[] = useMemo(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) return selectedVariant.images;
    return product?.images || [];
  }, [selectedVariant, product]);

  const effectiveStock = selectedVariant ? selectedVariant.quantity : (product?.quantity || 0);
  const hasSelectedAttributes = Object.values(selectedAttributes).some((v) => v && v.length > 0);

  const deriveCartSize = (): string => {
    if (!selectedVariant) return "FREE";
    const attrs = selectedVariant.attributes;
    if (hasDynamicSystem) {
      const dynamic = attrs.dynamic || [];
      if (dynamic.length > 0) return dynamic.map((d) => d.value).filter(Boolean).join(" / ") || "DEFAULT";
      return "DEFAULT";
    }
    return attrs.size || attrs.color || "FREE";
  };

  const primaryImageIndex = useMemo(() => {
    const primaryIdx = effectiveImages.findIndex((img) => img.isPrimary);
    return primaryIdx >= 0 ? primaryIdx : 0;
  }, [effectiveImages]);

  const reviewStats = useMemo(() => computeReviewStatistics(review.reviews), [review.reviews]);

  const isFav = wishlist.wishlist?.products?.some((p: any) => p.id === productId) || false;

  const isTouchDevice = typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId))
      dispatch(fetchReviewsByProductId({ productId }))
    }
  }, [dispatch, productId]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedAttributes({});
    setActiveTab('description');
    setCopiedCoupon(null);
    setIsZoomed(false);
    setGalleryHovered(false);
  }, [productId]);

  useEffect(() => {
    dispatch(getAllProducts({ category: categoryId }));
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    if (!coupone.customerCouponsLoaded) {
      dispatch(fetchCustomerCoupons());
    }
  }, [dispatch, coupone.customerCouponsLoaded]);

  // Auto-advance gallery
  useEffect(() => {
    if (!galleryHovered || isZoomed || effectiveImages.length <= 1 || isTouchDevice) return;
    galleryTimerRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % effectiveImages.length);
    }, 3000);
    return () => { if (galleryTimerRef.current) clearInterval(galleryTimerRef.current); };
  }, [galleryHovered, isZoomed, effectiveImages.length, isTouchDevice]);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 450);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAttributeSelect = (key: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));
    setSelectedImage(primaryImageIndex);
  };

  const handleAddCart = () => {
    const loginPath = requireAuthentication("Please login to add items to cart");
    if (loginPath) {
      navigate(loginPath, { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    dispatch(addItemToCart({
      jwt: localStorage.getItem('jwt'),
      request: { productId, variantId: selectedVariant?.id || undefined, size: deriveCartSize(), quantity }
    }));
  };

  const handleBuyNow = async () => {
    const loginPath = requireAuthentication("Please login to continue to checkout");
    if (loginPath) {
      navigate(loginPath, { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    try {
      await dispatch(addItemToCart({
        jwt: localStorage.getItem('jwt'),
        request: { productId, variantId: selectedVariant?.id || undefined, size: deriveCartSize(), quantity }
      })).unwrap();
      navigate('/checkout/address');
    } catch {
      notification.error("Could not add item to cart. Please try again.");
    }
  };

  const handleAddWishlist = () => {
    const loginPath = requireAuthentication("Please login to add items to wishlist");
    if (loginPath) {
      navigate(loginPath, { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    if (productId) dispatch(addProductToWishlist({ productId }));
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2000);
    });
  };

  const handleShare = async () => {
    const shareData = { title: product?.title || 'Check out this product', url: window.location.href };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed the native share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      notification.success("Link copied to clipboard");
    } catch {
      notification.error("Could not copy the link");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImageZoomPos({ x, y });
  };

  // Format description: support bullets, line breaks
  const formatDescription = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(Boolean);
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
          const isNumbered = /^\d+[.)]/.test(trimmed);
          const isBold = trimmed.endsWith(':') && trimmed.length < 40;
          if (isBullet) {
            return <p key={idx} className="text-gray-600 text-sm flex items-start gap-2">
              <span className="text-teal-600 mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
              <span>{trimmed.replace(/^[•\-*]\s*/, '')}</span>
            </p>;
          }
          if (isNumbered) {
            const match = trimmed.match(/^(\d+[.)])\s*(.*)/);
            return <p key={idx} className="text-gray-600 text-sm flex items-start gap-2">
              <span className="text-teal-600 font-medium min-w-[20px]">{match?.[1]}</span>
              <span>{match?.[2] || trimmed}</span>
            </p>;
          }
          if (isBold) {
            return <p key={idx} className="font-semibold text-gray-800 text-sm mt-2">{trimmed}</p>;
          }
          return <p key={idx} className="text-gray-600 text-sm leading-relaxed">{trimmed}</p>;
        })}
      </div>
    );
  };

  // Build specs table
  const specRows = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    if (product?.brand) rows.push({ label: 'Brand', value: product.brand });
    if (product?.color) rows.push({ label: 'Color', value: product.color });
    if (product?.category?.name) rows.push({ label: 'Category', value: product.category.name });
    if (product?.seller?.businessDetails?.businessName) rows.push({ label: 'Seller', value: product.seller.businessDetails.businessName });
    if (selectedVariant?.sku) rows.push({ label: 'SKU', value: selectedVariant.sku });
    if (selectedVariant?.weight) rows.push({ label: 'Weight', value: `${selectedVariant.weight}g` });
    if (effectiveStock > 0) rows.push({ label: 'Stock', value: `${effectiveStock} units` });
    const normalizedSizes = normalizeSizes(product?.sizes);
    if (normalizedSizes.length > 0) rows.push({ label: 'Available Sizes', value: normalizedSizes.join(', ') });
    return rows;
  }, [product, selectedVariant, effectiveStock]);

  const TABS = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'returns', label: 'Returns' },
  ];

  const trustItems = [
    { icon: <ShieldIcon sx={{ color: '#00927c', fontSize: 22 }} />, label: 'Secure Payment', sub: 'SSL encrypted checkout' },
    { icon: <LocalShippingIcon sx={{ color: '#00927c', fontSize: 22 }} />, label: 'Free Shipping', sub: 'On orders above ₹1500' },
    { icon: <AssignmentReturnIcon sx={{ color: '#00927c', fontSize: 22 }} />, label: 'Easy Returns', sub: 'Return within 7 days' },
    { icon: <WorkspacePremiumIcon sx={{ color: '#00927c', fontSize: 22 }} />, label: 'Genuine Product', sub: '100% authentic' },
    { icon: <Wallet sx={{ color: '#00927c', fontSize: 22 }} />, label: 'EMI Available', sub: 'No cost EMI options' },
  ];

  if (pageLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-20">
        <Skeleton width={200} height={20} className="mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton variant="rectangular" className="w-full aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton width="30%" height={20} />
            <Skeleton width="90%" height={32} />
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={48} className="mt-4" />
            <Skeleton width="100%" height={80} className="mt-4" />
            <Skeleton width="100%" height={120} className="mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">Failed to load product</p>
          <p className="text-gray-400 mt-2">{pageError}</p>
          <button onClick={() => productId && dispatch(fetchProductById(productId))}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const purchaseArea = (
    <>
      {/* Quantity */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quantity</p>
        <div className="flex items-center gap-0 border border-gray-300 rounded-lg w-fit overflow-hidden">
          <button disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-300">
            <RemoveIcon fontSize="small" />
          </button>
          <span className="w-12 text-center font-semibold text-gray-800 text-sm">{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(Math.max(effectiveStock, 1), q + 1))}
            disabled={quantity >= effectiveStock}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-300">
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        {effectiveStock <= 0 ? (
          <Button disabled sx={{ py: "0.9rem", fontSize: "0.9rem", borderRadius: "10px" }} variant='contained' fullWidth>
            Out of Stock
          </Button>
        ) : (
          <Button onClick={handleAddCart}
            disabled={hasSelectedAttributes && !selectedVariant}
            sx={{ py: "0.9rem", fontSize: "0.9rem", borderRadius: "10px", bgcolor: "#00927c", "&:hover": { bgcolor: "#007a6a" } }}
            variant='contained' fullWidth startIcon={<AddShoppingCartIcon />}>
            Add to Cart
          </Button>
        )}
        {effectiveStock > 0 && (
          <Button onClick={handleBuyNow}
            disabled={hasSelectedAttributes && !selectedVariant}
            sx={{ py: "0.9rem", fontSize: "0.9rem", borderRadius: "10px", borderColor: "#00927c", color: "#00927c", "&:hover": { borderColor: "#007a6a", bgcolor: "#f0fdfa" } }}
            variant='outlined' fullWidth>
            Buy Now
          </Button>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-3 mt-3">
        <button onClick={handleAddWishlist}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${isFav ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
          {isFav ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
          {isFav ? 'Wishlisted' : 'Wishlist'}
        </button>
        <button onClick={() => handleOpenAIAssistant(product)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors">
          <AutoAwesomeIcon sx={{ fontSize: 16, color: '#00927c' }} />
          Ask AI
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 text-xs text-gray-400 flex items-center gap-1.5">
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate('/')}>Home</span>
          {product?.category?.name && (
            <>
              <span>/</span>
              <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate(`/products/${product.category?.categoryId}`)}>{product.category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Hero section: Gallery + Product Info */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* ===== LEFT: GALLERY ===== */}
            <div className="p-4 lg:p-6 lg:border-r border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Thumbnails */}
                <div className="flex lg:flex-col gap-2 order-last lg:order-first mt-3 lg:mt-0">
                  {effectiveImages.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)}
                      onMouseEnter={() => { if (!isTouchDevice) setSelectedImage(idx); }}
                      className={`w-14 h-14 lg:w-16 lg:h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all duration-200 ${selectedImage === idx ? 'border-teal-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <img className="w-full h-full object-cover" src={img.url} alt="" />
                    </button>
                  ))}
                </div>

                {/* Main image with zoom */}
                <div className="flex-1 relative"
                  onMouseEnter={() => { setGalleryHovered(true); setIsZoomed(true); }}
                  onMouseLeave={() => { setGalleryHovered(false); setIsZoomed(false); setImageZoomPos({ x: 50, y: 50 }); }}
                  onMouseMove={handleMouseMove}>
                  <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden cursor-crosshair">
                    <img className="w-full h-full object-cover transition-opacity duration-400"
                      src={effectiveImages[selectedImage]?.url || ''} alt={product.title}
                      style={{
                        transform: isZoomed && !isTouchDevice ? 'scale(1.8)' : 'scale(1)',
                        transformOrigin: `${imageZoomPos.x}% ${imageZoomPos.y}%`,
                        transition: isZoomed ? 'none' : 'transform 0.3s ease, opacity 0.4s ease',
                      }} />
                    {/* Badges */}
                    {effectivePrice.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                        {effectivePrice.discount}% OFF
                      </span>
                    )}
                    {effectiveStock > 0 && effectiveStock <= 10 && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                        Only {effectiveStock} left
                      </span>
                    )}
                    {/* Dots for multiple images */}
                    {effectiveImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {effectiveImages.map((_, idx) => (
                          <button key={idx} onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === selectedImage ? 'bg-teal-500 w-4' : 'bg-white/70 hover:bg-white'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== RIGHT: PRODUCT INFO ===== */}
            <div className="p-4 lg:p-6 flex flex-col">
              {/* Brand */}
              {product?.brand && (
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">{product.brand}</p>
              )}

              {/* Title */}
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-snug">{product.title}</h1>

              {/* Seller */}
              {product?.seller?.businessDetails?.businessName && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">Sold by</span>
                  <span className="text-xs font-medium text-gray-700">{product.seller.businessDetails.businessName}</span>
                  <VerifiedIcon sx={{ fontSize: 14, color: '#00927c' }} />
                </div>
              )}

              {/* Rating Row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md">
                  <span className="text-sm font-bold text-teal-700">{reviewStats.averageRating || '—'}</span>
                  <StarIcon sx={{ color: '#00927c', fontSize: 16 }} />
                </div>
                <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                <span className="text-xs text-gray-500">{reviewStats.totalReviews} Ratings</span>
                {reviewStats.totalReviews > 0 && typeof product.numRatings === 'number' && product.numRatings > 0 && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                    <span className="text-xs text-gray-500">Sold {product.numRatings}+</span>
                  </>
                )}
                {/* Icons */}
                <div className="flex items-center gap-1 ml-auto">
                  <Tooltip title="Share">
                    <IconButton size="small" onClick={handleShare}><ShareIcon sx={{ fontSize: 18, color: '#666' }} /></IconButton>
                  </Tooltip>
                  <Tooltip title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                    <IconButton size="small" onClick={handleAddWishlist}>
                      {isFav ? <FavoriteIcon sx={{ fontSize: 18, color: '#e91e63' }} /> : <FavoriteBorderIcon sx={{ fontSize: 18, color: '#666' }} />}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Seller Card */}
              {/* {product?.seller?.businessDetails?.businessName && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <StorefrontIcon sx={{ color: '#00927c', fontSize: 20 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.seller.businessDetails.businessName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <VerifiedIcon sx={{ fontSize: 12, color: '#00927c' }} />
                      <span>Verified Seller</span>
                    </div>
                  </div>
                  <button className="text-xs text-teal-600 font-medium hover:underline flex-shrink-0">Visit Store →</button>
                </div>
              )} */}

              {/* Delivery */}
              <div className="mb-4 mt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Delivery</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <LocalShippingIcon sx={{ fontSize: 16 }} />
                  <span>Delivery options and charges are shown at checkout.</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">₹{effectivePrice.selling}</span>
                <span className="text-lg text-gray-400 line-through">₹{effectivePrice.mrp}</span>
                {effectivePrice.discount > 0 && (
                  <span className="bg-red-50 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded">{effectivePrice.discount}% OFF</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes • Free Shipping above ₹1500</p>

              <Divider className="my-4" />

              {/* Coupons */}
              {coupone.availableCoupons && coupone.availableCoupons.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <LocalOfferIcon sx={{ color: '#00927c', fontSize: 16 }} />
                    <span className="text-sm font-semibold text-gray-800">Available Coupons</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {coupone.availableCoupons.slice(0, 3).map((coupon) => (
                      <div key={coupon._id}
                        className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl px-3 py-2.5 min-w-[180px] flex-1 max-w-[220px] shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-teal-700 text-xs bg-teal-100 px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                          <button onClick={() => handleCopyCoupon(coupon.code)}
                            className="text-teal-600 hover:text-teal-700 transition-colors">
                            {copiedCoupon === coupon.code
                              ? <CheckCircleIcon sx={{ fontSize: 16 }} />
                              : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountPercentage}% OFF` : `₹${coupon.discountValue} OFF`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Min. ₹{coupon.minimumOrderValue}</p>
                      </div>
                    ))}
                  </div>
                  {coupone.availableCoupons.length > 3 && (
                    <p className="text-xs text-teal-600 cursor-pointer hover:underline mt-1"
                      onClick={() => navigate('/account/coupons')}>
                      +{coupone.availableCoupons.length - 3} more coupons
                    </p>
                  )}
                </div>
              )}

              {/* Variant Selector */}
              <div className="mb-4">
                <VariantSelector
                  variants={variants}
                  selectedAttributes={selectedAttributes}
                  onAttributeSelect={handleAttributeSelect}
                  supportedAttributes={supportedAttributes}
                />
                {hasSelectedAttributes && !selectedVariant && (
                  <Chip label="This combination is not available. Please try another."
                    color="warning" variant="outlined" sx={{ mt: 1, fontSize: '0.75rem' }} />
                )}
                {selectedVariant && selectedVariant.sku && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Chip size="small" label={`SKU: ${selectedVariant.sku}`} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    {effectiveStock > 0 && effectiveStock <= 10 ? (
                      <Chip size="small" label={`Only ${effectiveStock} left`} color="warning" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ) : effectiveStock > 10 ? (
                      <Chip size="small" label="In Stock" color="success" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ) : effectiveStock <= 0 && (
                      <Chip size="small" label="Out of Stock" color="error" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    )}
                  </div>
                )}
              </div>

              {/* Trust Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {trustItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchase Actions (desktop) */}
              <div className="hidden lg:block mt-auto pt-4 border-t border-gray-100">
                {purchaseArea}
              </div>
            </div>
          </div>
        </div>

        {/* ===== DESCRIPTION + TABS ===== */}
        <div className="bg-white rounded-2xl border shadow-sm mt-6 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.key ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tab.label}
                  {activeTab === tab.key && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {activeTab === 'description' && (
              product?.description ? formatDescription(product.description) : <p className="text-gray-400 text-sm">No description available.</p>
            )}
            {activeTab === 'specifications' && (
              specRows.length > 0 ? (
                <div className="max-w-2xl">
                  <table className="w-full text-sm">
                    <tbody>
                      {specRows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2.5 px-4 text-gray-500 font-medium w-1/3 border-b border-gray-100">{row.label}</td>
                          <td className="py-2.5 px-4 text-gray-800 border-b border-gray-100">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-gray-400 text-sm">No specifications available.</p>
            )}
            {activeTab === 'shipping' && (
              <div className="space-y-2 text-sm text-gray-600">
                <p>🚚 Free shipping on orders above ₹1500.</p>
                <p>📦 Standard delivery: 3–5 business days.</p>
                <p>⚡ Express delivery available at checkout.</p>
                <p>📍 Track your order from your account dashboard.</p>
              </div>
            )}
            {activeTab === 'returns' && (
              <div className="space-y-2 text-sm text-gray-600">
                <p>🔄 Easy returns within 7 days of delivery.</p>
                <p>✅ Items must be unused and in original packaging.</p>
                <p>💰 Refund processed within 5–7 business days.</p>
                <p>🆓 Free pickup for eligible returns.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== REVIEWS ===== */}
        <div className="bg-white rounded-2xl border shadow-sm mt-6 overflow-hidden p-5 lg:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Ratings & Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
                <div className="text-5xl font-bold text-gray-900">{reviewStats.averageRating || '—'}</div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.round(reviewStats.averageRating || 0)
                        ? <StarIcon sx={{ color: '#00927c', fontSize: 22 }} />
                        : <StarBorderIcon sx={{ color: '#00927c', fontSize: 22 }} />}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{reviewStats.totalReviews} Ratings</p>
                <Divider className="my-4" />
                <div className="space-y-2">
                  {reviewStats.ratingDistribution?.map((bucket) => (
                    <div key={bucket.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-right text-gray-500">{bucket.label}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all"
                          style={{ width: `${bucket.percentage}%` }} />
                      </div>
                      <span className="w-8 text-left text-gray-400">{bucket.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {review.reviews.length > 0 ? (
                review.reviews.slice(0, 3).map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <ProductReviewCard item={item} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
                </div>
              )}
              {review.reviews.length > 3 && (
                <button onClick={() => navigate(`/reviews/${productId}`)}
                  className="text-sm text-teal-600 font-medium hover:underline mt-2">
                  View all {review.reviews.length} reviews →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===== SIMILAR PRODUCTS ===== */}
        <div className="bg-white rounded-2xl border shadow-sm mt-6 overflow-hidden p-5 lg:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Similar Products</h2>
          <SmilarProduct categoryId={categoryId} currentProductId={productId} onAiChat={handleOpenAIAssistant} />
        </div>
      </div>

      {/* ===== STICKY PURCHASE BAR (Desktop) ===== */}
      <div className={`hidden lg:block fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img className="w-12 h-12 rounded-lg object-cover border border-gray-200" src={effectiveImages[selectedImage]?.url || ''} alt="" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900">₹{effectivePrice.selling}</span>
                <span className="text-xs text-gray-400 line-through">₹{effectivePrice.mrp}</span>
                {effectivePrice.discount > 0 && <span className="text-xs text-red-500 font-semibold">{effectivePrice.discount}% off</span>}
              </div>
              <p className="text-xs text-gray-400 truncate max-w-[250px]">{product.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden">
              <button disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 border-r border-gray-300">
                <RemoveIcon fontSize="small" />
              </button>
              <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(Math.max(effectiveStock, 1), q + 1))}
                disabled={quantity >= effectiveStock}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-300">
                <AddIcon fontSize="small" />
              </button>
            </div>
            {effectiveStock <= 0 ? (
              <Button disabled sx={{ py: "0.6rem", px: "2rem", borderRadius: "10px", fontSize: "0.85rem" }} variant='contained'>
                Out of Stock
              </Button>
            ) : (
              <>
                <Button onClick={handleAddCart}
                  disabled={hasSelectedAttributes && !selectedVariant}
                  sx={{ py: "0.6rem", px: "1.5rem", borderRadius: "10px", bgcolor: "#00927c", "&:hover": { bgcolor: "#007a6a" }, fontSize: "0.85rem" }}
                  variant='contained' startIcon={<AddShoppingCartIcon />}>
                  Add to Cart
                </Button>
                <Button onClick={handleBuyNow}
                  disabled={hasSelectedAttributes && !selectedVariant}
                  sx={{ py: "0.6rem", px: "1.5rem", borderRadius: "10px", borderColor: "#00927c", color: "#00927c", "&:hover": { borderColor: "#007a6a", bgcolor: "#f0fdfa" }, fontSize: "0.85rem" }}
                  variant='outlined'>
                  Buy Now
                </Button>
              </>
            )}
            <IconButton onClick={handleAddWishlist} size="small"
              sx={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: 38, height: 38 }}>
              {isFav ? <FavoriteIcon sx={{ color: '#e91e63', fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ color: '#666', fontSize: 18 }} />}
            </IconButton>
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-lg">₹{effectivePrice.selling}</span>
              <span className="text-xs text-gray-400 line-through">₹{effectivePrice.mrp}</span>
              {effectivePrice.discount > 0 && <span className="text-xs text-red-500 font-semibold">{effectivePrice.discount}% off</span>}
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-[260px]">{product.title}</p>
          </div>
          <IconButton onClick={handleAddWishlist} size="small" sx={{ border: '1px solid #e5e7eb', borderRadius: '10px', width: 40, height: 40, flexShrink: 0 }}>
            {isFav ? <FavoriteIcon sx={{ color: '#e91e63', fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />}
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          {effectiveStock <= 0 ? (
            <Button disabled sx={{ py: "0.7rem", borderRadius: "10px", fontSize: "0.85rem", flex: 1 }} variant='contained'>
              Sold Out
            </Button>
          ) : (
            <>
              <Button onClick={handleAddCart}
                disabled={hasSelectedAttributes && !selectedVariant}
                sx={{ py: "0.7rem", borderRadius: "10px", bgcolor: "#00927c", "&:hover": { bgcolor: "#007a6a" }, fontSize: "0.85rem", flex: 1, whiteSpace: "nowrap" }}
                variant='contained' startIcon={<AddShoppingCartIcon />}>
                Add to Cart
              </Button>
              <Button onClick={handleBuyNow}
                disabled={hasSelectedAttributes && !selectedVariant}
                sx={{ py: "0.7rem", borderRadius: "10px", borderColor: "#00927c", color: "#00927c", "&:hover": { borderColor: "#007a6a", bgcolor: "#f0fdfa" }, fontSize: "0.85rem", flex: 1, whiteSpace: "nowrap" }}
                variant='outlined'>
                Buy Now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Shopping Assistant */}
      <section className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        {showChatBot ? (
          <ChatBot handleClose={() => { setShowChatBot(false); setSelectedAiProduct(null); }} productId={selectedAiProduct?.id} />
        ) : (
          <button onClick={() => { setShowChatBot(true); setSelectedAiProduct(null); }}
            aria-label="Open AI Shopping Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center">
            <ChatBubbleIcon sx={{ fontSize: "1.6rem" }} />
          </button>
        )}
      </section>

      {/* Spacer for fixed bars */}
      <div className="h-20 lg:h-16" />
    </div>
  );
};

export default ProductDetails;