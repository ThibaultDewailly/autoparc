#!/bin/bash
# Installation script for AutoParc Backend systemd service

set -e

echo "Installing AutoParc Backend systemd service..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/autoparc/backend
mkdir -p /opt/autoparc/backend/bin
mkdir -p /opt/autoparc/backend/logs
mkdir -p /etc/autoparc

# Copy the binary
echo "Copying backend binary..."
if [ ! -f "./bin/api" ]; then
    echo "Error: Backend binary not found at ./bin/api"
    echo "Please build the backend first with: make build-backend"
    exit 1
fi
cp ./bin/api /opt/autoparc/backend/bin/api
chmod +x /opt/autoparc/backend/bin/api

# Create environment file if it doesn't exist
if [ ! -f "/etc/autoparc/backend.env" ]; then
    echo "Creating environment file..."
    cp scripts/backend.env.example /etc/autoparc/backend.env
    chmod 600 /etc/autoparc/backend.env
    echo "WARNING: Please edit /etc/autoparc/backend.env and set your DB_PASSWORD"
fi

# Set ownership
echo "Setting ownership..."
chown -R www-data:www-data /opt/autoparc/backend

# Copy systemd service file
echo "Installing systemd service..."
cp scripts/autoparc-backend.service /etc/systemd/system/autoparc-backend.service
chmod 644 /etc/systemd/system/autoparc-backend.service

# Reload systemd
echo "Reloading systemd..."
systemctl daemon-reload

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit /etc/autoparc/backend.env and set your DB_PASSWORD"
echo "2. Update the service file if needed: /etc/systemd/system/autoparc-backend.service"
echo "3. Enable the service: sudo systemctl enable autoparc-backend"
echo "4. Start the service: sudo systemctl start autoparc-backend"
echo "5. Check status: sudo systemctl status autoparc-backend"
echo "6. View logs: sudo journalctl -u autoparc-backend -f"
