import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import branding from '../../../Config/branding';
import NavbarProfile from './NavbarProfile';

interface NavbarProfileData {
  fullName?: string | null;
  sellerName?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
  businessDetails?: { businessName?: string | null };
}

const Navbar = ({
  DrawerList,
  role,
  profile,
}: {
  DrawerList: any;
  role?: 'seller' | 'admin';
  profile?: NavbarProfileData | null;
}) => {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: any)=>() => {
    setOpen(newOpen);
    
  };

  const profileName =
    profile?.fullName ||
    profile?.sellerName ||
    profile?.businessDetails?.businessName ||
    (role === 'admin' ? 'Admin' : 'Seller');

  const profileAvatar = profile?.avatar || profile?.profileImage || null;

  const handleProfileClick = () => {
    navigate(role === 'admin' ? '/admin/account' : '/seller/account');
  };

  return (
    <div className='h-[10vh] flex items-center justify-between px-5 border-b'>
      <div className='flex items-center gap-3 '>
        <IconButton onClick={toggleDrawer(true)} color='primary'>
          <MenuIcon color='primary' />
        </IconButton>

        <div onClick={() => navigate("/")} className='flex items-center gap-2 cursor-pointer'>
          <img src={branding.logoUrlTransparent} alt={branding.appName} className="h-7 w-auto object-contain" />
        </div>
      </div>

      <NavbarProfile
        name={profileName}
        avatar={profileAvatar}
        role={role}
        onClick={handleProfileClick}
      />

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <DrawerList toggleDrawer={toggleDrawer} />
      </Drawer>

    </div>
  )
}

export default Navbar