document.addEventListener('DOMContentLoaded', () => {
    const wallpaperGrid = document.getElementById('wallpaper-grid');
    const modal = document.getElementById('wallpaper-modal');
    const modalImage = document.getElementById('modal-image');
    const downloadHD = document.getElementById('download-hd');
    const downloadSD = document.getElementById('download-sd');
    const closeModal = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const loadingTrigger = document.getElementById('loading-trigger');

    let currentWallpaper = null;
    let allWallpapers = [];
    let currentPage = 1;
    const wallpapersPerPage = 10; // Reduced batch size for testing

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
        console.log('Fetching wallpapers with search query:', searchQuery);
        axios.get(`/api/wallpapers?search=${searchQuery}`)
            .then(response => {
                console.log('API response:', response.data);
                allWallpapers = Object.entries(response.data.data);
                currentPage = 1;
                wallpaperGrid.innerHTML = '';
                loadMoreWallpapers();
            })
            .catch(error => console.error('Error fetching wallpapers:', error));
    }

    function loadMoreWallpapers() {
        console.log('Loading more wallpapers. Current page:', currentPage);
        const startIndex = (currentPage - 1) * wallpapersPerPage;
        const endIndex = startIndex + wallpapersPerPage;
        const wallpapersToLoad = allWallpapers.slice(startIndex, endIndex);

        console.log('Wallpapers to load:', wallpapersToLoad.length);

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
            console.log('All wallpapers loaded. Unobserving loading trigger.');
            observer.unobserve(loadingTrigger);
        } else {
            console.log('More wallpapers available. Keeping observer active.');
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

    // Set up Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        console.log('Intersection Observer triggered');
        if (entries[0].isIntersecting) {
            console.log('Loading trigger is intersecting. Loading more wallpapers.');
            loadMoreWallpapers();
        }
    }, { threshold: 0.1 }); // Reduced threshold for earlier triggering

    console.log('Setting up Intersection Observer');
    observer.observe(loadingTrigger);

    // Initial wallpaper fetch
    console.log('Initiating initial wallpaper fetch');
    fetchWallpapers();
});
