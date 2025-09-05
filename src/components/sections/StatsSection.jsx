import React from 'react';
import { ArrowUpRight, Target, Zap, Award, Users } from 'lucide-react';
import CountUp from '../animations/CountUp';
import FadeIn from '../animations/FadeIn';

const StatsSection = () => {
  const scrollToQuote = () => {
    const element = document.getElementById('quote-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-primary-dark relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <FadeIn delay={200}>
            <div className="text-white">
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Hassas İmalat
                </span>
                <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Kalite Güvencesi
                </span>
                <span className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Teknoloji Lideri
                </span>
              </div>

              <h2 className="section-title mb-6 leading-tight">
                <span className="block">
                  <CountUp end="15" className="text-6xl" />+ YILLIK TECRÜBEMİZ
                </span>
                <span className="block">MİKRON HASSASİYETİNDE!</span>
                <span className="block text-gray-400 text-3xl md:text-4xl">
                  GÜVEN VE KALİTE.
                </span>
              </h2>

              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Havacılık, savunma, otomotiv ve medikal sektörlerinde 
                yüksek hassasiyetli CNC işleme teknolojileri ile 
                müşterilerimizin beklentilerini aşıyoruz.
              </p>

              <button 
                onClick={scrollToQuote}
                className="vertex-button-primary bg-orange-500 hover:bg-orange-600"
              >
                TEKLİF AL →
              </button>
            </div>
          </FadeIn>

          {/* Right Content - Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hassasiyet Card */}
            <FadeIn delay={400}>
              <div className="vertex-card bg-orange-500 text-white relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      ±<CountUp end="0.001" decimals={3} />mm
                    </div>
                    <div className="text-sm opacity-90">
                      Mikron Hassasiyet<br />
                      Tolerans Garantisi
                    </div>
                  </div>
                  <Target className="w-8 h-8 opacity-70" />
                </div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white/20"></div>
              </div>
            </FadeIn>

            {/* Müşteri Memnuniyeti Card */}
            <FadeIn delay={600}>
              <div className="vertex-card bg-gray-600 text-white relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      <CountUp end="98" />%
                    </div>
                    <div className="text-sm opacity-90">
                      Müşteri Memnuniyeti<br />
                      Oranı
                    </div>
                  </div>
                  <Award className="w-8 h-8 opacity-70" />
                </div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white/20"></div>
              </div>
            </FadeIn>

            {/* Tamamlanan Proje Card */}
            <FadeIn delay={800}>
              <div className="vertex-card bg-orange-400 text-white relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      <CountUp end="500" />+
                    </div>
                    <div className="text-sm opacity-90">
                      Tamamlanan<br />
                      Proje Sayısı
                    </div>
                  </div>
                  <Zap className="w-8 h-8 opacity-70" />
                </div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white/20"></div>
              </div>
            </FadeIn>

            {/* Sektör Deneyimi Card */}
            <FadeIn delay={1000}>
              <div className="vertex-card bg-gray-700 text-white relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      <CountUp end="4" />
                    </div>
                    <div className="text-sm opacity-90">
                      Ana Sektörde<br />
                      Uzman Hizmet
                    </div>
                  </div>
                  <Users className="w-8 h-8 opacity-70" />
                </div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white/20"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

