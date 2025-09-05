import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, AlertCircle, Truck, FileText, Phone, Mail, Calendar, User, Building } from 'lucide-react';

const DetailedTrackingPanel = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo sipariş verileri (gerçek uygulamada API'den gelecek)
  const demoOrders = {
    'demo-tracking-1': {
      orderNumber: 'VTX-20250903-001',
      customerInfo: {
        companyName: 'Havacılık Teknolojileri A.Ş.',
        contactName: 'Mehmet Özkan',
        email: 'mehmet.ozkan@havaciliktekno.com',
        phone: '+90 532 123 45 67'
      },
      projectInfo: {
        description: 'Havacılık sektörü için titanyum alaşımından hassas parça üretimi. Mikron toleranslarda işleme gerekiyor.',
        quantity: '25',
        material: 'Titanyum Ti-6Al-4V',
        deadline: '2025-12-15',
        additionalNotes: 'Özel toleranslar ve yüzey kalitesi gereksinimi var.'
      },
      stages: [
        { id: 'quote_received', name: 'Teklif Alındı', status: 'completed', date: '2025-09-03T10:30:00', progress: 100 },
        { id: 'design_analysis', name: 'Tasarım Analizi', status: 'completed', date: '2025-09-03T14:15:00', progress: 100 },
        { id: 'material_prep', name: 'Malzeme Hazırlık', status: 'in_progress', date: '2025-09-04T09:00:00', progress: 65 },
        { id: 'cnc_machining', name: 'CNC İşleme', status: 'pending', date: null, progress: 0 },
        { id: 'quality_control', name: 'Kalite Kontrol', status: 'pending', date: null, progress: 0 },
        { id: 'delivery', name: 'Teslimat', status: 'pending', date: null, progress: 0 }
      ],
      currentStage: 'material_prep',
      overallProgress: 55,
      priority: 'high',
      estimatedDelivery: '2025-09-18T16:00:00',
      createdAt: '2025-09-03T10:30:00',
      status: 'active'
    }
  };

  const handleSearch = async () => {
    if (!trackingId.trim()) {
      setError('Lütfen takip ID\'si girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Demo için local data kullan
      if (demoOrders[trackingId]) {
        setOrderData(demoOrders[trackingId]);
      } else {
        // Gerçek API çağrısı burada olacak
        const response = await fetch(`/api/track-order/${trackingId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
        } else {
          setError('Sipariş bulunamadı. Lütfen takip ID\'sini kontrol edin.');
        }
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      default:
        return 'text-green-500 bg-green-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Henüz başlanmadı';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-20 bg-gray-50" id="detailed-tracking">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Detaylı Sipariş Takibi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Takip ID'nizi girerek siparişinizin detaylı durumunu ve tüm aşamalarını görüntüleyebilirsiniz.
          </p>
        </div>

        {/* Arama Bölümü */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                Takip ID'si
              </label>
              <input
                type="text"
                id="trackingId"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Örnek: demo-tracking-1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Sipariş Detayları */}
        {orderData && (
          <div className="space-y-8">
            {/* Genel Bilgiler */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-8 h-8 text-orange-500" />
                  Sipariş: {orderData.orderNumber}
                </h3>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(orderData.priority)}`}>
                  {orderData.priority === 'high' ? 'Yüksek Öncelik' : 
                   orderData.priority === 'medium' ? 'Orta Öncelik' : 'Normal Öncelik'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Müşteri Bilgileri */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Müşteri Bilgileri
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{orderData.customerInfo.companyName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{orderData.customerInfo.contactName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{orderData.customerInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{orderData.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Proje Bilgileri */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Proje Detayları
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Açıklama:</span>
                      <p className="text-gray-700 mt-1">{orderData.projectInfo.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Adet:</span>
                        <p className="text-gray-700">{orderData.projectInfo.quantity}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Malzeme:</span>
                        <p className="text-gray-700">{orderData.projectInfo.material}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Tahmini Teslimat:</span>
                      <span className="text-gray-700 font-medium">{formatDate(orderData.estimatedDelivery)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Genel İlerleme */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">Genel İlerleme</span>
                  <span className="text-2xl font-bold text-orange-500">{orderData.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${orderData.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Üretim Aşamaları */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Truck className="w-8 h-8 text-orange-500" />
                Üretim Aşamaları
              </h3>

              <div className="space-y-6">
                {orderData.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-6">
                    {/* İkon ve Çizgi */}
                    <div className="flex flex-col items-center">
                      {getStageIcon(stage.status)}
                      {index < orderData.stages.length - 1 && (
                        <div className={`w-0.5 h-16 mt-2 ${
                          stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{stage.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(stage.date)}</span>
                      </div>
                      
                      {stage.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">İlerleme</span>
                            <span className="text-sm font-medium text-orange-500">{stage.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${stage.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                        stage.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {stage.status === 'completed' ? 'Tamamlandı' :
                         stage.status === 'in_progress' ? 'Devam Ediyor' : 'Beklemede'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Uyarısı */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Demo Takip Sistemi</h4>
                  <p className="text-blue-700 mb-3">
                    Bu bir demo takip sistemidir. Gerçek siparişleriniz için size e-posta ile gönderilen 
                    kişisel takip linkini kullanın.
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>Demo Takip ID:</strong> demo-tracking-1
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DetailedTrackingPanel;

