/* ==========================================================================
   PARAÍSO LAGUNA — interacciones
   Parallax, aparición escalonada, contadores, fase lunar real,
   filmstrip + lightbox, testimonios, FAQ y reserva por WhatsApp.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const WHATSAPP_NUMBER = '529541611334';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header: glass al hacer scroll ---------- */
    const header = document.getElementById('site-header');
    const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });

    /* ---------- Menú móvil ---------- */
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    navToggle.addEventListener('click', () => {
        const open = mainNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* ---------- Parallax del hero (rAF, solo si no hay reduced-motion) ---------- */
    const heroImg = document.getElementById('hero-img');
    if (heroImg && !reducedMotion) {
        let ticking = false;
        const parallax = () => {
            const y = window.scrollY;
            if (y < window.innerHeight * 1.2) {
                heroImg.style.transform = `translateY(${y * 0.28}px)`;
            }
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
        }, { passive: true });
    }

    /* ---------- La laguna responde al tacto (canvas de partículas en el hero) ---------- */
    const bioCanvas = document.getElementById('bio-canvas');
    if (bioCanvas && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const ctx = bioCanvas.getContext('2d');
        const hero = bioCanvas.closest('.hero');
        let particles = [];
        let running = false;

        const resize = () => {
            bioCanvas.width = hero.offsetWidth;
            bioCanvas.height = hero.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const tick = () => {
            ctx.clearRect(0, 0, bioCanvas.width, bioCanvas.height);
            particles = particles.filter(p => p.life > 0);
            for (const p of particles) {
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.008;              // deriva lenta, como plancton en el agua
                p.life -= p.decay;
                const alpha = Math.max(p.life, 0) * 0.55;
                const r = p.r * (0.5 + p.life * 0.5);
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
                g.addColorStop(0, `rgba(79, 227, 255, ${alpha})`);
                g.addColorStop(1, 'rgba(79, 227, 255, 0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            if (particles.length) { requestAnimationFrame(tick); } else { running = false; }
        };

        hero.addEventListener('pointermove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: x + (Math.random() - 0.5) * 24,
                    y: y + (Math.random() - 0.5) * 24,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    r: 1 + Math.random() * 2.5,
                    life: 1,
                    decay: 0.012 + Math.random() * 0.02
                });
            }
            if (particles.length > 220) particles.splice(0, particles.length - 220);
            if (!running) { running = true; requestAnimationFrame(tick); }
        }, { passive: true });
    }

    /* ---------- Aparición escalonada ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        // los elementos que entran juntos comparten stagger incremental
        let batch = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty('--stagger', `${batch * 90}ms`);
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
            batch++;
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    /* ---------- Contadores (se disparan al verse) ---------- */
    const easeOut = t => 1 - Math.pow(1 - t, 4);

    const countUp = (el) => {
        const target = parseFloat(el.dataset.count);
        const dur = 1300;
        const t0 = performance.now();
        const step = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            el.textContent = Math.round(target * easeOut(p));
            if (p < 1) requestAnimationFrame(step);
        };
        if (reducedMotion) { el.textContent = target; return; }
        requestAnimationFrame(step);
    };

    const numObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => numObserver.observe(el));

    /* ---------- Fase lunar real (ciclo sinódico desde 2000-01-06 18:14 UTC) ---------- */
    const SYNODIC = 29.53058867;
    const age = ((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % SYNODIC;
    const phases = [
        [1.85, 'Luna nueva'], [5.54, 'Luna creciente'], [9.23, 'Cuarto creciente'],
        [12.92, 'Gibosa creciente'], [16.61, 'Luna llena'], [20.30, 'Gibosa menguante'],
        [23.99, 'Cuarto menguante'], [27.68, 'Luna menguante'], [SYNODIC, 'Luna nueva']
    ];
    const moonName = phases.find(([limit]) => age <= limit)[1];
    const moonEl = document.getElementById('moon-phase');
    const heroMoonEl = document.getElementById('hero-moon');
    if (moonEl) moonEl.textContent = moonName;
    if (heroMoonEl) heroMoonEl.textContent = moonName.toLowerCase();

    // Potencial de brillo: a menor iluminación lunar, más se ve la bioluminiscencia.
    // Fracción iluminada = (1 - cos(fase)) / 2 — dato astronómico, no inventado.
    const illum = (1 - Math.cos((age / SYNODIC) * 2 * Math.PI)) / 2;
    const glowEl = document.getElementById('glow-potential');
    if (glowEl) {
        const level = illum < 0.35 ? ['Alto', 'ok'] : illum < 0.7 ? ['Medio', ''] : ['Bajo — luna brillante', ''];
        glowEl.textContent = level[0];
        if (level[1]) glowEl.classList.add(level[1]);
    }

    /* ---------- Filmstrip: navegación ---------- */
    const strip = document.getElementById('filmstrip');
    const stepStrip = (dir) => {
        const frame = strip.querySelector('.frame');
        const dx = frame ? frame.getBoundingClientRect().width + 16 : 400;
        strip.scrollBy({ left: dir * dx, behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    document.getElementById('gal-prev').addEventListener('click', () => stepStrip(-1));
    document.getElementById('gal-next').addEventListener('click', () => stepStrip(1));

    /* ---------- Lightbox ---------- */
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCaption = document.getElementById('lightbox-caption');
    let currentIndex = 0;

    const showImage = (index) => {
        currentIndex = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentIndex];
        const img = item.querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = `${item.dataset.caption} · ${currentIndex + 1} / ${galleryItems.length}`;
    };
    const openLightbox = (index) => {
        showImage(index);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        document.getElementById('lightbox-close').focus();
    };
    const closeLightbox = () => {
        lightbox.hidden = true;
        document.body.style.overflow = '';
        galleryItems[currentIndex].focus();
    };

    galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
    document.getElementById('lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    /* ---------- Testimonios: rotador manual ---------- */
    const slides = Array.from(document.querySelectorAll('.testi-slide'));
    const dotsWrap = document.getElementById('testi-dots');
    let testiIndex = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => { goTesti(i); });
        dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const goTesti = (i) => {
        testiIndex = (i + slides.length) % slides.length;
        slides.forEach((s, j) => s.classList.toggle('is-active', j === testiIndex));
        dots.forEach((d, j) => d.setAttribute('aria-selected', String(j === testiIndex)));
    };

    /* ---------- FAQ ---------- */
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            const answer = btn.nextElementSibling;
            answer.style.maxHeight = expanded ? '0' : answer.scrollHeight + 'px';
        });
    });

    /* ---------- Reserva → WhatsApp ---------- */
    const bookingForm = document.getElementById('booking-form');
    const dateInput = document.getElementById('f-date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('f-name').value.trim();
        const tour = document.getElementById('f-tour').value;
        const guests = document.getElementById('f-guests').value;
        const date = document.getElementById('f-date').value;
        const notes = document.getElementById('f-notes').value.trim();

        const dateStr = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        let message = `Hola Paraíso Laguna, quiero reservar:\n\n` +
            `Nombre: ${name}\n` +
            `Experiencia: ${tour}\n` +
            `Personas: ${guests}\n` +
            `Fecha: ${dateStr}`;
        if (notes) message += `\nNotas: ${notes}`;
        message += `\n\n¿Me confirman disponibilidad y precio? Gracias.`;

        if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', { event_category: 'booking', event_label: tour });
        }
        window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');
    });
});
