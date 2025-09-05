import React from 'react';
import { ArrowUpRight, Cog, Zap, Shield, Wrench, Settings, Target } from 'lucide-react';
import FadeIn from '../animations/FadeIn';
import SlideUp from '../animations/SlideUp';

// CNC Images
import cncPrecisionParts from '../../assets/cnc-precision-parts.jpg';
import cncTurning from '../../assets/cnc-turning.jpg';
import cnc5AxisMachining from '../../assets/cnc-5axis-machining.webp';
import cncAerospace from '../../assets/cnc-aerospace.webp';
import cnc5AxisMachine from '../../assets/cnc-5axis-machine.jpg';
import cncTurningOperations from '../../assets/cnc-turning-operations.webp';

const iconMap = {
  Cog,
  Zap,
  Shield,
  Wrench,
  Settings,
  Target
};

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: "5 Eksenli CNC İşleme",
      description: "Karmaşık geometrilere sahip parçaları tek seferde işleyerek yüksek hassasiyet ve kalite sağlıyoruz.",
      color: "orange",
      bgColor: "bg-orange-500",
      textColor: "text-white",
      icon: "Cog",
      image: cnc5AxisMachining
    },
    {
      id: 2,
      title: "Hassas Tornalama",
      description: "Mikron toleranslarda silindirik parçaların işlenmesi ve yüzey kalitesi optimizasyonu.",
      color: "gray",
      bgColor: "bg-gray-600",
      textColor: "text-white",
      icon: "Target",
      image: cncTurning
    },
    {
      id: 3,
      title: "Prototip Üretimi",
      description: "Hızlı prototipleme ile tasarımlarınızı kısa sürede gerçeğe dönüştürüyoruz.",
      color: "orange-light",
      bgColor: "bg-orange-400",
      textColor: "text-white",
      icon: "Zap",
      image: cncPrecisionParts
    },
    {
      id: 4,
      title: "Kalite Kontrol",
      description: "3D ölçüm cihazları ile %100 kalite kontrolü ve sertifikasyon hizmetleri.",
      color: "gray-dark",
      bgColor: "bg-gray-700",
      textColor: "text-white",
      icon: "Shield",
      image: cncAerospace
    },
    {
      id: 5,
      title: "Seri Üretim",
      description: "Yüksek kapasiteli makine parkurumuz ile büyük hacimli siparişleri zamanında teslim ediyoruz.",
      color: "orange-dark",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      icon: "Settings",
      image: cnc5AxisMachine
    },
    {
      id: 6,
      title: "Özel Takım Tasarımı",
      description: "Projenize özel kesici takım tasarımı ve üretimi ile optimum verimlilik sağlıyoruz.",
      color: "gray-light",
      bgColor: "bg-gray-500",
      textColor: "text-white",
      icon: "Wrench",
      image: cncTurningOperations
    }
  ];

  const scrollToQuote = () => {
    const element = document.getElementById('quote-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="vertex-section bg-background">
      <div className="vertex-container">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="vertex-section-title">
              HİZMETLERİMİZ
            </h2>
            <p className="vertex-section-subtitle">
              Havacılık, savunma, otomotiv ve medikal sektörlerinde 
              yüksek hassasiyetli CNC işleme teknolojileri ile hizmet veriyoruz.
            </p>
          </div>
        </FadeIn>

        <div className="vertex-grid">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon];
            return (
              <SlideUp key={service.id} delay={index * 100}>
                <div className={`vertex-service-card ${service.bgColor} p-8 rounded-xl relative overflow-hidden group cursor-pointer`}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-lg bg-white/20`}>
                        <IconComponent className="w-8 h-8 vertex-service-icon" />
                      </div>
                      <ArrowUpRight className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 vertex-service-title">
                      {service.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed vertex-service-description mb-4">
                      {service.description}
                    </p>

                    {/* CNC Image */}
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </SlideUp>
            );
          })}
        </div>

        <FadeIn delay={600}>
          <div className="text-center mt-16">
            <button 
              onClick={scrollToQuote}
              className="vertex-button-primary bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
            >
              TEKLİF AL →
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ServicesSection;

