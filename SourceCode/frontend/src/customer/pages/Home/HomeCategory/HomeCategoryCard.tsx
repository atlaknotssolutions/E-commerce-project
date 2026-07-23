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
            className="flex flex-col items-center gap-3 cursor-pointer group"
        >
            <div className="custom-border w-[150px] lg:w-[249px] h-[150px] lg:h-[249px] rounded-full bg-teal-400 overflow-hidden">
                <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="object-cover object-top w-full h-full transition-transform duration-700 group-hover:scale-95"
                />
            </div>

            <h1 className="font-medium text-center">
                {item.name}
            </h1>
        </div>
    );
};

export default HomeCategoryCard;
