/* ==========================================================================
   INTERACTIVE LOGIC & WHATSAPP CONVERSION FLOW - PARAÍSO LAGUNA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once animated, we don't need to observe it anymore
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // 1.5 FASE LUNAR REAL (ciclo sinódico desde 2000-01-06 18:14 UTC — astronomía, no inventado)
    const SYNODIC = 29.53058867;
    const moonAge = ((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % SYNODIC;
    const MOON_PHASES = [
        [1.85, 'Luna nueva'], [5.54, 'Luna creciente'], [9.23, 'Cuarto creciente'],
        [12.92, 'Gibosa creciente'], [16.61, 'Luna llena'], [20.30, 'Gibosa menguante'],
        [23.99, 'Cuarto menguante'], [27.68, 'Luna menguante'], [SYNODIC, 'Luna nueva']
    ];
    const moonName = MOON_PHASES.find(([limit]) => moonAge <= limit)[1];
    const moonEl = document.getElementById('moon-phase');
    if (moonEl) moonEl.textContent = moonName;

    // Potencial de brillo: a menor iluminación lunar, más se aprecia la bioluminiscencia.
    // Fracción iluminada = (1 - cos(fase)) / 2
    const moonIllum = (1 - Math.cos((moonAge / SYNODIC) * 2 * Math.PI)) / 2;
    const glowEl = document.getElementById('glow-potential');
    if (glowEl) {
        if (moonIllum < 0.35) {
            glowEl.textContent = 'Alto';
            glowEl.style.color = 'var(--accent-green, #00A86B)';
        } else if (moonIllum < 0.7) {
            glowEl.textContent = 'Medio';
        } else {
            glowEl.textContent = 'Bajo — luna brillante';
            glowEl.style.color = 'var(--accent-orange, #FF7A00)';
        }
    }

    // 2. FAQs ACCORDION INTERACTIVITY
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other accordions first (for a cleaner accordion feel)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 3. WHATSAPP CONVERSATIONAL FLOW (Booking Request Generator)
    const bookingForm = document.getElementById('whatsapp-booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent standard submission
            
            // Collect Form Values
            const name = document.getElementById('booking-name').value.trim();
            const experience = document.getElementById('booking-experience').value;
            const guests = document.getElementById('booking-guests').value;
            const date = document.getElementById('booking-date').value;
            const notes = document.getElementById('booking-notes').value.trim();
            
            // Validate essential fields
            if (!experience || !guests || !date) {
                alert('Por favor completa los campos principales (Experiencia, Personas y Fecha)');
                return;
            }
            
            // Formatear Fecha para el mensaje
            let formattedDate = 'pronto';
            if (date) {
                const dateObj = new Date(date + 'T00:00:00');
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                formattedDate = dateObj.toLocaleDateString('es-MX', options);
            }
            
            // Tu número de WhatsApp de negocios en formato internacional
            const whatsappNumber = '529541611334';
            
            // Escribir un mensaje sumamente persuasivo, ordenado y con emojis para cerrar tratos
            let message = `¡Hola, Paraíso Laguna! 🌴✨\n\n`;
            
            if (name) {
                message += `Mi nombre es *${name}* y me he enamorado de sus tours en la web. 😍\n\n`;
            } else {
                message += `Me he enamorado de sus tours en la web y me encantaría vivir la experiencia. 😍\n\n`;
            }
            
            message += `Quiero solicitar una *cotización y reservar* una fecha:\n`;
            message += `🔹 *Aventura:* ${experience}\n`;
            message += `🔹 *Integrantes:* ${guests} ${guests == 1 ? 'persona' : 'personas'}\n`;
            message += `🔹 *Fecha deseada:* ${formattedDate}\n`;
            
            if (notes) {
                message += `🔹 *Detalles adicionales:* "${notes}"\n`;
            }
            
            message += `\n¿Me podrían dar disponibilidad, confirmar precios y detalles para amarrar la reserva? ¡Muchas gracias! 🛶🐊🌌`;
            
            // Codificar el mensaje para URL
            const encodedMessage = encodeURIComponent(message);
            
            // Registrar conversión en Google Analytics si está definido
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Engagement',
                    'event_label': `Formulario Contacto: ${experience}`,
                    'value': 1
                });
            }
            
            // Crear el enlace directo a WhatsApp (Web o App)
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
            
            // Abrir en una pestaña nueva
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Helper function to smooth scroll to specific sections (from experiences links)
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-select experience in form if scrolled from experiences section
        if (sectionId === 'contacto') {
            const expSelect = document.getElementById('booking-experience');
            if (expSelect) {
                // If we want to set it, we could pass an argument, but keeping it simple for now
            }
        }
    }
}

// Interactive helper: Auto-select experience when clicking "Cotizar Ahora" from tour card
function selectTourAndScroll(tourName) {
    const expSelect = document.getElementById('booking-experience');
    if (expSelect) {
        expSelect.value = tourName;
    }
    scrollToSection('contacto');
}

// ==========================================================================
// 4. DATA DATABASE & DYNAMIC MODAL LOGIC (11 TOURS CATALOG)
// ==========================================================================
const TOURS_DATA = {
    biolum: {
        title: "Bioluminiscencia Mágica",
        tag: "Experiencia Nocturna",
        desc: "Experiencia nocturna en la Laguna de Manialtepec, a solo 14 km de Puerto Escondido. Se visita la comunidad del Aguaje del Zapote, donde se aborda una embarcación para observar y nadar en aguas bioluminiscentes. El fenómeno se produce gracias a microorganismos llamados dinoflagelados (Pyrodinium bahamense) que emiten luz azul-verdosa al ser perturbados.",
        duration: "3 Horas",
        time: "7:00 PM (Nocturno)",
        includes: "✅ Transporte de ida y vuelta desde Puerto Escondido\n✅ Guía certificado\n✅ Chaleco salvavidas\n✅ Tiempo libre para nadar en la laguna",
        bring: "Traje de baño, toalla, ropa cómoda que se pueda mojar. MUY IMPORTANTE: no usar repelentes ni protectores químicos para proteger el ecosistema lagunar.",
        whatsappName: "Tour Bioluminiscencia"
    },
    tortugas: {
        title: "Integración de Tortugas",
        tag: "Ecológico & Conciencia",
        desc: "Conocerás el campamento tortuguero La Escobilla o Vive Mar, donde recibirás información sobre el cuidado e importancia de las tortugas marinas. A cada participante se le proporcionará una tortuga bebé para ayudarla a integrarse al océano. Las tortugas golfina (Lepidochelys olivacea) regresan cada año a las mismas playas de Oaxaca para desovar.",
        duration: "2 Horas",
        time: "5:00 PM (Atardecer)",
        includes: "✅ Botella de agua\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Ropa ligera, cámara, lentes de sol y gorra. Respeta todas las indicaciones para el manejo responsable de las tortugas.",
        whatsappName: "Integración de Tortugas"
    },
    delfines: {
        title: "Avistamiento de Delfines y Ballenas",
        tag: "Aventura Marina",
        desc: "Navega en las aguas del Océano Pacífico y descubre nuestra fauna marina rodeado de hermosos delfines, mantarrayas, tortugas y ballenas. Navegaremos aproximadamente dos horas y media para observar el espectáculo de hermosos ejemplares marinos, también disfrutarás de un cálido amanecer y conocerás las diferentes playas que nos rodean.",
        duration: "4 Horas",
        time: "7:00 AM (Salida diaria)",
        includes: "✅ Chaleco salvavidas\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Bloqueador biodegradable, gorra, lentes de sol y ropa ligera que se pueda mojar.",
        whatsappName: "Avistamiento de Delfines"
    },
    cabalgata: {
        title: "Atardecer a Caballo",
        tag: "Experiencia Única",
        desc: "Conocerás y disfrutarás de hermosos paisajes cabalgando en la naturaleza. Observarás la flora y fauna del lugar, apreciarás uno de los espectáculos jamás vistos: los caballos nadadores en el río de Manialtepec. Disfrutarás de una bebida refrescante en la palapa Mangle Rojo y un hermoso atardecer en tu caballo.",
        duration: "3 Horas",
        time: "4:00 PM (Atardecer)",
        includes: "✅ Caballo propio\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Pantalón largo cómodo para montar, tenis cerrados, repelente biodegradable y cámara.",
        whatsappName: "Atardecer a Caballo"
    },
    kayak: {
        title: "Paseo en Kayak",
        tag: "Aventura de Día",
        desc: "Recorre la laguna en kayak acompañado por un guía que te mostrará canales, manglares y puntos de observación de aves. Es una actividad ideal para quienes disfrutan remar, estar en contacto directo con el agua y explorar la naturaleza a un ritmo relajado.",
        duration: "1:30 Hora",
        time: "8:00 AM / 4:30 PM",
        includes: "✅ Chaleco salvavidas\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Ropa que se pueda mojar, calzado cerrado para el agua, gorra, protector solar biodegradable y agua.",
        whatsappName: "Paseo en Kayak"
    },
    chacahua: {
        title: "Tour de Chacahua",
        tag: "Tour Completo",
        desc: "Esta actividad toma 1 hora en transporte hasta el pueblo de Zapotal donde se encuentra la primera laguna. Ahí abordaremos una embarcación para un recorrido de aproximadamente 2 horas por toda la laguna, donde conocerás los Laberintos de Manglares, especies de aves migratorias, iguanas y más. Llegaremos a la laguna de Chacahua donde podrás nadar, descansar o disfrutar de mariscos.",
        duration: "3 Horas",
        time: "12:30 PM (Medio día)",
        includes: "✅ Chaleco salvavidas\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Traje de baño, toalla, ropa de cambio cómoda, lentes de sol y efectivo para consumo de alimentos locales.",
        whatsappName: "Tour Chacahua"
    },
    cascadas: {
        title: "Cascadas Mágicas de Copalita",
        tag: "Naturaleza & Selva",
        desc: "Disfrutarás de un viaje de tres horas y media al sur de Puerto Escondido, con hermosas vistas de las montañas. Ubicadas en la comunidad de San Juan la Chao, las Cascadas Mágicas de Copalita son un lugar mágico e icónico, con aguas cristalinas que fluyen a través de las rocas y una vegetación exuberante.",
        duration: "7 Horas",
        time: "9:00 AM (Diurno)",
        includes: "✅ Entrada a las cascadas\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Traje de baño, toalla, calzado antideslizante para caminar en agua, ropa de cambio ligera y dinero para comida.",
        whatsappName: "Cascadas Mágicas"
    },
    tirolesa: {
        title: "Tirolesa Extrema",
        tag: "Adrenalina Pura",
        desc: "¿Buscas emociones fuertes? Vive un tour lleno de emociones en San Juan Lachao, ubicado a 90 minutos al norte de Puerto Escondido. Desde un pintoresco pueblo chatino, te adentrarás en la naturaleza en una caminata fascinante que culmina en una refrescante cascada. Sumérgete en sus aguas cristalinas antes de deslizarte por cinco tirolesas.",
        duration: "7 Horas",
        time: "9:00 AM (Diurno)",
        includes: "✅ Botella de agua\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Ropa deportiva cómoda, tenis cerrados obligatorios, gorra o cabello recogido y lentes de sol.",
        whatsappName: "Tirolesa"
    },
    termales: {
        title: "Aguas Termales de Atotonilco",
        tag: "Bienestar & Aventura",
        desc: "Adéntrate en la vegetación para descubrir las pozas termales de Atotonilco, un rincón natural a las afueras de Puerto Escondido. Estas aguas de origen mineral se caracterizan por sus propiedades relajantes, ideales para descansar el cuerpo y desconectar del estrés diario. Es como un spa al aire libre, rodeado de sonidos de la naturaleza.",
        duration: "7 Horas",
        time: "9:00 AM (Diurno)",
        includes: "✅ Paseo en caballo\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Traje de baño, toalla, calzado cerrado cómodo para montar y mojar, repelente biodegradable y gorra.",
        whatsappName: "Aguas Termales"
    },
    mazunte: {
        title: "Tour Mazunte Costa Oaxaqueña",
        tag: "Costa & Cultura",
        desc: "Descubre Mazunte, Zipolite, Ventanilla y Punta Cometa en un día diseñado para conectarte con la naturaleza. Salimos desde Puerto Escondido hacia la costa sureste, a aproximadamente una hora de camino, para recorrer playas aún poco urbanizadas y pequeños pueblos costeros con vibra relajada. Cierra el día viendo cómo el sol se esconde tras los acantilados de Punta Cometa.",
        duration: "9 Horas",
        time: "9:00 AM (Día Completo)",
        includes: "✅ Visita a Mazunte, Zipolite, Ventanilla y Punta Cometa\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Calzado cómodo para caminar, lentes de sol, gorra, protector solar y dinero en efectivo para suvenires y comida.",
        whatsappName: "Tour de Mazunte"
    },
    "laguna-sunset": {
        title: "Atardecer en la Laguna de Manialtepec",
        tag: "Naturaleza & Paz",
        desc: "Disfruta de un atardecer inolvidable en la laguna Manialtepec con un recorrido de aproximadamente 5 horas. Recorremos 13 km de manglar, donde podrás observar distintas especies de aves en su hábitat natural. Llegamos a Playa Puerto Suelo, una playa semivirgen ideal para relajarse. Encendemos una fogata, asamos bombones y concluimos con bioluminiscencia.",
        duration: "5 Horas",
        time: "3:00 PM (Vespertino)",
        includes: "✅ Chaleco Salvavidas\n✅ Seguro de viajero\n✅ Guía certificado\n✅ Transporte viaje redondo",
        bring: "Cámara o celular, ropa cómoda ligera, lentes de sol, repelente biodegradable y sombrero.",
        whatsappName: "Atardecer en la Laguna"
    }
};

let activeTourKey = null;

// Global function to open the modal
function openTourModal(tourKey) {
    const tour = TOURS_DATA[tourKey];
    if (!tour) return;
    
    activeTourKey = tourKey;
    
    // Populate modal values
    document.getElementById('modal-tour-tag').textContent = tour.tag;
    
    // Set proper tag class colors
    const tagEl = document.getElementById('modal-tour-tag');
    tagEl.className = 'exp-tag'; // reset
    if (tour.tag.includes('Nocturna') || tour.tag.includes('Única')) {
        tagEl.classList.add('sunset');
    } else if (tour.tag.includes('Marina') || tour.tag.includes('Día')) {
        tagEl.classList.add('green');
    }
    
    document.getElementById('modal-tour-title').textContent = tour.title;
    document.getElementById('modal-tour-desc').textContent = tour.desc;
    document.getElementById('modal-tour-duration').textContent = tour.duration;
    document.getElementById('modal-tour-time').textContent = tour.time;
    document.getElementById('modal-tour-includes').textContent = tour.includes;
    document.getElementById('modal-tour-bring').textContent = tour.bring;
    
    // Open modal with class
    const modal = document.getElementById('tour-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

// Global function to close the modal
function closeTourModal() {
    const modal = document.getElementById('tour-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Restore scrolling
    document.body.style.overflow = 'auto';
    activeTourKey = null;
}

// Event Listeners for Modal Closing
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('tour-modal');
    const closeBtn = document.getElementById('modal-close');
    const ctaBtn = document.getElementById('modal-cta-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTourModal);
    }
    
    // Close when clicking outside content box
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTourModal();
            }
        });
    }
    
    // WhatsApp direct button handler inside modal
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            if (!activeTourKey) return;
            const tour = TOURS_DATA[activeTourKey];
            
            // Format WhatsApp Direct Quote Request
            const whatsappNumber = '529541611334';
            let message = `¡Hola, Paraíso Laguna! 🌴✨\n\n`;
            message += `Quiero solicitar información y *reservar* la siguiente aventura:\n`;
            message += `🔹 *Aventura:* ${tour.title}\n`;
            message += `🔹 *Duración:* ${tour.duration}\n`;
            message += `🔹 *Horario:* ${tour.time}\n\n`;
            message += `¿Me podrían dar disponibilidad y el precio especial para nuestro grupo? ¡Muchas gracias! 🛶🐊🌌`;
            
            const encodedMessage = encodeURIComponent(message);
            
            // Registrar conversión en Google Analytics si está definido
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Engagement',
                    'event_label': `Modal Cotizar: ${tour.title}`,
                    'value': 1
                });
            }
            
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Expose openTourModal globally for inline onclick handlers
window.openTourModal = openTourModal;
window.closeTourModal = closeTourModal;

// ==========================================================================
// 5. INTERACTIVE QUIZ & WHATSAPP CHAT ASSISTANT LOGIC
// ==========================================================================


// WhatsApp Floating Widget Functions
function toggleWaChat() {
    const chatBox = document.getElementById('wa-chat-box');
    if (chatBox) {
        chatBox.classList.toggle('active');
    }
}

function waQuickChat(experienceName) {
    selectTourAndScroll(experienceName);
    toggleWaChat(); // Close chat box
}

// Expose functions globally for inline onclick attributes
window.toggleWaChat = toggleWaChat;
window.waQuickChat = waQuickChat;

// ==========================================================================
// 6. DYNAMIC PREMIUM MASONRY GALLERY & LIGHTBOX SYSTEM (41 WEBP PHOTOS)
// ==========================================================================
// Solo fotografías reales capturadas en los tours — con lugar y hora, como bitácora.
const GALLERY_PHOTOS = [
    // Bioluminiscencia (reales, de guías y viajeros)
    { src: "tours/bioluminiscencia/mano-brillo-real-1.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "El agua responde con luz ✨" },
    { src: "tours/bioluminiscencia/estela-lancha-brillo.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "La estela de la lancha, encendida 🌌" },
    { src: "tours/bioluminiscencia/grupo-letrero-bioluminiscencia.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Antes de zarpar a la laguna 🌙" },
    { src: "tours/bioluminiscencia/mano-brillo-real-2.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Nadie sale igual de esta noche ✨" },
    // Tortugas — liberación real
    { src: "tours/tortugas/crias-caminando-amanecer.webp", tag: "turtles", tagTitle: "Ecológico", title: "Rumbo al mar, solas 🐢" },
    { src: "tours/tortugas/cria-en-concha-coco.webp", tag: "turtles", tagTitle: "Ecológico", title: "Una cría, en la palma de la mano 🐢" },
    { src: "tours/tortugas/cubeta-crias-verde.webp", tag: "turtles", tagTitle: "Ecológico", title: "Listas para su primera nadada 🐢" },
    { src: "tours/tortugas/grupo-liberacion-playa.webp", tag: "turtles", tagTitle: "Ecológico", title: "Todos juntos, al atardecer 🐢" },
    { src: "tours/tortugas/crias-laud-canasta-1.webp", tag: "turtles", tagTitle: "Ecológico", title: "Tortugas laúd recién nacidas 🐢" },
    // Delfines y Ballenas — dron real
    { src: "tours/delfines-ballenas/ballenas-aereo-1.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Dos ballenas, vistas desde arriba 🐋" },
    { src: "tours/delfines-ballenas/ballenas-aereo-soplo.webp", tag: "turtles", tagTitle: "Vida Marina", title: "El soplo antes de sumergirse 🐋" },
    { src: "tours/delfines-ballenas/delfines-junto-lancha.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Mar abierto, 06:50 — Delfines junto a la lancha 🐬" },
    // Atardecer a Caballo
    { src: "tours/atardecer-caballo/cruzando-rio-dos-jinetes.webp", tag: "adventures", tagTitle: "Aventura", title: "Cruzando el río a caballo 🐎" },
    { src: "tours/atardecer-caballo/jinete-playa-rio-montanas.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Donde el río se junta con la playa 🐎" },
    { src: "tours/atardecer-caballo/dos-mujeres-a-caballo.webp", tag: "adventures", tagTitle: "Aventura", title: "Cabalgando entre palmeras 🐎" },
    { src: "tours/atardecer-caballo/cabalgata-el-aguaje.webp", tag: "adventures", tagTitle: "Aventura", title: "El Aguaje, 17:10 — Cabalgata rumbo al río 🐎" },
    // Kayak y manglares
    { src: "tours/kayak/kayak-silueta-amanecer.webp", tag: "adventures", tagTitle: "Aventura", title: "Kayak al amanecer, en silencio 🛶" },
    { src: "tours/kayak/kayak-entrando-tunel-manglar.webp", tag: "adventures", tagTitle: "Aventura", title: "Entrando al túnel de manglar 🛶" },
    { src: "tours/kayak/kayak-resplandor-sol.webp", tag: "adventures", tagTitle: "Aventura", title: "De frente al sol 🛶" },
    { src: "tours/kayak/espatulas-rosadas-volando.webp", tag: "adventures", tagTitle: "Aventura", title: "Espátulas rosadas sobre el manglar 🦩" },
    { src: "tours/kayak/kayak-canales-manialtepec.webp", tag: "adventures", tagTitle: "Aventura", title: "Manialtepec, 09:45 — Kayak entre canales 🛶" },
    // Aguas Termales
    { src: "tours/aguas-termales/poza-forma-corazon.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Una poza natural en forma de corazón ♥️" },
    { src: "tours/aguas-termales/poza-redonda.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Aguas termales, entre la selva 🌿" },
    // Tour de Chacahua
    { src: "tours/chacahua/cocodrilo-pasto.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Un cocodrilo tomando el sol 🐊" },
    { src: "tours/chacahua/dos-cocodrilos-manglar.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Chacahua, entre los manglares 🐊" },
    { src: "tours/chacahua/chacahua-canal-manglar.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Chacahua — Laberintos de manglar 🏝️" },
    // Ruta Mazunte / Santuario La Ventanilla
    { src: "tours/mazunte/letrero-punta-cometa.webp", tag: "landscapes", tagTitle: "Costa", title: "Llegando a Punta Cometa 🌅" },
    { src: "tours/mazunte/mono-arana-santuario.webp", tag: "turtles", tagTitle: "Vida Silvestre", title: "Mono araña en La Ventanilla 🐒" },
    { src: "tours/mazunte/alimentando-venado-1.webp", tag: "turtles", tagTitle: "Vida Silvestre", title: "Cara a cara con un venado cola blanca 🦌" },
    { src: "tours/mazunte/degustacion-mezcal-chocolate.webp", tag: "landscapes", tagTitle: "Costa", title: "Mezcal y chocolate de la región 🍫" },
    // Atardecer en la Laguna
    { src: "tours/atardecer-laguna/atardecer-embarcadero-manialtepec.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Manialtepec, 19:05 — El embarcadero al caer el sol 🌅" },
    { src: "tours/atardecer-laguna/imagen_redimensionada_2048.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Fogata en la Playa 🔥" }
];

let activeFilter = 'todos';
let isGalleryExpanded = false;
let currentFilteredPhotos = [...GALLERY_PHOTOS];
let currentLightboxIndex = 0;

// Render photos grid based on filters and expansion state
function renderGalleryGrid() {
    const gridWrapper = document.getElementById('photos-grid-wrapper');
    if (!gridWrapper) return;
    
    gridWrapper.innerHTML = '';
    
    // Determine how many items to show
    const itemsToShow = isGalleryExpanded ? currentFilteredPhotos.length : Math.min(8, currentFilteredPhotos.length);
    
    for (let i = 0; i < itemsToShow; i++) {
        const photo = currentFilteredPhotos[i];
        
        // Find index of the photo in GALLERY_PHOTOS to map it correctly in lightbox
        const globalIndex = GALLERY_PHOTOS.findIndex(p => p.src === photo.src);
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        
        // Add dynamic asymmetric spans for masonry layout
        if (i % 5 === 0) {
            itemDiv.classList.add('span-h'); // Horizontal double span
        } else if (i % 7 === 0) {
            itemDiv.classList.add('span-v'); // Vertical double span
        }
        
        itemDiv.setAttribute('onclick', `openLightbox(${i})`);
        
        itemDiv.innerHTML = `
            <img src="assets/images/${photo.src}" alt="${photo.title}" loading="lazy">
            <div class="gallery-overlay">
                <span class="photo-tag">${photo.tagTitle}</span>
                <p>${photo.title}</p>
            </div>
        `;
        
        gridWrapper.appendChild(itemDiv);
    }
    
    // Manage load more button visibility
    const loadMoreContainer = document.getElementById('gallery-load-more-container');
    if (loadMoreContainer) {
        if (isGalleryExpanded || currentFilteredPhotos.length <= 8) {
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'flex';
        }
    }
}

function filterGallery(tag) {
    activeFilter = tag;
    
    // Update active class on filter buttons
    const filterButtons = document.querySelectorAll('#gallery-category-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${tag}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Apply tag filter
    if (tag === 'todos') {
        currentFilteredPhotos = [...GALLERY_PHOTOS];
    } else {
        currentFilteredPhotos = GALLERY_PHOTOS.filter(p => p.tag === tag);
    }
    
    // Render
    renderGalleryGrid();
}

function expandGallery() {
    isGalleryExpanded = true;
    renderGalleryGrid();
}

// Lightbox Modal Functions
function openLightbox(index) {
    currentLightboxIndex = index;
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    
    updateLightboxContent();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scroll
    }
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    
    // Handle wrapping around the boundaries
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = currentFilteredPhotos.length - 1;
    } else if (currentLightboxIndex >= currentFilteredPhotos.length) {
        currentLightboxIndex = 0;
    }
    
    updateLightboxContent();
}

function updateLightboxContent() {
    const photo = currentFilteredPhotos[currentLightboxIndex];
    if (!photo) return;
    
    const imgEl = document.getElementById('lightbox-current-img');
    const captionEl = document.getElementById('lightbox-current-caption');
    const counterEl = document.getElementById('lightbox-current-counter');
    
    if (imgEl) {
        // Set loading attribute to ensure instant rendering transitions
        imgEl.style.opacity = '0';
        imgEl.src = `assets/images/${photo.src}`;
        imgEl.onload = () => {
            imgEl.style.opacity = '1';
        };
    }
    
    if (captionEl) captionEl.innerText = photo.title;
    if (counterEl) counterEl.innerText = `${currentLightboxIndex + 1} de ${currentFilteredPhotos.length}`;
}

// Close lightbox on click outside the image or Escape key
document.addEventListener('DOMContentLoaded', () => {
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
    });
    
    // Initial gallery render
    renderGalleryGrid();
});

// Experience cards filtering system (High-end transition)
function filterExperiences(category) {
    const filterButtons = document.querySelectorAll('#exp-category-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });
    
    const cards = document.querySelectorAll('#grid-tours-wrapper .exp-card');
    cards.forEach(card => {
        const cardId = card.id;
        let matches = false;
        
        if (category === 'all') {
            matches = true;
        } else if (category === 'nature') {
            matches = (cardId === 'tour-card-turtles' || cardId === 'tour-card-dolphins');
        } else if (category === 'adventure') {
            matches = (cardId === 'tour-card-kayak' || cardId === 'tour-card-chacahua');
        } else if (category === 'night') {
            matches = (cardId === 'tour-card-biolum' || cardId === 'tour-card-horse');
        }
        
        if (matches) {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Mobile menu drawer controllers (Luxury Redesign Addition)
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (drawer) {
        drawer.classList.toggle('active');
        // Prevent body scrolling when menu is active
        document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
    }
    if (hamburgerBtn) {
        hamburgerBtn.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (hamburgerBtn) {
        hamburgerBtn.classList.remove('active');
    }
}

// Expose functions globally
window.filterGallery = filterGallery;
window.expandGallery = expandGallery;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeLightboxImage = changeLightboxImage;
window.filterExperiences = filterExperiences;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;


