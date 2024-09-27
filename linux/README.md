# Sysmed
## Remove
```
sudo systemctl stop bumble-bluetooth.service
sudo systemctl disable bumble-bluetooth.service
sudo rm /etc/systemd/system/bumble-bluetooth.service
sudo systemctl daemon-reload
sudo systemctl reset-failed
```