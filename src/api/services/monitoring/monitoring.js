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
        exec('df -h', (err, stdout) => {
            if (err) {
                return callback(err);
            }
            const lines = stdout.trim().split('\n').slice(1);
            const disks = lines.map(line => {
                const [filesystem, size, used, available, percent, mount] = line.trim().split(/\s+/);

                return {
                    filesystem: filesystem,
                    size: size,
                    used: used,
                    available: available,
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

module.exports = { getCpuUsage, getMemoryUsage, getDiskUsage, getCpuInfo }