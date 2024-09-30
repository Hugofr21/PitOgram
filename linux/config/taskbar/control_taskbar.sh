#!/bin/bash

CONFIG_FILE="/etc/xdg/lxpanel/LXDE/panels/panel"
CONFIG_FILE_PI="/etc/xdg/lxpanel/LXDE-pi/panels/panel"

sudo rm -f /usr/bin/lxpanel

sudo sed -i 's/autohide=.*/autohide=true/' ~/.config/wf-panel-pi.ini
sudo sed -i 's/autohide=.*/autohide_duration=true/' ~/.config/wf-panel-pi.ini

/etc/xdg/lxpanel/LXDE/panels/panel

update_autohide() {
    local config="$1"

    if grep -q '"autohide"' "$config"; then
        sudo sed -i 's/"autohide": *[01]/"autohide": 1/' "$config"
    else
        sudo sed -i '/"Global": {/a \
        "autohide": 1,' "$config"
    fi
}

update_autohide "$CONFIG_FILE"
update_autohide "$CONFIG_FILE_PI"