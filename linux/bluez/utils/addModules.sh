#!/bin/bash

# sudo modprobe hci_uart
# sudo modprobe btbcm
# sudo modprobe btusb
# sudo modprobe bnep

modules=("btusb" "bnep" "btbcm" "hci_uart")

check_module_ls() {
    local module=$1
    if lsmod | grep -q "^$module\b"; then
        echo "Success: Module $module is loaded successfully."
    else
        echo "Error: module $module is not loaded."
    fi
}

for module in "${modules[@]}"; do
    if lsmod | grep -q "^$module\b"; then
        echo "The $module module is already loaded."
    else
        echo "Module $module is not loaded. Reloading..."
        sudo modprobe "$module"
        check_module_ls "$module"
    fi
done

echo "The specified modules have been processed."