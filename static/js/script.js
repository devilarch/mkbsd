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
        document.body.style.overflow = 'hidden';
        updateDownloadButtons();
    }

    function updateDownloadButtons() {
        downloadHD.disabled = !currentWallpaper.dhd;
        downloadSD.disabled = !currentWallpaper.dsd;
        downloadHD.classList.toggle('opacity-50', !currentWallpaper.dhd);
        downloadSD.classList.toggle('opacity-50', !currentWallpaper.dsd);
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    function startDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function showLoadingIndicator(button) {
        const originalText = button.textContent;
        button.innerHTML = '<svg class="animate-spin h-5 w-5 mr-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Downloading...';
        button.disabled = true;
        return () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    function showMessage(message, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = `fixed bottom-4 right-4 p-4 rounded-lg ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`;
        document.body.appendChild(messageElement);
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    function handleDownload(url, quality) {
        if (url) {
            const resetLoading = showLoadingIndicator(quality === 'HD' ? downloadHD : downloadSD);
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const filename = `wallpaper_${quality}.jpg`;
                    const url = window.URL.createObjectURL(blob);
                    startDownload(url, filename);
                    window.URL.revokeObjectURL(url);
                    showMessage(`${quality} wallpaper downloaded successfully!`);
                })
                .catch(error => {
                    console.error(`Error downloading ${quality} wallpaper:`, error);
                    showMessage(`Failed to download ${quality} wallpaper. Please try again.`, true);
                })
                .finally(resetLoading);
        }
    }

    downloadHD.addEventListener('click', () => {
        handleDownload(currentWallpaper.dhd, 'HD');
    });

    downloadSD.addEventListener('click', () => {
        handleDownload(currentWallpaper.dsd, 'SD');
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
