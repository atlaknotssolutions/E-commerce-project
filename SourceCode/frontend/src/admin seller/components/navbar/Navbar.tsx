import React from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import branding from '../../../Config/branding';

const Navbar = ({DrawerList}:any) => {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: any)=>() => {
    setOpen(newOpen);
    
  };

  return (
    <div className='h-[10vh] flex items-center px-5 border-b'>
      <div className='flex items-center gap-3 '>
        <IconButton onClick={toggleDrawer(true)} color='primary'>
          <MenuIcon color='primary' />
        </IconButton>

        <div onClick={() => navigate("/")} className='flex items-center gap-2 cursor-pointer'>
          <img src={branding.logoUrlTransparent} alt={branding.appName} className="h-7 w-auto object-contain" />
        </div>
      </div>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <DrawerList toggleDrawer={toggleDrawer} />
      </Drawer>

    </div>
  )
}

export default Navbar