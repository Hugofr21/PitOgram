#!/bin/bash

set -o errexit

USER=$(whoami)
SERVICE_NAME="pitogram.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
DIRECTORY_APP="/home/$USER/PitOgram/out/pitOgram-linux-arm64"
EXEC_PATH="$DIRECTORY_APP/pitogram"

BUMBLE_SERVICE_NAME="bumble-bluetooth.service"

if [ -f "$SERVICE_PATH" ]; then
    echo "Removendo serviço existente..."
    sudo systemctl stop "${SERVICE_NAME}"
    sudo systemctl disable "${SERVICE_NAME}"
    sudo rm "$SERVICE_PATH"
    sudo systemctl daemon-reload
    sudo systemctl reset-failed
fi

echo "Criando novo arquivo de serviço..."
sudo bash -c "cat <<EOF > ${SERVICE_PATH}
[Unit]
Description=Pitogram
After=network.target
Before=graphical.target


[Service]
Type=simple
User=$USER
WorkingDirectory=$DIRECTORY_APP
ExecStart=$EXEC_PATH
Restart=always
Environment=DISPLAY=:0

[Install]
WantedBy=graphical.target
EOF"

echo "Configurando permissões e habilitando o serviço..."
sudo chmod 644 ${SERVICE_PATH}
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}

echo "Configuração concluída. O Pitogram será iniciado automaticamente após o Bumble Bluetooth."
echo "Reiniciando o sistema em 5 segundos..."
sleep 5
sudo reboot
