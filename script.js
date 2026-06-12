// ==========================================
// 1. ACTUALIZAR AÑO DE COPYRIGHT
// ==========================================
document.getElementById('year-jemo').textContent = new Date().getFullYear();


// ==========================================
// 2. SMART NAVBAR (SCROLL Y MOUSE)
// ==========================================
const nav = document.getElementById('main-nav');
const indicator = document.querySelector('.nav-indicator');
let lastScrollY = window.scrollY;

// ¡EL PARCHE MÁGICO!
// Apenas carga la página, revisamos si estamos en lo más alto (el Hero).
// Si es así, la mostramos de inmediato.
if (window.scrollY < 50) {
    nav.classList.add('nav-visible');
    if (indicator && window.innerWidth > 900) indicator.style.opacity = '0';
}

// Lógica al Scrollear (Se mantiene igual)
window.addEventListener('scroll', () => {
    if (window.scrollY < 50) {
        nav.classList.add('nav-visible');
        if (indicator && window.innerWidth > 900) indicator.style.opacity = '0';
        lastScrollY = window.scrollY;
        return;
    }

    if (window.innerWidth <= 900) {
        if (window.scrollY > lastScrollY) {
            nav.classList.remove('nav-visible');
        } else {
            nav.classList.add('nav-visible');
        }
    } else {
        nav.classList.remove('nav-visible');
        if (indicator) indicator.style.opacity = '1';
    }
    lastScrollY = window.scrollY;
});

// Lógica del Mouse (SOLO PARA PC)
window.addEventListener('mousemove', function (e) {
    if (window.innerWidth > 900) {
        if (e.clientY < 75) {
            nav.classList.add('nav-visible');
            if (indicator) indicator.style.opacity = '0';
        } else if (window.scrollY >= 50) {
            nav.classList.remove('nav-visible');
            if (indicator) indicator.style.opacity = '1';
        }
    }
});


// ==========================================
// 3. CARRUSEL DE MARCAS E INSPECTOR DE LOGOS
// ==========================================
function desplazarMarcas(direction = 1) {
    const track = document.getElementById('marcas-track');
    if (!track) return;
    const distancia = 220;

    if (direction === 1) {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: distancia, behavior: 'smooth' });
        }
    } else {
        if (track.scrollLeft <= 10) {
            track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: -distancia, behavior: 'smooth' });
        }
    }
}

let marcasInterval = setInterval(() => desplazarMarcas(1), 3000);
const marcasTrack = document.getElementById('marcas-track');

if (marcasTrack) {
    marcasTrack.addEventListener('mouseenter', () => clearInterval(marcasInterval));
    marcasTrack.addEventListener('mouseleave', () => {
        marcasInterval = setInterval(() => desplazarMarcas(1), 3000);
    });
}

function revisarFlechasLogos() {
    const trackLogos = document.getElementById('marcas-track');
    const flechas = document.querySelectorAll('.btn-marcas-arrow');
    if (!trackLogos || flechas.length === 0) return;

    setTimeout(() => {
        if (trackLogos.scrollWidth > trackLogos.clientWidth + 10) {
            flechas.forEach(flecha => flecha.style.display = 'flex');
            trackLogos.style.justifyContent = 'flex-start';
        } else {
            flechas.forEach(flecha => flecha.style.display = 'none');
            trackLogos.style.justifyContent = 'center';
        }
    }, 100);
}
window.addEventListener('load', revisarFlechasLogos);
window.addEventListener('resize', revisarFlechasLogos);

// ==========================================
// ARRASTRE CON MOUSE PARA LOGOS (PC)
// ==========================================
let logosMousePresionado = false;
let logosInicioX;
let logosScrollIzquierdo;

if (marcasTrack) {
    marcasTrack.addEventListener('mousedown', (e) => {
        logosMousePresionado = true;
        marcasTrack.style.cursor = 'grabbing'; // Cambia el cursor a una manito cerrada
        clearInterval(marcasInterval); // Pausamos el movimiento automático
        logosInicioX = e.pageX - marcasTrack.offsetLeft;
        logosScrollIzquierdo = marcasTrack.scrollLeft;
    });

    marcasTrack.addEventListener('mouseleave', () => {
        logosMousePresionado = false;
        marcasTrack.style.cursor = 'default';
    });

    marcasTrack.addEventListener('mouseup', () => {
        logosMousePresionado = false;
        marcasTrack.style.cursor = 'default';
        marcasInterval = setInterval(() => desplazarMarcas(1), 3000); // Reactivamos
    });

    marcasTrack.addEventListener('mousemove', (e) => {
        if (!logosMousePresionado) return;
        e.preventDefault(); // Evita que se seleccione el texto por accidente
        const x = e.pageX - marcasTrack.offsetLeft;
        const recorrido = (x - logosInicioX) * 2; // Multiplicamos por 2 para que sea más rápido
        marcasTrack.scrollLeft = logosScrollIzquierdo - recorrido;
    });
}

// ==========================================
// 4. MÁQUINA DE ESCRIBIR PARA EL HERO
// ==========================================
let temporizadorMaquina;

function escribirTextoRapido(elementoId, texto, velocidad = 25) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return;

    elemento.innerHTML = "";
    clearTimeout(temporizadorMaquina);

    let i = 0;
    function escribir() {
        if (i < texto.length) {
            elemento.innerHTML += texto.charAt(i);
            i++;
            temporizadorMaquina = setTimeout(escribir, velocidad);
        }
    }
    escribir();
}


// ==========================================
// 5. CARGA DINÁMICA DE DATOS (HERO + PROYECTOS)
// ==========================================
let currentHeroIndex = 0;
let totalHeroSlides = 0;
let heroInterval;
let isHeroPaused = false;
let datosHeroGlobal = []; // Guardamos los datos para poder accederlos al cambiar de slide

fetch('site-config.json')
    .then(response => response.json())
    .then(data => {
        
        // --- A. RENDERIZAR EL HERO ---
        const heroContainer = document.getElementById('hero-slider-container');
        const arrowsWrapper = document.getElementById('hero-arrows-wrapper');
        const dotsContainer = document.getElementById('hero-dots-container'); // <- Atrapamos el contenedor de pelotitas
        
        datosHeroGlobal = data.hero;
        totalHeroSlides = datosHeroGlobal.length;

        if (heroContainer && totalHeroSlides > 0) {
            let dotsHtml = ''; // <- Variable para guardar las pelotitas

            datosHeroGlobal.forEach((slide, index) => {
                
                const textoDelBoton = slide.textoBoton || 'Sobre JEMO';
                const enlace = slide.enlaceBoton || '#nosotros';
                const rutaArchivo = slide.archivoFondo || slide.video;

                // 1. DETECTAR SI ES VIDEO O IMAGEN
                const esVideo = rutaArchivo.toLowerCase().endsWith('.mp4') || 
                                rutaArchivo.toLowerCase().endsWith('.webm');

                let htmlFondo = "";

                if (esVideo) {
                    htmlFondo = `
                        <video autoplay loop muted playsinline class="video-background">
                            <source src="${rutaArchivo}" type="video/mp4">
                        </video>`;
                } else {
                    htmlFondo = `
                        <div class="video-background" style="background-image: url('${rutaArchivo}'); background-size: cover; background-position: center; width:100%; height:100%; position:absolute; inset:0; z-index:1;">
                        </div>`;
                }
                
                // 2. MOTOR DE CLIC INTELIGENTE
                let accionClick = "";
                if (enlace.startsWith('#')) {
                    const targetId = enlace.substring(1);
                    accionClick = `const el = document.getElementById('${targetId}'); if(el) el.scrollIntoView({behavior: 'smooth'});`;
                } else {
                    accionClick = `window.open('${enlace}', '_blank');`;
                }

                // 3. ARMAMOS EL SLIDE FINAL
                const slideHtml = `
                    <div class="hero-slide">
                        ${htmlFondo}
                        <div class="hero-content">
                            <h1><span id="titulo-hero-${index}"></span><span class="cursor-maquina">|</span></h1>
                            <p>${slide.subtitulo}</p>
                            <button class="btn-hero" onclick="${accionClick}">${textoDelBoton}</button>
                        </div>
                    </div>
                `;
                heroContainer.innerHTML += slideHtml;

                // <- AQUÍ SE CREA UNA PELOTITA POR CADA SLIDE
                dotsHtml += `<div class="hero-dot ${index === 0 ? 'active' : ''}" onclick="goToHeroSlide(${index})"></div>`;
            });

            // <- INYECTAMOS LAS PELOTITAS EN EL HTML
            if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

            if (totalHeroSlides > 1) {
                if(arrowsWrapper) arrowsWrapper.style.display = 'flex';
                startHeroAutoplay(); 
            }
            
            escribirTextoRapido(`titulo-hero-0`, datosHeroGlobal[0].titulo);
        }

        // --- B. RENDERIZAR LOS PROYECTOS ---
        const proyectosTrack = document.getElementById('proyectos-track-dynamic');
        const proyectosData = data.proyectos;

        if (proyectosTrack && proyectosData && proyectosData.length > 0) {
            proyectosData.forEach(proy => {
                const logoRuta = proy.empresa === 'ptj' ? './assets/img/logo-ptj.webp' : './assets/img/logo-ppe.webp';
                let linkFinal = proy.enlace;
                if (linkFinal === "#" || linkFinal === "") {
                    linkFinal = proy.empresa === 'ptj' ? 'https://ptj.cl' : 'https://ppe.cl';
                }

                const proyHtml = `
                    <a href="${linkFinal}" target="_blank" class="carousel-card">
                        <div class="card-img" style="background-image: url('${proy.imagen}')"></div>
                        <img src="${logoRuta}" alt="${proy.empresa}" class="card-logo-overlay">
                        <div class="card-info">
                            <span class="card-cat">${proy.categoria}</span>
                            <h4>${proy.titulo}</h4>
                        </div>
                    </a>
                `;
                proyectosTrack.innerHTML += proyHtml;
            });
            
            reiniciarAutoPlayProyectos();
            activarBarraProyectos();
        }
    })
    .catch(error => console.error('Error cargando la configuración del sitio:', error));


// ==========================================
// 6. MOTOR DEL HERO BANNER (MOVIMIENTO DE VIDEOS)
// ==========================================
function updateHeroSlider() {
    const container = document.getElementById('hero-slider-container');
    if (!container) return;
    
    // Mueve el contenedor grande hacia la izquierda
    container.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
    
    // Dispara la máquina de escribir para el nuevo slide activo
    escribirTextoRapido(`titulo-hero-${currentHeroIndex}`, datosHeroGlobal[currentHeroIndex].titulo);

    // Actualiza qué pelotita está roja y cuáles transparentes
    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, index) => {
        if (index === currentHeroIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextHeroSlide() {
    currentHeroIndex = (currentHeroIndex + 1) % totalHeroSlides;
    updateHeroSlider();
    resetHeroAutoplay();
}

function prevHeroSlide() {
    currentHeroIndex = (currentHeroIndex - 1 + totalHeroSlides) % totalHeroSlides;
    updateHeroSlider();
    resetHeroAutoplay();
}

// <- AQUÍ ESTÁ LA FUNCIÓN FALTANTE PARA SALTAR AL TOCAR LA PELOTITA
function goToHeroSlide(index) {
    currentHeroIndex = index;
    updateHeroSlider();
    resetHeroAutoplay(); 
}

function startHeroAutoplay() {
    clearInterval(heroInterval);

    if (isHeroPaused) return;

    // Cambia de banner cada 10 segundos (10000ms)
    heroInterval = setInterval(nextHeroSlide, 10000);
}

function resetHeroAutoplay() {
    startHeroAutoplay();
}

function toggleHeroState() {
    const iconoPausa = document.getElementById('icono-hero-playpause');
    const heroVideos = document.querySelectorAll('.hero-slide .video-background');

    if (!iconoPausa) return;

    isHeroPaused = !isHeroPaused;

    iconoPausa.classList.remove('giro-animado');
    void iconoPausa.offsetWidth;
    iconoPausa.classList.add('giro-animado');

    setTimeout(() => {
        if (isHeroPaused) {
            iconoPausa.innerText = 'play_arrow';
            heroVideos.forEach(video => video.pause());
            clearInterval(heroInterval);
        } else {
            iconoPausa.innerText = 'pause';
            heroVideos.forEach(video => {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            });
            startHeroAutoplay();
        }
    }, 250);
}

// ==========================================
// SWIPE (ARRASTRE) PARA EL HERO BANNER
// ==========================================
let heroStartX = 0;
let heroEndX = 0;
const heroSection = document.getElementById('inicio');

// 1. Eventos para Celular (Touch)
heroSection.addEventListener('touchstart', e => {
    heroStartX = e.changedTouches[0].screenX;
}, { passive: true }); // El passive:true le dice al navegador que NO bloquee el scroll vertical

heroSection.addEventListener('touchend', e => {
    heroEndX = e.changedTouches[0].screenX;
    procesarSwipeHero();
}, { passive: true });

// 2. Eventos para Mouse (PC)
let mousePresionadoHero = false;
heroSection.addEventListener('mousedown', e => {
    heroStartX = e.screenX;
    mousePresionadoHero = true;
});
heroSection.addEventListener('mouseup', e => {
    if (!mousePresionadoHero) return;
    heroEndX = e.screenX;
    mousePresionadoHero = false;
    procesarSwipeHero();
});
heroSection.addEventListener('mouseleave', () => mousePresionadoHero = false);

// 3. Evaluamos si el movimiento fue suficiente para cambiar de slide
function procesarSwipeHero() {
    const umbral = 50; // Mínimo de píxeles que debe arrastrar para que cuente
    if (heroEndX < heroStartX - umbral) {
        nextHeroSlide(); // Deslizó hacia la izquierda
    }
    if (heroEndX > heroStartX + umbral) {
        prevHeroSlide(); // Deslizó hacia la derecha
    }
}

// ==========================================
// 7. MOTOR INTELIGENTE DE PROYECTOS Y BARRITA
// ==========================================
let autoPlayProyectos;

function desplazarProyectos(direction = 1) {
    const projectTrack = document.querySelector('.carousel-track-compact');
    const tarjeta = document.querySelector('.carousel-card');
    
    // Si la pista o la primera tarjeta aún no se cargan, aborta.
    if (!projectTrack || !tarjeta) return;
    
    const distancia = tarjeta.offsetWidth + 20; 
    
    if (direction === 1) {
        if (projectTrack.scrollLeft + projectTrack.clientWidth >= projectTrack.scrollWidth - 10) {
            projectTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            projectTrack.scrollBy({ left: distancia, behavior: 'smooth' });
        }
    } else {
        if (projectTrack.scrollLeft <= 10) {
            projectTrack.scrollTo({ left: projectTrack.scrollWidth, behavior: 'smooth' });
        } else {
            projectTrack.scrollBy({ left: -distancia, behavior: 'smooth' });
        }
    }

    reiniciarAutoPlayProyectos();
}

function nextSlide() { desplazarProyectos(1); }
function prevSlide() { desplazarProyectos(-1); }

function reiniciarAutoPlayProyectos() {
    clearInterval(autoPlayProyectos); 
    autoPlayProyectos = setInterval(() => desplazarProyectos(1), 5000); 
}

function activarBarraProyectos() {
    const projectTrack = document.querySelector('.carousel-track-compact');
    const pagThumb = document.getElementById('pag-thumb');
    
    if (projectTrack && pagThumb) {
        projectTrack.addEventListener('scroll', () => {
            const maxScrollLeft = projectTrack.scrollWidth - projectTrack.clientWidth;
            if (maxScrollLeft > 0) {
                const scrollPercent = projectTrack.scrollLeft / maxScrollLeft;
                // La barra del thumb medirá el 40% del track (100 - 40 = 60 de espacio movible)
                pagThumb.style.left = `${scrollPercent * 60}%`; 
            }
        });
    }
}


// ==========================================
// 8. CONTADORES NUMÉRICOS
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            const counters = document.querySelectorAll('.counter');
            const duration = 1500;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                let startTime = null;
                const easeOut = (t) => 1 - Math.pow(1 - t, 3);
                const animate = (currentTime) => {
                    if (!startTime) startTime = currentTime;
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    counter.innerText = Math.floor(easeOut(progress) * target);
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        counter.innerText = target === 85 ? target + '+' : target;
                    }
                };
                requestAnimationFrame(animate);
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const statsSection = document.querySelector('.stats-section');
if(statsSection) observer.observe(statsSection);


// ==========================================
// 9. PESTAÑA EXPANDIBLE (MEJORADA PARA EVITAR CIERRES ACCIDENTALES)
// ==========================================
function toggleTextoNosotros(origen) {
    const texto = document.getElementById('texto-nosotros');
    const icono = document.getElementById('icono-leer-mas');
    
    // Si la ventana es mayor a 900px (PC), no hacemos nada
    if (window.innerWidth > 900) return;

    if (texto.classList.contains('texto-colapsado')) {
        // ABRIR: No importa si tocaste el texto o el botón, siempre se abrirá
        texto.classList.remove('texto-colapsado');
        texto.classList.add('texto-expandido');
        icono.classList.add('flecha-arriba');
        
        // Al abrir, quitamos el cursor de la manito para que parezca texto normal
        texto.style.cursor = 'default';
    } else {
        // CERRAR: Aquí está la magia. Si el clic vino del texto, abortamos y no cerramos nada.
        if (origen === 'texto') return; 

        // Si el clic vino del botón, colapsamos normalmente
        texto.classList.remove('texto-expandido');
        texto.classList.add('texto-colapsado');
        icono.classList.remove('flecha-arriba');
        texto.style.cursor = 'pointer'; // Volvemos a poner la manito
        
        // Alineamos la pantalla suavemente hacia arriba
        setTimeout(() => {
            document.getElementById('nosotros').scrollIntoView({behavior: 'smooth', block: 'start'});
        }, 500); 
    }
}

// ==========================================
// 10. MOTOR CARRUSEL DE ATRIBUTOS NATIVO (SOLO MÓVIL)
// ==========================================
let currentFeatureIndex = 0;
const featuresTrack = document.getElementById('features-track');
const featuresDotsContainer = document.getElementById('features-dots');
let autoPlayFeatures; // Variable para controlar el reloj

// 1. FUNCIÓN PARA DIBUJAR LAS PELOTITAS
function updateFeaturesDots() {
    if (!featuresDotsContainer || !featuresTrack) return;

    const cards = featuresTrack.querySelectorAll('.feature-card');
    const totalCards = cards.length;
    if (!totalCards) return;

    // Si las pelotitas no se han creado, las creamos dinámicamente
    if (featuresDotsContainer.children.length !== totalCards) {
        featuresDotsContainer.innerHTML = '';
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('button');
            dot.className = 'f-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
            dot.addEventListener('click', () => goToFeature(i));
            featuresDotsContainer.appendChild(dot);
        }
    }

    // Ilumina la pelotita correspondiente al índice actual
    Array.from(featuresDotsContainer.children).forEach((dot, index) => {
        dot.classList.toggle('active', index === currentFeatureIndex);
    });
}

// 2. SENSOR DE DEDO: Detecta el arrastre manual y actualiza los puntos
if (featuresTrack) {
    featuresTrack.addEventListener('scroll', () => {
        if (window.innerWidth > 900) return;
        
        const scrollLeft = featuresTrack.scrollLeft;
        const cardWidth = featuresTrack.clientWidth;
        if (cardWidth === 0) return;

        // Calcula qué tarjeta está más cerca del centro de la pantalla
        const activeIndex = Math.round(scrollLeft / cardWidth);
        
        // Si el índice cambió con el dedo, actualizamos el contador global
        if (currentFeatureIndex !== activeIndex) {
            currentFeatureIndex = activeIndex;
            updateFeaturesDots();
        }
    });

    // Si el usuario pone el dedo en la pantalla, pausamos el reloj para que no salte en su cara
    featuresTrack.addEventListener('touchstart', () => clearInterval(autoPlayFeatures), { passive: true });
    // Cuando suelta la pantalla, reactivamos los 4 segundos limpios
    featuresTrack.addEventListener('touchend', resetFeaturesAutoplay, { passive: true });
}

// 3. IR A UNA TARJETA ESPECÍFICA (Al hacer clic en una pelotita)
function goToFeature(index) {
    if (!featuresTrack) return;

    const cardWidth = featuresTrack.clientWidth;
    featuresTrack.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
    });
    
    currentFeatureIndex = index;
    updateFeaturesDots();
    resetFeaturesAutoplay(); // Reinicia los 4 segundos
}

// 4. CLIC EN FLECHAS LATERALES (Con bucle infinito perfecto)
function scrollFeatures(direction) {
    if (!featuresTrack) return; // Corregido el nombre de la variable fantasma
    
    const cardWidth = featuresTrack.clientWidth;
    const maxScroll = featuresTrack.scrollWidth - featuresTrack.clientWidth;
    const currentScroll = featuresTrack.scrollLeft;

    let newScroll;
    
    if (direction > 0 && currentScroll >= (maxScroll - 10)) {
        // Bucle: Si va a la DERECHA y está al FINAL, vuelve al INICIO
        newScroll = 0;
    } else if (direction < 0 && currentScroll <= 10) {
        // Bucle: Si va a la IZQUIERDA y está al INICIO, va al FINAL
        newScroll = maxScroll;
    } else {
        // Movimiento normal
        newScroll = currentScroll + (direction * cardWidth);
    }

    featuresTrack.scrollTo({ left: newScroll, behavior: 'smooth' });
    resetFeaturesAutoplay(); // Reinicia los 4 segundos
}

// 5. MOVIMIENTO AUTOMÁTICO REFACTORIZADO
function moveFeaturesCarousel() {
    if (!featuresTrack || window.innerWidth > 900) return;

    const totalCards = featuresTrack.querySelectorAll('.feature-card').length;
    if (!totalCards) return;

    // Avanza uno en uno, si llega al final vuelve a 0
    currentFeatureIndex = (currentFeatureIndex + 1) % totalCards;
    
    const cardWidth = featuresTrack.clientWidth;
    featuresTrack.scrollTo({
        left: currentFeatureIndex * cardWidth,
        behavior: 'smooth'
    });
    updateFeaturesDots();
}

// 6. CONTROLADORES DEL RELOJ (START / RESET)
function startFeaturesAutoplay() {
    clearInterval(autoPlayFeatures);
    autoPlayFeatures = setInterval(moveFeaturesCarousel, 4000);
}

function resetFeaturesAutoplay() {
    clearInterval(autoPlayFeatures);
    if (window.innerWidth <= 900) {
        startFeaturesAutoplay();
    }
}

// ARRANCAR EL MOTOR INICIAL
if (featuresTrack) {
    updateFeaturesDots();
    startFeaturesAutoplay();
}

// CONTROLADOR DE CAMBIO DE TAMAÑO DE PANTALLA
window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && featuresTrack) {
        featuresTrack.scrollLeft = 0;
        currentFeatureIndex = 0;
        clearInterval(autoPlayFeatures);
        updateFeaturesDots();
    } else if (window.innerWidth <= 900 && featuresTrack) {
        updateFeaturesDots();
        startFeaturesAutoplay();
    }
});
