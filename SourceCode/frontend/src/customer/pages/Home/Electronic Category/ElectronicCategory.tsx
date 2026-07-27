import React from "react";
import ElectronicCategoryCard from "./ElectronicCategoryCard";
import { useMediaQuery } from "@mui/material";
import { useAppSelector } from "../../../../Redux Toolkit/Store";

const ElectronicCategory = () => {
  const {homePage}=useAppSelector(store=>store)
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const categories = homePage.homePageData?.electricCategories || [];
  return (
    <div className="flex flex-wrap justify-between py-6 lg:px-16 border-b border-gray-100/80">
      {categories
        .slice(0, isSmallScreen ? 5 : categories.length)
        .map((item) => (
          <ElectronicCategoryCard key={item.categoryId} item={item} />
        ))}
    </div>
  );
};

export default ElectronicCategory;
