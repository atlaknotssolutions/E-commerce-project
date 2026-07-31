import
  {
    Avatar,
    Badge,
    Box,
    Button,
    Drawer,
    IconButton,
    useMediaQuery,
    useTheme,
  } from "@mui/material";
import React, { useState } from "react";
import "./Navbar.css";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MenuIcon from "@mui/icons-material/Menu";
import { mainCategory } from "../../../data/category/mainCategory";
import CategorySheet from "./CategorySheet";
import DrawerList from "./DrawerList";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import SearchBar from "./SearchBar";
import { FavoriteBorder } from "@mui/icons-material";
import { getAccountRoute } from "../../../util/roleRoutes";
import branding from "../../../Config/branding";


const Navbar = () =>
{
  const [showSheet, setShowSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("men");
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const { user, cart, sellers, wishlist } = useAppSelector((store) => store);
  const navigate = useNavigate();


  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () =>
  {
    setOpen(newOpen);
  };



  const becomeSellerClick = () =>
  {
    const role = user.user?.role;
    if (role === "ROLE_ADMIN")
    {
      navigate("/admin");
    } else if (role === "ROLE_SELLER" || sellers.profile?.id)
    {
      navigate("/seller");
    } else navigate("/become-seller");
  }



  return (
    <Box
      sx={{ zIndex: 2 }}
      className="sticky top-0 left-0 right-0 blur-bg border-b border-gray-100/80"
    >
      <div className="flex items-center justify-between px-4 lg:px-16 h-[68px]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
            {!isLarge && (
              <IconButton onClick={() => toggleDrawer(true)()} size="small" sx={{ mr: 0.5 }}>
                <MenuIcon className="text-gray-600" sx={{ fontSize: 24 }} />
              </IconButton>
            )}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center"
            >
              <img
                src={branding.logoUrlTransparent}
                alt={branding.appName}
                className="h-[38px] w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = branding.logoUrl;
                }}
              />
            </div>
          </div>

          {isLarge && (
            <ul className="flex items-center gap-1">
              {mainCategory.map((item) => (
                <li
                  key={item.categoryId}
                  onMouseLeave={() => setShowSheet(false)}
                  onMouseEnter={() => {
                    setSelectedCategory(item.categoryId);
                    setShowSheet(true);
                  }}
                  className="cursor-pointer h-[68px] px-3 flex items-center text-[13px] font-semibold text-gray-600 hover:text-[#00927c] border-b-2 border-transparent hover:border-[#00927c] transition-all duration-200 uppercase tracking-wide"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          <SearchBar />

          {user.user ? (
            <Button
              onClick={() => navigate(getAccountRoute(user.user?.role))}
              className="normal-case"
              sx={{ textTransform: 'none', px: 1.5, minWidth: 'unset' }}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: '#00927c', fontSize: 14 }}
                src={user.user?.profileImage || undefined}
              >
                {!user.user?.profileImage && user.user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
              <span className="font-semibold text-gray-600 hidden lg:block text-[13px] ml-1.5">
                {user.user?.fullName?.split(" ")[0]}
              </span>
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountCircleIcon sx={{ fontSize: "15px" }} />}
              onClick={() => navigate("/login")}
              size="small"
              sx={{
                backgroundColor: '#00927c',
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                px: 2.5,
                py: 0.7,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#007a6a', boxShadow: '0 2px 8px rgba(0,146,124,0.3)' }
              }}
            >
              Login
            </Button>
          )}

          <IconButton onClick={() => navigate("/wishlist")} size="small" sx={{ p: 1 }} className="hover:bg-gray-50">
            <Badge badgeContent={wishlist.wishlist?.products?.length ?? 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}>
              <FavoriteBorder sx={{ fontSize: 22 }} className="text-gray-500" />
            </Badge>
          </IconButton>

          <IconButton onClick={() => navigate("/cart")} size="small" sx={{ p: 1 }} className="hover:bg-gray-50">
            <Badge badgeContent={cart.cart?.cartItems?.length ?? 0} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}>
              <AddShoppingCartIcon sx={{ fontSize: 22 }} className="text-gray-500" />
            </Badge>
          </IconButton>

          {isLarge && user.user?.role !== "ROLE_ADMIN" && user.user?.role !== "ROLE_SELLER" && (
            <Button
              onClick={becomeSellerClick}
              startIcon={<StorefrontIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#00927c',
                color: '#00927c',
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                ml: 1,
                px: 2.5,
                py: 0.6,
                '&:hover': { borderColor: '#007a6a', backgroundColor: 'rgba(0,146,124,0.04)' }
              }}
            >
              Become Seller
            </Button>
          )}
        </div>
      </div>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {<DrawerList toggleDrawer={toggleDrawer} />}
      </Drawer>
      {showSheet && selectedCategory && (
        <div
          onMouseLeave={() => setShowSheet(false)}
          onMouseEnter={() => setShowSheet(true)}
          className="categorySheet absolute top-[68px] left-16 right-16"
        >
          <CategorySheet
            setShowSheet={setShowSheet}
            selectedCategory={selectedCategory}
          />
        </div>
      )}
    </Box>
  );
};

export default Navbar;
