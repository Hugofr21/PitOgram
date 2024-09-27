#!/bin/bash

heck_module() {
    if lsmod | grep -q "$1"; then
        echo "Failure: The $1 module is still loaded."
    else
        echo "OK: Module $1 was successfully removed."
    fi 
}

if hciconfig hci0 > /dev/null 2>&1; then
    echo "Desativando a interface HCI..."
    sudo hciconfig hci0 down
    echo "HCI interface hci0 has been successfully disabled."
else
    echo "HCI interface hci0 not found or is already disabled."
fi

echo "Disabling the Bluetooth service..."

sudo systemctl stop bluetooth
sudo systemctl disable bluetooth

echo "Verificando interface HCI..."


echo "Removing Bluetooth modules from the kernel..."

modules=("bluetooth")

for module in "${modules[@]}"; do
    sudo rmmod "$module"
    check_module "$module"
done

echo "Blocking automatic loading of Bluetooth modules..."
for module in "${modules[@]}"; do
   if ! grep -q "^blacklist $module" /etc/modprobe.d/blacklist-bluetooth.conf; then
        echo "blacklist $module" | sudo tee -a /etc/modprobe.d/blacklist-bluetooth.conf
    else
        echo "Module $module is already blacklisted, skipping..."
    fi
done

echo "Restarting the system..."
sudo reboot