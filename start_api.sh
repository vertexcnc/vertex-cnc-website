#!/bin/bash

export SENDGRID_API_KEY="YOUR_SENDGRID_API_KEY_HERE"
export FROM_EMAIL="destek@vertexcnc.tr"
export SUPPORT_EMAIL="destek@vertexcnc.tr"
export NOTIFICATION_EMAIL="destek@vertexcnc.tr"
export FLASK_DEBUG=1

echo "🚀 Starting VERTEX CNC API with proper environment..."
echo "📧 FROM_EMAIL: $FROM_EMAIL"
echo "📧 SUPPORT_EMAIL: $SUPPORT_EMAIL"

cd /workspaces/vertex-cnc-website/api
python app.py
