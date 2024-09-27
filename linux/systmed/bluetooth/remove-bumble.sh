#!/bin/bash

SERVICE_NAME="bumble-bluetooth.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
DIRECTORY_BUMBLE="/home/PitOgram/Bluetooth-Keypad/test/"

cleanup_service_bluetooth(){
    if [ -f "$SERVICE_PATH" ]; then
        echo "Service exists, preparing to remove!"
        sudo systemctl stop "${SERVICE_NAME}" || { echo "Failed to stop service"; exit 1; }
        sudo systemctl disable "${SERVICE_NAME}" || { echo "Failed to disable service"; exit 1; }
        sudo rm "$SERVICE_PATH" || { echo "Failed to remove service file"; exit 1; }
        sudo systemctl daemon-reload || { echo "Failed to reload daemon"; exit 1; }
        sudo systemctl reset-failed || { echo "Failed to reset failed services"; exit 1; }
    fi
}


cleanup_service_bluetooth