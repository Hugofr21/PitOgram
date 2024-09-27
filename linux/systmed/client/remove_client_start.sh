#!/bin/bash

USER=$(whoami)
SERVICE_NAME="pitogram.service"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
STARTUP_SCRIPT="/home/$USER/start_pitogram_and_desktop.sh"

cleanup() {
    echo "Iniciando limpeza completa de configurações anteriores..."
    
    if systemctl is-active --quiet ${SERVICE_NAME}; then
        echo "Parando o serviço ${SERVICE_NAME}..."
        sudo systemctl stop ${SERVICE_NAME}
    fi
    if systemctl is-enabled --quiet ${SERVICE_NAME}; then
        echo "Desabilitando o serviço ${SERVICE_NAME}..."
        sudo systemctl disable ${SERVICE_NAME}
    fi

    if [ -f "$SERVICE_PATH" ]; then
        echo "Removendo arquivo de serviço ${SERVICE_PATH}..."
        sudo rm "$SERVICE_PATH"
    fi


    echo "Removendo links simbólicos do serviço..."
    sudo find /etc/systemd/system -type l -name "*${SERVICE_NAME}*" -delete

    echo "Recarregando o daemon do systemd..."
    sudo systemctl daemon-reload
    sudo systemctl reset-failed

    if [ -f "$STARTUP_SCRIPT" ]; then
        echo "Removendo script de inicialização ${STARTUP_SCRIPT}..."
        sudo rm "$STARTUP_SCRIPT"
    fi

    echo "Removendo configurações do .bashrc..."
    sed -i '/start_pitogram_and_desktop.sh/d' /home/$USER/.bashrc

    echo "Restaurando configuração padrão do ambiente gráfico..."
    sudo systemctl set-default graphical.target


    echo "Limpando cache do systemd..."
    sudo rm -rf /var/lib/systemd/unit-overrides/${SERVICE_NAME}
    sudo rm -rf /var/lib/systemd/linger/${USER}

    sed -i '/if \[\[ ! \$DISPLAY && \$XDG_VTNR -eq 1 \]\]; then/,/fi/d' /home/$USER/.bashrc

    echo "Limpeza completa concluída."
}


cleanup

echo "Verificando se o serviço ainda existe..."
if systemctl list-unit-files | grep -q ${SERVICE_NAME}; then
    echo "AVISO: O serviço ${SERVICE_NAME} ainda está presente no sistema."
    echo "Por favor, verifique manualmente e considere reiniciar o sistema."
else
    echo "O serviço ${SERVICE_NAME} foi removido com sucesso."
fi

echo "Recomenda-se reiniciar o sistema para garantir que todas as mudanças tenham efeito."
echo "Deseja reiniciar agora? (s/n)"
read -r response
if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    sudo reboot
else
    echo "Lembre-se de reiniciar o sistema mais tarde para aplicar todas as mudanças."
fi