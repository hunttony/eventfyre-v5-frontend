import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link to="/about" className="text-gray-300 hover:text-white">
              About
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white">
              Terms of Service
            </Link>
          </div>
          <div className="mt-8 md:mt-0 text-center md:text-right">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} EventFyre. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Designed and built with ❤️ for event organizers and vendors
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
