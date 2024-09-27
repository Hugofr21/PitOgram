#!/bin/bash

DIRECTORY_APP="/home/PitOgram/PitOgram/out/pitOgram-linux-arm64/pitogram"
SERVICE_NAME="pitogram.desktop"
AUTOSTART_PATH="$HOME/.config/autostart/${SERVICE_NAME}"
sudo systemctl disable lightdm.service

sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/
sudo tee /etc/systemd/system/getty@tty1.service.d/autologin.conf > /dev/null <<EOL
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin pi --noclear %I \$TERM
EOL


echo 'if [ "$(tty)" = "/dev/tty1" ]; then' >> ~/.bashrc
echo "  sudo systemctl start $SERVICE_NAME" >> ~/.bashrc
echo "  sleep 5" >> ~/.bashrc
echo "  startx $DIRECTORY_APP --no-sandbox" >> ~/.bashrc
echo 'fi' >> ~/.bashrc


if [ -f "$AUTOSTART_PATH" ]; then
    echo "Removendo arquivo de autostart existente..."
    rm "$AUTOSTART_PATH"
fi

echo "Configuração completa. O Pitogram iniciará automaticamente após o boot."

sleep 5

sudo reboot