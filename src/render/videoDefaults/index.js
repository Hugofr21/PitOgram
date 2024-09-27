const { getDataToVideoDefaults } = window.electronAPISettings;


document.addEventListener('DOMContentLoaded', function (e) {
    const video = document.getElementById('video-main');
    getDataToVideoDefaults(
        (videoPath) => {
            if (videoPath.success) {
                const videoPathRelative = videoPath.videos.videoPath;
                const video = document.getElementById('video-main');
                video.controls = false;
                video.querySelector('source').src = videoPathRelative;
                video.load();

                video.addEventListener('loadeddata', function () {
                    video.play();
                    video.loop = true;
                });

            } else {
                console.error("Video path is not available");
            }
        },
        (err) => {
            console.error("Error loading video settings:", err);
        }
    );
    document.body.style.backgroundColor = "#fff";
    setTimeout(() => {
        document.body.style.transition = "background-color 0.5s ease";
    }, 100);
});


document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video-main');
    var body = document.body;
    video.style.opacity = 0;

    video.addEventListener('mouseover', function () {
        video.removeAttribute('controls');
    });

    body.addEventListener('mouseleave', function () {
        video.setAttribute('controls', 'false');
    });

    video.addEventListener('loadedmetadata', function () {
        video.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2000, easing: 'ease' });
        video.style.opacity = 1;
        video.controls = false;
    });
});