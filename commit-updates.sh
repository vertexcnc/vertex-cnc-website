#!/bin/bash

echo "📋 VERTEX CNC Güncelleme Özeti 📋"

echo "🔒 Güvenlik güncellemelerini commit ediyorum..."
git add .
git commit -m "Güvenlik güncellemeleri: Wrangler v2'ye geçiş, NPM güvenlik açıklarını düzeltme"

echo "📝 Değişiklikler:"
echo "1. Wrangler v1 -> v2 geçişi"
echo "2. NPM güvenlik açıkları giderildi"
echo "3. Yapılandırma dosyaları güncellendi"
echo "4. Deployment kılavuzları güncellendi"
echo "5. Güncel güvenlik raporu eklendi"

echo "✅ Tüm değişiklikler kaydedildi."
echo "🚀 Değişiklikleri göndermek için: git push origin main"
