document.addEventListener('DOMContentLoaded', () => {
    const wallpaperGrid = document.getElementById('wallpaper-grid');
    const modal = document.getElementById('wallpaper-modal');
    const modalImage = document.getElementById('modal-image');
    const downloadHD = document.getElementById('download-hd');
    const downloadSD = document.getElementById('download-sd');
    const closeModal = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');

    let currentWallpaper = null;

    function fetchWallpapers(searchQuery = '') {
        axios.get(`/api/wallpapers?search=${searchQuery}`)
            .then(response => {
                const wallpapers = response.data.data;
                displayWallpapers(wallpapers);
            })
            .catch(error => console.error('Error fetching wallpapers:', error));
    }

    function displayWallpapers(wallpapers) {
        wallpaperGrid.innerHTML = '';
        Object.entries(wallpapers).forEach(([id, wallpaper]) => {
            const wallpaperItem = document.createElement('div');
            wallpaperItem.className = 'wallpaper-item cursor-pointer';
            wallpaperItem.innerHTML = `
                <img src="${wallpaper.s || wallpaper.wfs}" alt="Wallpaper ${id}" class="w-full h-auto rounded-lg shadow-lg">
            `;
            wallpaperItem.addEventListener('click', () => openModal(wallpaper));
            wallpaperGrid.appendChild(wallpaperItem);
        });
    }

    function openModal(wallpaper) {
        currentWallpaper = wallpaper;
        modalImage.src = wallpaper.s || wallpaper.wfs;
        modal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    downloadHD.addEventListener('click', () => {
        if (currentWallpaper && currentWallpaper.dhd) {
            window.open(currentWallpaper.dhd, '_blank');
        }
    });

    downloadSD.addEventListener('click', () => {
        if (currentWallpaper && currentWallpaper.dsd) {
            window.open(currentWallpaper.dsd, '_blank');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchQuery = e.target.value.trim();
        fetchWallpapers(searchQuery);
    });

    // Initial wallpaper fetch
    fetchWallpapers();
});
