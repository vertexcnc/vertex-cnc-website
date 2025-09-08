import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, Package, CheckCircle, Clock, AlertCircle, Download, Mail, Phone } from 'lucide-react';

const TrackingDetails = () => {
  const { trackingId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trackingId) {
      fetchOrderDetails(trackingId);
    }
  }, [trackingId]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/track-order/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderData(data.order);
      } else {
        setError(data.message || 'Sipariş bulunamadı');
      }
    } catch (err) {
      setError('Sipariş sorgulanırken bir hata oluştu');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Package className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Sipariş Bulunamadı</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Takip ID'nizi kontrol edin veya bizimle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-gray-600">Sipariş bilgisi bulunamadı</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Henüz başlamadı';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sipariş: {orderData.orderNumber}
            </h1>
            <p className="text-gray-600">
              Takip ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{orderData.trackingId}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg">
              <div className="text-sm">Genel İlerleme</div>
              <div className="text-2xl font-bold">{orderData.overallProgress}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">İmalat Aşamaları</h2>
        <div className="space-y-4">
          {orderData.stages?.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  stage.status === 'completed' ? 'bg-green-500' : 
                  stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {getStatusIcon(stage.status)}
                </div>
                {index < orderData.stages.length - 1 && (
                  <div className={`w-0.5 h-12 mt-2 ${
                    stage.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <p className="text-sm text-gray-600">
                      {stage.status === 'completed' && `✅ Tamamlandı - ${formatDate(stage.date)}`}
                      {stage.status === 'in_progress' && '🔄 Devam ediyor...'}
                      {stage.status === 'pending' && '⏳ Beklemede'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`w-16 h-2 rounded-full ${getStatusColor(stage.status)}`}>
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${100 - stage.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{stage.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Müşteri Bilgileri
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Şirket:</span>
              <p className="font-medium">{orderData.customerInfo?.companyName || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">İletişim Kişisi:</span>
              <p className="font-medium">{orderData.customerInfo?.contactName || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">E-posta:</span>
              <p className="font-medium">{orderData.customerInfo?.email || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Telefon:</span>
              <p className="font-medium">{orderData.customerInfo?.phone || 'Belirtilmemiş'}</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Proje Detayları
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Açıklama:</span>
              <p className="font-medium">{orderData.projectInfo?.description || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Adet:</span>
              <p className="font-medium">{orderData.projectInfo?.quantity || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Malzeme:</span>
              <p className="font-medium">{orderData.projectInfo?.material || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">İstenen Teslimat:</span>
              <p className="font-medium">{orderData.projectInfo?.deadline || 'Belirtilmemiş'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Dates */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Zaman Çizelgesi</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Sipariş Tarihi</p>
            <p className="font-semibold">{formatDate(orderData.createdAt)}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Son Güncelleme</p>
            <p className="font-semibold">{formatDate(orderData.updatedAt)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Tahmini Teslimat</p>
            <p className="font-semibold">{formatDate(orderData.estimatedDelivery)}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">İletişim</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <div>
              <p className="font-medium">E-posta</p>
              <a href="mailto:destek@vertexcnc.tr" className="hover:underline">
                destek@vertexcnc.tr
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <div>
              <p className="font-medium">Telefon</p>
              <a href="tel:+902125550100" className="hover:underline">
                +90 212 555 01 00
              </a>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm opacity-90">
          Siparişinizle ilgili sorularınız için yukarıdaki iletişim bilgilerini kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default TrackingDetails;
