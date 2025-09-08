import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const EmailStatusPanel = () => {
  const [emailStats, setEmailStats] = useState({
    todaysSent: 0,
    todaysFailed: 0,
    weeklySuccess: 95.5,
    lastEmailTime: null,
    sendgridStatus: 'unknown',
    smtpFallbackStatus: 'unknown'
  });
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchEmailStats();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchEmailStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmailStats = async () => {
    try {
      // API'den e-mail istatistiklerini getir
      // Bu gerçek implementasyonda backend'den gelecek
      setEmailStats({
        todaysSent: Math.floor(Math.random() * 50) + 10,
        todaysFailed: Math.floor(Math.random() * 5),
        weeklySuccess: 95.5 + Math.random() * 3,
        lastEmailTime: new Date().toISOString(),
        sendgridStatus: Math.random() > 0.1 ? 'active' : 'error',
        smtpFallbackStatus: 'active'
      });
    } catch (error) {
      console.error('E-mail istatistikleri alınamadı:', error);
    }
  };

  const testEmailSystem = async () => {
    setIsTestingEmail(true);
    setTestResult(null);

    try {
      // Test e-maili gönder
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'system_check',
          recipient: 'admin@vertexcnc.tr'
        })
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.message || 'Test tamamlandı',
        method: result.method || 'SendGrid',
        timestamp: new Date()
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test sırasında hata oluştu: ' + error.message,
        timestamp: new Date()
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-500" />
          E-mail Sistem Durumu
        </h2>
        <button
          onClick={fetchEmailStats}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="Yenile"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Bugün Gönderilen</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{emailStats.todaysSent}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">Başarısız</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{emailStats.todaysFailed}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">Haftalık Başarı</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {emailStats.weeklySuccess.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Servis Durumları */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Servis Durumları</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(emailStats.sendgridStatus)}
              <div>
                <span className="font-medium text-gray-900">SendGrid API</span>
                <p className="text-sm text-gray-500">Birincil e-mail servisi</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emailStats.sendgridStatus)}`}>
              {emailStats.sendgridStatus === 'active' ? 'Aktif' : 
               emailStats.sendgridStatus === 'error' ? 'Hata' : 'Bilinmiyor'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(emailStats.smtpFallbackStatus)}
              <div>
                <span className="font-medium text-gray-900">SMTP Fallback</span>
                <p className="text-sm text-gray-500">Yedek e-mail servisi</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emailStats.smtpFallbackStatus)}`}>
              {emailStats.smtpFallbackStatus === 'active' ? 'Hazır' : 
               emailStats.smtpFallbackStatus === 'error' ? 'Hata' : 'Bilinmiyor'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Bölümü */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Sistem Testi</h3>
          <button
            onClick={testEmailSystem}
            disabled={isTestingEmail}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingEmail ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isTestingEmail ? 'Test Ediliyor...' : 'E-mail Testi Yap'}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Test Başarılı!' : 'Test Başarısız!'}
                </p>
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
                {testResult.method && (
                  <p className="text-xs text-gray-500 mt-2">
                    Kullanılan servis: {testResult.method} • 
                    {testResult.timestamp.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {emailStats.lastEmailTime && (
          <div className="mt-4 text-sm text-gray-500">
            Son e-mail gönderimi: {new Date(emailStats.lastEmailTime).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailStatusPanel;
