#!/bin/bash

COMMAND="sudo systemctl status bluetooth.service"
OUTPUT=$($COMMAND)

echo "${OUTPUT}"

if echo "$OUTPUT" | grep -q 'Active: inactive (dead)'; then
    echo "Bluetooth is off"
else
    echo "Bluetooth is active"
    
    sleep 2

    sudo systemctl stop bluetooth.service
    sudo systemctl disable bluetooth.service
    echo "Bluetooth service has been stopped and disabled."
    sudo reboot 
fi