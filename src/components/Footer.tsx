import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* Shop Column */}
          <div>
            <h3 className="mb-4 text-white">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/new-arrivals" className="text-gray-400 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/men" className="text-gray-400 hover:text-white transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/women" className="text-gray-400 hover:text-white transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/kids" className="text-gray-400 hover:text-white transition-colors">
                  Kids' Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Store Locator
                </a>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="mb-4 text-white">Help</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div>
            <h3 className="mb-4 text-white">Follow Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-0">
            © {currentYear} RFM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
