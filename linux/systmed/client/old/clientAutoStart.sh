#!/bin/bash

SERVICE_NAME="pitogram.desktop"
SERVICE_PATH="$HOME/.config/autostart/${SERVICE_NAME}"

if [ -f "$AUTOSTART_PATH" ]; then
    echo "Removing existing autostart file..."
    rm "$AUTOSTART_PATH"
fi

echo "Creating new autostart file..."
mkdir -p "$HOME/.config/autostart"

cat <<EOF > "$AUTOSTART_PATH"
[Desktop Entry]
Type=Application
Exec=/home/PitOgram/PitOgram/out/pitOgram-linux-arm64/pitogram
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=Pitogram
Comment=Start Pitogram on login
EOF

echo "Autostart configuration complete. The Pitogram interface project will now start automatically after login."

sudo systemctl disable lightdm.service

sudo reboot