#!/bin/bash

set -o errexit

DISABLE_WIFI="dtoverlay=disable-wifi"
CONFIG_FILE="/boot/config.txt"

sudo rfkill block wifi

set_config() {
    local key_value="$1"
    local key=$(echo "$key_value" | cut -d'=' -f1)

    if grep -q "^${key}=" "$CONFIG_FILE"; then
        sudo sed -i "s/^${key}=.*/${key_value}/" "$CONFIG_FILE"
    else
        echo "$key_value" | sudo tee -a "$CONFIG_FILE" > /dev/null
    fi
}

set_dtoverlay() {
    local overlay="$1"

    if grep -q "^dtoverlay=" "$CONFIG_FILE"; then
        if grep -q "^dtoverlay=.*$overlay" "$CONFIG_FILE"; then
            return
        else
           
            sudo sed -i "/^dtoverlay=/s/$/,$overlay/" "$CONFIG_FILE"
        fi
    else 
        echo "$overlay" | sudo tee -a "$CONFIG_FILE" > /dev/null
    fi
}


set_dtoverlay "$DISABLE_WIFI"

echo "Configurações adicionadas/atualizadas com sucesso no /boot/config.txt"
sleep 2
sudo reboot
