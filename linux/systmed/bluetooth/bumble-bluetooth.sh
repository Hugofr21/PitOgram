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

if [ ! -d "${DIRECTORY_BUMBLE}" ]; then
    echo "Working directory does not exist!"
    exit 1
fi

sudo chmod -R 755 "${DIRECTORY_BUMBLE}" || { echo "Failed to set permissions"; exit 1; }

if ! groups $USER | grep -q '\bdocker\b'; then
    sudo groupadd -f docker || { echo "Failed to create docker group"; exit 1; }
    sudo usermod -aG docker $USER || { echo "Failed to add user to docker group"; exit 1; }
    echo "User $USER added to docker group."
fi

echo "Creating systemd service file..."

sudo bash -c "cat <<EOF > ${SERVICE_PATH}
[Unit]
Description=Bumble Bluetooth
After=network.target docker.service
Requires=docker.service

[Service]
WorkingDirectory=${DIRECTORY_BUMBLE}
ExecStart=/usr/bin/docker compose -f $DIRECTORY_BUMBLE/docker-compose.yml up 
ExecStop=/usr/bin/docker compose -f $DIRECTORY_BUMBLE/docker-compose.yml down
Restart=always

[Install]
WantedBy=multi-user.target
EOF" || { echo "Failed to create service file"; exit 1; }


sudo systemctl daemon-reload || { echo "Failed to reload systemd daemon"; exit 1; }
sudo systemctl enable "$SERVICE_NAME" || { echo "Failed to enable service"; exit 1; }
sudo systemctl start "$SERVICE_NAME" || { echo "Failed to start service"; exit 1; }

echo "Configuration complete. The Bumble interface project will now start."
