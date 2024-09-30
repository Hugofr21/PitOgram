# Concluir a instalação final
Após ter efetuado a instalação do Docker e adicionado o serviço Bluetooth, siga os passos abaixo para concluir a configuração do sistema.

Primeiro, verifique se o serviço Bluetooth está ativo:
```sh
sudo systemctl status bumble-bluetooth.service
```
Se o serviço não estiver ativo, execute o seguinte script para ativar o Bluetooth: [Ativar Bluetooth](../linux/systmed/bluetooth/bumble-bluetooth.sh)

## Desligar o wifi
Neste caso, como a aplicação não necessita de acesso Wi-Fi, não é necessário manter o serviço ativo. Assim, desativamos o Wi-Fi utilizando o script abaixo. Caso precise manter o Wi-Fi ligado, não execute este passo.
[Desligar wifi](../linux/wifi/disable_wifi.sh)


## Desligar Taskbar
É essencial desativar a barra de tarefas gráfica, pois não será necessária para a aplicação.
[Desligar taskbar](../linux/config/taskbar/control_taskbar.sh)



## Serviço app client
Após executar este script, a aplicação será reiniciada automaticamente após o login.
[Ative serviço da app](../linux/systmed/client/client_start.sh)
