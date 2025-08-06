/*
video-player.js - Zenit Video Player SIN TÍTULOS DE SERVIDORES
Author: CrisDEV
*/

// Zenit Video Player - Reproductor Sin Información de Servidores
class ZenitVideoPlayer {
    constructor() {
        this.currentVideo = null;
        this.isPlaying = false;
        this.loadAttempts = 0;
        this.maxAttempts = 6;
        this.activeIframe = null;
        this.activeContainer = null;
    }

    // Método principal para reproducir video - SIN mostrar servidor
    async playVideo(url, title, description, server = 'direct') {
        console.log('🎬 Iniciando reproducción:', title);
        // NO mostrar URL ni servidor en consola
        
        const video = document.getElementById('videoPlayer');
        const overlay = document.getElementById('videoOverlay');
        const playerTitle = document.getElementById('playerTitle');
        const playerDescription = document.getElementById('playerDescription');
        
        // Limpiar cualquier reproductor anterior
        this.cleanup();
        
        // Configurar información del reproductor
        if (playerTitle) playerTitle.textContent = title;
        if (playerDescription) playerDescription.textContent = description || '';
        
        // Mostrar overlay de carga SIN mencionar servidor
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Cargando video...</p>
                </div>
            `;
        }
        
        this.currentVideo = { url, title, description, server };
        this.loadAttempts = 0;
        
        try {
            // Procesar según el servidor (sin mostrar cuál)
            switch(server) {
                case 'drive':
                    await this.playGoogleDriveVideo(url, video, overlay);
                    break;
                case 'youtube':
                    this.playYouTubeVideo(url);
                    return;
                case 'facebook':
                    await this.playFacebookVideo(url, video, overlay);
                    break;
                case 'mega':
                    await this.playMegaVideo(url, video, overlay);
                    break;
                case 'streamtape':
                    await this.playStreamtapeVideo(url, video, overlay);
                    break;
                case 'dropbox':
                    await this.playDropboxVideo(url, video, overlay);
                    break;
                case 'firebase':
                    await this.playFirebaseVideo(url, video, overlay);
                    break;
                case '1fichier':
                    await this.play1FichierVideo(url, video, overlay);
                    break;
                case 'stape':
                    await this.playStapeVideo(url, video, overlay);
                    break;
                case 'zippyshare':
                    await this.playZippyshareVideo(url, video, overlay);
                    break;
                case 'direct':
                default:
                    await this.playDirectVideo(url, video, overlay);
                    break;
            }
        } catch (error) {
            console.error('❌ Error en reproducción:', error);
            this.showVideoError(error.message, url, overlay);
        }
    }

    // Google Drive - SIN mostrar información técnica
    async playGoogleDriveVideo(url, video, overlay) {
        const fileId = this.extractGoogleDriveFileId(url);
        if (!fileId) {
            throw new Error('Video no disponible');
        }
        
        // URLs sin mostrar información técnica
        const sources = [
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?id=${fileId}&export=view`,
            `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
            `https://docs.google.com/uc?id=${fileId}`,
            `https://drive.usercontent.google.com/download?id=${fileId}&export=view`,
            `https://drive.google.com/file/d/${fileId}/preview`
        ];
        
        for (let i = 0; i < sources.length; i++) {
            const currentSource = sources[i];
            
            try {
                // Actualizar overlay SIN detalles técnicos
                if (overlay) {
                    overlay.innerHTML = `
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                            <p>Cargando video...</p>
                            <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 16px auto; overflow: hidden;">
                                <div style="width: ${((i + 1) / sources.length) * 100}%; height: 100%; background: #007bff; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `;
                }
                
                await this.loadSingleVideo(currentSource, video);
                
                if (overlay) overlay.classList.add('hidden');
                
                // Intentar reproducir automáticamente
                try {
                    await video.play();
                } catch (playError) {
                    this.showPlayButton(overlay);
                }
                return;
                
            } catch (error) {
                if (i === sources.length - 1) {
                    this.loadGoogleDriveIframe(fileId, video, overlay);
                    return;
                }
                continue;
            }
        }
    }

    // Iframe de Google Drive SIN mostrar información del servidor
    loadGoogleDriveIframe(fileId, video, overlay) {
        const videoContainer = video.parentElement;
        const iframeContainer = this.createIframeContainer('drive-iframe-container');
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: #000;
        `;
        iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
        
        iframeContainer.appendChild(iframe);
        video.style.display = 'none';
        videoContainer.appendChild(iframeContainer);
        
        this.activeIframe = iframe;
        this.activeContainer = iframeContainer;
        
        // Controles SIN mostrar tipo de servidor
        const controls = this.createSimpleControls(() => {
            this.cleanupIframe();
            video.style.display = 'block';
            if (overlay) overlay.classList.remove('hidden');
        });
        
        videoContainer.appendChild(controls);
        this.setupControlsAutoHide(controls, videoContainer);
        
        if (overlay) overlay.classList.add('hidden');
    }

    // MEGA - SIN mostrar información técnica
    async playMegaVideo(url, video, overlay) {
        if (!url.includes('mega.nz')) {
            throw new Error('Video no disponible');
        }
        
        const megaBlocked = await this.checkMegaBlocked(url);
        
        if (megaBlocked) {
            this.showMegaAlternativesSimple(url, overlay);
            return;
        }
        
        const attempts = [
            async () => {
                if (overlay) {
                    overlay.innerHTML = `
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                            <p>Verificando disponibilidad...</p>
                        </div>
                    `;
                }
                await this.loadSingleVideoWithTimeout(url, video, 3000);
            },
            async () => {
                this.showMegaAlternativesSimple(url, overlay);
            }
        ];
        
        try {
            await this.tryMultipleAttempts(attempts, 'Video', overlay);
        } catch (error) {
            this.showMegaAlternativesSimple(url, overlay);
        }
    }

    // MEGA alternativas SIN mencionar servidor
    showMegaAlternativesSimple(url, overlay) {
        if (!overlay) return;
        
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div style="color: #ff6b6b; font-size: 48px; margin-bottom: 16px;">🔒</div>
                <h3 style="color: #ff6b6b; font-weight: 600; margin-bottom: 16px;">Contenido Protegido</h3>
                <p style="margin-bottom: 20px; opacity: 0.9; line-height: 1.5; max-width: 500px;">
                    Este video requiere apertura en nueva ventana por políticas de seguridad del servidor.
                </p>
                
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    <button onclick="window.open('${url}', '_blank')" 
                            style="background: #007bff; color: white; border: none; padding: 12px 20px; 
                                   border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        🌐 Abrir Video
                    </button>
                    
                    <button onclick="navigator.clipboard.writeText('${url}').then(() => { 
                        alert('Enlace copiado'); 
                    })" style="background: #6c757d; color: white; border: none; padding: 12px 20px; 
                               border-radius: 6px; cursor: pointer; font-size: 14px;">
                        📋 Copiar Enlace
                    </button>
                </div>
            </div>
        `;
    }

    // Otros servidores - SIMPLIFICADOS sin mostrar información técnica
    async playStreamtapeVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => {
                const match = url.match(/streamtape\.com\/v\/([^\/\?]+)/);
                if (match) {
                    const processedUrl = `https://streamtape.com/e/${match[1]}`;
                    await this.loadSingleVideo(processedUrl, video);
                }
            },
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async playDropboxVideo(url, video, overlay) {
        const attempts = [
            async () => {
                let processedUrl = url.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
                if (!processedUrl.includes('dl=1') && !processedUrl.includes('raw=1')) {
                    processedUrl += (processedUrl.includes('?') ? '&' : '?') + 'raw=1';
                }
                await this.loadSingleVideo(processedUrl, video);
            },
            async () => await this.loadSingleVideo(url, video),
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async playFirebaseVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => {
                const processedUrl = url.includes('?') ? url + '&alt=media' : url + '?alt=media';
                await this.loadSingleVideo(processedUrl, video);
            }
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async play1FichierVideo(url, video, overlay) {
        if (overlay) {
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Cargando video...</p>
                </div>
            `;
        }
        
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async playStapeVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => {
                const processedUrl = url.replace('/v/', '/e/');
                await this.loadSingleVideo(processedUrl, video);
            },
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async playZippyshareVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    async playDirectVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => {
                const video = document.getElementById('videoPlayer');
                video.crossOrigin = 'anonymous';
                await this.loadSingleVideo(url, video);
            }
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    playYouTubeVideo(url) {
        window.open(url, '_blank');
        if (window.zenitPlayer) {
            window.zenitPlayer.hidePlayer();
            window.zenitPlayer.showNotification('Video abierto en nueva pestaña', 'info');
        }
    }

    async playFacebookVideo(url, video, overlay) {
        const attempts = [
            async () => await this.loadSingleVideo(url, video),
            async () => this.loadVideoIframeSimple(url, video, overlay)
        ];
        
        await this.tryMultipleAttempts(attempts, 'Video', overlay);
    }

    // Método auxiliar para múltiples intentos SIN mostrar información técnica
    async tryMultipleAttempts(attempts, serverName, overlay) {
        for (let i = 0; i < attempts.length; i++) {
            try {
                if (overlay && serverName !== 'MEGA') {
                    overlay.innerHTML = `
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                            <p>Cargando video...</p>
                        </div>
                    `;
                }
                
                await attempts[i]();
                
                if (overlay && !this.activeIframe && serverName !== 'MEGA') {
                    overlay.classList.add('hidden');
                }
                
                // Autoplay
                const video = document.getElementById('videoPlayer');
                if (video && video.src && !this.activeIframe) {
                    try {
                        await video.play();
                    } catch (playError) {
                        if (serverName !== 'MEGA') {
                            this.showPlayButton(overlay);
                        }
                    }
                }
                return;
                
            } catch (error) {
                if (serverName === 'MEGA' && (error.message.includes('rechazó') || error.message.includes('blocked'))) {
                    this.showMegaAlternativesSimple(this.currentVideo?.url || '', overlay);
                    return;
                }
                
                if (i === attempts.length - 1) {
                    if (serverName === 'MEGA') {
                        this.showMegaAlternativesSimple(this.currentVideo?.url || '', overlay);
                        return;
                    } else {
                        throw new Error('Video no disponible en este momento');
                    }
                }
            }
        }
    }

    // Crear controles simples SIN mostrar servidor
    createSimpleControls(onBack) {
        const controls = document.createElement('div');
        controls.className = 'simple-controls';
        controls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            gap: 8px;
        `;
        
        controls.innerHTML = `
            <button class="fullscreen-btn" style="background: rgba(0,0,0,0.7); color: white; border: none; 
                       padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                ⛶ Pantalla completa
            </button>
            <button class="back-btn" style="background: rgba(0,0,0,0.7); color: white; border: none; 
                       padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                ✕ Cerrar
            </button>
        `;
        
        controls.querySelector('.back-btn').onclick = onBack;
        controls.querySelector('.fullscreen-btn').onclick = () => {
            if (this.activeContainer && this.activeContainer.requestFullscreen) {
                this.activeContainer.requestFullscreen();
            }
        };
        
        return controls;
    }

    // Iframe simple SIN mostrar servidor
    loadVideoIframeSimple(url, video, overlay) {
        const videoContainer = video.parentElement;
        const iframeContainer = this.createIframeContainer('video-iframe-container');
        const iframe = this.createIframe(url);
        
        iframeContainer.appendChild(iframe);
        video.style.display = 'none';
        videoContainer.appendChild(iframeContainer);
        
        this.activeIframe = iframe;
        this.activeContainer = iframeContainer;
        
        const controls = this.createSimpleControls(() => {
            this.cleanupIframe();
            video.style.display = 'block';
        });
        
        videoContainer.appendChild(controls);
        
        if (overlay) overlay.classList.add('hidden');
        
        iframe.onerror = () => {
            this.cleanupIframe();
            video.style.display = 'block';
            throw new Error('No se pudo cargar el video');
        };
    }

    // Métodos auxiliares sin cambios importantes
    extractGoogleDriveFileId(url) {
        const patterns = [
            /\/d\/([a-zA-Z0-9-_]+)/,
            /id=([a-zA-Z0-9-_]+)/,
            /file\/d\/([a-zA-Z0-9-_]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    async checkMegaBlocked(url) {
        try {
            const testUrl = url.replace('/file/', '/embed/').split('#')[0];
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors'
            });
            
            clearTimeout(timeoutId);
            return false;
        } catch (error) {
            return true;
        }
    }

    loadSingleVideoWithTimeout(url, video, timeout = 5000) {
        return new Promise((resolve, reject) => {
            this.clearVideoEvents(video);
            
            video.src = '';
            video.load();
            video.src = url;
            video.preload = 'auto';
            
            let hasResolved = false;
            
            const timeoutId = setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    cleanup();
                    reject(new Error('Video no disponible'));
                }
            }, timeout);
            
            const onCanPlay = () => {
                if (hasResolved) return;
                hasResolved = true;
                clearTimeout(timeoutId);
                cleanup();
                resolve();
            };
            
            const onError = (e) => {
                if (hasResolved) return;
                hasResolved = true;
                clearTimeout(timeoutId);
                cleanup();
                reject(new Error('Error de carga'));
            };
            
            const cleanup = () => {
                video.removeEventListener('canplay', onCanPlay);
                video.removeEventListener('error', onError);
            };
            
            video.addEventListener('canplay', onCanPlay);
            video.addEventListener('error', onError);
            video.load();
        });
    }

    loadSingleVideo(url, video) {
        return new Promise((resolve, reject) => {
            this.clearVideoEvents(video);
            
            video.src = '';
            video.load();
            video.src = url;
            video.preload = 'auto';
            video.crossOrigin = 'anonymous';
            
            let hasResolved = false;
            let timeoutId;
            
            const onCanPlayThrough = () => {
                if (hasResolved) return;
                hasResolved = true;
                clearTimeout(timeoutId);
                cleanup();
                resolve();
            };
            
            const onLoadedData = () => {
                if (hasResolved) return;
                if (video.readyState >= 3) {
                    onCanPlayThrough();
                }
            };
            
            const onError = (e) => {
                if (hasResolved) return;
                hasResolved = true;
                clearTimeout(timeoutId);
                cleanup();
                reject(new Error('Error de carga'));
            };
            
            const cleanup = () => {
                video.removeEventListener('canplaythrough', onCanPlayThrough);
                video.removeEventListener('loadeddata', onLoadedData);
                video.removeEventListener('error', onError);
                video.removeEventListener('abort', onError);
            };
            
            video.addEventListener('canplaythrough', onCanPlayThrough);
            video.addEventListener('loadeddata', onLoadedData);
            video.addEventListener('error', onError);
            video.addEventListener('abort', onError);
            
            timeoutId = setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    cleanup();
                    reject(new Error('Timeout'));
                }
            }, 12000);
            
            video.load();
            
            const checkInterval = setInterval(() => {
                if (hasResolved) {
                    clearInterval(checkInterval);
                    return;
                }
                
                if (video.readyState >= 3 && video.duration > 0) {
                    clearInterval(checkInterval);
                    onCanPlayThrough();
                }
            }, 1000);
            
            setTimeout(() => clearInterval(checkInterval), 12000);
        });
    }

    createIframeContainer(className) {
        const container = document.createElement('div');
        container.className = className;
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10;
        `;
        return container;
    }

    createIframe(url) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: #000;
        `;
        iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-downloads';
        return iframe;
    }

    setupControlsAutoHide(controls, container) {
        let hideTimeout = setTimeout(() => {
            controls.style.opacity = '0';
        }, 5000);
        
        const resetTimeout = () => {
            controls.style.opacity = '1';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                controls.style.opacity = '0';
            }, 3000);
        };
        
        controls.addEventListener('mousemove', resetTimeout);
        container.addEventListener('mousemove', resetTimeout);
    }

    cleanupIframe() {
        if (this.activeContainer) {
            this.activeContainer.remove();
            this.activeContainer = null;
        }
        if (this.activeIframe) {
            this.activeIframe = null;
        }
        
        const controls = document.querySelectorAll('.simple-controls, .iframe-controls');
        controls.forEach(control => control.remove());
    }

    showPlayButton(overlay) {
        if (!overlay) return;
        
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="loading-spinner">
                <button onclick="document.getElementById('videoPlayer').play(); this.parentElement.parentElement.classList.add('hidden');" 
                        style="background: #007bff; color: white; border: none; border-radius: 50%; 
                               width: 80px; height: 80px; font-size: 24px; cursor: pointer; 
                               box-shadow: 0 4px 16px rgba(0,123,255,0.3); transition: all 0.2s ease;"
                        onmouseover="this.style.transform='scale(1.1)'"
                        onmouseout="this.style.transform='scale(1)'">
                    ▶
                </button>
                <p style="margin-top: 16px;">Haz clic para reproducir</p>
            </div>
        `;
    }

    showVideoError(message, originalUrl, overlay) {
        if (!overlay) return;
        
        overlay.classList.remove('hidden');
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div style="color: #ff4444; font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <p style="color: #ff4444; font-weight: 600; margin-bottom: 16px;">Error al cargar video</p>
                <p style="margin-bottom: 20px; opacity: 0.8;">Video no disponible en este momento</p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.open('${originalUrl}', '_blank')" 
                            style="background: #007bff; color: white; border: none; padding: 8px 16px; 
                                   border-radius: 4px; cursor: pointer; font-size: 12px;">
                        🔗 Abrir en nueva pestaña
                    </button>
                    <button onclick="zenitVideoPlayer.playVideo('${originalUrl}', '${this.currentVideo?.title || 'Video'}', '${this.currentVideo?.description || ''}', '${this.currentVideo?.server || 'direct'}')" 
                            style="background: #28a745; color: white; border: none; padding: 8px 16px; 
                                   border-radius: 4px; cursor: pointer; font-size: 12px;">
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    clearVideoEvents(video) {
        const events = ['canplay', 'canplaythrough', 'loadeddata', 'error', 'abort', 'loadstart'];
        events.forEach(event => {
            video.removeEventListener(event, () => {});
        });
    }

    changeSpeed(speed) {
        const video = document.getElementById('videoPlayer');
        if (video && !this.activeIframe) {
            video.playbackRate = parseFloat(speed);
            if (window.zenitPlayer) {
                window.zenitPlayer.showNotification(`Velocidad: ${speed}x`, 'info');
            }
        }
    }

    toggleFullscreen() {
        if (this.activeContainer) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                this.activeContainer.requestFullscreen();
            }
        } else {
            const video = document.getElementById('videoPlayer');
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (video) {
                video.requestFullscreen();
            }
        }
    }

    cleanup() {
        const video = document.getElementById('videoPlayer');
        if (video) {
            try {
                video.pause();
                video.src = '';
                video.load();
                video.style.display = 'block';
                this.clearVideoEvents(video);
            } catch (error) {
                // Error silencioso
            }
        }
        
        this.cleanupIframe();
        this.currentVideo = null;
        this.isPlaying = false;
        this.loadAttempts = 0;
    }
}

// Crear instancia global del reproductor
window.zenitVideoPlayer = new ZenitVideoPlayer();

// Mensaje limpio en consola
console.log('🎬 Reproductor inicializado');