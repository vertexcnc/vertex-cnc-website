import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, CheckCircle, AlertTriangle, Settings, BarChart3, Package, Truck } from 'lucide-react';

const TrackingPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [currentStep, setCurrentStep] = useState(3);
  
  const navigate = useNavigate();

  // Handle order search - redirect to tracking page
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError('Lütfen takip numarası girin');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Takip sayfasına yönlendir
      navigate(`/track/${searchTerm.trim()}`);
    } catch (error) {
      setSearchError('Yönlendirme sırasında bir hata oluştu');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const processSteps = [
    { id: 1, name: 'Teklif Alındı', icon: CheckCircle },
    { id: 2, name: 'Teknik İnceleme', icon: Settings },
    { id: 3, name: 'Fiyat Hesaplama', icon: Package },
    { id: 4, name: 'Teklif Hazırlama', icon: Settings },
    { id: 5, name: 'Teklif Gönderildi', icon: CheckCircle }
  ];

  const stats = [
    { label: 'Toplam Sipariş', value: '127', icon: Package, color: 'blue' },
    { label: 'Aktif İşler', value: '23', icon: Settings, color: 'orange' },
    { label: 'Tamamlanan', value: '104', icon: CheckCircle, color: 'green' },
    { label: 'Müşteri Memnuniyeti', value: '98%', icon: BarChart3, color: 'green' }
  ];

  // Eğer bir sipariş varsa otomatik canlandırma durdurulmalı
  useEffect(() => {
    let interval;
    
    // Animasyonu çalıştır
    interval = setInterval(() => {
      setCurrentStep(prev => (prev >= 5 ? 1 : prev + 1));
    }, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <section id="tracking-panel" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Sipariş <span className="text-orange-500">Takip Paneli</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Siparişlerinizi canlı olarak takip edin ve üretim sürecini izleyin. 
            Gerçek zamanlı güncellemeler ile projenizin her aşamasından haberdar olun.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Takip numarası girin (örn: VTX-ABC123-XYZ45)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-20 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
            >
              {isSearching ? 'Aranıyor...' : 'Ara'}
            </button>
          </div>
          
          {/* Search Error */}
          {searchError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{searchError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Process Simulation */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Üretim Süreci Simülasyonu</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Canlı Güncelleme</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex justify-between items-center">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                const isPending = step.id > currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/50' :
                      isActive ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/50 animate-pulse' :
                      'bg-gray-700 border-gray-600'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm mt-2 text-center max-w-20">{step.name}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Connection Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-gray-700 transition-all duration-1000"
                style={{ width: `${((currentStep - 1) / (processSteps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    stat.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Demo Instructions */}
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sipariş Takip Sistemi</h3>
          <p className="text-gray-400 mb-4">
            Takip numaranızı girerek siparişinizin durumunu görüntüleyebilirsiniz.
          </p>
          <p className="text-sm text-gray-500">
            Takip numarası, teklif onaylandıktan sonra e-posta adresinize gönderilir.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-orange-400 text-sm">
              Bu demo bir simülasyondur. Gerçek siparişleriniz için giriş yapmanız gerekmektedir.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingPanel;

