#!/bin/bash

function help {
    echo "Uso: $0 [desligar|ligar]"
    exit 1
}

if [ $# -ne 1 ]; then
    help
fi

action=$1

function handle_gnome {
    if [ "$action" = "desligar" ]; then
        gsettings set org.gnome.Shell enable-hot-corners false
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock autohide true
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock dock-fixed false
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock intellihide true
    elif [ "$action" = "ligar" ]; then
        gsettings set org.gnome.Shell enable-hot-corners true
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock autohide false
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock dock-fixed true
        gsettings set org.gnome.Shell.Extensions.Dash-to-Dock intellihide false
    fi
}

function handle_kde {
    if [ "$action" = "desligar" ]; then
        kwriteconfig5 --file plasma-org.kde.plasma.desktop-appletsrc --group Containments --group 1 --group General --key locked true
    elif [ "$action" = "ligar" ]; then
        kwriteconfig5 --file plasma-org.kde.plasma.desktop-appletsrc --group Containments --group 1 --group General --key locked false
    fi
}

function handle_xfce {
    if [ "$action" = "desligar" ]; then
        xfce4-panel -q
    elif [ "$action" = "ligar" ]; then
        xfce4-panel &
    fi
}

function handle_lxde {
    if [ "$action" = "desligar" ]; then
        pkill lxpanel
    elif [ "$action" = "ligar" ]; then
        lxpanel &
    fi
}

if [ "$action" != "desligar" ] && [ "$action" != "ligar" ]; then
    help
fi

if pgrep gnome-shell > /dev/null; then
    handle_gnome
elif pgrep plasmashell > /dev/null; then
    handle_kde
elif pgrep xfce4-panel > /dev/null; then
    handle_xfce
elif pgrep lxpanel > /dev/null; then
    handle_lxde
else
    echo "Ambiente de desktop não reconhecido ou não suportado."
    exit 1
fi

echo "A barra de tarefas foi $action. Use '$0 ligar' para reativá-la ou '$0 desligar' para desativá-la novamente."