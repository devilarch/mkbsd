document.addEventListener('DOMContentLoaded', () => {
    const wallpaperGrid = document.getElementById('wallpaper-grid');
    const modal = document.getElementById('wallpaper-modal');
    const modalImage = document.getElementById('modal-image');
    const downloadHD = document.getElementById('download-hd');
    const downloadSD = document.getElementById('download-sd');
    const closeModal = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');

    let currentWallpaper = null;
    let allWallpapers = [];
    let currentPage = 1;
    const wallpapersPerPage = 20;

    function fetchWallpapers(searchQuery = '') {
        axios.get(`/api/wallpapers?search=${searchQuery}`)
            .then(response => {
                allWallpapers = Object.entries(response.data.data);
                currentPage = 1;
                wallpaperGrid.innerHTML = '';
                loadMoreWallpapers();
            })
            .catch(error => console.error('Error fetching wallpapers:', error));
    }

    function loadMoreWallpapers() {
        const startIndex = (currentPage - 1) * wallpapersPerPage;
        const endIndex = startIndex + wallpapersPerPage;
        const wallpapersToLoad = allWallpapers.slice(startIndex, endIndex);

        wallpapersToLoad.forEach(([id, wallpaper]) => {
            const wallpaperItem = document.createElement('div');
            wallpaperItem.className = 'wallpaper-item cursor-pointer';
            wallpaperItem.innerHTML = `
                <img src="${wallpaper.s || wallpaper.wfs}" alt="Wallpaper ${id}" class="w-full h-auto rounded-lg shadow-lg">
            `;
            wallpaperItem.addEventListener('click', () => openModal(wallpaper));
            wallpaperGrid.appendChild(wallpaperItem);
        });

        currentPage++;

        if (endIndex >= allWallpapers.length) {
            observer.unobserve(loadingTrigger);
        }
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

    // Create a loading trigger element
    const loadingTrigger = document.createElement('div');
    loadingTrigger.id = 'loading-trigger';
    document.body.appendChild(loadingTrigger);

    // Set up Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreWallpapers();
        }
    }, { threshold: 1.0 });

    observer.observe(loadingTrigger);

    // Initial wallpaper fetch
    fetchWallpapers();
});
