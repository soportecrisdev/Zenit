/*
script.js - Zenit Player con Repositorio GitHub
Author: CrisDEV
*/

// Zenit Player - Sistema Completo Netflix-Style con Repositorio GitHub
class ZenitPlayer {
    constructor() {
        this.isAdmin = false;
        this.currentContent = null;
        this.currentEpisode = null;
        this.currentServer = null;
        this.theme = localStorage.getItem('zenit-theme') || 'dark';
        this.favorites = JSON.parse(localStorage.getItem('zenit-favorites') || '[]');
        
        // Repositorio GitHub
        this.repoUrl = 'https://raw.githubusercontent.com/soportecrisdev/pelis_gen/refs/heads/main/gen';
        this.lastUpdate = localStorage.getItem('zenit-last-update') || null;
        
        // Data storage (desde repositorio)
        this.movies = [];
        this.series = [];
        this.repoData = null;
        
        // Admin credentials
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };

        // Server configurations mejorado
        this.serverConfigs = {
            'Google Drive': {
                name: 'Google Drive',
                icon: '📁',
                color: '#4285f4',
                urlPattern: 'drive.google.com',
                example: 'https://drive.google.com/file/d/FILE_ID/view',
                help: 'Usa el enlace de compartir de Google Drive. Asegúrate que sea público.',
                processor: 'drive'
            },
            'YouTube': {
                name: 'YouTube',
                icon: '📺',
                color: '#ff0000',
                urlPattern: 'youtube.com|youtu.be',
                example: 'https://youtube.com/watch?v=VIDEO_ID',
                help: 'URL completa del video de YouTube. Se abrirá en nueva pestaña.',
                processor: 'youtube'
            },
            'Facebook': {
                name: 'Facebook',
                icon: '📘',
                color: '#1877f2',
                urlPattern: 'facebook.com|fb.watch',
                example: 'https://facebook.com/username/videos/12345',
                help: 'URL del video de Facebook. Puede requerir permisos especiales.',
                processor: 'facebook'
            },
            'MEGA': {
                name: 'MEGA',
                icon: '☁️',
                color: '#d9272e',
                urlPattern: 'mega.nz',
                example: 'https://mega.nz/file/FILE_ID#KEY',
                help: 'URL completa del archivo en Mega. Debe ser público.',
                processor: 'mega'
            },
            'Streamtape': {
                name: 'Streamtape',
                icon: '🎬',
                color: '#ff6b35',
                urlPattern: 'streamtape.com',
                example: 'https://streamtape.com/v/VIDEO_ID/',
                help: 'URL del video en Streamtape. Optimizado para streaming.',
                processor: 'streamtape'
            },
            'Dropbox': {
                name: 'Dropbox',
                icon: '📦',
                color: '#0061ff',
                urlPattern: 'dropbox.com',
                example: 'https://dropbox.com/s/FILE_ID/video.mp4?dl=0',
                help: 'URL de compartir de Dropbox. Se convertirá automáticamente.',
                processor: 'dropbox'
            },
            'Firebase': {
                name: 'Firebase',
                icon: '🔥',
                color: '#ff9800',
                urlPattern: 'firebasestorage.googleapis.com',
                example: 'https://firebasestorage.googleapis.com/v0/b/project/o/video.mp4',
                help: 'URL directa del archivo en Firebase Storage.',
                processor: 'firebase'
            },
            '1Fichier': {
                name: '1Fichier',
                icon: '📄',
                color: '#2ecc71',
                urlPattern: '1fichier.com',
                example: 'https://1fichier.com/?FILE_ID',
                help: 'URL del archivo en 1Fichier. Puede requerir tiempo de espera.',
                processor: '1fichier'
            },
            'Stape': {
                name: 'Stape',
                icon: '📹',
                color: '#00d4aa',
                urlPattern: 'stape.co',
                example: 'https://stape.co/v/VIDEO_ID',
                help: 'URL del video en Stape. Optimizado para streaming rápido.',
                processor: 'stape'
            },
            'Zippyshare': {
                name: 'Zippyshare',
                icon: '🗂️',
                color: '#ffa500',
                urlPattern: 'zippyshare.com',
                example: 'https://zippyshare.com/v/FILE_ID/file.html',
                help: 'URL del archivo en Zippyshare. Se extraerá el enlace directo.',
                processor: 'zippyshare'
            },
            'Directa': {
                name: 'URL Directa',
                icon: '🔗',
                color: '#6c757d',
                urlPattern: '.*\\.(mp4|mkv|avi|mov|webm|m3u8)',
                example: 'https://servidor.com/video.mp4',
                help: 'URL directa al archivo de video. Formatos: MP4, MKV, AVI, MOV, WebM, M3U8.',
                processor: 'direct'
            }
        };

        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Zenit Player con Repositorio...');
        
        // Mostrar pantalla de carga
        this.showLoadingScreen();
        
        // Configurar tema
        await this.setupTheme();
        
        // Cargar datos del repositorio
        await this.loadFromRepository();
        
        // Configurar eventos
        this.setupEventListeners();
        this.setupNavigation();
        
        // Cargar contenido
        this.loadContent();
        this.setupHeroBanner();
        
        // Ocultar pantalla de carga y mostrar app
        this.hideLoadingScreen();
        
        console.log('✅ Zenit Player inicializado correctamente');
        this.verifyElements();
    }

    // Loading Screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        loadingScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
        
        this.updateLoadingStatus('Conectando al repositorio...', 'loading');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 1000);
    }

    updateLoadingStatus(message, type = 'loading') {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        const loadingText = document.querySelector('.loading-text');
        
        if (statusText) statusText.textContent = message;
        if (loadingText) loadingText.textContent = message;
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            switch(type) {
                case 'success':
                    statusIndicator.style.background = '#28a745';
                    break;
                case 'error':
                    statusIndicator.style.background = '#dc3545';
                    break;
                case 'loading':
                default:
                    statusIndicator.style.background = '#007bff';
                    break;
            }
        }
    }

    // Repository Management
    async loadFromRepository() {
        try {
            console.log('🔄 Cargando datos del repositorio...');
            this.updateLoadingStatus('Descargando datos del repositorio...', 'loading');
            
            const response = await fetch(this.repoUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Datos recibidos del repositorio:', data);
            
            // Validar estructura de datos
            if (!data.movies && !data.series) {
                throw new Error('Estructura de datos inválida');
            }
            
            this.repoData = data;
            this.movies = data.movies || [];
            this.series = data.series || [];
            
            // Actualizar timestamp
            this.lastUpdate = new Date().toISOString();
            localStorage.setItem('zenit-last-update', this.lastUpdate);
            
            this.updateLoadingStatus('Datos cargados exitosamente', 'success');
            console.log(`✅ Cargadas ${this.movies.length} películas y ${this.series.length} series`);
            
            // Actualizar indicadores de estado
            this.updateRepoStatus(true);
            
        } catch (error) {
            console.error('❌ Error cargando del repositorio:', error);
            this.updateLoadingStatus(`Error: ${error.message}`, 'error');
            
            // Usar datos de fallback
            this.initializeFallbackData();
            this.updateRepoStatus(false, error.message);
            
            // Mostrar notificación de error
            setTimeout(() => {
                this.showNotification('Error conectando al repositorio. Usando datos locales.', 'warning');
            }, 2000);
        }
    }

    updateRepoStatus(connected, error = null) {
        const repoStatus = document.getElementById('repoStatus');
        const repoIndicator = repoStatus.querySelector('.repo-indicator');
        const repoText = repoStatus.querySelector('.repo-text');
        
        if (connected) {
            repoIndicator.style.background = '#28a745';
            repoText.textContent = 'Repo conectado';
            repoStatus.title = `Última actualización: ${new Date(this.lastUpdate).toLocaleString()}`;
        } else {
            repoIndicator.style.background = '#dc3545';
            repoText.textContent = 'Repo desconectado';
            repoStatus.title = error || 'Error de conexión';
        }
    }

    async refreshFromRepository() {
        console.log('🔄 Actualizando desde repositorio...');
        this.showNotification('Actualizando contenido...', 'info');
        
        await this.loadFromRepository();
        this.loadContent();
        this.updateStats();
        
        this.showNotification('Contenido actualizado desde repositorio', 'success');
    }
    
    verifyElements() {
        const criticalElements = [
            'videoPlayer', 'playerModal', 'adminModal', 'adminLoginModal',
            'repoStatus', 'refreshBtn'
        ];
        
        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ Elemento crítico no encontrado: ${id}`);
            } else {
                console.log(`✅ Elemento verificado: ${id}`);
            }
        });
    }

    // Theme Management
    setupTheme() {
        document.body.className = `${this.theme}-theme`;
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('zenit-theme', this.theme);
        this.setupTheme();
        this.showNotification('Tema cambiado', 'success');
    }

    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Refresh repository
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshFromRepository();
        });

        document.getElementById('refreshRepoBtn')?.addEventListener('click', () => {
            this.refreshFromRepository();
        });

        // Admin access
        document.getElementById('adminBtn')?.addEventListener('click', () => {
            this.showAdminLogin();
        });

        // Admin login modal
        document.getElementById('closeLoginModal')?.addEventListener('click', () => {
            this.hideAdminLogin();
        });

        document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
            this.handleAdminLogin(e);
        });

        // Admin panel
        document.getElementById('closeAdminModal')?.addEventListener('click', () => {
            this.hideAdminPanel();
        });

        // Admin tabs
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchAdminTab(tab));
        });

        // Forms
        document.getElementById('movieForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMovie();
        });

        document.getElementById('seriesForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSeries();
        });

        document.getElementById('episodeForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEpisode();
        });

        // Server selection handlers
        document.getElementById('movieServer')?.addEventListener('change', (e) => {
            this.updateServerHelp('movie', e.target.value);
        });

        document.getElementById('episodeServer')?.addEventListener('change', (e) => {
            this.updateServerHelp('episode', e.target.value);
        });

        // Player controls
        document.getElementById('closePlayer')?.addEventListener('click', () => {
            this.hidePlayer();
        });

        document.getElementById('speedControl')?.addEventListener('change', (e) => {
            this.changePlaybackSpeed(e.target.value);
        });

        // Detail modal
        document.getElementById('closeDetail')?.addEventListener('click', () => {
            this.hideDetail();
        });

        document.getElementById('detailPlayBtn')?.addEventListener('click', () => {
            this.playCurrentContent();
        });

        document.getElementById('addToListBtn')?.addEventListener('click', () => {
            this.toggleFavorite();
        });

        // Search
        document.getElementById('globalSearch')?.addEventListener('input', (e) => {
            this.globalSearch(e.target.value);
        });

        // Hero buttons
        document.getElementById('heroPlayBtn')?.addEventListener('click', () => {
            this.playHeroContent();
        });

        document.getElementById('heroInfoBtn')?.addEventListener('click', () => {
            this.showHeroDetail();
        });

        // Manage tabs
        document.querySelectorAll('.manage-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchManageTab(tab));
        });

        // Scroll navbar effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
            if (e.target.classList.contains('player-modal')) {
                this.hidePlayer();
            }
            if (e.target.classList.contains('detail-modal')) {
                this.hideDetail();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // Navigation
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load section-specific content
            switch(sectionName) {
                case 'movies':
                    this.loadMoviesSection();
                    break;
                case 'series':
                    this.loadSeriesSection();
                    break;
                case 'favorites':
                    this.loadFavoritesSection();
                    break;
                case 'home':
                default:
                    this.loadHomeSection();
                    break;
            }
        }
    }

    // Content Loading
    loadContent() {
    this.loadHomeSection();
    this.updateStats();
    this.updateContentCounts();
    
    // Mostrar información de repositorios en consola (solo para admin)
    if (this.isAdmin) {
        console.log('📊 Estadísticas de repositorios:', this.getRepositoriesInfo());
    }
}
filterByRepository(repositoryId) {
    if (!this.isAdmin) return;
    
    if (repositoryId === 'all') {
        this.movies = this.allMovies;
        this.series = this.allSeries;
    } else {
        this.movies = this.allMovies.filter(movie => movie.repository === repositoryId);
        this.series = this.allSeries.filter(series => series.repository === repositoryId);
    }
    
    this.loadContent();
    this.showNotification(`Filtrado por repositorio aplicado`, 'info');
}

    updateContentCounts() {
        const moviesCount = document.getElementById('moviesContentCount');
        const seriesCount = document.getElementById('seriesContentCount');
        
        if (moviesCount) moviesCount.textContent = `(${this.movies.length})`;
        if (seriesCount) seriesCount.textContent = `(${this.series.length})`;
    }

    loadHomeSection() {
        this.loadCarousel('trendingCarousel', this.getTrendingContent());
        this.loadCarousel('moviesCarousel', this.movies.slice(0, 10));
        this.loadCarousel('seriesCarousel', this.series.slice(0, 10));
        this.loadCarousel('recentCarousel', this.getRecentContent());
    }

    loadMoviesSection() {
        const grid = document.getElementById('moviesGrid');
        grid.innerHTML = '';
        this.movies.forEach(movie => {
            const card = this.createMovieCard(movie);
            grid.appendChild(card);
        });
        this.setupFilters('movie');
    }

    loadSeriesSection() {
        const grid = document.getElementById('seriesGrid');
        grid.innerHTML = '';
        this.series.forEach(series => {
            const card = this.createMovieCard(series, 'series');
            grid.appendChild(card);
        });
        this.setupFilters('series');
    }

    loadFavoritesSection() {
        const grid = document.getElementById('favoritesGrid');
        grid.innerHTML = '';
        
        const favoriteItems = [];
        this.favorites.forEach(fav => {
            if (fav.type === 'movie') {
                const movie = this.movies.find(m => m.id === fav.id);
                if (movie) favoriteItems.push(movie);
            } else {
                const series = this.series.find(s => s.id === fav.id);
                if (series) favoriteItems.push({...series, type: 'series'});
            }
        });

        if (favoriteItems.length === 0) {
            grid.innerHTML = '<div class="empty-state">No has agregado nada a tu lista aún</div>';
        } else {
            favoriteItems.forEach(item => {
                const card = this.createMovieCard(item, item.type || 'movie');
                grid.appendChild(card);
            });
        }
    }

    loadCarousel(carouselId, items) {
        const carousel = document.getElementById(carouselId);
        if (!carousel || !items.length) return;

        carousel.innerHTML = '';
        items.forEach(item => {
            const card = this.createMovieCard(item, item.seasons ? 'series' : 'movie');
            carousel.appendChild(card);
        });
    }

    createMovieCard(item, type = 'movie') {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterUrl = item.poster || `https://via.placeholder.com/280x420?text=${encodeURIComponent(item.title)}&bg=333&color=fff`;
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${item.title}" class="movie-poster" 
             onerror="this.src='https://via.placeholder.com/280x420?text=${encodeURIComponent(item.title)}&bg=333&color=fff'">
        <div class="movie-overlay">
            <div class="movie-title">${item.title}</div>
            <div class="movie-meta">${item.year || '2024'} • ${item.genre || 'Sin categoría'}</div>
            <div class="movie-description">${(item.synopsis || item.description || 'Sin descripción disponible').substring(0, 100)}...</div>
        </div>
    `;

    card.addEventListener('click', () => {
        this.showDetail(item, type);
    });

    return card;
}

    getServersInfo(item) {
    let servers = [];
    
    if (item.servers && item.servers.length > 0) {
        servers = item.servers;
    } else if (item.seasons && item.seasons.length > 0) {
        const allServers = new Set();
        item.seasons.forEach(season => {
            if (season.episodes) {
                season.episodes.forEach(episode => {
                    if (episode.servers) {
                        episode.servers.forEach(server => {
                            allServers.add('HD'); // Solo mostrar calidad, no servidor
                        });
                    }
                });
            }
        });
        servers = Array.from(allServers).map(quality => ({ quality }));
    }
    
    if (servers.length === 0) return '';
    
    // Solo mostrar cantidad de opciones disponibles
    return `<span class="availability-badge" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px;">
        ${servers.length} opción${servers.length > 1 ? 'es' : ''} disponible${servers.length > 1 ? 's' : ''}
    </span>`;
}


    // Server configuration updates
    updateServerHelp(prefix, serverType) {
        const helpElement = document.getElementById(`${prefix}ServerHelp`);
        if (!helpElement || !serverType) return;

        const config = this.serverConfigs[serverType];
        if (config) {
            helpElement.innerHTML = `
                <strong>${config.icon} ${config.name}</strong><br>
                <strong>Ejemplo:</strong> ${config.example}<br>
                <strong>Ayuda:</strong> ${config.help}
            `;
            helpElement.style.display = 'block';
        } else {
            helpElement.style.display = 'none';
        }
    }

    

    hidePlayer() {
        const playerModal = document.getElementById('playerModal');
        playerModal.classList.add('hidden');
        
        // Limpiar reproductor especializado
        if (window.zenitVideoPlayer) {
            window.zenitVideoPlayer.cleanup();
        }
        
        console.log('🔇 Reproductor cerrado y limpiado');
    }

    changePlaybackSpeed(speed) {
        if (window.zenitVideoPlayer) {
            window.zenitVideoPlayer.changeSpeed(speed);
        }
    }

    // Detail Modal
    showDetail(content, type) {
        this.currentContent = content;
        const modal = document.getElementById('detailModal');
        
        // Set backdrop
        const backdrop = document.getElementById('detailBackdrop');
        backdrop.src = content.backdrop || content.poster || '';
        
        // Set poster
        const poster = document.getElementById('detailPoster');
        poster.src = content.poster || `https://via.placeholder.com/300x450?text=${encodeURIComponent(content.title)}`;
        
        // Set info
        document.getElementById('detailTitle').textContent = content.title;
        document.getElementById('detailYear').textContent = content.year || '2024';
        document.getElementById('detailGenre').textContent = content.genre || 'Sin categoría';
        document.getElementById('detailRating').textContent = `★ ${content.rating || '8.0'}`;
        document.getElementById('detailDescription').textContent = content.synopsis || content.description || 'Sin descripción disponible';
        
        // Mostrar servidores disponibles
        this.showDetailServers(content, type);
        
        // Handle episodes for series
        const episodesSection = document.getElementById('detailEpisodes');
        if (type === 'series' && content.seasons) {
            episodesSection.classList.remove('hidden');
            this.loadEpisodes(content);
        } else {
            episodesSection.classList.add('hidden');
        }
        
        // Update favorite button
        this.updateFavoriteButton();
        
        modal.classList.remove('hidden');
    }

    showDetailServers(content, type) {
    const serversContainer = document.getElementById('detailServers');
    if (!serversContainer) return;
    
    let servers = [];
    if (content.servers && content.servers.length > 0) {
        servers = content.servers;
    }
    
    if (servers.length === 0) {
        serversContainer.innerHTML = '';
        return;
    }
    
    const serversButtonsContainer = document.createElement('div');
    serversButtonsContainer.className = 'servers-buttons';
    
    servers.forEach((server, index) => {
        const serverBtn = document.createElement('button');
        serverBtn.className = 'server-btn';
        serverBtn.style.background = '#007bff'; // Color uniforme
        
        // SIN mostrar nombre del servidor, solo calidad
        serverBtn.innerHTML = `▶ Reproducir${server.quality ? ` (${server.quality})` : ''}`;
        
        serverBtn.addEventListener('click', () => {
            console.log('🎬 Reproduciendo desde detail modal');
            this.playContent(content, server);
        });
        
        serversButtonsContainer.appendChild(serverBtn);
    });
    
    serversContainer.innerHTML = `
        <div class="servers-list">
            <h4>Opciones de reproducción:</h4>
        </div>
    `;
    
    serversContainer.querySelector('.servers-list').appendChild(serversButtonsContainer);
}

    // Método mejorado para cargar episodios
loadEpisodes(series) {
    const container = document.getElementById('episodesContainer');
    container.innerHTML = '';
    
    if (!series.seasons || series.seasons.length === 0) {
        container.innerHTML = '<p>No hay episodios disponibles</p>';
        return;
    }
    
    console.log('📺 Cargando episodios para reproducción directa:', series.title);
    
    series.seasons.forEach(season => {
        if (!season.episodes || season.episodes.length === 0) return;
        
        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'season-section';
        seasonDiv.innerHTML = `<h4>Temporada ${season.number}</h4>`;
        
        season.episodes.forEach((episode, episodeIndex) => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            
            // CAMBIO: Hacer clic directo en la tarjeta reproduce el episodio
            episodeCard.style.cursor = 'pointer';
            episodeCard.addEventListener('click', () => {
                console.log('🎬 Reproducción directa de episodio:', {
                    series: series.title,
                    season: season.number,
                    episode: episode.number,
                    title: episode.title
                });
                
                // Reproducir inmediatamente con el primer servidor disponible
                if (episode.servers && episode.servers.length > 0) {
                    this.playContent(series, episode.servers[0], episode);
                } else {
                    this.showNotification('Este episodio no tiene servidores disponibles', 'warning');
                }
            });
            
            // Efecto hover para indicar que es clickeable
            episodeCard.addEventListener('mouseenter', () => {
                episodeCard.style.transform = 'translateY(-2px)';
                episodeCard.style.boxShadow = '0 4px 16px rgba(0, 123, 255, 0.3)';
            });
            
            episodeCard.addEventListener('mouseleave', () => {
                episodeCard.style.transform = 'translateY(0)';
                episodeCard.style.boxShadow = '';
            });
            
            // SIN mostrar información de servidores
            episodeCard.innerHTML = `
                <div class="episode-info">
                    <div class="episode-number">E${episode.number}</div>
                    <div class="episode-details">
                        <h4>${episode.title}</h4>
                        <p>${episode.synopsis || 'Sin descripción disponible'}</p>
                        <div class="episode-meta">
                            <span>⏱️ ${episode.duration || 25} min</span>
                            <span style="color: var(--netflix-red); font-weight: 600;">▶ Clic para reproducir</span>
                        </div>
                    </div>
                </div>
            `;
            
            seasonDiv.appendChild(episodeCard);
        });
        
        container.appendChild(seasonDiv);
    });
}
// Método mejorado para obtener color del servidor
getServerColor(serverName) {
    const config = this.serverConfigs[serverName];
    return config ? config.color : '#6c757d';
}

// Método mejorado para mostrar servidores en detail
showDetailServers(content, type) {
    const serversContainer = document.getElementById('detailServers');
    if (!serversContainer) return;
    
    let servers = [];
    if (content.servers && content.servers.length > 0) {
        servers = content.servers;
    }
    
    if (servers.length === 0) {
        serversContainer.innerHTML = '';
        return;
    }
    
    console.log('🖥️ Mostrando servidores en detail:', servers);
    
    const serversButtonsContainer = document.createElement('div');
    serversButtonsContainer.className = 'servers-buttons';
    
    servers.forEach((server, index) => {
        const serverBtn = document.createElement('button');
        serverBtn.className = 'server-btn';
        serverBtn.style.background = this.getServerColor(server.name);
        
        const config = this.serverConfigs[server.name];
        const icon = config ? config.icon : '🔗';
        
        serverBtn.innerHTML = `${icon} ${server.name} (${server.quality || 'HD'})`;
        
        // Event listener en lugar de onclick
        serverBtn.addEventListener('click', () => {
            console.log('🎬 Reproduciendo desde detail modal:', {
                content: content.title,
                server: server.name,
                url: server.url
            });
            
            this.playContent(content, server);
        });
        
        serversButtonsContainer.appendChild(serverBtn);
    });
    
    serversContainer.innerHTML = `
        <div class="servers-list">
            <h4>Servidores disponibles:</h4>
        </div>
    `;
    
    serversContainer.querySelector('.servers-list').appendChild(serversButtonsContainer);
}

// Método mejorado para reproducir contenido
async playContent(content, server = null, episode = null) {
    console.log('🎬 ZenitPlayer.playContent llamado');
    // NO mostrar información detallada del servidor
    
    if (!content) {
        console.error('❌ No se proporcionó contenido');
        this.showNotification('Error: No se encontró el contenido', 'error');
        return;
    }
    
    if (!server) {
        console.error('❌ No se proporcionó servidor');
        this.showNotification('Error: No se encontró servidor disponible', 'error');
        return;
    }
    
    if (!server.url) {
        console.error('❌ Servidor sin URL');
        this.showNotification('Error: Servidor sin URL válida', 'error');
        return;
    }
    
    this.currentContent = content;
    this.currentEpisode = episode;
    this.currentServer = server;
    
    const playerModal = document.getElementById('playerModal');
    if (!playerModal) {
        console.error('❌ Modal del reproductor no encontrado');
        this.showNotification('Error: Reproductor no disponible', 'error');
        return;
    }
    
    playerModal.classList.remove('hidden');
    
    // Configurar información del reproductor SIN mostrar servidor
    const title = episode ? `${content.title} - ${episode.title}` : content.title;
    const description = episode ? (episode.synopsis || episode.description) : (content.synopsis || content.description);
    
    const playerTitle = document.getElementById('playerTitle');
    const playerDescription = document.getElementById('playerDescription');
    
    if (playerTitle) playerTitle.textContent = title;
    if (playerDescription) playerDescription.textContent = description || 'Sin descripción disponible';
    
    // NO mostrar información del servidor
    this.hidePlayerServerInfo();
    
    // Determinar tipo de servidor
    const serverType = this.getServerType(server.name);
    
    // Usar el reproductor especializado
    if (window.zenitVideoPlayer) {
        try {
            await window.zenitVideoPlayer.playVideo(server.url, title, description, serverType);
            
            // Ocultar modal de detalle si está abierto
            const detailModal = document.getElementById('detailModal');
            if (detailModal && !detailModal.classList.contains('hidden')) {
                detailModal.classList.add('hidden');
            }
            
        } catch (error) {
            console.error('❌ Error en reproductor:', error);
            this.showNotification('Error al reproducir video', 'error');
            this.hidePlayer();
        }
    } else {
        console.error('❌ Reproductor no disponible');
        this.showNotification('Error: Reproductor no disponible', 'error');
        this.hidePlayer();
    }
}
hidePlayerServerInfo() {
    const serverInfo = document.getElementById('playerServerInfo');
    if (serverInfo) {
        serverInfo.style.display = 'none';
    }
}

// Método mejorado para obtener tipo de servidor
getServerType(serverName) {
    const serverMap = {
        'Google Drive': 'drive',
        'MEGA': 'mega',
        'YouTube': 'youtube',
        'Facebook': 'facebook',
        'Streamtape': 'streamtape',
        'Dropbox': 'dropbox',
        'Firebase': 'firebase',
        '1Fichier': '1fichier',
        'Stape': 'stape',
        'Zippyshare': 'zippyshare',
        'Directa': 'direct',
        'URL Directa': 'direct'
    };
    
    return serverMap[serverName] || 'direct';
}

// Método mejorado para actualizar información del servidor en el reproductor
updatePlayerServerInfo(server) {
    const serverInfo = document.getElementById('playerServerInfo');
    if (!serverInfo) return;
    
    const config = this.serverConfigs[server.name];
    const icon = config ? config.icon : '🔗';
    const color = config ? config.color : '#6c757d';
    
    serverInfo.innerHTML = `
        <span class="server-badge" style="background: ${color};">${icon} ${server.name}</span>
        <span class="quality-badge">${server.quality || 'HD'}</span>
        <span class="language-badge">${server.language || 'Español'}</span>
    `;
}

// Método para reproducir contenido actual (desde detail modal) - CORREGIDO
playCurrentContent() {
    console.log('🎬 Reproduciendo contenido actual desde detail');
    
    if (!this.currentContent) {
        this.showNotification('No hay contenido seleccionado', 'warning');
        return;
    }
    
    // Si es una película (tiene servidores directamente)
    if (this.currentContent.servers && this.currentContent.servers.length > 0) {
        console.log('🎬 Reproduciendo película:', this.currentContent.title);
        this.playContent(this.currentContent, this.currentContent.servers[0]);
        return;
    }
    
    // Si es una serie (tiene temporadas y episodios)
    if (this.currentContent.seasons && this.currentContent.seasons.length > 0) {
        console.log('📺 Buscando PRIMER EPISODIO de la serie:', this.currentContent.title);
        
        const firstEpisode = this.findFirstEpisode(this.currentContent);
        if (firstEpisode) {
            console.log('▶️ Reproduciendo desde episodio 1:', firstEpisode.episode.title);
            this.showNotification(`Reproduciendo desde: ${firstEpisode.episode.title}`, 'success');
            this.playContent(this.currentContent, firstEpisode.server, firstEpisode.episode);
        } else {
            this.showNotification('No se encontraron episodios disponibles', 'warning');
        }
        return;
    }
    
    this.showNotification('Este contenido no tiene servidores disponibles', 'warning');
}

// Método para encontrar el primer episodio disponible de una serie
findFirstEpisode(series) {
    if (!series.seasons || series.seasons.length === 0) {
        return null;
    }
    
    // Ordenar temporadas por número
    const sortedSeasons = [...series.seasons].sort((a, b) => a.number - b.number);
    
    for (const season of sortedSeasons) {
        if (season.episodes && season.episodes.length > 0) {
            // Ordenar episodios por número
            const sortedEpisodes = [...season.episodes].sort((a, b) => a.number - b.number);
            
            // CAMBIO: Buscar específicamente el episodio 1
            const firstEpisode = sortedEpisodes.find(ep => ep.number === 1) || sortedEpisodes[0];
            
            if (firstEpisode && firstEpisode.servers && firstEpisode.servers.length > 0) {
                console.log('✅ Encontrado primer episodio:', {
                    season: season.number,
                    episode: firstEpisode.number,
                    title: firstEpisode.title
                });
                
                return {
                    episode: firstEpisode,
                    server: firstEpisode.servers[0],
                    season: season
                };
            }
        }
    }
    
    return null;
}

// Método para reproducir contenido del hero - CORREGIDO
playHeroContent() {
    console.log('🎬 Reproduciendo contenido hero');
    
    if (!this.heroContent) {
        this.showNotification('No hay contenido seleccionado', 'warning');
        return;
    }
    
    // Si es una película
    if (this.heroContent.servers && this.heroContent.servers.length > 0) {
        console.log('🎬 Reproduciendo película hero:', this.heroContent.title);
        this.playContent(this.heroContent, this.heroContent.servers[0]);
        return;
    }
    
    // Si es una serie, buscar episodio 1
    if (this.heroContent.seasons && this.heroContent.seasons.length > 0) {
        console.log('📺 Buscando episodio 1 de serie hero:', this.heroContent.title);
        
        const firstEpisode = this.findFirstEpisode(this.heroContent);
        if (firstEpisode) {
            this.showNotification(`Reproduciendo desde: ${firstEpisode.episode.title}`, 'success');
            this.playContent(this.heroContent, firstEpisode.server, firstEpisode.episode);
        } else {
            // Si no hay episodios, mostrar el detalle
            const type = 'series';
            this.showDetail(this.heroContent, type);
        }
        return;
    }
    
    this.showNotification('Este contenido no tiene servidores disponibles', 'warning');
}

// Método mejorado para manejar errores de JSON
parseJSONSafely(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('❌ Error parsing JSON:', error, jsonString);
        return null;
    }
}

// Método mejorado para actualizar información del servidor en el reproductor
updatePlayerServerInfo(server) {
    const serverInfo = document.getElementById('playerServerInfo');
    if (!serverInfo) return;
    
    const config = this.serverConfigs[server.name];
    const icon = config ? config.icon : '🔗';
    const color = config ? config.color : '#6c757d';
    
    serverInfo.innerHTML = `
        <span class="server-badge" style="background: ${color};">${icon} ${server.name}</span>
        <span class="quality-badge">${server.quality || 'HD'}</span>
        <span class="language-badge">${server.language || 'Español'}</span>
    `;
}

// Método para reproducir contenido del hero
playHeroContent() {
    console.log('🎬 Reproduciendo contenido hero');
    if (this.heroContent) {
        if (this.heroContent.servers && this.heroContent.servers.length > 0) {
            this.playContent(this.heroContent, this.heroContent.servers[0]);
        } else if (this.heroContent.seasons && this.heroContent.seasons.length > 0) {
            // Si es una serie, mostrar el detalle en lugar de reproducir directamente
            const type = 'series';
            this.showDetail(this.heroContent, type);
        } else {
            this.showNotification('No hay servidores disponibles para este contenido', 'warning');
        }
    } else {
        this.showNotification('No hay contenido seleccionado', 'warning');
    }
}

// Método para reproducir contenido actual (desde detail modal)
playCurrentContent() {
    console.log('🎬 Reproduciendo contenido actual desde detail');
    if (this.currentContent) {
        if (this.currentContent.servers && this.currentContent.servers.length > 0) {
            this.playContent(this.currentContent, this.currentContent.servers[0]);
        } else if (this.currentContent.seasons && this.currentContent.seasons.length > 0) {
            this.showNotification('Selecciona un episodio específico para reproducir', 'info');
        } else {
            this.showNotification('No hay servidores disponibles', 'warning');
        }
    } else {
        this.showNotification('No hay contenido seleccionado', 'warning');
    }
}

// Método mejorado para manejar errores de JSON
parseJSONSafely(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('❌ Error parsing JSON:', error, jsonString);
        return null;
    }
}



    hideDetail() {
        document.getElementById('detailModal').classList.add('hidden');
    }


    // Favorites Management
    toggleFavorite() {
        if (!this.currentContent) return;
        
        const type = this.currentContent.seasons ? 'series' : 'movie';
        const favoriteIndex = this.favorites.findIndex(fav => 
            fav.id === this.currentContent.id && fav.type === type
        );
        
        if (favoriteIndex > -1) {
            this.favorites.splice(favoriteIndex, 1);
            this.showNotification('Eliminado de Mi Lista', 'info');
        } else {
            this.favorites.push({
                id: this.currentContent.id,
                type: type
            });
            this.showNotification('Agregado a Mi Lista', 'success');
        }
        
        localStorage.setItem('zenit-favorites', JSON.stringify(this.favorites));
        this.updateFavoriteButton();
    }

    updateFavoriteButton() {
        const btn = document.getElementById('addToListBtn');
        if (!btn || !this.currentContent) return;
        
        const type = this.currentContent.seasons ? 'series' : 'movie';
        const isFavorite = this.favorites.some(fav => 
            fav.id === this.currentContent.id && fav.type === type
        );
        
        btn.textContent = isFavorite ? '✓ En Mi Lista' : '+ Mi Lista';
    }

    // Hero Banner
    setupHeroBanner() {
        const allContent = [...this.movies, ...this.series];
        if (allContent.length > 0) {
            const featured = allContent[Math.floor(Math.random() * allContent.length)];
            this.setHeroBanner(featured);
        }
    }

    setHeroBanner(content) {
        const bgImage = document.getElementById('heroBgImage');
        const title = document.getElementById('heroTitle');
        const description = document.getElementById('heroDescription');
        
        bgImage.src = content.backdrop || content.poster || '';
        title.textContent = content.title;
        description.textContent = (content.synopsis || content.description || 'Tu plataforma de streaming personal').substring(0, 200);
        
        this.heroContent = content;
    }



    showHeroDetail() {
        if (this.heroContent) {
            const type = this.heroContent.seasons ? 'series' : 'movie';
            this.showDetail(this.heroContent, type);
        }
    }

    // Admin Management
    showAdminLogin() {
        document.getElementById('adminLoginModal').classList.remove('hidden');
    }

    hideAdminLogin() {
        document.getElementById('adminLoginModal').classList.add('hidden');
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            this.isAdmin = true;
            this.hideAdminLogin();
            this.showAdminPanel();
            this.showNotification('Bienvenido, Administrador', 'success');
            
            // Clear form
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
        } else {
            this.showNotification('Credenciales incorrectas', 'error');
        }
    }

    showAdminPanel() {
        if (!this.isAdmin) {
            this.showAdminLogin();
            return;
        }
        
        document.getElementById('adminModal').classList.remove('hidden');
        this.loadManageContent();
        this.updateStats();
        this.updateAdminRepoInfo();
    }

    hideAdminPanel() {
        document.getElementById('adminModal').classList.add('hidden');
    }

    updateAdminRepoInfo() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate && this.lastUpdate) {
            lastUpdate.textContent = new Date(this.lastUpdate).toLocaleString();
        }
    }

    switchAdminTab(clickedTab) {
    // Update tab appearance
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    clickedTab.classList.add('active');
    
    // Show corresponding panel
    const tabName = clickedTab.dataset.tab;
    document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
    
    // Convertir nombre de tab a ID de panel
    let panelId;
    switch(tabName) {
        case 'repo-info':
            panelId = 'repoinfoPanel';
            break;
        case 'repositories': // NUEVO
            panelId = 'repositoriesPanel';
            this.loadRepositoriesPanel();
            break;
        case 'add-movie':
            panelId = 'addmoviePanel';
            break;
        case 'add-series':
            panelId = 'addseriesPanel';
            break;
        case 'manage':
            panelId = 'managePanel';
            break;
    }
    
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    if (tabName === 'manage') {
        this.loadManageContent();
    }
}

loadRepositoriesPanel() {
    const panel = document.getElementById('repositoriesPanel');
    if (!panel) return;
    
    const reposInfo = this.getRepositoriesInfo();
    
    panel.innerHTML = `
        <div class="repositories-management">
            <div class="repos-stats-grid">
                <div class="stat-card">
                    <h3>${reposInfo.length}</h3>
                    <p>Repositorios Configurados</p>
                </div>
                <div class="stat-card">
                    <h3>${reposInfo.filter(r => r.active).length}</h3>
                    <p>Repositorios Activos</p>
                </div>
                <div class="stat-card">
                    <h3>${reposInfo.filter(r => r.hasData).length}</h3>
                    <p>Con Datos Cargados</p>
                </div>
            </div>
            
            <div class="repos-list">
                <h3>📂 Repositorios Configurados</h3>
                ${reposInfo.map(repo => `
                    <div class="repo-item ${repo.active ? 'active' : 'inactive'}" data-repo-id="${repo.id}">
                        <div class="repo-info">
                            <div class="repo-header">
                                <h4>${repo.name}</h4>
                                <span class="repo-status ${repo.hasData ? 'loaded' : 'not-loaded'}">
                                    ${repo.hasData ? '✅ Datos cargados' : '⏳ Sin datos'}
                                </span>
                            </div>
                            <p class="repo-url">${repo.url}</p>
                            <div class="repo-stats">
                                <span>🎬 ${repo.itemsCount.movies} películas</span>
                                <span>📺 ${repo.itemsCount.series} series</span>
                                <span>🔢 Prioridad: ${repo.priority}</span>
                                ${repo.lastUpdate ? `<span>🕒 ${new Date(repo.lastUpdate).toLocaleString()}</span>` : ''}
                            </div>
                        </div>
                        <div class="repo-controls">
                            <label class="repo-toggle">
                                <input type="checkbox" ${repo.active ? 'checked' : ''} 
                                       onchange="zenitPlayer.toggleRepository('${repo.id}', this.checked)">
                                <span class="toggle-slider"></span>
                                <span class="toggle-label">Activo</span>
                            </label>
                            <div class="repo-actions">
                                <button onclick="zenitPlayer.testRepository('${repo.id}')" 
                                        class="test-repo-btn" title="Probar conexión">
                                    🔍 Probar
                                </button>
                                <button onclick="zenitPlayer.refreshRepository('${repo.id}')" 
                                        class="refresh-repo-btn" title="Actualizar datos">
                                    🔄 Actualizar
                                </button>
                                ${repo.id !== 'main' ? `
                                    <button onclick="zenitPlayer.editRepository('${repo.id}')" 
                                            class="edit-repo-btn" title="Editar repositorio">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="zenitPlayer.confirmDeleteRepository('${repo.id}')" 
                                            class="delete-repo-btn" title="Eliminar repositorio">
                                        🗑️ Eliminar
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="add-repo-section">
                <h3>➕ Agregar Nuevo Repositorio</h3>
                <form id="addRepoForm" class="add-repo-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre del Repositorio *</label>
                            <input type="text" id="newRepoName" placeholder="Ej: Repositorio de Anime" required>
                        </div>
                        <div class="form-group">
                            <label>Prioridad</label>
                            <input type="number" id="newRepoPriority" placeholder="1" min="1" value="${reposInfo.length + 1}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>URL del Repositorio JSON *</label>
                        <input type="url" id="newRepoUrl" placeholder="https://ejemplo.com/repositorio.json" required>
                        <small>La URL debe devolver un JSON con formato: {"movies": [...], "series": [...]}</small>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="newRepoActive" checked>
                            Activar repositorio inmediatamente
                        </label>
                    </div>
                    <button type="submit" class="submit-btn">➕ Agregar Repositorio</button>
                </form>
            </div>
            
            <div class="bulk-actions">
                <h3>🔧 Acciones Masivas</h3>
                <div class="bulk-buttons">
                    <button onclick="zenitPlayer.refreshAllRepositories()" class="bulk-btn refresh-all">
                        🔄 Actualizar Todos
                    </button>
                    <button onclick="zenitPlayer.testAllRepositories()" class="bulk-btn test-all">
                        🔍 Probar Todos
                    </button>
                    <button onclick="zenitPlayer.exportRepositoriesConfig()" class="bulk-btn export-config">
                        📤 Exportar Configuración
                    </button>
                    <label class="bulk-btn import-config">
                        📥 Importar Configuración
                        <input type="file" accept=".json" onchange="zenitPlayer.importRepositoriesConfig(this)" style="display: none;">
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Configurar formulario
    const form = document.getElementById('addRepoForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addRepositoryFromForm();
    });
}

addRepositoryFromForm() {
    const name = document.getElementById('newRepoName')?.value;
    const url = document.getElementById('newRepoUrl')?.value;
    const priority = parseInt(document.getElementById('newRepoPriority')?.value) || this.repositories.length + 1;
    const active = document.getElementById('newRepoActive')?.checked;
    
    if (!name || !url) {
        this.showNotification('❌ Completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        const repoId = this.addRepository({ name, url, priority, active });
        this.showNotification(`✅ Repositorio "${name}" agregado correctamente`, 'success');
        
        // Limpiar formulario
        document.getElementById('addRepoForm').reset();
        document.getElementById('newRepoPriority').value = this.repositories.length + 1;
        document.getElementById('newRepoActive').checked = true;
        
        // Recargar panel
        this.loadRepositoriesPanel();
        
    } catch (error) {
        this.showNotification(`❌ Error: ${error.message}`, 'error');
    }
}

async testRepository(repoId) {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;
    
    this.showNotification(`🔍 Probando conexión a ${repo.name}...`, 'info');
    
    try {
        const data = await this.loadSingleRepository(repo);
        this.showNotification(`✅ ${repo.name}: Conexión exitosa (${data.movies?.length || 0} películas, ${data.series?.length || 0} series)`, 'success');
    } catch (error) {
        this.showNotification(`❌ ${repo.name}: ${error.message}`, 'error');
    }
}

async refreshRepository(repoId) {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo || !repo.active) return;
    
    this.showNotification(`🔄 Actualizando ${repo.name}...`, 'info');
    
    try {
        const data = await this.loadSingleRepository(repo);
        
        // Actualizar datos
        this.repositoryData.set(repo.id, {
            repo: repo,
            data: data,
            lastUpdate: new Date().toISOString()
        });
        
        // Recombinar todos los datos
        this.combineRepositoryData();
        this.loadContent();
        
        this.showNotification(`✅ ${repo.name} actualizado correctamente`, 'success');
        this.loadRepositoriesPanel(); // Recargar panel para mostrar nueva info
        
    } catch (error) {
        this.showNotification(`❌ Error actualizando ${repo.name}: ${error.message}`, 'error');
    }
}

confirmDeleteRepository(repoId) {
    const repo = this.repositories.find(r => r.id === repoId);
    if (!repo) return;
    
    if (confirm(`¿Estás seguro de eliminar el repositorio "${repo.name}"?\n\nEsta acción no se puede deshacer.`)) {
        this.deleteRepository(repoId);
    }
}

deleteRepository(repoId) {
    const success = this.removeRepository(repoId);
    if (success) {
        this.combineRepositoryData();
        this.loadContent();
        this.showNotification('Repositorio eliminado correctamente', 'success');
        this.loadRepositoriesPanel();
    } else {
        this.showNotification('Error eliminando repositorio', 'error');
    }
}

async refreshAllRepositories() {
    this.showNotification('🔄 Actualizando todos los repositorios...', 'info');
    
    const startTime = Date.now();
    await this.loadFromRepositories();
    this.loadContent();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    this.showNotification(`✅ Todos los repositorios actualizados en ${duration}s`, 'success');
    this.loadRepositoriesPanel();
}

async testAllRepositories() {
    this.showNotification('🔍 Probando todos los repositorios...', 'info');
    
    const activeRepos = this.repositories.filter(r => r.active);
    let successCount = 0;
    
    for (const repo of activeRepos) {
        try {
            await this.loadSingleRepository(repo);
            successCount++;
        } catch (error) {
            console.error(`Error probando ${repo.name}:`, error);
        }
    }
    
    this.showNotification(`✅ Prueba completada: ${successCount}/${activeRepos.length} repositorios funcionando`, successCount === activeRepos.length ? 'success' : 'warning');
}

exportRepositoriesConfig() {
    const config = {
        repositories: this.repositories,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `zenit-repositories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    this.showNotification('📤 Configuración exportada correctamente', 'success');
}

importRepositoriesConfig(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            
            if (!config.repositories || !Array.isArray(config.repositories)) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Confirmar importación
            if (confirm(`¿Importar ${config.repositories.length} repositorios?\n\nEsto reemplazará la configuración actual.`)) {
                this.repositories = config.repositories;
                this.repositoryData.clear();
                
                this.showNotification(`📥 ${config.repositories.length} repositorios importados. Actualiza para cargar datos.`, 'success');
                this.loadRepositoriesPanel();
            }
            
        } catch (error) {
            this.showNotification(`❌ Error importando: ${error.message}`, 'error');
        }
        
        // Limpiar input
        input.value = '';
    };
    
    reader.readAsText(file);
}


    // Content Management (Local)
    addMovie() {
        console.log('📝 Agregando película localmente...');
        
        const movieData = {
            id: Date.now(),
            title: document.getElementById('movieTitle').value,
            year: document.getElementById('movieYear').value || new Date().getFullYear(),
            synopsis: document.getElementById('movieDescription').value,
            genre: document.getElementById('movieGenre').value,
            poster: document.getElementById('moviePoster').value,
            backdrop: document.getElementById('movieBackdrop').value,
            servers: [{
                name: document.getElementById('movieServer').value,
                url: document.getElementById('movieUrl').value,
                quality: document.getElementById('movieQuality').value,
                language: document.getElementById('movieLanguage').value
            }],
            dateAdded: new Date().toISOString()
        };
        
        // Validate required fields
        if (!movieData.title || !movieData.servers[0].name || !movieData.servers[0].url) {
            this.showNotification('❌ Completa todos los campos requeridos (*)', 'error');
            return;
        }
        
        this.movies.push(movieData);
        this.saveMoviesLocal();
        this.loadContent();
        this.updateStats();
        this.clearForm('movie');
        
        this.showNotification('✅ Película agregada localmente', 'success');
    }

    addSeries() {
        console.log('📺 Agregando serie localmente...');
        
        const seriesData = {
            id: Date.now(),
            title: document.getElementById('seriesTitle').value,
            year: document.getElementById('seriesYear').value || new Date().getFullYear(),
            synopsis: document.getElementById('seriesDescription').value,
            genre: document.getElementById('seriesGenre').value,
            poster: document.getElementById('seriesPoster').value,
            backdrop: document.getElementById('seriesBackdrop').value,
            seasons: [],
            dateAdded: new Date().toISOString()
        };
        
        if (!seriesData.title) {
            this.showNotification('❌ El título es requerido', 'error');
            return;
        }
        
        this.series.push(seriesData);
        this.saveSeriesLocal();
        this.loadContent();
        this.updateStats();
        this.clearForm('series');
        
        // Show episodes management
        const episodesManagement = document.getElementById('episodesManagement');
        if (episodesManagement) {
            episodesManagement.classList.remove('hidden');
            this.currentSeriesId = seriesData.id;
        }
        
        this.showNotification('✅ Serie creada localmente', 'success');
    }

    addEpisode() {
        console.log('📺 Agregando episodio...');
        
        if (!this.currentSeriesId) {
            this.showNotification('❌ Selecciona una serie primero', 'error');
            return;
        }
        
        const series = this.series.find(s => s.id === this.currentSeriesId);
        if (!series) {
            this.showNotification('❌ Serie no encontrada', 'error');
            return;
        }
        
        const seasonNumber = parseInt(document.getElementById('episodeSeason').value);
        const episodeNumber = parseInt(document.getElementById('episodeNumber').value);
        
        const episodeData = {
            number: episodeNumber,
            title: document.getElementById('episodeTitle').value,
            synopsis: document.getElementById('episodeDescription').value,
            duration: 25,
            servers: [{
                name: document.getElementById('episodeServer').value,
                url: document.getElementById('episodeUrl').value,
                quality: document.getElementById('episodeQuality').value,
                language: document.getElementById('episodeLanguage').value
            }]
        };
        
        if (!episodeData.title || !episodeData.servers[0].name || !episodeData.servers[0].url) {
            this.showNotification('❌ Completa todos los campos requeridos (*)', 'error');
            return;
        }
        
        // Encontrar o crear temporada
        let season = series.seasons.find(s => s.number === seasonNumber);
        if (!season) {
            season = {
                number: seasonNumber,
                year: new Date().getFullYear(),
                description: `Temporada ${seasonNumber} de ${series.title}`,
                episodes: []
            };
            series.seasons.push(season);
        }
        
        // Agregar episodio
        season.episodes.push(episodeData);
        
        this.saveSeriesLocal();
        this.updateStats();
        this.clearForm('episode');
        
        this.showNotification(`✅ Episodio S${seasonNumber}E${episodeNumber} agregado`, 'success');
    }

    clearForm(type) {
        if (type === 'movie') {
            document.getElementById('movieForm').reset();
        } else if (type === 'series') {
            document.getElementById('seriesForm').reset();
            document.getElementById('episodesManagement').classList.add('hidden');
            this.currentSeriesId = null;
        } else if (type === 'episode') {
            document.getElementById('episodeForm').reset();
        }
    }

    // Local Data Management
    saveMoviesLocal() {
        localStorage.setItem('zenit-movies-local', JSON.stringify(this.movies));
    }

    saveSeriesLocal() {
        localStorage.setItem('zenit-series-local', JSON.stringify(this.series));
    }

    loadManageContent() {
        this.switchManageTab(document.querySelector('.manage-tab.active') || document.querySelector('.manage-tab'));
    }

    switchManageTab(clickedTab) {
        document.querySelectorAll('.manage-tab').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
        
        const tabType = clickedTab.dataset.tab;
        const manageList = document.getElementById('manageList');
        
        manageList.innerHTML = '';
        
        const items = tabType === 'movies' ? this.movies : this.series;
        
        items.forEach(item => {
            const manageItem = document.createElement('div');
            manageItem.className = 'manage-item';
            
            const serversCount = this.getItemServersCount(item);
            
            manageItem.innerHTML = `
                <div class="manage-item-info">
                    <h4>${item.title}</h4>
                    <p>${item.year || '2024'} • ${item.genre || 'Sin categoría'} • ${serversCount} servidor(es)</p>
                </div>
                <div class="manage-actions">
                    <button class="delete-btn" onclick="zenitPlayer.deleteContent(${item.id}, '${tabType}')">Eliminar</button>
                </div>
            `;
            
            manageList.appendChild(manageItem);
        });
        
        if (items.length === 0) {
            manageList.innerHTML = '<div class="empty-state">No hay contenido disponible</div>';
        }
    }

    getItemServersCount(item) {
        if (item.servers) {
            return item.servers.length;
        } else if (item.seasons) {
            let count = 0;
            item.seasons.forEach(season => {
                if (season.episodes) {
                    season.episodes.forEach(episode => {
                        if (episode.servers) {
                            count += episode.servers.length;
                        }
                    });
                }
            });
            return count;
        }
        return 0;
    }

    deleteContent(id, type) {
        if (!confirm(`¿Eliminar este ${type === 'movies' ? 'película' : 'serie'}?`)) return;
        
        if (type === 'movies') {
            this.movies = this.movies.filter(movie => movie.id !== id);
            this.saveMoviesLocal();
        } else {
            this.series = this.series.filter(series => series.id !== id);
            this.saveSeriesLocal();
        }
        
        this.loadContent();
        this.loadManageContent();
        this.updateStats();
        this.showNotification('Contenido eliminado', 'success');
    }

    updateStats() {
        // Admin panel stats
        document.getElementById('totalMoviesCount').textContent = this.movies.length;
        document.getElementById('totalSeriesCount').textContent = this.series.length;
        
        let episodesCount = 0;
        let serversCount = 0;
        
        // Contar episodios y servidores
        this.movies.forEach(movie => {
            if (movie.servers) serversCount += movie.servers.length;
        });
        
        this.series.forEach(series => {
            if (series.seasons) {
                series.seasons.forEach(season => {
                    if (season.episodes) {
                        episodesCount += season.episodes.length;
                        season.episodes.forEach(episode => {
                            if (episode.servers) serversCount += episode.servers.length;
                        });
                    }
                });
            }
        });
        
        document.getElementById('totalEpisodesCount').textContent = episodesCount;
        document.getElementById('totalServersCount').textContent = serversCount;
    }

    // Search and Filters
    globalSearch(query) {
        if (!query.trim()) {
            this.loadContent();
            return;
        }
        
        const searchResults = [];
        
        // Search movies
        this.movies.forEach(movie => {
            if (this.matchesSearch(movie, query)) {
                searchResults.push({...movie, type: 'movie'});
            }
        });
        
        // Search series
        this.series.forEach(series => {
            if (this.matchesSearch(series, query)) {
                searchResults.push({...series, type: 'series'});
            }
        });
        
        // Display results
        this.displaySearchResults(searchResults);
    }

    matchesSearch(item, query) {
    const searchFields = [
        item.title,
        item.synopsis,
        item.description,
        item.genre,
        item.year?.toString(),
        // NO incluir información de servidores en búsqueda
    ].filter(Boolean);
    
    return searchFields.some(field => 
        field.toLowerCase().includes(query.toLowerCase())
    );
}

    displaySearchResults(results) {
        // Clear all carousels and show search results
        document.querySelectorAll('.movies-carousel').forEach(carousel => {
            carousel.innerHTML = '';
            results.forEach(item => {
                const card = this.createMovieCard(item, item.type);
                carousel.appendChild(card);
            });
        });
        
        if (results.length === 0) {
            document.getElementById('trendingCarousel').innerHTML = 
                '<div class="empty-state">No se encontraron resultados</div>';
        }
    }

    setupFilters(type) {
        const items = type === 'movie' ? this.movies : this.series;
        
        const genres = [...new Set(
            items.map(item => item.genre).filter(Boolean)
        )];
        
        const years = [...new Set(
            items.map(item => item.year).filter(Boolean)
        )].sort((a, b) => b - a);
        
        // Populate genre filter
        const genreFilter = document.getElementById(`${type}GenreFilter`);
        if (genreFilter) {
            genreFilter.innerHTML = '<option value="">Todos los géneros</option>';
            genres.forEach(genre => {
                genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
            });
        }
        
        // Populate year filter
        const yearFilter = document.getElementById(`${type}YearFilter`);
        if (yearFilter) {
            yearFilter.innerHTML = '<option value="">Todos los años</option>';
            years.forEach(year => {
                yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
            });
        }
        
        // Add filter event listeners
        [genreFilter, yearFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyFilters(type));
            }
        });
    }

    applyFilters(type) {
        const genreFilter = document.getElementById(`${type}GenreFilter`);
        const yearFilter = document.getElementById(`${type}YearFilter`);
        
        const genreValue = genreFilter ? genreFilter.value : '';
        const yearValue = yearFilter ? yearFilter.value : '';
        
        const items = type === 'movie' ? this.movies : this.series;
        const filteredItems = items.filter(item => {
            const genreMatch = !genreValue || item.genre === genreValue;
            const yearMatch = !yearValue || item.year?.toString() === yearValue;
            return genreMatch && yearMatch;
        });
        
        const grid = document.getElementById(`${type}sGrid`);
        if (grid) {
            grid.innerHTML = '';
            
            filteredItems.forEach(item => {
                const card = this.createMovieCard(item, type);
                grid.appendChild(card);
            });
            
            if (filteredItems.length === 0) {
                grid.innerHTML = '<div class="empty-state">No se encontraron resultados con los filtros aplicados</div>';
            }
        }
    }

    // Helper Functions
    getTrendingContent() {
        const recent = [...this.movies, ...this.series]
            .sort((a, b) => new Date(b.dateAdded || b.addedDate || 0) - new Date(a.dateAdded || a.addedDate || 0))
            .slice(0, 8);
        
        return recent;
    }

    getRecentContent() {
        return [...this.movies, ...this.series]
            .sort((a, b) => new Date(b.dateAdded || b.addedDate || 0) - new Date(a.dateAdded || a.addedDate || 0))
            .slice(0, 10);
    }

    handleKeyboardShortcuts(e) {
        const video = document.getElementById('videoPlayer');
        const playerModal = document.getElementById('playerModal');
        
        // Only handle shortcuts when player is open
        if (!playerModal || playerModal.classList.contains('hidden') || !video || !video.src) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                video.paused ? video.play() : video.pause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                video.muted = !video.muted;
                break;
            case 'Escape':
                e.preventDefault();
                this.hidePlayer();
                break;
        }
    }

    toggleFullscreen() {
        const video = document.getElementById('videoPlayer');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (video) {
            video.requestFullscreen();
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Auto remove after delay
        const delay = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, delay);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    // Fallback Data
    initializeFallbackData() {
        console.log('⚠️ Usando datos de fallback...');
        
        this.movies = [
            {
                id: 1,
                title: "Error de Conexión - Demo",
                synopsis: "No se pudo conectar al repositorio. Este es contenido de demostración local.",
                year: 2024,
                genre: "Demo",
                poster: "https://via.placeholder.com/280x420?text=Error+Conexion&bg=dc3545&color=white",
                servers: [
                    {
                        name: "Google Drive",
                        url: "https://drive.google.com/file/d/15P4pqgtePHrygH67U5Yev2vHq1ctIejE/view?usp=sharing",
                        quality: "HD",
                        language: "Español"
                    }
                ],
                dateAdded: new Date().toISOString()
            }
        ];

        this.series = [];
        
        console.log('Datos de fallback inicializados');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zenitPlayer = new ZenitPlayer();
});

// Additional CSS for new elements
const repoStyles = `
/* Loading Screen */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
}

.loading-content {
    text-align: center;
    max-width: 400px;
    padding: 40px;
}

.logo-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 30px;
}

.logo-loading .logo-text {
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(45deg, #007bff, #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.loading-text {
    font-size: 18px;
    margin-bottom: 20px;
    opacity: 0.9;
}

.loading-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    opacity: 0.8;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #007bff;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Repo Status */
.repo-status {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    cursor: help;
}

.repo-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #28a745;
}

.refresh-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
}

.refresh-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(180deg);
}

/* Content Count */
.content-count {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 1.2rem;
}

/* Server Badges */
.server-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
    color: white;
    margin-right: 4px;
    margin-bottom: 2px;
}

.quality-badge, .language-badge {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    margin-left: 4px;
}

/* Player Server Info */
.player-server-info {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

/* Detail Servers */
.servers-list h4 {
    font-size: 14px;
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.servers-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.server-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.server-btn:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

/* Episode Cards */
.season-section {
    margin-bottom: 24px;
}

.season-section h4 {
    color: var(--text-primary);
    font-size: 18px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-color);
}

.episode-info {
    display: flex;
    gap: 16px;
    width: 100%;
}

.episode-details {
    flex: 1;
}

.episode-meta {
    margin: 8px 0;
    font-size: 12px;
    color: var(--text-secondary);
}

.episode-servers {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
}

.episode-server-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.episode-server-btn:hover {
    opacity: 0.8;
}

/* Repo Info Panel */
.repo-info-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
}

.repo-info-card h3 {
    color: var(--text-primary);
    margin-bottom: 16px;
}

.repo-stats {
    display: grid;
    gap: 12px;
    margin-bottom: 16px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
}

.stat-item:last-child {
    border-bottom: none;
}

.status-connected {
    color: #28a745;
    font-weight: 600;
}

.refresh-repo-btn {
    background: var(--netflix-red);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
}

.refresh-repo-btn:hover {
    background: var(--netflix-dark-red);
    transform: translateY(-1px);
}

.content-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

/* Movie servers in overlay */
.movie-servers {
    margin: 8px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

/* Responsive */
@media (max-width: 768px) {
    .loading-content {
        padding: 20px;
    }
    
    .repo-status {
        display: none;
    }
    
    .servers-buttons, .episode-servers {
        flex-direction: column;
    }
    
    .server-btn, .episode-server-btn {
        width: 100%;
        text-align: center;
    }
    
    .content-stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = repoStyles;
document.head.appendChild(styleElement);