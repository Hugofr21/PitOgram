#!/bin/bash

# Caminhos dos arquivos
CONFIG_FILE="/etc/xdg/openbox/lxde-pi-rc.xml"
BACKUP_FILE="/etc/xdg/openbox/lxde-pi-rc.xml.bak"
TEMP_FILE="$(mktemp)"

# Verificar se o arquivo de configuração existe
if [[ ! -f $CONFIG_FILE ]]; then
    echo "Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

# Fazer backup do arquivo de configuração
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "Backup do arquivo de configuração criado em: $BACKUP_FILE"

# Remover a seção <keyboard>
awk '
    BEGIN { skip=0 }
    /<keyboard>/ { skip=1 }  # Quando encontra <keyboard>, começa a ignorar
    /<\/keyboard>/ { skip=0; next }  # Quando encontra </keyboard>, para de ignorar
    !skip { print }  # Se não estiver ignorando, imprime a linha
' "$CONFIG_FILE" > "$TEMP_FILE"

# Substituir o arquivo de configuração original pelo temporário
mv "$TEMP_FILE" "$CONFIG_FILE"

echo "Seção <keyboard> removida com sucesso. Reinicie o Openbox com 'openbox --restart'."
