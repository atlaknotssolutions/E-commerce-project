import React from 'react'
import { useNavigate } from 'react-router-dom'


const ElectronicCategoryCard = ({item}:any) => {
  const navigate=useNavigate();

  return (
    <div onClick={()=>navigate(`/products/${item.categoryId}`)} className='flex w-16 lg:w-[90px] flex-col items-center gap-2.5 cursor-pointer group transition-all duration-200 hover:-translate-y-0.5'>
        <div className='w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-[#00927c]/5 border border-gray-100 group-hover:border-[#00927c]/20 transition-all duration-300'>
          <img className='object-contain h-8 lg:h-10' src={item.image} alt={item.name} />
        </div>
        <h2 className='font-medium text-[11px] lg:text-xs text-gray-500 text-center group-hover:text-[#00927c] transition-colors leading-tight'>{item.name}</h2>
    </div>
  )
}

export default ElectronicCategoryCard