/* ==========================================================================
   INTERACTIVE LOGIC & MULTILINGUAL CONVERSION FLOW - PARAÍSO LAGUNA
   Supports: Español (Default), English (EN), Français (FR)
   ========================================================================== */

function getCurrentLang() {
    const htmlLang = (document.documentElement.lang || 'es').toLowerCase();
    if (htmlLang.startsWith('en')) return 'en';
    if (htmlLang.startsWith('fr')) return 'fr';
    return 'es';
}

(function initHeroBioParticles() {
    const canvas = document.getElementById('hero-bio-canvas');
    const hero = document.getElementById('inicio');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let particles = [];
    let running = false;
    let rafId = null;
    let glowSprite = null;

    function buildGlowSprite() {
        const size = 48;
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        const grad = octx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, 'rgba(160, 235, 255, 0.95)');
        grad.addColorStop(0.4, 'rgba(90, 205, 230, 0.5)');
        grad.addColorStop(1, 'rgba(70, 180, 220, 0)');
        octx.fillStyle = grad;
        octx.fillRect(0, 0, size, size);
        return off;
    }

    function resizeCanvas() {
        const rect = hero.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(rect.width));
        canvas.height = Math.max(1, Math.round(rect.height));
    }

    function moonGlowFactor() {
        const SYNODIC = 29.53058867;
        const age = ((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % SYNODIC;
        const illum = (1 - Math.cos((age / SYNODIC) * 2 * Math.PI)) / 2;
        return 1 - illum;
    }

    function createParticles() {
        const glowFactor = moonGlowFactor();
        const isMobile = window.innerWidth < 768;
        const baseCount = isMobile ? 14 : 32;
        const count = Math.round(baseCount * (0.55 + glowFactor * 0.45));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: (isMobile ? 5 : 7) + Math.random() * (isMobile ? 6 : 9),
            baseAlpha: (0.22 + Math.random() * 0.4) * (0.6 + glowFactor * 0.4),
            phase: Math.random() * Math.PI * 2,
            speed: 0.12 + Math.random() * 0.22,
            drift: (Math.random() - 0.5) * 0.12
        }));
    }

    function draw(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.y -= p.speed;
            p.x += p.drift;
            if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
            if (p.x < -20) p.x = canvas.width + 20;
            if (p.x > canvas.width + 20) p.x = -20;

            const twinkle = 0.75 + Math.sin(time / 900 + p.phase) * 0.25;
            ctx.globalAlpha = p.baseAlpha * twinkle;
            const s = p.r * 2;
            ctx.drawImage(glowSprite, p.x - p.r, p.y - p.r, s, s);
        }
        ctx.globalAlpha = 1;
        if (running) rafId = requestAnimationFrame(draw);
    }

    function start() {
        if (running || prefersReducedMotion) return;
        running = true;
        rafId = requestAnimationFrame(draw);
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    glowSprite = buildGlowSprite();
    resizeCanvas();
    createParticles();

    if (prefersReducedMotion) {
        draw(0);
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0.05 });
    io.observe(hero);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else if (hero.getBoundingClientRect().bottom > 0) {
            start();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            createParticles();
        }, 200);
    });
})();

const MOON_PHASES_I18N = {
    es: [
        [1.85, 'Luna nueva'], [5.54, 'Luna creciente'], [9.23, 'Cuarto creciente'],
        [12.92, 'Gibosa creciente'], [16.61, 'Luna llena'], [20.30, 'Gibosa menguante'],
        [23.99, 'Cuarto menguante'], [27.68, 'Luna menguante'], [999, 'Luna nueva']
    ],
    en: [
        [1.85, 'New Moon'], [5.54, 'Waxing Crescent'], [9.23, 'First Quarter'],
        [12.92, 'Waxing Gibbous'], [16.61, 'Full Moon'], [20.30, 'Waning Gibbous'],
        [23.99, 'Last Quarter'], [27.68, 'Waning Crescent'], [999, 'New Moon']
    ],
    fr: [
        [1.85, 'Nouvelle lune'], [5.54, 'Premier croissant'], [9.23, 'Premier quartier'],
        [12.92, 'Gibbeuse croissante'], [16.61, 'Pleine lune'], [20.30, 'Gibbeuse décroissante'],
        [23.99, 'Dernier quartier'], [27.68, 'Dernier croissant'], [999, 'Nouvelle lune']
    ]
};

const GLOW_POTENTIAL_I18N = {
    es: { high: 'Alto', medium: 'Medio', low: 'Bajo — luna brillante' },
    en: { high: 'High', medium: 'Moderate', low: 'Low — bright moon' },
    fr: { high: 'Élevé', medium: 'Moyen', low: 'Faible — lune brillante' }
};

const I18N_FORM = {
    es: {
        alertMsg: "Por favor completa los campos principales (Experiencia, Personas y Fecha)",
        locale: "es-MX",
        soon: "pronto",
        person: "persona",
        people: "personas",
        buildMessage: function(name, exp, guests, formattedDate, notes) {
            let msg = "¡Hola, Paraíso Laguna! 🌴✨\n\n";
            if (name) {
                msg += "Mi nombre es *" + name + "* y me he enamorado de sus tours en la web. 😍\n\n";
            } else {
                msg += "Me he enamorado de sus tours en la web y me encantaría vivir la experiencia. 😍\n\n";
            }
            msg += "Quiero solicitar una *cotización y reservar* una fecha:\n";
            msg += "🔹 *Aventura:* " + exp + "\n";
            msg += "🔹 *Integrantes:* " + guests + " " + (guests == 1 ? "persona" : "personas") + "\n";
            msg += "🔹 *Fecha deseada:* " + formattedDate + "\n";
            if (notes) {
                msg += "🔹 *Detalles adicionales:* \"" + notes + "\"\n";
            }
            msg += "\n¿Me podrían dar disponibilidad, confirmar precios y detalles para amarrar la reserva? ¡Muchas gracias! 🛶🐊🌌";
            return msg;
        },
        buildModalMessage: function(tour) {
            let msg = "¡Hola, Paraíso Laguna! 🌴✨\n\n";
            msg += "Quiero solicitar información y *reservar* la siguiente aventura:\n";
            msg += "🔹 *Aventura:* " + tour.title + "\n";
            msg += "🔹 *Duración:* " + tour.duration + "\n";
            msg += "🔹 *Horario:* " + tour.time + "\n\n";
            msg += "¿Me podrían dar disponibilidad y el precio especial para nuestro grupo? ¡Muchas gracias! 🛶🐊🌌";
            return msg;
        }
    },
    en: {
        alertMsg: "Please complete the main fields (Experience, Guests, and Date)",
        locale: "en-US",
        soon: "soon",
        person: "guest",
        people: "guests",
        buildMessage: function(name, exp, guests, formattedDate, notes) {
            let msg = "Hello, Paraíso Laguna! 🌴✨\n\n";
            if (name) {
                msg += "My name is *" + name + "* and I would love to book one of your tours from your website. 😍\n\n";
            } else {
                msg += "I saw your tours on your website and would love to experience one. 😍\n\n";
            }
            msg += "I would like to request a *quote and reserve* a date:\n";
            msg += "🔹 *Adventure:* " + exp + "\n";
            msg += "🔹 *Guests:* " + guests + " " + (guests == 1 ? "guest" : "guests") + "\n";
            msg += "🔹 *Desired Date:* " + formattedDate + "\n";
            if (notes) {
                msg += "🔹 *Additional details:* \"" + notes + "\"\n";
            }
            msg += "\nCould you please confirm availability and provide details for our group? Thank you so much! 🛶🐊🌌";
            return msg;
        },
        buildModalMessage: function(tour) {
            let msg = "Hello, Paraíso Laguna! 🌴✨\n\n";
            msg += "I would like to request information and *book* the following adventure:\n";
            msg += "🔹 *Adventure:* " + tour.title + "\n";
            msg += "🔹 *Duration:* " + tour.duration + "\n";
            msg += "🔹 *Schedule:* " + tour.time + "\n\n";
            msg += "Could you please share availability and the best quote for our group? Thank you so much! 🛶🐊🌌";
            return msg;
        }
    },
    fr: {
        alertMsg: "Veuillez remplir les champs principaux (Expérience, Personnes et Date)",
        locale: "fr-FR",
        soon: "bientôt",
        person: "personne",
        people: "personnes",
        buildMessage: function(name, exp, guests, formattedDate, notes) {
            let msg = "Bonjour Paraíso Laguna ! 🌴✨\n\n";
            if (name) {
                msg += "Je m'appelle *" + name + "* et j'aimerais réserver une expérience découverte sur votre site. 😍\n\n";
            } else {
                msg += "J'ai découvert vos excursions sur votre site et j'aimerais vivre l'expérience. 😍\n\n";
            }
            msg += "Je souhaite demander un *devis et réserver* une date :\n";
            msg += "🔹 *Aventure :* " + exp + "\n";
            msg += "🔹 *Nombre de personnes :* " + guests + " " + (guests == 1 ? "personne" : "personnes") + "\n";
            msg += "🔹 *Date souhaitée :* " + formattedDate + "\n";
            if (notes) {
                msg += "🔹 *Détails supplémentaires :* \"" + notes + "\"\n";
            }
            msg += "\nPourriez-vous m'indiquer la disponibilité et le tarif pour notre groupe ? Merci beaucoup ! 🛶🐊🌌";
            return msg;
        },
        buildModalMessage: function(tour) {
            let msg = "Bonjour Paraíso Laguna ! 🌴✨\n\n";
            msg += "Je souhaite me renseigner et *réserver* l'excursion suivante :\n";
            msg += "🔹 *Aventure :* " + tour.title + "\n";
            msg += "🔹 *Durée :* " + tour.duration + "\n";
            msg += "🔹 *Horaire :* " + tour.time + "\n\n";
            msg += "Pourriez-vous me confirmer la disponibilité et le tarif pour notre groupe ? Merci beaucoup ! 🛶🐊🌌";
            return msg;
        }
    }
};

const TOURS_DATA_I18N = {
    es: {
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
    },
    en: {
        biolum: {
            title: "Magic Bioluminescence",
            tag: "Night Experience",
            desc: "Night adventure in Manialtepec Lagoon, only 14 km from Puerto Escondido. Visit the community of El Aguaje del Zapote and board a boat to admire and swim in glowing bioluminescent waters caused by dinoflagellates.",
            duration: "3 Hours",
            time: "7:00 PM (Night tour)",
            includes: "✅ Roundtrip transportation from Puerto Escondido\n✅ Certified bilingual guide\n✅ Life jacket\n✅ Free time to swim in the lagoon",
            bring: "Swimsuit, towel, comfortable clothes. IMPORTANT: Avoid chemical sunscreens and bug sprays to protect the lagoon ecosystem.",
            whatsappName: "Bioluminescence Tour"
        },
        tortugas: {
            title: "Sea Turtle Release",
            tag: "Eco & Conservation",
            desc: "Visit the certified sea turtle sanctuary at La Escobilla or Vive Mar. Learn about marine turtle preservation and gently release baby olive ridley turtles into the Pacific Ocean at sunset.",
            duration: "2 Hours",
            time: "5:00 PM (Sunset)",
            includes: "✅ Bottled water\n✅ Travel insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Light clothing, camera, sunglasses, and cap. Please follow all conservation guidelines.",
            whatsappName: "Turtle Release"
        },
        delfines: {
            title: "Dolphin & Whale Watching",
            tag: "Ocean Wildlife",
            desc: "Sail the open Pacific Ocean at sunrise to encounter wild spinner dolphins, spotted dolphins, rays, sea turtles, and migrating humpback whales.",
            duration: "4 Hours",
            time: "7:00 AM (Daily departure)",
            includes: "✅ Life jacket\n✅ Travel insurance\n✅ Certified guide & captain\n✅ Roundtrip transportation",
            bring: "Biodegradable sunscreen, cap, sunglasses, and light clothes that can get wet.",
            whatsappName: "Dolphin Watching"
        },
        cabalgata: {
            title: "Sunset Horseback Riding",
            tag: "Unique Adventure",
            desc: "Ride well-cared horses along the scenic riverbanks of Manialtepec and pristine beaches. Witness swimming horses crossing the river and enjoy a refreshing drink at sunset.",
            duration: "3 Hours",
            time: "4:00 PM (Sunset)",
            includes: "✅ Personal horse & equipment\n✅ Travel insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Comfortable long pants for riding, closed shoes/sneakers, and camera.",
            whatsappName: "Horseback Riding"
        },
        kayak: {
            title: "Mangrove Kayak Tour",
            tag: "Nature & Birdwatching",
            desc: "Paddle through tranquil mangrove canals in Manialtepec Lagoon with an expert naturalist guide. Perfect for birdwatching and peaceful nature immersion.",
            duration: "1:30 Hour",
            time: "8:00 AM / 4:30 PM",
            includes: "✅ Kayak & paddle gear\n✅ Life jacket\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Water shoes, clothes that can get wet, cap, biodegradable sunscreen, and water.",
            whatsappName: "Mangrove Kayak"
        },
        chacahua: {
            title: "Chacahua National Park Tour",
            tag: "Full Day Adventure",
            desc: "Discover the breathtaking mangrove channels of Chacahua National Park, encounter exotic birds and iguanas, and relax on untouched Pacific beaches with delicious local seafood.",
            duration: "6 Hours",
            time: "12:30 PM (Midday)",
            includes: "✅ Boat excursion through canals\n✅ Life jacket & insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Swimsuit, towel, change of clothes, sunglasses, and cash for fresh local meals.",
            whatsappName: "Chacahua Tour"
        },
        cascadas: {
            title: "Copalita Magic Waterfalls",
            tag: "Jungle & Nature",
            desc: "Scenic journey through the mountains of San Juan Lachao to swim in crystalline jungle waterfalls surrounded by lush tropical vegetation.",
            duration: "7 Hours",
            time: "9:00 AM (Day trip)",
            includes: "✅ Waterfall entrance fees\n✅ Travel insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Swimsuit, towel, water shoes/grip footwear, dry change of clothes.",
            whatsappName: "Copalita Waterfalls"
        },
        tirolesa: {
            title: "Extreme Zipline Adventure",
            tag: "Pure Adrenaline",
            desc: "High-flying zipline circuit soaring over deep canyons in San Juan Lachao, followed by an invigorating hike and a refreshing dip in mountain pools.",
            duration: "7 Hours",
            time: "9:00 AM (Day trip)",
            includes: "✅ Safety gear & harness\n✅ Travel insurance\n✅ Certified instructor\n✅ Roundtrip transportation",
            bring: "Sport clothing, mandatory closed sneakers/hiking shoes, sunglasses.",
            whatsappName: "Zipline Adventure"
        },
        termales: {
            title: "Atotonilco Hot Springs",
            tag: "Wellness & Nature",
            desc: "Relax in secluded natural mineral hot springs tucked deep inside the jungle near Puerto Escondido. An open-air natural spa experience.",
            duration: "7 Hours",
            time: "9:00 AM (Day trip)",
            includes: "✅ Horseback ride portion\n✅ Travel insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Swimsuit, towel, comfortable footwear that can get wet, cap.",
            whatsappName: "Hot Springs"
        },
        mazunte: {
            title: "Mazunte & Coast Discovery",
            tag: "Coastal Culture",
            desc: "Explore Mazunte, Zipolite, La Ventanilla wildlife sanctuary, and watch the legendary Pacific sunset from the cliffs of Punta Cometa.",
            duration: "9 Hours",
            time: "9:00 AM (Full Day)",
            includes: "✅ Visits to Mazunte, Zipolite, Ventanilla & Punta Cometa\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Comfortable walking shoes, sunglasses, cap, cash for souvenirs and food.",
            whatsappName: "Mazunte Tour"
        },
        "laguna-sunset": {
            title: "Sunset & Bonfire at the Lagoon",
            tag: "Peace & Nature",
            desc: "Cruise the 13 km mangrove labyrinth of Manialtepec, spot coastal bird species, relax at Puerto Suelo beach with a sunset bonfire, and conclude with glowing bioluminescence.",
            duration: "5 Hours",
            time: "3:00 PM (Afternoon)",
            includes: "✅ Life jacket\n✅ Travel insurance\n✅ Certified guide\n✅ Roundtrip transportation",
            bring: "Camera, light jacket/clothes, sunglasses, biodegradable bug spray.",
            whatsappName: "Lagoon Sunset & Bio"
        }
    },
    fr: {
        biolum: {
            title: "Bioluminescence Magique",
            tag: "Expérience Nocturne",
            desc: "Aventure nocturne sur la lagune de Manialtepec, à seulement 14 km de Puerto Escondido. Embarquez à bord d'un bateau pour observer et nager dans des eaux bioluminescentes étincelantes sous l'effet des dinoflagellés.",
            duration: "3 Heures",
            time: "19h00 (Nocturne)",
            includes: "✅ Transport aller-retour depuis Puerto Escondido\n✅ Guide certifié\n✅ Gilet de sauvetage\n✅ Temps libre pour nager dans la lagune",
            bring: "Maillot de bain, serviette, vêtements confortables. IMPORTANT : Pas de répulsif chimique afin de préserver l'écosystème.",
            whatsappName: "Tour Bioluminescence"
        },
        tortugas: {
            title: "Libération des Tortues Marines",
            tag: "Écologie & Protection",
            desc: "Visitez un sanctuaire de conservation à La Escobilla ou Vive Mar. Découvrez le cycle de vie des tortues marines et participez à la libération de bébés tortues au coucher du soleil.",
            duration: "2 Heures",
            time: "17h00 (Coucher du soleil)",
            includes: "✅ Bouteille d'eau\n✅ Assurance voyageur\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Vêtements légers, appareil photo, lunettes de soleil et casquette.",
            whatsappName: "Libération des Tortues"
        },
        delfines: {
            title: "Observation des Dauphins et Baleines",
            tag: "Aventure Marine",
            desc: "Naviguez sur l'Océan Pacifique à l'aube pour observer des groupes de dauphins sauvages, raies mantas, tortues et baleines à bosse en saison.",
            duration: "4 Heures",
            time: "07h00 (Départ quotidien)",
            includes: "✅ Gilet de sauvetage\n✅ Assurance voyageur\n✅ Capitaine et guide certifié\n✅ Transport aller-retour",
            bring: "Crème solaire biodégradable, casquette, lunettes de soleil et vêtements pouvant être mouillés.",
            whatsappName: "Observation des Dauphins"
        },
        cabalgata: {
            title: "Balade à Cheval au Coucher du Soleil",
            tag: "Aventure Unique",
            desc: "Chevauchez le long de la rivière de Manialtepec et sur des plages sauvages. Admirez les chevaux nageurs traversant le cours d'eau et profitez d'un coucher de soleil inoubliable.",
            duration: "3 Heures",
            time: "16h00 (Après-midi)",
            includes: "✅ Cheval et équipement\n✅ Assurance voyageur\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Pantalon long confortable pour monter, chaussures fermées et appareil photo.",
            whatsappName: "Balade à Cheval"
        },
        kayak: {
            title: "Kayak dans les Mangroves",
            tag: "Nature & Oiseaux",
            desc: "Parcourez les canaux calmes de la lagune de Manialtepec en kayak avec un guide naturaliste. Idéal pour observer les oiseaux exotiques et s'immerger dans la nature.",
            duration: "1h30",
            time: "08h00 / 16h30",
            includes: "✅ Kayak et pagaie\n✅ Gilet de sauvetage\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Chaussures d'eau, vêtements légers pouvant être mouillés, casquette et eau.",
            whatsappName: "Kayak Mangroves"
        },
        chacahua: {
            title: "Excursion à Chacahua",
            tag: "Journée Complète",
            desc: "Explorez les lagunes et labyrinthes de mangroves du Parc National de Chacahua, observez iguanes et oiseaux rares, puis détendez-vous sur les plages de l'océan.",
            duration: "6 Heures",
            time: "12h30 (Midi)",
            includes: "✅ Traversée en bateau dans les mangroves\n✅ Gilet de sauvetage et assurance\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Maillot de bain, serviette, vêtements de rechange et espèces pour le déjeuner.",
            whatsappName: "Excursion Chacahua"
        },
        cascadas: {
            title: "Cascades Magiques de Copalita",
            tag: "Nature & Forêt",
            desc: "Voyage au cœur de la jungle à San Juan Lachao pour vous baigner dans des piscines naturelles d'eau douce cristalline entourées de végétation tropicale.",
            duration: "7 Heures",
            time: "09h00 (Journée)",
            includes: "✅ Entrées aux cascades\n✅ Assurance voyageur\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Maillot de bain, serviette, chaussures antidérapantes pour marcher dans l'eau.",
            whatsappName: "Cascades Copalita"
        },
        tirolesa: {
            title: "Tyroliennes Extrêmes",
            tag: "Sensations Fortes",
            desc: "Circuit de tyroliennes survolant des canyons spectaculaires à San Juan Lachao, combiné avec une randonnée en forêt et une baignade rafraîchissante.",
            duration: "7 Heures",
            time: "09h00 (Journée)",
            includes: "✅ Équipement de sécurité complet\n✅ Assurance voyageur\n✅ Moniteur certifié\n✅ Transport aller-retour",
            bring: "Tenue de sport, baskets fermées obligatoires, lunettes de soleil.",
            whatsappName: "Tyroliennes"
        },
        termales: {
            title: "Sources Thermales d'Atotonilco",
            tag: "Bien-être & Nature",
            desc: "Détendez-vous dans des bassins thermaux naturels aux propriétés minérales apaisantes au milieu de la forêt tropicale.",
            duration: "7 Heures",
            time: "09h00 (Journée)",
            includes: "✅ Balade à cheval\n✅ Assurance voyageur\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Maillot de bain, serviette, chaussures confortables pouvant être mouillées.",
            whatsappName: "Sources Thermales"
        },
        mazunte: {
            title: "Excursion Mazunte & Côte Sauvage",
            tag: "Culture & Océan",
            desc: "Découvrez Mazunte, Zipolite, le sanctuaire de La Ventanilla et admirez le coucher de soleil depuis les falaises majestueuses de Punta Cometa.",
            duration: "9 Heures",
            time: "09h00 (Journée complète)",
            includes: "✅ Visites de Mazunte, Zipolite, Ventanilla et Punta Cometa\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Chaussures de marche confortables, lunettes de soleil, casquette et argent liquide.",
            whatsappName: "Tour Mazunte"
        },
        "laguna-sunset": {
            title: "Coucher de Soleil & Feu de Camp",
            tag: "Nature & Détente",
            desc: "Parcourez les mangroves de Manialtepec, observez les oiseaux au crépuscule, profitez d'un feu de camp à la plage Puerto Suelo et terminez par la bioluminescence.",
            duration: "5 Heures",
            time: "15h00 (Après-midi)",
            includes: "✅ Gilet de sauvetage\n✅ Assurance voyageur\n✅ Guide certifié\n✅ Transport aller-retour",
            bring: "Appareil photo, vêtements légers, lunettes de soleil et antimoustique biodégradable.",
            whatsappName: "Coucher de Soleil & Bio"
        }
    }
};

const TOURS_DATA = TOURS_DATA_I18N.es;
let activeTourKey = null;

const GALLERY_PHOTOS = [
    { src: "tours/bioluminiscencia/mano-brillo-real-1.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "El agua responde con luz ✨" },
    { src: "tours/bioluminiscencia/estela-lancha-brillo.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "La estela de la lancha, encendida 🌌" },
    { src: "tours/bioluminiscencia/grupo-letrero-bioluminiscencia.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Antes de zarpar a la laguna 🌙" },
    { src: "tours/bioluminiscencia/mano-brillo-real-2.webp", tag: "biolum", tagTitle: "Bioluminiscencia", title: "Nadie sale igual de esta noche ✨" },
    { src: "tours/tortugas/crias-caminando-amanecer.webp", tag: "turtles", tagTitle: "Ecológico", title: "Rumbo al mar, solas 🐢" },
    { src: "tours/tortugas/cria-en-concha-coco.webp", tag: "turtles", tagTitle: "Ecológico", title: "Una cría, en la palma de la mano 🐢" },
    { src: "tours/tortugas/cubeta-crias-verde.webp", tag: "turtles", tagTitle: "Ecológico", title: "Listas para su primera nadada 🐢" },
    { src: "tours/tortugas/grupo-liberacion-playa.webp", tag: "turtles", tagTitle: "Ecológico", title: "Todos juntos, al atardecer 🐢" },
    { src: "tours/tortugas/crias-laud-canasta-1.webp", tag: "turtles", tagTitle: "Ecológico", title: "Tortugas laúd recién nacidas 🐢" },
    { src: "tours/delfines-ballenas/ballenas-aereo-1.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Dos ballenas, vistas desde arriba 🐋" },
    { src: "tours/delfines-ballenas/ballenas-aereo-soplo.webp", tag: "turtles", tagTitle: "Vida Marina", title: "El soplo antes de sumergirse 🐋" },
    { src: "tours/delfines-ballenas/delfines-junto-lancha.webp", tag: "turtles", tagTitle: "Vida Marina", title: "Mar abierto, 06:50 — Delfines junto a la lancha 🐬" },
    { src: "tours/atardecer-caballo/cruzando-rio-dos-jinetes.webp", tag: "adventures", tagTitle: "Aventura", title: "Cruzando el río a caballo 🐎" },
    { src: "tours/atardecer-caballo/jinete-playa-rio-montanas.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Donde el río se junta con la playa 🐎" },
    { src: "tours/atardecer-caballo/dos-mujeres-a-caballo.webp", tag: "adventures", tagTitle: "Aventura", title: "Cabalgando entre palmeras 🐎" },
    { src: "tours/atardecer-caballo/cabalgata-el-aguaje.webp", tag: "adventures", tagTitle: "Aventura", title: "El Aguaje, 17:10 — Cabalgata rumbo al río 🐎" },
    { src: "tours/kayak/kayak-silueta-amanecer.webp", tag: "adventures", tagTitle: "Aventura", title: "Kayak al amanecer, en silencio 🛶" },
    { src: "tours/kayak/kayak-entrando-tunel-manglar.webp", tag: "adventures", tagTitle: "Aventura", title: "Entrando al túnel de manglar 🛶" },
    { src: "tours/kayak/kayak-resplandor-sol.webp", tag: "adventures", tagTitle: "Aventura", title: "De frente al sol 🛶" },
    { src: "tours/kayak/espatulas-rosadas-volando.webp", tag: "adventures", tagTitle: "Aventura", title: "Espátulas rosadas sobre el manglar 🦩" },
    { src: "tours/kayak/kayak-canales-manialtepec.webp", tag: "adventures", tagTitle: "Aventura", title: "Manialtepec, 09:45 — Kayak entre canales 🛶" },
    { src: "tours/aguas-termales/poza-forma-corazon.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Una poza natural en forma de corazón ♥️" },
    { src: "tours/aguas-termales/poza-redonda.webp", tag: "landscapes", tagTitle: "Bienestar", title: "Aguas termales, entre la selva 🌿" },
    { src: "tours/chacahua/cocodrilo-pasto.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Un cocodrilo tomando el sol 🐊" },
    { src: "tours/chacahua/dos-cocodrilos-manglar.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Chacahua, entre los manglares 🐊" },
    { src: "tours/chacahua/chacahua-canal-manglar.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Chacahua — Laberintos de manglar 🏝️" },
    { src: "tours/mazunte/letrero-punta-cometa.webp", tag: "landscapes", tagTitle: "Costa", title: "Llegando a Punta Cometa 🌅" },
    { src: "tours/mazunte/mono-arana-santuario.webp", tag: "turtles", tagTitle: "Vida Silvestre", title: "Mono araña en La Ventanilla 🐒" },
    { src: "tours/mazunte/alimentando-venado-1.webp", tag: "turtles", tagTitle: "Vida Silvestre", title: "Cara a cara con un venado cola blanca 🦌" },
    { src: "tours/mazunte/degustacion-mezcal-chocolate.webp", tag: "landscapes", tagTitle: "Costa", title: "Mezcal y chocolate de la región 🍫" },
    { src: "tours/atardecer-laguna/atardecer-embarcadero-manialtepec.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Manialtepec, 19:05 — El embarcadero al caer el sol 🌅" },
    { src: "tours/atardecer-laguna/imagen_redimensionada_2048.webp", tag: "landscapes", tagTitle: "Paisaje", title: "Fogata en la Playa 🔥" }
];

let activeFilter = 'todos';
let isGalleryExpanded = false;
let currentFilteredPhotos = [...GALLERY_PHOTOS];
let currentLightboxIndex = 0;

function getAssetPrefix() {
    const styleLink = document.querySelector('link[href*="styles.css"]');
    if (styleLink) {
        const href = styleLink.getAttribute('href');
        return href.substring(0, href.indexOf('styles.css'));
    }
    return '';
}

function renderGalleryGrid() {
    const gridWrapper = document.getElementById('photos-grid-wrapper');
    if (!gridWrapper) return;
    
    gridWrapper.innerHTML = '';
    const prefix = getAssetPrefix();
    const itemsToShow = isGalleryExpanded ? currentFilteredPhotos.length : Math.min(8, currentFilteredPhotos.length);
    
    for (let i = 0; i < itemsToShow; i++) {
        const photo = currentFilteredPhotos[i];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        
        if (i % 5 === 0) itemDiv.classList.add('span-h');
        else if (i % 7 === 0) itemDiv.classList.add('span-v');
        
        itemDiv.setAttribute('onclick', 'openLightbox(' + i + ')');
        itemDiv.innerHTML = '<img src="' + prefix + 'assets/images/' + photo.src + '" alt="' + photo.title + '" loading="lazy"><div class="gallery-overlay"><span class="photo-tag">' + photo.tagTitle + '</span><p>' + photo.title + '</p></div>';
        gridWrapper.appendChild(itemDiv);
    }
    
    const loadMoreContainer = document.getElementById('gallery-load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = (isGalleryExpanded || currentFilteredPhotos.length <= 8) ? 'none' : 'flex';
    }
}

function filterGallery(tag) {
    activeFilter = tag;
    const filterButtons = document.querySelectorAll('#gallery-category-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes("'" + tag + "'")) {
            btn.classList.add('active');
        }
    });
    
    if (tag === 'todos' || tag === 'all') {
        currentFilteredPhotos = [...GALLERY_PHOTOS];
    } else {
        currentFilteredPhotos = GALLERY_PHOTOS.filter(p => p.tag === tag);
    }
    renderGalleryGrid();
}

function expandGallery() {
    isGalleryExpanded = true;
    renderGalleryGrid();
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    updateLightboxContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
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
    
    const prefix = getAssetPrefix();
    const imgEl = document.getElementById('lightbox-current-img');
    const captionEl = document.getElementById('lightbox-current-caption');
    const counterEl = document.getElementById('lightbox-current-counter');
    
    if (imgEl) {
        imgEl.style.opacity = '0';
        imgEl.src = prefix + 'assets/images/' + photo.src;
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
    }
    
    if (captionEl) captionEl.innerText = photo.title;
    if (counterEl) counterEl.innerText = (currentLightboxIndex + 1) + ' / ' + currentFilteredPhotos.length;
}

function openTourModal(tourKey) {
    const lang = getCurrentLang();
    const langTours = TOURS_DATA_I18N[lang] || TOURS_DATA_I18N.es;
    const tour = langTours[tourKey] || TOURS_DATA_I18N.es[tourKey];
    if (!tour) return;
    
    activeTourKey = tourKey;
    
    const tagEl = document.getElementById('modal-tour-tag');
    if (tagEl) {
        tagEl.textContent = tour.tag;
        tagEl.className = 'exp-tag';
        if (tour.tag.includes('Nocturna') || tour.tag.includes('Única') || tour.tag.includes('Night') || tour.tag.includes('Nocturne')) {
            tagEl.classList.add('sunset');
        } else if (tour.tag.includes('Marina') || tour.tag.includes('Día') || tour.tag.includes('Wildlife') || tour.tag.includes('Nature')) {
            tagEl.classList.add('green');
        }
    }
    
    const titleEl = document.getElementById('modal-tour-title');
    if (titleEl) titleEl.textContent = tour.title;

    const descEl = document.getElementById('modal-tour-desc');
    if (descEl) descEl.textContent = tour.desc;

    const durEl = document.getElementById('modal-tour-duration');
    if (durEl) durEl.textContent = tour.duration;

    const timeEl = document.getElementById('modal-tour-time');
    if (timeEl) timeEl.textContent = tour.time;

    const incEl = document.getElementById('modal-tour-includes');
    if (incEl) incEl.textContent = tour.includes;

    const bringEl = document.getElementById('modal-tour-bring');
    if (bringEl) bringEl.textContent = tour.bring;
    
    const modal = document.getElementById('tour-modal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    
    document.body.style.overflow = 'hidden';
}

function closeTourModal() {
    const modal = document.getElementById('tour-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    document.body.style.overflow = 'auto';
    activeTourKey = null;
}

window.openTourModal = openTourModal;
window.closeTourModal = closeTourModal;

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function selectTourAndScroll(tourName) {
    const expSelect = document.getElementById('booking-experience');
    if (expSelect) {
        expSelect.value = tourName;
    }
    scrollToSection('contacto');
}

window.scrollToSection = scrollToSection;
window.selectTourAndScroll = selectTourAndScroll;

function filterExperiences(category) {
    const filterButtons = document.querySelectorAll('#exp-category-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes("'" + category + "'")) {
            btn.classList.add('active');
        }
    });
    
    const cards = document.querySelectorAll('#grid-tours-wrapper .exp-card');
    cards.forEach(card => {
        const cardId = card.id;
        let matches = false;
        if (category === 'all') matches = true;
        else if (category === 'nature') matches = (cardId === 'tour-card-turtles' || cardId === 'tour-card-dolphins');
        else if (category === 'adventure') matches = (cardId === 'tour-card-kayak' || cardId === 'tour-card-chacahua');
        else if (category === 'night') matches = (cardId === 'tour-card-biolum' || cardId === 'tour-card-horse');
        
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

function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (drawer) {
        drawer.classList.toggle('active');
        document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
    }
    if (hamburgerBtn) hamburgerBtn.classList.toggle('active');
}

function closeMobileMenu() {
    const drawer = document.getElementById('mobile-drawer');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
}

function toggleWaChat() {
    const chatBox = document.getElementById('wa-chat-box');
    if (chatBox) chatBox.classList.toggle('active');
}

function waQuickChat(experienceName) {
    selectTourAndScroll(experienceName);
    toggleWaChat();
}

window.toggleWaChat = toggleWaChat;
window.waQuickChat = waQuickChat;

window.filterGallery = filterGallery;
window.expandGallery = expandGallery;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.changeLightboxImage = changeLightboxImage;
window.filterExperiences = filterExperiences;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

function initApp() {
    const lang = getCurrentLang();

    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0,
        rootMargin: '0px 0px -50px 0px'
    });
    revealElements.forEach(el => revealObserver.observe(el));

    const SYNODIC = 29.53058867;
    const moonAge = ((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % SYNODIC;
    const phaseList = MOON_PHASES_I18N[lang] || MOON_PHASES_I18N.es;
    const matchedPhase = phaseList.find(([limit]) => moonAge <= limit);
    const moonName = matchedPhase ? matchedPhase[1] : phaseList[0][1];
    const moonEl = document.getElementById('moon-phase');
    if (moonEl) moonEl.textContent = moonName;

    const moonIllum = (1 - Math.cos((moonAge / SYNODIC) * 2 * Math.PI)) / 2;
    const glowEl = document.getElementById('glow-potential');
    const glowTexts = GLOW_POTENTIAL_I18N[lang] || GLOW_POTENTIAL_I18N.es;
    if (glowEl) {
        if (moonIllum < 0.35) {
            glowEl.textContent = glowTexts.high;
            glowEl.style.color = 'var(--accent-green, #00A86B)';
        } else if (moonIllum < 0.7) {
            glowEl.textContent = glowTexts.medium;
            glowEl.style.color = '';
        } else {
            glowEl.textContent = glowTexts.low;
            glowEl.style.color = 'var(--accent-orange, #FF7A00)';
        }
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (questionBtn && answer) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAns = otherItem.querySelector('.faq-answer');
                    if (otherAns) otherAns.style.maxHeight = null;
                });
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    const bookingForm = document.getElementById('whatsapp-booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentConfig = I18N_FORM[lang] || I18N_FORM.es;
            
            const name = (document.getElementById('booking-name')?.value || '').trim();
            const experience = document.getElementById('booking-experience')?.value || '';
            const guests = document.getElementById('booking-guests')?.value || '';
            const date = document.getElementById('booking-date')?.value || '';
            const notes = (document.getElementById('booking-notes')?.value || '').trim();

            if (!experience || !guests || !date) {
                alert(currentConfig.alertMsg);
                return;
            }

            let formattedDate = currentConfig.soon;
            if (date) {
                const dateObj = new Date(date + 'T00:00:00');
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                formattedDate = dateObj.toLocaleDateString(currentConfig.locale, options);
            }

            const whatsappNumber = '529541611334';
            const message = currentConfig.buildMessage(name, experience, guests, formattedDate, notes);
            const encodedMessage = encodeURIComponent(message);

            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Engagement',
                    'event_label': 'Formulario Contacto: ' + experience,
                    'language': lang,
                    'value': 1
                });
            }

            const whatsappUrl = 'https://api.whatsapp.com/send?phone=' + whatsappNumber + '&text=' + encodedMessage;
            window.open(whatsappUrl, '_blank');
        });
    }

    const modal = document.getElementById('tour-modal');
    const closeBtn = document.getElementById('modal-close');
    const ctaBtn = document.getElementById('modal-cta-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeTourModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeTourModal();
        });
    }

    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            if (!activeTourKey) return;
            const langTours = TOURS_DATA_I18N[lang] || TOURS_DATA_I18N.es;
            const tour = langTours[activeTourKey] || TOURS_DATA_I18N.es[activeTourKey];
            const currentConfig = I18N_FORM[lang] || I18N_FORM.es;

            const whatsappNumber = '529541611334';
            const message = currentConfig.buildModalMessage(tour);
            const encodedMessage = encodeURIComponent(message);

            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Engagement',
                    'event_label': 'Modal Cotizar: ' + tour.title,
                    'language': lang,
                    'value': 1
                });
            }

            const whatsappUrl = 'https://api.whatsapp.com/send?phone=' + whatsappNumber + '&text=' + encodedMessage;
            window.open(whatsappUrl, '_blank');
        });
    }

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

    renderGalleryGrid();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
