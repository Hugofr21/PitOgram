document.addEventListener("DOMContentLoaded", function () {
    const stepItems = document.querySelectorAll('.step-item');

    stepItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            
            // Verifique se o target está definido
            if (target) {
                navigateToPage(target);
            }
        });
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
    const btnLogs = document.getElementById('btn-logs');
    if (btnLogs) {
        btnLogs.addEventListener('click', function () {
            navigateToPage('video-section-logs');
        });
    }
});

function navigateToPage(target) {
    let url = "";
    switch (target) {
        case 'video-section-settings':
            url = "../confSettingsPathVideo/index.html";
            break;
        case 'video-section-compay':
            url = "../confVideoDefaults/index.html";
            break;
        case 'video-section-logs':
            url = "../systemLogs/index.html";
            break;
        case 'video-section-logout':
            logout();
            return;
        case 'video-section-joystick':
            url = "../listconfigSettings/index.html";
            break;
        case 'chart-section':
            url = "../chart/index.html";
            break;
        default:
            console.error("Invalid target:", target);
            return;
    }

    window.location.href = url;
}

function logout() {
    localStorage.clear();
    window.location.href = "../../index.html";
}
