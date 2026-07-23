import React from 'react'
import HomeCategoryCard from './HomeCategoryCard'
import { useAppSelector } from '../../../../Redux Toolkit/Store';

const HomeCategory = () => {
  const { homePage } = useAppSelector((store) => store);

  return (
    <div className='flex justify-center gap-7 flex-wrap'>
      {homePage.homePageData?.shopByCategories.map((item) => (
        <HomeCategoryCard
          key={item.id ?? item.categoryId}
          item={item}
        />
      ))}
    </div>
  )
}

export default HomeCategory