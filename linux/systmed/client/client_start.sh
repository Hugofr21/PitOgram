#!/bin/bash

set -o errexit

USER=$(whoami)
SERVICE_NAME="pitogram.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
DIRECTORY_APP="/home/$USER/PitOgram/out/pitOgram-linux-arm64"
EXEC_PATH="$DIRECTORY_APP/pitogram"


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
WantedBy=multi-user.target
EOF"


echo "Configurando permissões e habilitando o serviço..."
sudo chmod 644 ${SERVICE_PATH}
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}


echo "Desabilitando o início automático do ambiente gráfico..."
sudo systemctl set-default multi-user.target


echo "Criando script de inicialização..."
STARTUP_SCRIPT="/home/$USER/start_pitogram_and_desktop.sh"
sudo bash -c "cat <<EOF > ${STARTUP_SCRIPT}
#!/bin/bash
sudo systemctl start ${SERVICE_NAME}
sleep 2 
startx  
EOF"
sudo chmod +x ${STARTUP_SCRIPT}


echo "Configurando .bashrc..."
echo "if [[ ! \$DISPLAY && \$XDG_VTNR -eq 1 ]]; then" >> /home/$USER/.bashrc
echo "    exec ${STARTUP_SCRIPT}" >> /home/$USER/.bashrc
echo "fi" >> /home/$USER/.bashrc

echo "Configuração concluída. O Pitogram será iniciado automaticamente antes do ambiente gráfico."
echo "Reiniciando o sistema em 10 segundos..."
sleep 10
sudo reboot