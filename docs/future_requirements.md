# Enegenharia de Requisitos:

## Requisitos funcionais:
### 1. Verificação de Temperatura do Raspberry Pi
> Descrição: O sistema deve monitorar constantemente a temperatura do Raspberry Pi.

Critérios de Aceitação:
 - A temperatura deve ser monitorada em tempo real.
 - Notificações devem ser enviadas sempre que a temperatura atingir ou ultrapassar os 55ºC.
 - Deve ser possível visualizar a temperatura atual num painel de controlo.
 - Se a temperatura ultrapassar os 55ºC, o sistema deve alertar o utilizador sobre possível perda de desempenho.
Justificação: Garantir que o Raspberry Pi opera de forma eficiente e evitar lentidão por superaquecimento.

### 2. Notificação da Bateria do Teclado
> Descrição: O sistema deve monitorar o estado da bateria do teclado sem fios e informar o utilizador sobre a necessidade de recarga.

Critérios de Aceitação:
- Deve notificar o utilizador quando a bateria do teclado estiver abaixo de um nível predefinido (ex.: 20%).
- Se o teclado estiver desligado ou desconectado, o sistema deve alertar o utilizador.
- A interface do sistema deve exibir o estado atual da bateria e o estado de conexão do teclado.
Justificação: Evitar que o teclado sem fios fique inutilizável de forma inesperada devido à falta de carga.

## Requisitos Não Funcionais
- Exprimentar min-pc  Computador de mesa para ver se o software fica amis rapido do que raspberry pi 4.
- Procurar outros keyboard diferente do atual que nao tem informaçao de baterial, serie, etc...

### 1. Experimentar [TECLAST Mini PC N10](https://www.amazon.es/dp/B09FJV3VLC?tag=clarovencedor76801-21&linkCode=osi&th=1&psc=1&language=pt_PT)
> Descrição: Testar o mini PC TECLAST N10 e compará-lo com o desempenho do Raspberry Pi 4.

Critérios de Avaliação:
- A velocidade do sistema deve ser comparada em tarefas idênticas executadas no Raspberry Pi 4 e no TECLAST Mini PC N10.
- O desempenho global do sistema (tempo de resposta, processamento de dados, etc.) deve ser avaliado.
Justificação: Avaliar se o software funciona mais rapidamente no mini PC em comparação com o Raspberry Pi 4.

### 2. Procurar Outros Teclados com informaçao de bateria
> Descrição: Investigar a disponibilidade de teclados que ofereçam informações detalhadas sobre o estado da bateria, número de série, e outras especificações técnicas.

Critérios de Avaliação:
- Encontrar opções de teclados que possuam um sistema de notificação de bateria incorporado.
- Verificar a compatibilidade dos teclados com o Raspberry Pi ou Mini PC.
- Justificação: Melhorar a gestão do hardware e facilitar a experiência de utilização, substituindo o teclado atual por um com mais funcionalidades.