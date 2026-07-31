import React, { useRef, useState, useEffect } from 'react'
import ProductCard from '../ProductCard/ProductCard'
import { useAppSelector } from '../../../../Redux Toolkit/Store'
import { Product } from '../../../../types/productTypes'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { IconButton } from '@mui/material';

interface SmilarProductProps {
  categoryId?: string;
  currentProductId?: string;
  onAiChat?: (product: Product) => void;
}

const SmilarProduct = ({ categoryId, currentProductId, onAiChat }: SmilarProductProps) => {
  const { products } = useAppSelector((store) => store);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const similarProducts = products.products.filter(
    (item) => item.id !== currentProductId
  ).slice(0, 10);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [similarProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (similarProducts.length === 0) return null;

  return (
    <div className="relative">
      {canScrollLeft && (
        <IconButton onClick={() => scroll('left')}
          sx={{
            position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', width: 34, height: 34,
            '&:hover': { bgcolor: '#f8f8f8' }
          }}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      )}
      {canScrollRight && (
        <IconButton onClick={() => scroll('right')}
          sx={{
            position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', width: 34, height: 34,
            '&:hover': { bgcolor: '#f8f8f8' }
          }}>
          <KeyboardArrowRightIcon />
        </IconButton>
      )}
      <div ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {similarProducts.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[185px] sm:w-[210px]">
            <ProductCard item={item} viewMode="grid" onAiChat={onAiChat} />
          </div>
        ))}
      </div>
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default SmilarProduct;