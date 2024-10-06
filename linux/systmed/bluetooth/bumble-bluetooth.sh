#!/bin/bash

set -o errexit 

USER=$(whoami) 
SERVICE_NAME="bumble-bluetooth.service" 
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}" 
DIRECTORY_BUMBLE="/home/$USER/Bluetooth-Keypad/test/" 
DIRECTORY_BUMBLE_MOVE="/opt/bumble-bluetooth" 


if [ ! -d "${DIRECTORY_BUMBLE_MOVE}" ]; then
   echo "Creating directory in /opt..."
   sudo mkdir -p "${DIRECTORY_BUMBLE_MOVE}/test" 
   sudo cp -r "${DIRECTORY_BUMBLE}"* "${DIRECTORY_BUMBLE_MOVE}/" 
fi


echo "Setting permissions on the working directory..."
sudo chown -R root:docker "${DIRECTORY_BUMBLE_MOVE}" 
sudo chmod -R 750 "${DIRECTORY_BUMBLE_MOVE}" || { echo "Failed to set permissions"; exit 1; } 


cleanup_service_bluetooth(){
    if [ -f "$SERVICE_PATH" ]; then
        echo "Existing service found, removing..."
        sudo systemctl stop "${SERVICE_NAME}" || { echo "Failed to stop the service"; exit 1; }  
        sudo systemctl disable "${SERVICE_NAME}" || { echo "Failed to disable the service"; exit 1; }  
        sudo rm "$SERVICE_PATH" || { echo "Failed to remove the service file"; exit 1; } 
        sudo systemctl daemon-reload || { echo "Failed to reload the daemon"; exit 1; }  
        sudo systemctl reset-failed || { echo "Failed to reset failed services"; exit 1; } 
    fi
}

cleanup_service_bluetooth


if [ ! -d "${DIRECTORY_BUMBLE_MOVE}" ]; then
    echo "Working directory not found!"
    exit 1
fi


if ! groups $USER | grep -q '\bdocker\b'; then
    sudo groupadd -f docker || { echo "Failed to create the docker group"; exit 1; }  
    sudo usermod -aG docker $USER || { echo "Failed to add the user to the docker group"; exit 1; }  
    echo "User $USER added to the docker group."
fi


echo "Creating systemd service file..."
sudo bash -c "cat <<EOF > ${SERVICE_PATH}
[Unit]
Description=Bumble Bluetooth
After=network.target docker.service 
Requires=docker.service  

[Service]
WorkingDirectory=${DIRECTORY_BUMBLE_MOVE}  
ExecStart=/usr/bin/docker compose -f ${DIRECTORY_BUMBLE_MOVE}/docker-compose.yml up
ExecStop=/usr/bin/docker compose -f ${DIRECTORY_BUMBLE_MOVE}/docker-compose.yml down  
Restart=always 

[Install]
WantedBy=multi-user.target 
EOF" || { echo "Failed to create the service file"; exit 1; }

echo "Enabling and starting the service..."
sudo systemctl daemon-reload || { echo "Failed to reload the systemd daemon"; exit 1; }
sudo systemctl enable "$SERVICE_NAME" || { echo "Failed to enable the service"; exit 1; } 
sudo systemctl start "$SERVICE_NAME" || { echo "Failed to start the service"; exit 1; } 

echo "Configuration complete. The Bumble Bluetooth project will now start automatically."
