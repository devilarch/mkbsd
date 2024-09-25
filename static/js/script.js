document.addEventListener('DOMContentLoaded', () => {
    const wallpaperGrid = document.getElementById('wallpaper-grid');
    const modal = document.getElementById('wallpaper-modal');
    const modalImage = document.getElementById('modal-image');
    const downloadHD = document.getElementById('download-hd');
    const downloadSD = document.getElementById('download-sd');
    const closeModal = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');

    let currentWallpaper = null;

    // Theme switching functionality
    function setTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme + '-mode');
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', toggleTheme);

    function fetchWallpapers(searchQuery = '') {
        axios.get(`/api/wallpapers?search=${searchQuery}`)
            .then(response => {
                const wallpapers = response.data.data;
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
            })
            .catch(error => console.error('Error fetching wallpapers:', error));
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
