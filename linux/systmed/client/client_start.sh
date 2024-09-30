#!/bin/bash

set -o errexit

USER=$(whoami)
SERVICE_NAME="pitogram.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
DIRECTORY_APP="/home/$USER/PitOgram/out/pitOgram-linux-arm64"
EXEC_PATH="$DIRECTORY_APP/pitogram"
STARTUP_SCRIPT="/home/$USER/start_pitogram_and_desktop.sh"

# Verifica se o serviço já existe e remove se necessário
if [ -f "$SERVICE_PATH" ]; then
    echo "Removendo serviço existente..."
    sudo systemctl stop "${SERVICE_NAME}"
    sudo systemctl disable "${SERVICE_NAME}"
    sudo rm "$SERVICE_PATH"
    sudo systemctl daemon-reload
    sudo systemctl reset-failed
fi

# Cria o arquivo do serviço
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

# Configura permissões e habilita o serviço
echo "Configurando permissões e habilitando o serviço..."
sudo chmod 644 ${SERVICE_PATH}
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}

# Script para iniciar o serviço e o ambiente gráfico
echo "Criando script de inicialização..."
sudo bash -c "cat <<EOF > ${STARTUP_SCRIPT}
#!/bin/bash
sudo systemctl start ${SERVICE_NAME}
sleep 2
startx
EOF"
sudo chmod +x ${STARTUP_SCRIPT}


echo "Configurando .bashrc..."
BASHRC_FILE="/home/$USER/.bashrc"
if ! grep -q "$STARTUP_SCRIPT" "$BASHRC_FILE"; then
    echo "if [[ ! \$DISPLAY && \$XDG_VTNR -eq 1 ]]; then" >> $BASHRC_FILE
    echo "    exec ${STARTUP_SCRIPT}" >> $BASHRC_FILE
    echo "fi" >> $BASHRC_FILE
else
    echo "Configuração de inicialização já presente no .bashrc"
fi

echo "Configuração concluída. O Pitogram será iniciado automaticamente antes do ambiente gráfico."
echo "Reiniciando o sistema em 5 segundos..."
sleep 5
sudo reboot
