// Carrusel Integrado Mejorado en la Página
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const inlineCarrusel = document.getElementById('inline-carrusel');
    const carruselTrack = document.getElementById('inline-carrusel-track');
    const carruselTitle = document.getElementById('inline-carrusel-title');
    const closeBtn = document.getElementById('close-inline-carrusel');
    const prevBtn = document.querySelector('.inline-prev-btn');
    const nextBtn = document.querySelector('.inline-next-btn');
    const currentImgSpan = document.getElementById('inline-current-img');
    const totalImgsSpan = document.getElementById('inline-total-imgs');
    const serviciosSection = document.getElementById('servicios');
    
    // Configuración de carruseles por servicio
    const carruselConfig = {
        automatizacion: {
            totalImages: 17,
            imagePrefix: 'Automatizacion',
            serviceName: 'Automatización'
        },
        mecanica: {
            totalImages: 8,
            imagePrefix: 'Mecanica',
            serviceName: 'Mecánica Industrial'
        },
        electricidad: {
            totalImages: 31,
            imagePrefix: 'Electricidad',
            serviceName: 'Electricidad Industrial'
        }
    };
    
    const imageFolder = 'Imagenes_Servicios/';
    
    // Variables del carrusel actual
    let currentCarrusel = null;
    let currentIndex = 0;
    let totalImages = 0;
    let autoAdvanceInterval;
    let mouseLeaveTimeout;
    
    // Configurar event listeners para las tarjetas
    const cardsWithCarrusel = document.querySelectorAll('[data-carrusel-type]');
    
    cardsWithCarrusel.forEach(card => {
        
        // También permitir apertura con clic
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const carruselType = this.getAttribute('data-carrusel-type');
            openCarrusel(carruselType);
        });
    });
    
    // Función para abrir el carrusel
    function openCarrusel(carruselType) {
        if (!carruselConfig[carruselType]) return;
        
        // Cerrar carrusel anterior si existe
        if (currentCarrusel) {
            stopAutoAdvance();
        }
        
        currentCarrusel = carruselType;
        const config = carruselConfig[carruselType];
        totalImages = config.totalImages;
        currentIndex = 0;
        
        // Actualizar título
        carruselTitle.textContent = `Trabajos Realizados - ${config.serviceName}`;
        totalImgsSpan.textContent = totalImages;
        
        // Cargar imágenes
        loadCarruselImages(config);
        
        // Mostrar carrusel con animación
        inlineCarrusel.classList.add('active');
        serviciosSection.classList.add('with-carrusel');
        
        // Desplazar suavemente a la sección de servicios
        setTimeout(() => {
        window.scrollTo({
        top: serviciosSection.offsetTop - 10,  // Ajusta este valor para compensar el desplazamiento
        behavior: 'smooth'
        });
    }, 300);
 
        // Actualizar contador
        updateCounter();
        
        // Iniciar auto-avance
        startAutoAdvance();
        
        // Crear indicadores de progreso
        createProgressDots();
    }
    
    // Función para cerrar el carrusel
    function closeCarrusel() {
        inlineCarrusel.classList.remove('active');
        serviciosSection.classList.remove('with-carrusel');
        currentCarrusel = null;
        
        // Detener auto-avance
        stopAutoAdvance();
        
        // Limpiar timeout si existe
        if (mouseLeaveTimeout) {
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = null;
        }
    }
    
    // Función para cargar imágenes al carrusel
    function loadCarruselImages(config) {
        carruselTrack.innerHTML = `
            <div class="carrusel-loading">
                <div class="loading-spinner"></div>
                Cargando imágenes...
            </div>
        `;
        
        setTimeout(() => {
            let slidesHTML = '';
            
            for (let i = 1; i <= config.totalImages; i++) {
                const imagePath = `${imageFolder}${config.imagePrefix}${i}.jpg`;
                slidesHTML += `
                    <div class="carrusel-slide">
                        <img src="${imagePath}" alt="${config.serviceName} ${i}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDI1MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVWMTI1SDE3NVYxMjVIMTI1VjE3NUg3NVYxNzVIMTI1VjEyNUg3NVY3NUgxMjVaIiBmaWxsPSIjODAwMDAwIi8+Cjx0ZXh0IHg9IjEyNSIgeT0iMjE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4MDAwMDAiPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pgo8L3N2Zz4K'">
                    </div>
                `;
            }
            
            carruselTrack.innerHTML = slidesHTML;
            
            // Precargar imágenes para mejor experiencia
            preloadImages(config);
        }, 500);
    }
    
    // Función para crear indicadores de progreso
    function createProgressDots() {
        const carruselFooter = document.querySelector('.carrusel-footer');
        let existingProgress = carruselFooter.querySelector('.carrusel-progress');
        if (existingProgress) {
            existingProgress.remove();
        }
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'carrusel-progress';
        
        for (let i = 0; i < Math.min(totalImages, 10); i++) { // Máximo 10 puntos
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 0) dot.classList.add('active');
            progressContainer.appendChild(dot);
        }
        
        carruselFooter.appendChild(progressContainer);
        updateProgressDots();
    }
    
    // Función para actualizar los puntos de progreso
    function updateProgressDots() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            // Mostrar puntos alrededor del índice actual
            const startIndex = Math.max(0, currentIndex - 4);
            const dotIndex = startIndex + index;
            if (dotIndex === currentIndex) {
                dot.classList.add('active');
            }
        });
    }
    
    // Función para precargar imágenes
    function preloadImages(config) {
        for (let i = 1; i <= config.totalImages; i++) {
            const img = new Image();
            img.src = `${imageFolder}${config.imagePrefix}${i}.jpg`;
        }
    }
    
    // Función para navegar el carrusel
    function navigateCarrusel(direction) {
        if (!currentCarrusel) return;
        
        currentIndex += direction;
        
        if (currentIndex < 0) {
            currentIndex = totalImages - 1;
        } else if (currentIndex >= totalImages) {
            currentIndex = 0;
        }
        
        updateCarruselPosition();
        updateCounter();
        updateProgressDots();
        
        // Reiniciar auto-avance después de navegación manual
        restartAutoAdvance();
    }
    
    // Actualizar posición del carrusel
    function updateCarruselPosition() {
        const slideWidth = 265; // Ancho de cada slide + gap
        const newPosition = -currentIndex * slideWidth;
        carruselTrack.style.transform = `translateX(${newPosition}px)`;
    }
    
    // Actualizar contador
    function updateCounter() {
        currentImgSpan.textContent = currentIndex + 1;
    }
    
    // Iniciar auto-avance
    function startAutoAdvance() {
        stopAutoAdvance();
        autoAdvanceInterval = setInterval(() => {
            navigateCarrusel(1);
        }, 4000); // Cambiar imagen cada 4 segundos
    }
    
    // Detener auto-avance
    function stopAutoAdvance() {
        if (autoAdvanceInterval) {
            clearInterval(autoAdvanceInterval);
            autoAdvanceInterval = null;
        }
    }
    
    // Reiniciar auto-avance
    function restartAutoAdvance() {
        stopAutoAdvance();
        startAutoAdvance();
    }
    
    // Event listeners para los controles del carrusel
    closeBtn.addEventListener('click', closeCarrusel);
    prevBtn.addEventListener('click', () => navigateCarrusel(-1));
    nextBtn.addEventListener('click', () => navigateCarrusel(1));
    
    // Navegación con teclado
    document.addEventListener('keydown', function(e) {
        if (inlineCarrusel.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateCarrusel(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCarrusel(1);
            } else if (e.key === 'Escape') {
                closeCarrusel();
            }
        }
    });
    
    // Pausar auto-avance cuando el usuario interactúa con el carrusel
    inlineCarrusel.addEventListener('mouseenter', stopAutoAdvance);
    inlineCarrusel.addEventListener('mouseleave', startAutoAdvance);
    
    // Cerrar carrusel cuando el mouse sale del carrusel
    inlineCarrusel.addEventListener('mouseleave', function(e) {
        // Usar un pequeño delay para evitar que se cierre accidentalmente
        mouseLeaveTimeout = setTimeout(() => {
            if (inlineCarrusel.classList.contains('active')) {
                closeCarrusel();
            }
        }, 500); // 500ms de delay antes de cerrar
    });
    
    // Cancelar el cierre si el mouse vuelve al carrusel
    inlineCarrusel.addEventListener('mouseenter', function() {
        if (mouseLeaveTimeout) {
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = null;
        }
    });
    
    // También permitir cerrar el carrusel cuando el mouse sale de la sección de servicios
    serviciosSection.addEventListener('mouseleave', function(e) {
        // Verificar que el mouse realmente salió de la sección completa
        if (!serviciosSection.contains(e.relatedTarget) && 
            inlineCarrusel.classList.contains('active')) {
            mouseLeaveTimeout = setTimeout(() => {
                closeCarrusel();
            }, 300);
        }
    });
    
    // Cancelar el cierre si el mouse vuelve a la sección de servicios
    serviciosSection.addEventListener('mouseenter', function() {
        if (mouseLeaveTimeout) {
            clearTimeout(mouseLeaveTimeout);
            mouseLeaveTimeout = null;
        }
    });
    
    // Inicializar precarga de todas las imágenes
    window.addEventListener('load', function() {
        Object.keys(carruselConfig).forEach(carruselType => {
            const config = carruselConfig[carruselType];
            preloadImages(config);
        });
    });
});