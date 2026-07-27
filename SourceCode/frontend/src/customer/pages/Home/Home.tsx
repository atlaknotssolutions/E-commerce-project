import React, { useEffect, useState } from 'react'
// import Banner from './Banner/Banner'
import HomeCategory from './HomeCategory/HomeCategory'
import TopBrand from './TopBrands/Grid'
import ElectronicCategory from './Electronic Category/ElectronicCategory'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Backdrop, Button, CircularProgress } from '@mui/material'
import ChatBot from '../ChatBot/ChatBot'
import { useNavigate } from 'react-router-dom'
import StorefrontIcon from '@mui/icons-material/Storefront';
import branding from '../../../Config/branding';
import
{
    useAppDispatch,
    useAppSelector,
} from '../../../Redux Toolkit/Store'
import { fetchCategoryTree } from '../../../Redux Toolkit/Customer/Customer/AsyncThunk'
import DealSlider from './Deals/Deals'



const Home = () =>
{
    const [showChatBot, setShowChatBot] = useState(false)
    const { homePage } = useAppSelector(store => store)
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleShowChatBot = () =>
    {
        setShowChatBot(!showChatBot)
    }
    const handleCloseChatBot = () =>
    {
        setShowChatBot(false)
    }
    const becomeSellerClick = () =>
    {
        navigate("/become-seller")
    }

    useEffect(() =>
    {
        dispatch(fetchCategoryTree());
    }, [dispatch]);
    return (
        <>
            {(!homePage.loading) ? <div className='space-y-6 lg:space-y-10 relative'>
                {homePage.homePageData?.electricCategories && <ElectronicCategory />}

                {homePage.homePageData?.grid && <section className='px-5 lg:px-16'>
                    <TopBrand />
                </section>}

                {homePage.homePageData?.deals && <section className='pt-6 px-5 lg:px-16'>
                    <h1 className='section-heading text-center w-full mb-8 lg:mb-12'>Today's Deals</h1>
                    <DealSlider />
                </section>}

                {homePage.homePageData?.shopByCategories && <section className='flex flex-col justify-center items-center py-14 px-5 lg:px-16'>
                    <h1 className='section-heading text-center mb-8 lg:mb-14'>Shop by Category</h1>
                    <HomeCategory />
                </section>}

                <div className="py-12 lg:py-14">
                    <section className="relative mx-5 my-8 lg:mx-16 lg:my-16 overflow-hidden rounded-2xl h-[220px] lg:h-[465px] shadow-xl">

                        <img
                            src="/seller_banner_image.png"
                            alt="Become a Seller"
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(90deg, rgba(0,80,70,0.75) 0%, rgba(0,80,70,0.45) 40%, rgba(0,80,70,0.15) 70%, rgba(255,255,255,0) 100%)',
                            }}
                        />

                        <div className="relative z-1000 flex h-full items-center px-7 lg:px-20">
                            <div className="max-w-xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={branding.logoUrlTransparent}
                                        alt={branding.appName}
                                        className="h-10 lg:h-14 w-auto object-contain"
                                    />
                                </div>

                                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                                    Start Selling on AI Kart
                                </h2>

                                <p className="mt-3 max-w-lg text-sm md:text-base text-white/85 leading-relaxed">
                                    Reach thousands of customers, manage your products, and grow your business with powerful seller tools.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Button
                                        onClick={becomeSellerClick}
                                        startIcon={<StorefrontIcon />}
                                        variant="contained"
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "10px",
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            px: 4,
                                            py: 1.2,
                                            background: "linear-gradient(135deg,#00C896,#00A884)",
                                            boxShadow: "0 6px 24px rgba(0,200,150,0.35)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg,#00B388,#009E76)",
                                                boxShadow: "0 8px 28px rgba(0,200,150,0.45)",
                                            },
                                        }}
                                    >
                                        Start Selling
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className='fixed bottom-10 right-10 z-50'>
                    {showChatBot ? <ChatBot handleClose={handleCloseChatBot} /> : <Button
                        onClick={handleShowChatBot}
                        sx={{
                            borderRadius: "50%",
                            minWidth: '54px',
                            minHeight: '54px',
                            backgroundColor: '#00927c',
                            boxShadow: '0 4px 20px rgba(0,146,124,0.35)',
                            '&:hover': { backgroundColor: '#007a6a', boxShadow: '0 6px 24px rgba(0,146,124,0.45)' }
                        }}
                        variant='contained'
                    >
                        <ChatBubbleIcon sx={{ color: "white", fontSize: "1.6rem" }} />
                    </Button>}
                </section>

            </div> : <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <CircularProgress color="inherit" />
                <p className="text-gray-400 text-sm">Loading amazing products for you...</p>
            </div>}
        </>
    )
}

export default Home