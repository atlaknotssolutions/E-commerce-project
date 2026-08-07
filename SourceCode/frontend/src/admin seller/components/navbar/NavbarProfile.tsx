import React from 'react'
import { Avatar } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface NavbarProfileProps {
  name: string
  avatar?: string | null
  onClick: () => void
  role?: string
}

const NavbarProfile = ({ name, avatar, onClick, role }: NavbarProfileProps) => {
  const initials = name.trim().charAt(0).toUpperCase() || ''

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={role ? `${name} - ${role}` : name}
      className="flex items-center gap-2 rounded-full px-2 py-1.5 cursor-pointer transition-colors duration-200 hover:bg-primary-color/10 sm:px-3"
    >
      <Avatar
        src={avatar || undefined}
        alt={name}
        sx={{
          width: 36,
          height: 36,
          bgcolor: 'primary.main',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        {initials ? initials : <PersonIcon />}
      </Avatar>

      <span className="hidden sm:block max-w-[160px] truncate text-sm font-medium text-gray-800">
        {name}
      </span>

      <ExpandMoreIcon className="hidden md:block text-gray-500" fontSize="small" />
    </button>
  )
}

export default NavbarProfile
