#!/bin/bash

# AI Agent için Cron Job kurulum script'i

# Log dosyası ayarla
mkdir -p /var/log/ai-agent
touch /var/log/ai-agent/monitor.log
chmod 644 /var/log/ai-agent/monitor.log

# Proje dizinini belirle
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "AI Agent'ı $PROJECT_DIR dizininde çalıştıracak."

# .env dosyasını kontrol et
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "⚠️  .env dosyası bulunamadı! Örnek dosyadan kopyalanıyor."
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo "⚠️  Lütfen .env dosyasındaki değerleri güncelleyin."
fi

# Cron job tanımını oluştur
CRON_JOB="*/5 * * * * cd $PROJECT_DIR && CLOUDFLARE_API_TOKEN='4ZbWE35t1Sk_clPZjoQxOIXkIBb09y5nfIEqb_2m' CLOUDFLARE_ACCOUNT_ID='ac59bcba451f212de66aef49fb66fc75' /usr/bin/python3 $PROJECT_DIR/ai_agent_monitor.py >> /var/log/ai-agent/monitor.log 2>&1"
echo "Eklenecek cron job:"
echo "$CRON_JOB"

# Cron job'ı ekle
(crontab -l 2>/dev/null | grep -v "ai_agent_monitor.py"; echo "$CRON_JOB") | crontab -

echo "✅ AI Agent cron job başarıyla eklendi!"
echo "✅ 5 dakikada bir kontrol edecek şekilde ayarlandı."
echo "✅ Log dosyası: /var/log/ai-agent/monitor.log"
