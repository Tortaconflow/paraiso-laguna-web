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
const GALLERY_PHOTOS = [
    // Bioluminiscencia
    { src: "tours/bioluminiscencia/Gemini_Generated_Image_8ujze38ujze38ujz.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Bioluminiscencia Mágica 🌌" },
    { src: "tours/bioluminiscencia/Gemini_Generated_Image_p1bmwsp1bmwsp1bm-1-1.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Destello Azul Neón ✨" },
    { src: "tours/bioluminiscencia/Gemini_Generated_Image_uun6pguun6pguun6-1.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Noche en Manialtepec 🌌" },
    { src: "tours/bioluminiscencia/Gemini_Generated_Image_x26k17x26k17x26k.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Sumérgete en la Luz ✨" },
    // Tortugas
    { src: "tours/tortugas/Gemini_Generated_Image_7edww87edww87edw.webp", tag: "turtles", tagTitle: "Ecológico", title: "Tortuga Rumbo al Mar 🐢" },
    { src: "tours/tortugas/Gemini_Generated_Image_a5ely6a5ely6a5el.webp", tag: "turtles", tagTitle: "Ecológico", title: "Integración de Tortugas 🐢" },
    { src: "tours/tortugas/Gemini_Generated_Image_p7v9n5p7v9n5p7v9-1.webp", tag: "turtles", tagTitle: "Ecológico", title: "Crías al Océano 🐢" },
    { src: "tours/tortugas/i.webp", tag: "turtles", tagTitle: "Ecológico", title: "Campamento Tortuguero 🐢" },
    // Delfines y Ballenas
    { src: "tours/delfines-ballenas/unnamed-8.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Delfines en el Pacífico 🐬" },
    { src: "tours/delfines-ballenas/unnamed-9.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Avistamiento de Delfines 🐬" },
    // Atardecer a Caballo
    { src: "tours/atardecer-caballo/ES.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Atardecer a Caballo 🐎" },
    { src: "tours/atardecer-caballo/Gemini_Generated_Image_9jy9er9jy9er9jy9.webp", tag: "adventures", tagTitle: "Aventura", title: "Cabalgata por la Playa 🐎" },
    { src: "tours/atardecer-caballo/Gemini_Generated_Image_9qcrdg9qcrdg9qcr.webp", tag: "adventures", tagTitle: "Aventura", title: "Caballos Nadadores 🐎" },
    { src: "tours/atardecer-caballo/Gemini_Generated_Image_phvuesphvuesphvu.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Sunset Dorado 🌅" },
    { src: "tours/atardecer-caballo/V-1.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Paisajes de Oaxaca 🌅" },
    // Kayak
    { src: "tours/kayak/Gemini_Generated_Image_21x5na21x5na21x5.webp", tag: "adventures", tagTitle: "Aventura", title: "Kayak en los Manglares 🛶" },
    { src: "tours/kayak/Gemini_Generated_Image_9rkmzc9rkmzc9rkm.webp", tag: "adventures", tagTitle: "Aventura", title: "Exploración en Kayak 🛶" },
    { src: "tours/kayak/Gemini_Generated_Image_h86jomh86jomh86j.webp", tag: "adventures", tagTitle: "Aventura", title: "Manglares de Manialtepec 🛶" },
    { src: "tours/kayak/Gemini_Generated_Image_s1caums1caums1ca.webp", tag: "adventures", tagTitle: "Aventura", title: "Aventura en Kayak 🛶" },
    { src: "tours/kayak/Gemini_Generated_Image_ywxx19ywxx19ywxx.webp", tag: "adventures", tagTitle: "Aventura", title: "Canales del Manglar 🛶" },
    // Cascadas
    { src: "tours/cascadas/Gemini_Generated_Image_7zk1hb7zk1hb7zk1.webp", tag: "adventures", tagTitle: "Naturaleza", title: "Cascadas Mágicas 🌊" },
    { src: "tours/cascadas/Gemini_Generated_Image_kv580dkv580dkv58.webp", tag: "adventures", tagTitle: "Naturaleza", title: "Pozas Cristalinas 🌊" },
    { src: "tours/cascadas/Gemini_Generated_Image_m9tk5em9tk5em9tk.webp", tag: "adventures", tagTitle: "Naturaleza", title: "Cascadas de Copalita 🌊" },
    { src: "tours/cascadas/Gemini_Generated_Image_sysvvsysvvsysvvs.webp", tag: "adventures", tagTitle: "Naturaleza", title: "Agua Cristalina 🌊" },
    // Tirolesa
    { src: "tours/tirolesa/Gemini_Generated_Image_e9dr9pe9dr9pe9dr.webp", tag: "adventures", tagTitle: "Adrenalina", title: "Tirolesa Extrema 🧗" },
    { src: "tours/tirolesa/Gemini_Generated_Image_kbnpx0kbnpx0kbnp-1.webp", tag: "adventures", tagTitle: "Adrenalina", title: "Vuelo sobre el Cañón 🧗" },
    { src: "tours/tirolesa/Gemini_Generated_Image_n6tzyhn6tzyhn6tz.webp", tag: "adventures", tagTitle: "Adrenalina", title: "Adrenalina Pura 🧗" },
    // Aguas Termales
    { src: "tours/aguas-termales/Gemini_Generated_Image_gcemzgcemzgcemzg.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Aguas Termales 🌋" },
    { src: "tours/aguas-termales/Gemini_Generated_Image_ijwvibijwvibijwv-1.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Pozas de Atotonilco 🌋" },
    { src: "tours/aguas-termales/Gemini_Generated_Image_wvn6h5wvn6h5wvn6.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Spa Natural 🌋" },
    // Tour de Mazunte
    { src: "tours/mazunte/Gemini_Generated_Image_2yq0ps2yq0ps2yq0.webp", tag: "landscapes", tagTitle: "Costa", title: "Costa Oaxaqueña 🐢" },
    { src: "tours/mazunte/Gemini_Generated_Image_8bxr8z8bxr8z8bxr.webp", tag: "landscapes", tagTitle: "Costa", title: "Punta Cometa 🌅" },
    { src: "tours/mazunte/Gemini_Generated_Image_a6siiga6siiga6si.webp", tag: "landscapes", tagTitle: "Costa", title: "Mazunte Mágico 🐢" },
    { src: "tours/mazunte/Gemini_Generated_Image_osl4jdosl4jdosl4.webp", tag: "landscapes", tagTitle: "Costa", title: "Zipolite y Ventanilla 🌅" },
    // Tour de Chacahua
    { src: "tours/chacahua/asset-eabdb6a5-9a73-405e-b4a7-90df2bcb5c5b-1-1.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Laguna de Chacahua 🏝️" },
    { src: "tours/chacahua/0ee5db45-0b7c-455f-9627-df296ca3c754.png", tag: "landscapes", tagTitle: "Paisaje", title: "Manglares de Chacahua 🏝️" },
    { src: "tours/chacahua/e702dd05-31f3-4335-a65f-21dfcb4c8423.png", tag: "landscapes", tagTitle: "Paisaje", title: "Parque Nacional Chacahua 🏝️" },
    // Atardecer en la Laguna
    { src: "tours/atardecer-laguna/Gemini_Generated_Image_4h5tan4h5tan4h5t.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Atardecer en la Laguna 🌅" },
    { src: "tours/atardecer-laguna/Gemini_Generated_Image_z8xfklz8xfklz8xf-1.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Manglar al Atardecer 🌅" },
    { src: "tours/atardecer-laguna/imagen_redimensionada_2048 (1).webp", tag: "landscapes", tagTitle: "Paisaje", title: "Playa Puerto Suelo 🌅" },
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


