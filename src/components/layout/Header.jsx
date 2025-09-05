import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import vertexLogoNew from '../../assets/vertex-logo-new.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    // Ana sayfada değilsek önce ana sayfaya yönlendir
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-primary-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src={vertexLogoNew} 
                alt="VERTEX CNC Logo" 
                className="h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              Ana Sayfa
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              Hizmetlerimiz
            </button>
            <button 
              onClick={() => scrollToSection('process')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              Makine Parkuru
            </button>
            <button 
              onClick={() => scrollToSection('quote-panel')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              Teklif Al
            </button>
            <button 
              onClick={() => scrollToSection('tracking-panel')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              Sipariş Takip
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              İletişim
            </button>
            
            {/* Admin Link */}
            <Link 
              to="/admin"
              className="flex items-center text-white hover:text-orange-500 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 font-medium"
            >
              <Lock size={16} className="mr-1" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* CTA Button */}
          <button 
            onClick={() => scrollToSection('quote-panel')}
            className="hidden md:block btn-primary bg-orange-500 hover:bg-orange-600"
          >
            TEKLİF AL →
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary-dark/95 backdrop-blur-md border-t border-white/10">
            <nav className="flex flex-col space-y-4 p-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                Ana Sayfa
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                Hizmetlerimiz
              </button>
              <button 
                onClick={() => scrollToSection('projects')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                Makine Parkuru
              </button>
              <button 
                onClick={() => scrollToSection('quote-panel')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                Teklif Al
              </button>
              <button 
                onClick={() => scrollToSection('tracking-panel')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                Sipariş Takip
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-white hover:text-orange-500 transition-colors duration-300 text-left"
              >
                İletişim
              </button>
              <button 
                onClick={() => scrollToSection('quote-panel')}
                className="btn-primary bg-orange-500 hover:bg-orange-600 w-full mt-4"
              >
                TEKLİF AL →
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

