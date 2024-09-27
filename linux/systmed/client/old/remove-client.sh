#!/bin/bash

SERVICE_NAME="client.service"
SERVICE_PATH="$HOME/.config/systemd/user/${SERVICE_NAME}"

if systemctl --user is-active --quiet "$SERVICE_NAME"; then
    echo "Stopping existing service..."
    systemctl --user stop "$SERVICE_NAME"
fi

if systemctl --user is-enabled --quiet "$SERVICE_NAME"; then
    echo "Disabling existing service..."
    systemctl --user disable "$SERVICE_NAME"
fi

if [ -f "$SERVICE_PATH" ]; then
    echo "Removing existing service file..."
    rm "$SERVICE_PATH"
fi