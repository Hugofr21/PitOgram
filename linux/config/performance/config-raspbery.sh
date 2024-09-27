#!/bin/bash

OVER_VOLTAGE="over_voltage=4"
ARM_FREQ="arm_freq=1500"
GPU_FREQ="gpu_freq=600"
GPU_MEM="gpu_mem=512"
SD_OVERCLOCK="dtparam=sd_overclock=80"
FAN_OVERLAY="dtoverlay=gpio-fan,gpiopin=18,active_low=1"
DTOVERLAY="dtoverlay=piscope,dtoverlay=vc4-kms-v3d"

CONFIG_FILE="/boot/config.txt"

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
            sudo sed -i "/^dtoverlay=/s/.*/$overlay/" "$CONFIG_FILE"
        fi
    else 
        echo "$overlay" | sudo tee -a "$CONFIG_FILE" > /dev/null
    fi
    
}

set_config "$OVER_VOLTAGE"
set_config "$ARM_FREQ"
set_config "$GPU_FREQ"
set_config "$GPU_MEM"
set_config "$SD_OVERCLOCK"
set_config "$FAN_OVERLAY"
set_dtoverlay "$DTOVERLAY"

TEMPERATURE=$(vcgencmd measure_temp)
echo "Temperatura atual: $TEMPERATURE"

echo "Configurações adicionadas/atualizadas com sucesso no /boot/config.txt"
sleep 4
sudo reboot