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

echo "Creating new service file..."
mkdir -p "$HOME/.config/systemd/user"
cat <<EOF > "$SERVICE_PATH"
[Unit]
Description=Pitogram
After=graphical-session.target
Requires=graphical-session.target

[Service]
WorkingDirectory=/home/PitOgram/PitOgram/out/pitOgram-linux-arm64/
ExecStart=/home/PitOgram/PitOgram/out/pitOgram-linux-arm64/pitogram
Restart=always
Environment=DISPLAY=:0
Environment=XAUTHORITY=$XAUTHORITY
StandardOutput=journal
StandardError=journal
Type=simple

[Install]
WantedBy=default.target

EOF

# Step 3: Reload systemd, enable, and start the new service
echo "Reloading systemd user daemon..."
systemctl --user daemon-reload

echo "Enabling the new service..."
systemctl --user enable client.service

echo "Starting the new service..."
systemctl --user start client.service

echo "Configuration complete. The Pitogram interface project will now start after login."
