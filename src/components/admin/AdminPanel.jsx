import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, checkAPIHealth } from '../../lib/api';
import { 
  Table, 
  Package, 
  FileEdit, 
  Trash2, 
  Search, 
  ChevronDown, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings
} from 'lucide-react';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [authToken, setAuthToken] = useState('');
  
  useEffect(() => {
    // API durumunu kontrol et
    checkApiHealth();
    
    // Local storage'dan token'ı getir
    const token = localStorage.getItem('vertex_admin_token');
    if (token) {
      setAuthToken(token);
      fetchOrders(token);
    }
  }, []);
  
  const checkApiHealth = async () => {
    try {
      const result = await checkAPIHealth();
      setApiStatus(result.success ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('error');
    }
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    const token = e.target.token.value;
    
    if (token) {
      setAuthToken(token);
      localStorage.setItem('vertex_admin_token', token);
      fetchOrders(token);
    }
  };
  
  const handleLogout = () => {
    setAuthToken('');
    localStorage.removeItem('vertex_admin_token');
    setOrders([]);
  };
  
  const fetchOrders = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      // API'den siparişleri getir
      const result = await getAllOrders(token);
      
      if (result.success) {
        setOrders(result.data.orders || []);
      } else {
        setError(result.error || 'Siparişler getirilemedi');
      }
    } catch (error) {
      setError('API bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };
  
  const handleStatusUpdate = async (trackingId, status, stageInfo) => {
    try {
      const result = await updateOrderStatus(authToken, {
        trackingId,
        status,
        stage: stageInfo
      });
      
      if (result.success) {
        // Başarılı güncelleme sonrası siparişleri yenile
        await fetchOrders(authToken);
        
        // Seçili siparişi güncelle
        if (selectedOrder && selectedOrder.trackingId === trackingId) {
          setSelectedOrder(result.data.order);
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      return false;
    }
  };
  
  // Auth durumu kontrolü
  if (!authToken) {
    return (
      <div className="admin-login p-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">VERTEX CNC Admin Panel</h2>
          <p className="text-gray-600">Yönetim paneline erişmek için giriş yapın</p>
          
          {apiStatus && (
            <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm ${
              apiStatus === 'online' ? 'bg-green-100 text-green-800' :
              apiStatus === 'offline' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                apiStatus === 'online' ? 'bg-green-500' :
                apiStatus === 'offline' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}></span>
              API Durumu: {apiStatus}
            </div>
          )}
        </div>
        
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="token">
              API Anahtarı
            </label>
            <input
              type="password"
              id="token"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Admin API anahtarınızı girin"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <div className="admin-panel p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">VERTEX CNC Yönetim Paneli</h1>
          <p className="text-gray-600">Siparişler ve talepler yönetimi</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
            apiStatus === 'online' ? 'bg-green-100 text-green-800' :
            apiStatus === 'offline' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              apiStatus === 'online' ? 'bg-green-500' :
              apiStatus === 'offline' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}></span>
            API: {apiStatus}
          </div>
          
          <button
            onClick={() => fetchOrders(authToken)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            Yenile
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Çıkış
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Siparişler
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz sipariş bulunmamaktadır
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left text-xs font-semibold text-gray-600">SİP. NO</th>
                    <th className="py-2 text-left text-xs font-semibold text-gray-600">MÜŞTERİ</th>
                    <th className="py-2 text-left text-xs font-semibold text-gray-600">DURUM</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr 
                      key={order.trackingId}
                      onClick={() => handleOrderSelect(order)}
                      className={`hover:bg-gray-50 cursor-pointer border-b ${
                        selectedOrder?.trackingId === order.trackingId ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="py-3 text-sm">{order.orderNumber}</td>
                      <td className="py-3 text-sm">{order.customerData?.company || 'N/A'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          order.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' :
                          order.status === 'İşleniyor' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Teklif Hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Order details */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          {selectedOrder ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    Takip ID: {selectedOrder.trackingId}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    selectedOrder.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'İşleniyor' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'Teklif Hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-3">Müşteri Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">İsim</p>
                    <p className="font-medium">{selectedOrder.customerData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Firma</p>
                    <p className="font-medium">{selectedOrder.customerData?.company || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-posta</p>
                    <p className="font-medium">{selectedOrder.customerData?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium">{selectedOrder.customerData?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Project Details */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Proje Detayları</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm mb-4">
                    {selectedOrder.customerData?.description || 'Açıklama bulunamadı'}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedOrder.customerData?.quantity && (
                      <div>
                        <p className="text-xs text-gray-600">Adet</p>
                        <p className="text-sm font-medium">{selectedOrder.customerData.quantity}</p>
                      </div>
                    )}
                    {selectedOrder.customerData?.material && (
                      <div>
                        <p className="text-xs text-gray-600">Malzeme</p>
                        <p className="text-sm font-medium">{selectedOrder.customerData.material}</p>
                      </div>
                    )}
                    {selectedOrder.customerData?.deadline && (
                      <div>
                        <p className="text-xs text-gray-600">Teslimat Tarihi</p>
                        <p className="text-sm font-medium">{selectedOrder.customerData.deadline}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedOrder.customerData?.additionalNotes && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">Ek Notlar</p>
                      <p className="text-sm mt-1">{selectedOrder.customerData.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stages */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Süreç Durumu</h4>
                <div className="space-y-4">
                  {selectedOrder.stages?.map((stage, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        stage.status === 'completed' ? 'bg-green-500 text-white' :
                        stage.status === 'in-progress' ? 'bg-orange-500 text-white' : 
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {stage.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : stage.status === 'in-progress' ? (
                          <Settings className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{stage.stage}</p>
                          {stage.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(stage.timestamp).toLocaleString('tr-TR')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                        
                        {/* Update Status Buttons */}
                        {stage.status !== 'completed' && (
                          <div className="mt-2">
                            <button 
                              onClick={() => handleStatusUpdate(
                                selectedOrder.trackingId,
                                stage.stage === 'Teklif Gönderildi' ? 'Tamamlandı' : 'İşleniyor',
                                {
                                  stage: stage.stage,
                                  status: 'completed',
                                  description: stage.description
                                }
                              )}
                              className="inline-flex items-center px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs rounded"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> 
                              Tamamlandı olarak işaretle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded"
                  onClick={() => {
                    // Send email to customer
                    alert('Bu özellik henüz aktif değil. E-posta gönderilecek: ' + selectedOrder.customerData?.email);
                  }}
                >
                  Müşteriye E-posta Gönder
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Detayları görüntülemek için sipariş seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
