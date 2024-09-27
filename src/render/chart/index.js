const { cpuAction, memoryAction, diskAction, onCpuData, onMemoryData, onDiskData } = window.SystemMonitoring;

document.addEventListener('DOMContentLoaded', () => {

    setInterval(() => {
        cpuAction();
        memoryAction();
        diskAction();
    }, 1000);


    document.querySelectorAll('.menu-options-chart-vertical a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.grid-item').forEach(chart => {
                chart.style.display = 'none';
            });
            const chartId = link.getAttribute('data-chart') + '-chart';
            document.getElementById(chartId).style.display = 'block';
        });
    });


    onCpuData((data) => {
        console.log('cpu data: ', data.usage);
        updateCpuChart(data.usage);
        updateCpuInfo(data);
    });


    onMemoryData((data) => {
        console.log('memory data: ', data);
        updateMemoryInfo(data);

    });


    onDiskData((data) => {

        const disk = data[0];
        console.log('disk data: ', disk);
        updateDiskInfo(disk);

    });
});

const historicalData = []; 
const maxDataPoints = 20; 

function updateCpuChart(usage) {
    historicalData.push(usage); 
    if (historicalData.length > maxDataPoints) {
        historicalData.shift(); 
    }
    
    const points = generatePoints(historicalData);
    console.log('points chart: ', points);
    
    const chart = document.querySelector('.area-chart');
    const polyline = chart.querySelector('.area');
    polyline.setAttribute('points', points);
}

function generatePoints(data) {
    const step = 100 / (data.length - 1);
    let points = '';
    
    data.forEach((usage, index) => {
        const x = index * step;
        const y = 45 - (usage / 100) * 45;
        points += `${x},${y} `;
    });
    
    // Close the area chart by adding the last point and returning to the baseline
    points += `100,45 0,45`;
    return points;
}


function updateCpuInfo(data) {
    document.querySelector('.cpu').innerHTML = `
        <p><strong>CPU Model:</strong> ${data.model}</p>
        <p><strong>CPU Speed:</strong> ${data.speed} MHz</p>
        <p><strong>CPU Cores:</strong> ${data.cores}</p>
        <p><strong>CPU Usage:</strong> ${data.usage}%</p>
    `;
}

function updateMemoryInfo(data) {
    const totalMemory = parseFloat(data.total);
    const freeMemory = parseFloat(data.free);
    const usedMemory = parseFloat(data.used);

    if (isNaN(totalMemory) || isNaN(freeMemory) || isNaN(usedMemory)) {
        console.error('Invalid memory data:', data);
        return;
    }

    // Update the memory information section
    document.querySelector('.memory').innerHTML = `
        <p><strong>Memory Total:</strong> ${totalMemory.toFixed(2)} MB</p>
        <p><strong>Memory Livre:</strong> ${freeMemory.toFixed(2)} MB</p>
        <p><strong>Memory Usada:</strong> ${usedMemory.toFixed(2)} MB</p>
    `;

    const memoryUsagePercentage = (usedMemory / totalMemory) * 100;


    const memoryCircle = document.querySelector('.circular-chart .circle');
    const memoryPercentageText = document.querySelector('.circular-chart .percentage');

    memoryCircle.setAttribute('stroke-dasharray', `${memoryUsagePercentage.toFixed(2)}, 100`);
    memoryPercentageText.textContent = `${memoryUsagePercentage.toFixed(0)}%`;
}

function updateDiskInfo(disk) {
    const size = parseFloat(disk.size.replace(' GB', '').replace(',', ''));
    const used = parseFloat(disk.used.replace(' GB', '').replace(',', ''));
    const available = parseFloat(disk.available.replace(' GB', '').replace(',', ''));
    const percent = parseFloat(disk.percent.replace('%', ''));

    if (isNaN(size) || isNaN(used) || isNaN(available) || isNaN(percent)) {
        console.error('Invalid disk data:', disk);
        return;
    }

    document.querySelector('.disk').innerHTML = `
       <p><strong>Tamanho:</strong> ${size.toFixed(2)} GB</p>
        <p><strong>Usado:</strong> ${used.toFixed(2)} GB</p>
        <p><strong>Disponível:</strong> ${available.toFixed(2)} GB</p>
        <p><strong>Percentual Usado:</strong> ${percent.toFixed(2)}%</p>
    `;

   const diskCircle = document.querySelector('.disk-chart .circle-disk');
    const diskPercentageText = document.querySelector('.disk-chart .disk-percentage');

    diskCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
    diskPercentageText.textContent = `${percent.toFixed(0)}%`;
}

