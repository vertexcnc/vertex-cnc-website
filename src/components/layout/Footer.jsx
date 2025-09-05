import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import vertexLogoNew from '../../assets/vertex-logo-new.png';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src={vertexLogoNew} 
                alt="VERTEX CNC Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md mb-4">
              15+ yıllık tecrübemiz ile hassas imalat teknolojilerinde hizmet veren şirket olarak, 
              havacılık, savunma, otomotiv ve medikal sektörlerinin en zorlu projelerine çözüm üretiyoruz.
            </p>
            <p className="text-orange-500 font-semibold">
              "Mikron Hassasiyetinde Geleceği Şekillendiriyoruz"
            </p>
          </div>

          {/* Hizmetlerimiz */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-orange-500">Hizmetlerimiz</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="text-gray-400 hover:text-orange-500 transition-colors duration-300">Hassas CNC İşleme</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-orange-500 transition-colors duration-300">5 Eksenli İşleme</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-orange-500 transition-colors duration-300">Tel Erozyon</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-orange-500 transition-colors duration-300">CNC Bileme</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-orange-500 transition-colors duration-300">Tersine Mühendislik</a></li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-orange-500">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={16} />
                <span className="text-gray-400 text-sm">
                  Dudullu OSB Mahallesi İmes Sanayi Sitesi E blok 502.Sokak No:29 Ümraniye İstanbul
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="text-orange-500 flex-shrink-0" size={16} />
                <span className="text-gray-400">+90 531 521 89 81</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="text-orange-500 flex-shrink-0" size={16} />
                <span className="text-gray-400">destek@vertexcnc.tr</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="text-orange-500 flex-shrink-0" size={16} />
                <span className="text-gray-400">Pazartesi - Cuma: 08:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Vertex CNC Yüksek Hassas İmalat Teknolojileri A.Ş. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 text-sm">
              Gizlilik Politikası
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 text-sm">
              Kullanım Şartları
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

