document.addEventListener('DOMContentLoaded', () => {
    const wallpaperGrid = document.getElementById('wallpaper-grid');
    const modal = document.getElementById('wallpaper-modal');
    const modalImage = document.getElementById('modal-image');
    const downloadHD = document.getElementById('download-hd');
    const downloadSD = document.getElementById('download-sd');
    const closeModal = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');

    let currentWallpaper = null;
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;
    let searchQuery = '';

    function fetchWallpapers(page = 1, append = false) {
        if (isLoading) return;
        isLoading = true;

        axios.get(`/api/wallpapers?search=${searchQuery}&page=${page}`)
            .then(response => {
                const wallpapers = response.data.data;
                totalPages = response.data.total_pages;
                currentPage = response.data.current_page;

                if (append) {
                    displayWallpapers(wallpapers, true);
                } else {
                    displayWallpapers(wallpapers, false);
                }
                isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching wallpapers:', error);
                isLoading = false;
            });
    }

    function displayWallpapers(wallpapers, append = false) {
        if (!append) {
            wallpaperGrid.innerHTML = '';
        }

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
        document.body.style.overflow = 'hidden'; // Prevent scrolling on the background
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Re-enable scrolling on the background
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
        searchQuery = e.target.value.trim();
        currentPage = 1;
        fetchWallpapers(currentPage);
    });

    // Infinite scroll
    window.addEventListener('scroll', () => {
        if (isLoading || currentPage >= totalPages) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            fetchWallpapers(currentPage + 1, true);
        }
    });

    // Initial wallpaper fetch
    fetchWallpapers();
});
