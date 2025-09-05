import React from 'react';
import { Check, FileText, Cog, Shield, Truck } from 'lucide-react';

const ProcessSection = () => {
  const processSteps = [
    {
      id: 1,
      number: "1.",
      title: "TEKLİF VE TASARIM ANALİZİ",
      description: "CAD dosyalarınızı analiz ederek en uygun işleme yöntemini belirliyor ve detaylı teklifimizi hazırlıyoruz.",
      color: "orange",
      bgColor: "bg-orange-500/20",
      textColor: "text-orange-500",
      borderColor: "border-orange-500/30",
      icon: FileText
    },
    {
      id: 2,
      number: "2.",
      title: "PROGRAMLAMA VE HAZIRLIK",
      description: "CNC programlarını hazırlayarak takım seçimi yapıyor ve makine kurulumunu gerçekleştiriyoruz.",
      color: "gray",
      bgColor: "bg-gray-600/20",
      textColor: "text-gray-600",
      borderColor: "border-gray-600/30",
      icon: Cog
    },
    {
      id: 3,
      number: "3.",
      title: "HASSASİYETLİ İŞLEME",
      description: "5 eksenli CNC makinelerimizde mikron hassasiyetinde işleme gerçekleştiriyoruz.",
      color: "orange-dark",
      bgColor: "bg-orange-600/20",
      textColor: "text-orange-600",
      borderColor: "border-orange-600/30",
      icon: Cog
    },
    {
      id: 4,
      number: "4.",
      title: "KALİTE KONTROL VE TESLİMAT",
      description: "3D ölçüm cihazları ile kalite kontrolünü tamamlayarak sertifikalı teslimat gerçekleştiriyoruz.",
      color: "gray-dark",
      bgColor: "bg-gray-700/20",
      textColor: "text-gray-700",
      borderColor: "border-gray-700/30",
      icon: Shield
    }
  ];

  return (
    <section className="bg-primary-dark py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-500/20 text-orange-500 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            İŞ SÜRECİMİZ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ÇALIŞMA YÖNTEMİMİZ
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Projelerinizi baştan sona profesyonel bir süreçle yönetiyor, 
            her aşamada kalite ve hassasiyeti ön planda tutuyoruz.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.id}
                className={`${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-8 relative overflow-hidden group hover:scale-105 transition-all duration-300`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-6xl font-bold ${step.textColor} opacity-20`}>
                    {step.number}
                  </div>
                  <div className={`p-3 rounded-xl bg-white/10`}>
                    <IconComponent className={`w-8 h-8 ${step.textColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className={`text-xl font-bold mb-4 ${step.textColor}`}>
                    {step.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Check Icon */}
                <div className={`absolute top-6 right-6 w-8 h-8 ${step.bgColor} ${step.textColor} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  <Check className="w-5 h-5" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500/20 to-gray-600/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Projenizi Hayata Geçirmeye Hazır mısınız?
            </h3>
            <p className="text-gray-400 mb-6">
              CAD dosyalarınızı gönderin, 24 saat içinde detaylı teklifimizi alın.
            </p>
            <button 
              onClick={() => {
                const element = document.getElementById('quote-panel');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="vertex-button-primary bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
            >
              TEKLİF AL →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

