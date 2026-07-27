import React from "react";
import { useAppSelector } from "../../../../Redux Toolkit/Store";

const TopBrand = () => {
  const {homePage}=useAppSelector(store=>store)
  return (
    <div className="grid gap-3 grid-rows-12 grid-cols-12 lg:h-[600px]">
      <div className="col-span-3 row-span-12 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[0].image}
          alt=""
        />
      </div>

      <div className="col-span-2 row-span-6 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[1].image}
          alt=""
        />
      </div>

      <div className="col-span-4 row-span-6 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[2].image}
          alt=""
        />
      </div>

      <div className="col-span-3 row-span-12 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[3].image}
          alt=""
        />
      </div>

      <div className="col-span-4 row-span-6 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[4].image}
          alt=""
        />
      </div>
      <div className="col-span-2 row-span-6 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <img
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          src={homePage.homePageData?.grid[5].image}
          alt=""
        />
      </div>
    </div>
  );
};

export default TopBrand;
