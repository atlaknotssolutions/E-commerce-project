import React from 'react'
import { Link } from 'react-router-dom'
import branding from '../../../Config/branding'

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto px-5 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          <div className="md:col-span-1">
            <img src={branding.logoUrl} alt={branding.appName} className="h-9 w-auto object-contain mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              Your trusted marketplace for quality products. Shop with confidence.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest mb-5 text-gray-300">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Home</Link></li>
              <li><Link to="/search-products" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Shop</Link></li>
              <li><Link to="/brands" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Brands</Link></li>
              <li><Link to="/about" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest mb-5 text-gray-300">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/account" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">My Account</Link></li>
              <li><Link to="/account/orders" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Orders</Link></li>
              <li><Link to="/account/wishlist" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Wishlist</Link></li>
              <li><Link to="/account/coupons" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Coupons</Link></li>
              <li><Link to="/become-seller" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Become a Seller</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest mb-5 text-gray-300">Legal</h3>
            <ul className="space-y-3">
              {/* <li><Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Terms & Conditions</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Cookie Policy</Link></li> */}
              <li><Link to="/refund-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200 no-underline">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest mb-5 text-gray-300">Contact</h3>
            <ul className="space-y-3">
              {branding.supportEmail && <li className="text-gray-400 text-sm">{branding.supportEmail}</li>}
              {branding.supportPhone && <li className="text-gray-400 text-sm">{branding.supportPhone}</li>}
              {branding.address && <li className="text-gray-400 text-sm">{branding.address}</li>}
            </ul>
            <div className="flex gap-2.5 mt-5">
              {branding.socialLinks.facebook && <a href={branding.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-[#00927c] hover:text-white transition-all duration-200 text-xs font-medium">f</a>}
              {branding.socialLinks.twitter && <a href={branding.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-[#00927c] hover:text-white transition-all duration-200 text-xs font-medium">t</a>}
              {branding.socialLinks.instagram && <a href={branding.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-[#00927c] hover:text-white transition-all duration-200 text-xs font-medium">ig</a>}
              {branding.socialLinks.linkedin && <a href={branding.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-[#00927c] hover:text-white transition-all duration-200 text-xs font-medium">in</a>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-10 pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {branding.appName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="text-gray-500 text-xs hover:text-gray-300 transition-colors no-underline">Privacy</Link>
            <Link to="/terms" className="text-gray-500 text-xs hover:text-gray-300 transition-colors no-underline">Terms</Link>
            <Link to="/cookie-policy" className="text-gray-500 text-xs hover:text-gray-300 transition-colors no-underline">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
