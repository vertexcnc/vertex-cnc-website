import React from 'react';
import { Settings, Zap, Target, Cog } from 'lucide-react';
import { Highlighter } from '@/components/magicui/highlighter';
import vertexLogoNew from '../../assets/vertex-logo-new.png';

const HeroSection = () => {
  const scrollToQuote = () => {
    const element = document.getElementById('quote-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen bg-primary-dark relative overflow-hidden flex items-center">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Settings className="absolute top-20 left-10 text-orange-500 w-6 h-6 animate-spin" style={{animationDuration: '8s'}} />
        <Cog className="absolute top-32 right-20 text-gray-400 w-8 h-8 animate-spin" style={{animationDuration: '12s'}} />
        <Target className="absolute bottom-40 left-20 text-orange-500 w-5 h-5 animate-pulse" />
        <Zap className="absolute bottom-20 right-10 text-gray-400 w-6 h-6 animate-bounce" />
        <Settings className="absolute top-40 left-1/4 text-gray-500 w-7 h-7 animate-spin" style={{animationDuration: '10s'}} />
        <Cog className="absolute bottom-60 right-1/4 text-orange-400 w-6 h-6 animate-spin" style={{animationDuration: '6s'}} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Large VERTEX CNC Logo Banner with Neon Glow */}
          <div className="mb-8 flex justify-center relative">
            {/* Neon Glow Background */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div 
                className="w-[700px] h-[700px] rounded-full opacity-30 animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, rgba(255, 107, 53, 0.2) 30%, rgba(255, 107, 53, 0.1) 60%, transparent 100%)',
                  animation: 'pulse 4s ease-in-out infinite, rotate 20s linear infinite'
                }}
              ></div>
              <div 
                className="absolute w-[800px] h-[800px] rounded-full opacity-20 animate-spin"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(255, 107, 53, 0.3), transparent, rgba(255, 107, 53, 0.2), transparent)',
                  animationDuration: '15s'
                }}
              ></div>
            </div>
            
            {/* Logo */}
            <img 
              src={vertexLogoNew} 
              alt="VERTEX CNC Logo" 
              className="w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] object-contain relative z-10"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(255, 107, 53, 0.6)) drop-shadow(0 0 80px rgba(255, 107, 53, 0.3))',
                animation: 'float 6s ease-in-out infinite'
              }}
            />
          </div>

          {/* Badge - Moved below logo */}
          <div className="inline-flex items-center space-x-2 text-orange-200 py-4 px-6 rounded-full mb-8 bg-orange-500/10 border border-orange-500/20">
            <span className="text-lg font-semibold animate-pulse">15+ Yıllık Tecrübe • Hassas İmalat Teknolojileri</span>
          </div>

          {/* Main Title with Shimmer Effects */}
          <h1 className="hero-title text-white mb-8 leading-tight">
            <span className="block animate-shimmer bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent bg-[length:200%_100%]">MİKRON</span>
            <span className="block">
              <span className="text-orange-500 animate-glow">HASSASİYETİNDE</span>{' '}
              <span className="text-gray-300 animate-shimmer bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent bg-[length:200%_100%]">GELECEĞİ</span>
            </span>
            <span className="block text-white">
              <Highlighter action="underline" color='#FF6B35'>
                <span className="animate-shimmer bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent bg-[length:200%_100%]">
                  ŞEKİLLENDİRİYORUZ
                </span>
              </Highlighter>
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto mb-8 leading-relaxed">
            VERTEX CNC olarak, havacılık, savunma, otomotiv ve medikal sektörlerinin en zorlu projelerine 
            yüksek hassasiyetli CNC işleme teknolojileri ile çözüm üretiyoruz.
          </p>

          {/* Key Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center space-x-2 text-orange-400">
              <Target size={16} />
              <span>Mikron Hassasiyet</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <Settings size={16} />
              <span>5 Eksenli İşleme</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <Zap size={16} />
              <span>Hızlı Teslimat</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <Cog size={16} />
              <span>Modern Makine Parkuru</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToQuote}
              className="btn-primary bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4"
            >
              TEKLİF AL →
            </button>
            <button 
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 text-lg px-8 py-4 rounded-lg"
            >
              HİZMETLERİMİZ
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex justify-center space-x-4 pb-8">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

