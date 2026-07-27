import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DealCard from "./DealCard";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import { Deal } from "../../../../types/dealTypes";

export default function DealSlider() {
    const {homePage}=useAppSelector(store=>store)
    const deals = homePage.homePageData?.deals ?? [];

const settings = {
    dots: true,
    infinite: deals.length > 6,          // sirf tab infinite jab enough deals ho
    slidesToShow: Math.min(6, deals.length || 1),
    slidesToScroll: 1,
    autoplay: deals.length > 1,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: Math.min(4, deals.length || 1),
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: Math.min(2, deals.length || 1),
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

    return (
        <div className="py-2">
            <div className="slide-container">
                <Slider {...settings}>
    {homePage.homePageData?.deals?.map((item: Deal, index) => (
        <div
            key={item.id || item.id || item.category?.id || index}
            className="px-2.5 deal-card-fixed"
        >
            <DealCard deal={item} />
        </div>
    ))}
</Slider>
            </div>
        </div>

    );
}