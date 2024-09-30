# Fase final  para iniciar o software
Clique aqui após ter realizado todas as etapas de configurações essenciais para que o software seja executado com sucesso. Esta é a fase final para iniciar o software automaticamente após o login. Consulte a: [documentação final.](./docs/pre_installation.md)
---

# Normas para Vídeos de Animações
Para mais detalhes sobre as normas de criação de vídeos, consulte a  [documentação das normas.](./docs/normas.md)
---

# PitOgram: Inicialização da App (Windows e Linux)

## Iniciar a App (node)
```
npm start
```

## Install dependencies (node)

```
npm install
```

## Remove noce_modules (windows only)
Use este comando para remover a pasta node_modules no Windows:
```
rmdir /s /q node_modules 
```

# Linux
Os projetos estão localizados nos seguintes diretórios:
- Client: /home/PitOgram/PitOgram
- Bluetooth API: /home/PitOgram/Bluetooth-Keypad/

## Remove noce_modules (linux only)
Para remover a pasta node_modules no Linux, utilize o seguinte comando:
- Diretório: /home/PitOgram/PitOgram

```
rm -rf  node_modules 
```


## Python 2.7.3 (Linux only)
Para instalar o Python 2.7.3, utilize o script de configuração disponível no link abaixo. Antes de executar o script, certifique-se de que está conectado à internet:
[script install python](./linux/config/dependencies/python_config.sh)

## Node version >= 17 (Linux only)
Para instalar a versão 17 ou superior do Node.js, utilize o seguinte script. Verifique a conexão à internet antes de iniciar o processo:
[script install python](./linux/config/dependencies/python_config.sh)

## Docker (Linux only)
Para instalar o Docker, execute o script de configuração abaixo. Lembre-se de garantir que seu sistema está conectado à internet antes de rodar o script no terminal:
[script install python](./linux/config/dependencies/docker_config.sh)


# Raspberry Pi 4 (Linux only)

Para resolver problemas com Bluetooth, consulte a documentação para
[linux.](./docs/linux_bluetooth.md)

## Configurar o Overlay Raspberry Pi
O arquivo /boot/config.txt é crucial para a configuração do Raspberry Pi, permitindo ajustes na velocidade da CPU, na memória RAM e em outros parâmetros de desempenho. Aqui estão algumas considerações importantes:
1. Velocidade da CPU
2. Controle de Temperatura
3. Overclocking
4. Ajustes na Memória
[Configurar](./linux/config/performance/config-raspbery.sh)

### Tutorial como configurar cooler (Verifique as Conexões do Cooler)
> Primeiramente, certifique-se de que o cooler está corretamente conectado ao Raspberry Pi:

- Pino de Alimentação: Conecte o fio vermelho do cooler ao pino de 5V do GPIO (pino 4 ou 2).
- Pino de Terra: Conecte o fio preto ao pino GND do GPIO (pino 6 ou 9).
- Pino de Controle (Opcional): Se o cooler for controlado via GPIO, conecte o fio de controle ao pino GPIO 18 (pino 12).



***Referências***
https://www.makerhero.com/blog/como-utilizar-o-cooler-para-case-oficial-raspberry-pi-4/


# Criar Projeto Executável
Para exportar o projeto como executável, execute este comando no terminal (tanto no Windows quanto no Linux). Ele irá exportar o executável para a pasta out. O processo pode demorar alguns minutos. Este comando deve ser executado no diretório do projeto.
- Exemplo: Diretório do projeto (Linux): /home/PitOgram/PitOgram/out/pitOgram-linux-arm64
- Exemplo: Saída do projeto (linux): /home/PitOgram/PitOgram/out/pitOgram-linux-arm64/pitogram 

```
npm run make 
```

## Construir Aplicação para Linux
Use o comando abaixo para construir a aplicação no Linux. A permissão de execução é necessária para o arquivo binário gerado:

```sh
chmod +x /home/PitOgram/PitOgram/dist/PitOgram-linux-arm64/pitogram 
```
