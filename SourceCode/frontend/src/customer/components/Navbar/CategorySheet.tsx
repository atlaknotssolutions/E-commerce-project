import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAppSelector } from '../../../Redux Toolkit/Store'
import { Category } from '../../../types/categoryTypes'

interface CategorySheetProps {
    selectedCategory: string;
    toggleDrawer?: (open: boolean) => () => void;
    setShowSheet?: (show: boolean) => void;
}

const CategorySheet = ({ selectedCategory, toggleDrawer, setShowSheet }: CategorySheetProps) => {
    const navigate = useNavigate()
    const { categoryTree } = useAppSelector((store) => store.homePage)

    const selectedNode = categoryTree.find(
        (category) => category.categoryId === selectedCategory
    )

    const handleCategoryClick = (categoryId: string) => {
        if (toggleDrawer) toggleDrawer(false)()
        if (setShowSheet) setShowSheet(false)
        navigate("/products/" + categoryId)
    }

    return (
        <Box className='bg-white shadow-lg lg:h-[500px] overflow-y-auto'>
            <div className='flex text-sm flex-wrap'>
                {selectedNode?.children?.map((item: Category, index: number) => (
                    <div key={item._id} className={`p-8 lg:w-[20%] ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                        <p className='text-[#00927c] mb-5 font-semibold'>{item.name}</p>
                        <ul className='space-y-3'>
                            {item.children?.map((child: Category) => (
                                <li
                                    key={child._id}
                                    onClick={() => handleCategoryClick(child.categoryId)}
                                    className='hover:text-[#00927c] cursor-pointer'
                                >
                                    {child.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Box>
    )
}

export default CategorySheet
