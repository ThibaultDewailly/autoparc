#!/bin/bash
# Copy systemd service file
echo "Installing systemd service..."
cp autoparc-backend.service /etc/systemd/system/autoparc-backend.service
chmod 644 /etc/systemd/system/autoparc-backend.service

# Reload systemd
echo "Reloading systemd..."
systemctl daemon-reload
