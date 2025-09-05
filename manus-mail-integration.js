/**
 * VERTEX CNC - Manus Mail Otomasyon Entegrasyonu
 * 
 * Bu dosya Manus Mail Automation özelliklerini VERTEX CNC web sitesine entegre eder.
 * Tetikleme tabanlı e-posta workflow'ları ve otomatik süreç yönetimi sağlar.
 */

class ManusMailIntegration {
    constructor(config) {
        this.config = {
            manusApiUrl: 'https://api.manus.im',
            mailManusBot: '@manus.bot',
            webhookUrl: config.webhookUrl || 'https://vertexcnc.tr/api/manus-webhook',
            apiKey: config.apiKey || process.env.MANUS_API_KEY,
            ...config
        };
        
        this.workflows = new Map();
        this.triggers = new Map();
        this.init();
    }

    /**
     * Manus Mail Automation sistemini başlatır
     */
    async init() {
        console.log('🚀 Manus Mail Automation başlatılıyor...');
        
        // Workflow'ları kaydet
        this.registerWorkflows();
        
        // Tetikleyicileri ayarla
        this.setupTriggers();
        
        // Webhook listener'ı başlat
        this.startWebhookListener();
        
        console.log('✅ Manus Mail Automation aktif!');
    }

    /**
     * E-posta workflow'larını kaydeder
     */
    registerWorkflows() {
        // 1. Teklif Talebi Workflow'u
        this.workflows.set('quote_request', {
            name: 'Teklif Talebi İşleme',
            description: 'Yeni teklif talebi geldiğinde PDF oluştur ve e-posta gönder',
            steps: [
                'PDF teklif formu oluştur',
                'Müşteriye kişisel takip linki gönder',
                'Destek ekibine bilgilendirme e-postası',
                'CRM sistemine kayıt ekle',
                'Takip numarası oluştur'
            ],
            triggers: ['form_submission', 'cad_file_upload'],
            recipients: ['customer', 'support_team']
        });

        // 2. Sipariş Durumu Güncelleme Workflow'u
        this.workflows.set('order_status_update', {
            name: 'Sipariş Durumu Bildirimi',
            description: 'Sipariş durumu değiştiğinde müşteriye bilgilendirme',
            steps: [
                'Sipariş durumunu kontrol et',
                'Müşteri bilgilerini al',
                'Durum güncelleme e-postası hazırla',
                'Tahmini teslimat tarihini hesapla',
                'E-posta gönder'
            ],
            triggers: ['status_change', 'milestone_reached'],
            recipients: ['customer']
        });

        // 3. CAD Dosya Analizi Workflow'u
        this.workflows.set('cad_analysis', {
            name: 'CAD Dosya Analizi',
            description: 'Yüklenen CAD dosyalarının otomatik analizi',
            steps: [
                'CAD dosyasını analiz et',
                'Üretim süresini hesapla',
                'Malzeme gereksinimlerini belirle',
                'Maliyet tahmini oluştur',
                'Mühendislik ekibine bildir'
            ],
            triggers: ['file_upload', 'analysis_request'],
            recipients: ['engineering_team', 'customer']
        });

        // 4. Teslimat Hatırlatma Workflow'u
        this.workflows.set('delivery_reminder', {
            name: 'Teslimat Hatırlatması',
            description: 'Teslimat tarihi yaklaştığında hatırlatma e-postası',
            steps: [
                'Teslimat tarihini kontrol et',
                'Kargo takip bilgilerini al',
                'Hatırlatma e-postası hazırla',
                'Müşteriye gönder',
                'Teslimat sonrası feedback talebi'
            ],
            triggers: ['delivery_approaching', 'shipped'],
            recipients: ['customer']
        });

        console.log(`📋 ${this.workflows.size} workflow kaydedildi`);
    }

    /**
     * Tetikleme kurallarını ayarlar
     */
    setupTriggers() {
        // Form gönderimi tetikleyicisi
        this.triggers.set('form_submission', {
            event: 'quote_form_submitted',
            condition: 'form.isValid && form.hasCADFiles',
            workflow: 'quote_request',
            priority: 'high',
            delay: 0 // Anında çalıştır
        });

        // Sipariş durumu değişimi tetikleyicisi
        this.triggers.set('status_change', {
            event: 'order_status_updated',
            condition: 'order.status !== previousStatus',
            workflow: 'order_status_update',
            priority: 'medium',
            delay: 300 // 5 dakika bekle
        });

        // CAD dosya yükleme tetikleyicisi
        this.triggers.set('file_upload', {
            event: 'cad_file_uploaded',
            condition: 'file.type in ["dwg", "dxf", "step", "iges"]',
            workflow: 'cad_analysis',
            priority: 'medium',
            delay: 600 // 10 dakika bekle
        });

        // Teslimat yaklaşma tetikleyicisi
        this.triggers.set('delivery_approaching', {
            event: 'delivery_date_near',
            condition: 'daysUntilDelivery <= 2',
            workflow: 'delivery_reminder',
            priority: 'low',
            delay: 0
        });

        console.log(`⚡ ${this.triggers.size} tetikleyici ayarlandı`);
    }

    /**
     * Webhook listener'ı başlatır
     */
    startWebhookListener() {
        // Express.js webhook endpoint'i
        const express = require('express');
        const app = express();
        
        app.use(express.json());
        
        app.post('/api/manus-webhook', async (req, res) => {
            try {
                const { event, data } = req.body;
                await this.handleWebhook(event, data);
                res.status(200).json({ success: true });
            } catch (error) {
                console.error('Webhook hatası:', error);
                res.status(500).json({ error: error.message });
            }
        });

        console.log('🔗 Webhook listener aktif: /api/manus-webhook');
    }

    /**
     * Webhook olaylarını işler
     */
    async handleWebhook(event, data) {
        console.log(`📨 Webhook alındı: ${event}`, data);

        // Tetikleyiciyi bul
        const trigger = Array.from(this.triggers.values())
            .find(t => t.event === event);

        if (!trigger) {
            console.log(`⚠️ Bilinmeyen olay: ${event}`);
            return;
        }

        // Koşulu kontrol et
        if (!this.evaluateCondition(trigger.condition, data)) {
            console.log(`❌ Koşul sağlanmadı: ${trigger.condition}`);
            return;
        }

        // Workflow'u çalıştır
        await this.executeWorkflow(trigger.workflow, data, trigger.delay);
    }

    /**
     * Koşulu değerlendirir
     */
    evaluateCondition(condition, data) {
        try {
            // Basit koşul değerlendirmesi
            // Gerçek uygulamada daha gelişmiş bir parser kullanılabilir
            return eval(condition.replace(/\b(\w+)\./g, 'data.$1.'));
        } catch (error) {
            console.error('Koşul değerlendirme hatası:', error);
            return false;
        }
    }

    /**
     * Workflow'u çalıştırır
     */
    async executeWorkflow(workflowName, data, delay = 0) {
        const workflow = this.workflows.get(workflowName);
        
        if (!workflow) {
            console.error(`❌ Workflow bulunamadı: ${workflowName}`);
            return;
        }

        console.log(`🔄 Workflow başlatılıyor: ${workflow.name}`);

        // Gecikme varsa bekle
        if (delay > 0) {
            console.log(`⏳ ${delay} saniye bekleniyor...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        try {
            // Workflow adımlarını çalıştır
            for (const step of workflow.steps) {
                console.log(`📝 Adım: ${step}`);
                await this.executeWorkflowStep(step, data, workflow);
            }

            console.log(`✅ Workflow tamamlandı: ${workflow.name}`);
        } catch (error) {
            console.error(`❌ Workflow hatası: ${workflow.name}`, error);
        }
    }

    /**
     * Workflow adımını çalıştırır
     */
    async executeWorkflowStep(step, data, workflow) {
        switch (step) {
            case 'PDF teklif formu oluştur':
                await this.generateQuotePDF(data);
                break;
                
            case 'Müşteriye kişisel takip linki gönder':
                await this.sendTrackingLink(data);
                break;
                
            case 'Destek ekibine bilgilendirme e-postası':
                await this.notifySupportTeam(data);
                break;
                
            case 'Sipariş durumunu kontrol et':
                await this.checkOrderStatus(data);
                break;
                
            case 'CAD dosyasını analiz et':
                await this.analyzeCADFile(data);
                break;
                
            default:
                console.log(`⚠️ Bilinmeyen adım: ${step}`);
        }
    }

    /**
     * PDF teklif formu oluşturur
     */
    async generateQuotePDF(data) {
        console.log('📄 PDF oluşturuluyor...');
        
        // Flask API'sine PDF oluşturma isteği gönder
        const response = await fetch('/api/generate-quote-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('✅ PDF oluşturuldu');
        } else {
            throw new Error('PDF oluşturma hatası');
        }
    }

    /**
     * Müşteriye takip linki gönderir
     */
    async sendTrackingLink(data) {
        console.log('🔗 Takip linki gönderiliyor...');
        
        const trackingUrl = `https://vertexcnc.tr/?track=${data.trackingId}`;
        
        const emailData = {
            to: data.customerEmail,
            subject: `Teklif Talebiniz Alındı - ${data.orderNumber}`,
            template: 'tracking_link',
            data: {
                customerName: data.customerName,
                orderNumber: data.orderNumber,
                trackingUrl: trackingUrl,
                estimatedResponse: '24 saat'
            }
        };
        
        await this.sendEmail(emailData);
    }

    /**
     * Destek ekibine bildirim gönderir
     */
    async notifySupportTeam(data) {
        console.log('👥 Destek ekibi bilgilendiriliyor...');
        
        const emailData = {
            to: 'destek@vertexcnc.tr',
            subject: `Yeni Teklif Talebi - ${data.orderNumber}`,
            template: 'support_notification',
            data: {
                orderNumber: data.orderNumber,
                customerName: data.customerName,
                projectDescription: data.projectDescription,
                urgency: data.urgency || 'normal',
                cadFiles: data.cadFiles || []
            }
        };
        
        await this.sendEmail(emailData);
    }

    /**
     * E-posta gönderir
     */
    async sendEmail(emailData) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData)
            });
            
            if (response.ok) {
                console.log(`📧 E-posta gönderildi: ${emailData.to}`);
            } else {
                throw new Error('E-posta gönderme hatası');
            }
        } catch (error) {
            console.error('E-posta hatası:', error);
        }
    }

    /**
     * Manus Mail Automation'ı manuel olarak tetikler
     */
    async triggerManualWorkflow(workflowName, data) {
        console.log(`🎯 Manuel tetikleme: ${workflowName}`);
        await this.executeWorkflow(workflowName, data);
    }

    /**
     * Aktif workflow'ları listeler
     */
    getActiveWorkflows() {
        return Array.from(this.workflows.entries()).map(([key, workflow]) => ({
            id: key,
            name: workflow.name,
            description: workflow.description,
            steps: workflow.steps.length,
            triggers: workflow.triggers
        }));
    }

    /**
     * Sistem durumunu döndürür
     */
    getStatus() {
        return {
            active: true,
            workflows: this.workflows.size,
            triggers: this.triggers.size,
            lastActivity: new Date().toISOString(),
            version: '1.0.0'
        };
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManusMailIntegration;
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.ManusMailIntegration = ManusMailIntegration;
}

/**
 * Kullanım Örneği:
 * 
 * const manus = new ManusMailIntegration({
 *     webhookUrl: 'https://vertexcnc.tr/api/manus-webhook',
 *     apiKey: 'your-manus-api-key'
 * });
 * 
 * // Manuel tetikleme
 * manus.triggerManualWorkflow('quote_request', {
 *     customerEmail: 'musteri@sirket.com',
 *     orderNumber: 'VTX-2025-001',
 *     trackingId: 'uuid-here'
 * });
 */

