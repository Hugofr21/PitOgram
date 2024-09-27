#!/bin/bash

#backup
cp ~/.config/openbox/lxde-pi-rc.xml ~/.config/openbox/lxde-pi-rc.xml.bak

remove_keybinding() {
    sed -i "/<keybind key=\"$1\">/,/<\/keybind>/d" ~/.config/openbox/lxde-pi-rc.xml
}

remove_keybinding "A-Tab"        # Alt+Tab (mudar de aplicativo)
remove_keybinding "A-F4"         # Alt+F4 (fechar janela)
remove_keybinding "A-F5"         # Alt+F5 (maximizar)
remove_keybinding "A-F7"         # Alt+F7 (mover janela)
remove_keybinding "A-F8"         # Alt+F8 (redimensionar janela)
remove_keybinding "A-F9"         # Alt+F9 (minimizar)
remove_keybinding "A-F10"        # Alt+F10 (tela cheia)
remove_keybinding "C-A-Delete"   # Ctrl+Alt+Delete (gestor de tarefas)
remove_keybinding "W-e"          # Win+E (explorador de arquivos)
remove_keybinding "W-r"          # Win+R (executar)
remove_keybinding "A-S-Delete"   # Alt+Shift+Delete

for i in {1..12}; do
    remove_keybinding "F$i"
done

openbox --reconfigure

mkdir -p ~/.config/lxsession/LXDE-pi
echo "# Empty file to disable global hotkeys" > ~/.config/lxsession/LXDE-pi/desktop.conf

echo '<?xml version="1.0" encoding="UTF-8"?>
<openbox_menu>
</openbox_menu>' > ~/.config/openbox/menu.xml

echo "Atalhos do sistema e funcionalidades foram desativados. Um backup foi criado em ~/.config/openbox/lxde-pi-rc.xml.bak"