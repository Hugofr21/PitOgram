const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');


let previousIdle = 0;
let previousTotal = 0;

function getCpuUsage(callback) {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;

    const idleDifference = idle - previousIdle;
    const totalDifference = total - previousTotal;
    const usage = totalDifference > 0 ? 100 - (idleDifference / totalDifference) * 100 : 0;

    previousIdle = idle;
    previousTotal = total;

    if (callback) {
        callback(usage.toFixed(2));
    } else {
        return usage.toFixed(2);
    }
}

function getCpuInfo() {
    const cpus = os.cpus();
    const speed = cpus[0].speed;
    const model = cpus[0].model;
    const cores = cpus.length;

    return {
        model,
        speed,
        cores
    };
}

function getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
        total: (totalMemory / (1024 * 1024)).toFixed(2) + ' MB',
        free: (freeMemory / (1024 * 1024)).toFixed(2) + ' MB',
        used: (usedMemory / (1024 * 1024)).toFixed(2) + ' MB'
    };
}

function getDiskUsage(callback) {
    const platform = os.platform();

    if (platform === 'win32') {
        exec('wmic logicaldisk get size,freespace,caption', (err, stdout) => {
            if (err) {
                return callback(err);
            }
            const lines = stdout.trim().split('\n').slice(1);
            const disks = lines.map(line => {
                const [drive, freeSpace, size] = line.trim().split(/\s+/);
                const used = size - freeSpace;
                const percent = ((used / size) * 100).toFixed(2) + '%';
                return {
                    drive: drive,
                    size: (parseInt(size) / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
                    used: (parseInt(used) / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
                    available: (parseInt(freeSpace) / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
                    percent: percent,
                    mount: drive
                };
            });
            callback(null, disks);
        });
    } else if (platform === 'linux' || platform === 'darwin') {
        exec('df -h | grep "/dev/mmcblk0p2"', (err, stdout) => {
            if (err) {
                return callback(err);
            }
            const lines = stdout.trim().split('\n');
            const disks = lines.map(line => {
                const parts = line.match(/(\S+)/g);
                const [filesystem, size, used, available, percent, mount] = parts;

                return {
                    filesystem: filesystem,
                    size: convertToGB(size) + ' GB',     
                    used: convertToGB(used) + ' GB',      
                    available: convertToGB(available) + ' GB',
                    percent: percent,
                    mount: mount
                };
            });
            callback(null, disks);
        });
    } else {
        callback(new Error('Platform not supported'));
    }
}


function getTemperatureCpu(callback) { 
    const platform = os.platform();
    
    if (platform === 'linux') {
        exec('vcgencmd measure_temp', (err, stdout, stderr) => {
            if (err || stderr) {
                return callback(err || stderr); 
            }

            const tempMatch = stdout.match(/temp=([\d.]+)'C/);
            if (tempMatch && tempMatch[1]) {
                const temp = parseFloat(tempMatch[1]);
                callback(null, temp + '°C'); 
            } else {
                callback(new Error('Temperature not found in vcgencmd output'));
            }
        });
    } 
}

function convertToGB(valueWithUnit) {
    const units = {
        'B': 1 / (1024 ** 3),         // Bytes para GB
        'K': 1 / (1024 ** 2),         // KB para GB
        'M': 1 / 1024,                // MB para GB
        'G': 1                        // GB para GB
    };

   
    const match = valueWithUnit.match(/([\d.]+)([BKMGT])/);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        const factor = units[unit] || 1; 
        return (value * factor).toFixed(2); 
    }
    return valueWithUnit; 
}

module.exports = { getCpuUsage, getMemoryUsage, getDiskUsage, getCpuInfo, getTemperatureCpu }