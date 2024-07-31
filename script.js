document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.scroll-container');
    const snapZones = document.querySelectorAll('.snap-zone');
    let snapHeight = window.innerHeight;
    let currentScrollTop = 0;

    const updateSnapHeight = () => {
        snapHeight = window.innerHeight;
        snapZones.forEach(zone => {
            zone.style.height = `${snapHeight}px`;
        });
        // Snap to the nearest zone after resizing
        let snapIndex = Math.round(currentScrollTop / snapHeight);
        snapToZone(snapIndex);
    };

    const snapToZone = (index) => {
        currentScrollTop = index * snapHeight;
        scrollContainer.scrollTo({
            top: currentScrollTop,
            behavior: 'smooth'
        });
    };

    window.addEventListener('resize', updateSnapHeight);

    scrollContainer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].pageY;
    });

    scrollContainer.addEventListener('touchmove', (e) => {
        let touchY = e.touches[0].pageY;
        let touchMove = startY - touchY;

        scrollContainer.scrollTop = currentScrollTop + touchMove;
    });

    scrollContainer.addEventListener('touchend', () => {
        let scrollPosition = scrollContainer.scrollTop;
        let snapIndex = Math.round(scrollPosition / snapHeight);

        // Limit snapIndex to the number of snap zones
        snapIndex = Math.min(snapZones.length - 1, Math.max(0, snapIndex));

        snapToZone(snapIndex);
    });

    scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        let scrollPosition = scrollContainer.scrollTop;
        let snapIndex = Math.round(scrollPosition / snapHeight);

        if (e.deltaY > 0) {
            snapIndex = Math.min(snapZones.length - 1, snapIndex + 1);
        } else {
            snapIndex = Math.max(0, snapIndex - 1);
        }

        snapToZone(snapIndex);
    });

    // Initial setup
    updateSnapHeight();
});
