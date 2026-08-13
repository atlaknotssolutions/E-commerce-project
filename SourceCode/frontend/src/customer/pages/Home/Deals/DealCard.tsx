import React from 'react'
import { Deal } from '../../../../types/dealTypes'
import { useNavigate } from 'react-router-dom'

const DealCard = ({deal}:{deal:Deal}) => {
  const navigate=useNavigate();
  const category = deal.category;
  if (!category) {
    // Null-safe fallback for deals whose category reference is missing.
    // Without a category there is no image, label or destination link, so the
    // card renders a neutral placeholder instead of throwing.
    return (
      <div className='deal-card-fixed w-full cursor-default group rounded-xl overflow-hidden border border-gray-100 bg-white'>
        <div className='relative overflow-hidden h-[180px] lg:h-[200px] bg-gray-100 flex items-center justify-center'>
          <div className='text-gray-400 text-4xl font-bold'>{deal.discount}%</div>
        </div>
        <div className='flex-1 flex flex-col justify-between p-3.5'>
          <p className='line-clamp-2 text-[13px] font-semibold text-gray-800 capitalize leading-snug min-h-[36px]'>
            Special Offer
          </p>
          <span className='mt-2 text-[11px] font-semibold text-[#00927c] uppercase tracking-wider'>
            Shop Now →
          </span>
        </div>
      </div>
    )
  }
  return (
    <div
      onClick={()=>navigate(`/products/${category.categoryId}`)}
      className='deal-card-fixed w-full cursor-pointer group rounded-xl overflow-hidden border border-gray-100 bg-white'
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
        <div className='relative overflow-hidden h-[180px] lg:h-[200px]'>
          <img
            className='w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500'
            src={category.image}
            alt={category.categoryId}
          />
          <div className='absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md'>
            {deal.discount}% OFF
          </div>
        </div>
        <div className='flex-1 flex flex-col justify-between p-3.5'>
          <p className='line-clamp-2 text-[13px] font-semibold text-gray-800 capitalize leading-snug min-h-[36px]'>
            {category.categoryId.split("_").join(" ")}
          </p>
          <span className='mt-2 text-[11px] font-semibold text-[#00927c] uppercase tracking-wider'>
            Shop Now →
          </span>
        </div>
    </div>
  )
}

export default DealCard