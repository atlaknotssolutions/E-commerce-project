import React from "react";
import "./HomeCategoryCard.css";
import { useNavigate } from "react-router-dom";

interface Props {
    item: {
        name: string;
        categoryId: string;
        image?: string;
    };
}

const FALLBACK_IMAGE =
    "https://via.placeholder.com/250?text=Category";

const HomeCategoryCard = ({ item }: Props) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/products/${item.categoryId}`)}
            className="flex flex-col items-center gap-4 cursor-pointer group"
        >
            <div className="custom-border w-[140px] lg:w-[220px] h-[140px] lg:h-[220px] rounded-full bg-gray-100 overflow-hidden">
                <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            <h2 className="font-semibold text-[13px] lg:text-sm text-gray-600 text-center group-hover:text-[#00927c] transition-colors duration-200 tracking-wide">
                {item.name}
            </h2>
        </div>
    );
};

export default HomeCategoryCard;
