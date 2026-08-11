import { Box, Divider, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mainCategory } from '../../../data/category/mainCategory'
import CategorySheet from './CategorySheet';
import branding from '../../../Config/branding';
import { useAppSelector } from '../../../Redux Toolkit/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const DrawerList = ({toggleDrawer}:any) => {
    const [selectedCategory,setSelectedCategory]=useState("");
    const navigate = useNavigate();
    const { user } = useAppSelector(store => store);

    const handleNavigate = (path: string) => {
        navigate(path);
        if (toggleDrawer) toggleDrawer(false)();
    };

  return (
    <Box sx={{ width: 280 }} role="presentation">
    <List>
      <ListItem>
        <ListItemButton onClick={() => handleNavigate('/')}>
          <ListItemText primary={
            <img src={branding.logoUrlTransparent} alt={branding.appName} className="h-8 w-auto object-contain" />
          } />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton onClick={() => handleNavigate('/search-products')}>
          <ListItemIcon><SearchIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
          <ListItemText primary="Search Products" />
        </ListItemButton>
      </ListItem>

      {user.user ? (
        <>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/account')}>
              <ListItemIcon><PersonIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
              <ListItemText primary="My Account" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/account/orders')}>
              <ListItemIcon><ShoppingCartIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/account/wishlist')}>
              <ListItemIcon><FavoriteBorderIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
              <ListItemText primary="Wishlist" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/account/coupons')}>
              <ListItemIcon><LocalOfferIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
              <ListItemText primary="Coupons" />
            </ListItemButton>
          </ListItem>
        </>
      ) : (
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/login')}>
            <ListItemIcon><LoginIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
            <ListItemText primary="Login / Sign Up" />
          </ListItemButton>
        </ListItem>
      )}

      <Divider />
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleNavigate('/become-seller')}>
          <ListItemIcon><StorefrontIcon sx={{ fontSize: 20, color: '#666' }} /></ListItemIcon>
          <ListItemText primary="Become a Seller" />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton onClick={() => setSelectedCategory("")}>
          <ListItemText primary="Browse Categories" sx={{ fontWeight: 'bold' }} />
        </ListItemButton>
      </ListItem>

      {mainCategory.map((item) => <ListItem key={item.name} disablePadding>
        <ListItemButton onClick={()=>setSelectedCategory(item.categoryId)}>
          <ListItemText primary={item.name} />
        </ListItemButton>
      </ListItem>
      )}
    </List>

    {selectedCategory && <div className='categorySheet absolute top-[4.41rem] left-0 right-0 h-[400px]'>
        <CategorySheet toggleDrawer={toggleDrawer} selectedCategory={selectedCategory}/>
      </div>}

  </Box>
  )
}

export default DrawerList
