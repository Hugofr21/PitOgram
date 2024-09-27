# Resolver Conflitos entre Kernel, BlueZ e Bumble no Raspberry Pi 4

Para garantir que o controlador Bluetooth não seja iniciado pelo BlueZ e resolver conflitos com a aplicação Bumble, siga os passos abaixo:

## 1. Desative o BlueZ e o Serviço `bluetooth`

```sh
sudo systemctl stop bluetooth
sudo systemctl disable bluetooth
```

### 2. Interface HCI down

```sh
hciconfig
sudo hciconfig hci0 down
```

### 2. Desativar Modulos Bluetooth do Kernel

```sh
lsmod | grep bluetooth
sudo rmmod bluetooth
```

### 3. Reneniciar o Sistema

```sh
sudo reboot
```

***Este guia garante que o controlador Bluetooth não seja iniciado pelo BlueZ, permitindo que a aplicação Bumble use diretamente a interface HCI do dispositivo Bluetooth no Raspberry Pi 4.***
