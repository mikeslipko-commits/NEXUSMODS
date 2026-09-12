document.addEventListener("DOMContentLoaded", () => {
    let alleProdukte = [];
    let aktuelleKategorie = 'alle';
    let aktuellesAudio = null;
    let aktuellerPlayBtn = null;
    let aktuelleAnsicht = 'katalog';

    // 1. Daten aus der JSON-Datei laden (mit Cache-Busting-Zeitstempel)
    fetch(`produkte.json?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            alleProdukte = data;
            rendereProdukte(alleProdukte);
            setupFilter();
            setupSuche();
            setupHeaderNav(); 
        })
        .catch(error => {
            console.error("Fehler beim Laden der Produkte:", error);
            const container = document.getElementById('produkt-container');
            if (container) {
                container.innerHTML = '<p style="color: #ef4444; text-align:center;">Fehler beim Laden der produkte.json.</p>';
            }
        });

    // 2. Funktion, die das HTML für die Produktkarten baut
    function rendereProdukte(produkte) {
        const container = document.getElementById('produkt-container');
        if (!container) return;
        
        if (aktuellesAudio) {
            aktuellesAudio.pause();
            aktuellesAudio = null;
        }

        container.innerHTML = '';

        const anzahlSpan = document.getElementById('produkt-anzahl');
        if (anzahlSpan) {
            let labelText = `Zeige <span>${produkte.length} exklusive${produkte.length === 1 ? 'r' : ''} Artikel</span>`;
            if (aktuelleAnsicht === 'neuheiten') {
                labelText = `🔥 Unsere <span>${produkte.length} neuesten Modifikationen</span>`;
            }
            anzahlSpan.innerHTML = labelText;
        }

        if (produkte.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af; text-align:center; grid-column: 1/-1; padding: 40px 0;">Keine Produkte gefunden.</p>';
            return;
        }

        produkte.forEach((item) => {
            let mediaInhalt = '';
            if (item.bild) {
                mediaInhalt = `<img src="https://github.io{item.bild}" alt="${item.titel}" class="card-media-image">`;
            } else {
                mediaInhalt = `<span class="card-media-label">${item.platzhalter_text || '[ BILD ]'}</span>`;
            }

            let passwortHTML = '';
            if (item.passwort && item.passwort.trim() !== "") {
                passwortHTML = `
                    <div style="font-size: 12px; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px dashed rgba(251, 191, 36, 0.4); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px; font-family: monospace; display: flex; justify-content: space-between; align-items: center;">
                        <span>🔑 PW: <strong>${item.passwort}</strong></span>
                        <span style="font-size: 10px; color: #9ca3af; cursor:pointer;" onclick="navigator.clipboard.writeText('${item.passwort}'); alert('Passwort kopiert!');">Kopieren</span>
                    </div>
                `;
            }

            let youtubeHTML = '';
            if (item.youtube_link && item.youtube_link.trim() !== "") {
                youtubeHTML = `
                    <a href="${item.youtube_link}" target="_blank" class="btn-action" style="background-color: rgba(225, 29, 72, 0.1); color: #e11d48; border-color: rgba(225, 29, 72, 0.3); margin-bottom: 8px; text-decoration:none;">
                        📺 Video-Vorschau
                    </a>
                `;
            }

            let audioHTML = '';
            if (item.sound_datei && item.sound_datei.trim() !== "") {
                audioHTML = `
                    <button class="btn-audio-player" data-sound="${item.sound_datei}">
                        <span>▶</span> Sound abspielen
                    </button>
                `;
            }

            const produktHTML = `
                <div class="product-card">
                    <div>
                        <div class="card-media">
                            ${mediaInhalt}
                            <div class="category-tag ${item.kategorie_klasse || ''}">${item.kategorie_text || ''}</div>
                            <div class="type-badge">${item.typ_badge || ''}</div>
                        </div>
                        <div class="card-body">
                            <h4 class="product-title">${item.titel || ''}</h4>
                            <p class="product-desc">${item.beschreibung || ''}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="price-row">
                            <div class="price-box">
                                <span class="current-price">${item.preis || '0,00 €'}</span>
                                <span class="old-price">${item.alter_preis || ''}</span>
                            </div>
                            <span class="free-tag">${item.free_tag || 'Kostenloser Download'}</span>
                        </div>
                        ${audioHTML}
                        ${passwortHTML}
                        ${youtubeHTML}
                        <a href="${item.download_link || '#'}" target="_blank" class="btn-action" style="text-decoration:none;">Details & Download</a>
                    </div>
                </div>
            `;
            container.innerHTML += produktHTML;
        });

        setupAudioEvents();
    }

    // 3. Waffensound Audio Event Logik
    function setupAudioEvents() {
        const audioButtons = document.querySelectorAll('.btn-audio-player');
        audioButtons.forEach(button => {
            button.addEventListener('click', () => {
                const soundPath = button.getAttribute('data-sound');
                if (aktuellesAudio && aktuellerPlayBtn === button) {
                    if (!aktuellesAudio.paused) {
                        aktuellesAudio.pause();
                        button.innerHTML = '<span>▶</span> Sound abspielen';
                        button.classList.remove('playing');
                    } else {
                        aktuellesAudio.play();
                        button.innerHTML = '<span>⏸</span> Sound pausieren';
                        button.classList.add('playing');
                    }
                    return;
                }
                if (aktuellesAudio) {
                    aktuellesAudio.pause();
                    if (aktuellerPlayBtn) {
                        aktuellerPlayBtn.innerHTML = '<span>▶</span> Sound abspielen';
                        aktuellerPlayBtn.classList.remove('playing');
                    }
                }
                aktuellesAudio = new Audio(soundPath);
                aktuellerPlayBtn = button;
                button.innerHTML = '<span>⏸</span> Sound pausieren';
                button.classList.add('playing');
                aktuellesAudio.play().catch(err => {
                    button.innerHTML = '<span>▶</span> Sound abspielen';
                    button.classList.remove('playing');
                });
                aktuellesAudio.addEventListener('ended', () => {
                    button.innerHTML = '<span>▶</span> Sound abspielen';
                    button.classList.remove('playing');
                    aktuellesAudio = null;
                    aktuellerPlayBtn = null;
                });
            });
        });
    }

    // 4. Logik für die Filter-Buttons in der Sidebar
    function setupFilter() {
        const buttons = document.querySelectorAll('[data-kategorie]');
        const searchInput = document.getElementById('search-input');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                aktuelleKategorie = button.getAttribute('data-kategorie');
                if (searchInput) searchInput.value = '';

                if (aktuelleKategorie === 'alle') {
                    rendereProdukte(alleProdukte);
                } else {
                    const gefilterteListe = alleProdukte.filter(p => p.kategorie === aktuelleKategorie);
                    rendereProdukte(gefilterteListe);
                }
            });
        });
    }

    // 5. Logik für die Live-Suchleiste
    function setupSuche() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const suchBegriff = e.target.value.toLowerCase().trim();
            let ergebnis = alleProdukte;
            if (aktuelleKategorie !== 'alle') {
                ergebnis = alleProdukte.filter(p => p.kategorie === aktuelleKategorie);
            }
            if (suchBegriff !== '') {
                ergebnis = ergebnis.filter(p => {
                    const titelPasst = p.titel ? p.titel.toLowerCase().includes(suchBegriff) : false;
                    const beschreibungPasst = p.beschreibung ? p.beschreibung.toLowerCase().includes(suchBegriff) : false;
                    return titelPasst || beschreibungPasst;
                });
            }
            rendereProdukte(ergebnis);
        });
    }

    // 6. Logik für das Umschalten der Menüpunkte im Header
    function setupHeaderNav() {
        const linkKatalog = document.getElementById('nav-katalog');
        const linkNeuheiten = document.getElementById('nav-neuheiten');
        const linkSupport = document.getElementById('nav-support');
        const catalogContent = document.getElementById('catalog-main-content');
        const supportContent = document.getElementById('support-main-content');
        const sidebar = document.getElementById('store-sidebar');
        const searchWrapper = document.getElementById('main-search-wrapper');

        if (!linkKatalog || !catalogContent) return;

                function wechsleAnsicht(ansicht) {
            aktuelleAnsicht = ansicht;
            [linkKatalog, linkNeuheiten, linkSupport].forEach(link => {
                if(link) link.classList.remove('active');
            });
            if (ansicht === 'katalog') {
                if(linkKatalog) linkKatalog.classList.add('active');
                catalogContent.style.display = 'block';
                if(supportContent) supportContent.style.display = 'none';
                if(sidebar) sidebar.style.display = 'block';
                if(searchWrapper) {
                    searchWrapper.style.opacity = '1';
                    searchWrapper.style.pointerEvents = 'auto';
                }
                const filterButtons = document.querySelectorAll('[data-kategorie]');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                const alleBtn = document.querySelector('[data-kategorie="alle"]');
                if(alleBtn) alleBtn.classList.add('active');
                aktuelleKategorie = 'alle';
                rendereProdukte(alleProdukte);
            } 
            else if (ansicht === 'neuheiten') {
                if(linkNeuheiten) linkNeuheiten.classList.add('active');
                catalogContent.style.display = 'block';
                if(supportContent) supportContent.style.display = 'none';
                if(sidebar) sidebar.style.display = 'none'; 
                if(searchWrapper) {
                    searchWrapper.style.opacity = '0'; 
                    searchWrapper.style.pointerEvents = 'none';
                }
                const neuesteDrei = alleProdukte.slice(-3).reverse();
                rendereProdukte(neuesteDrei);
            } 
            else if (ansicht === 'support') {
                if(linkSupport) linkSupport.classList.add('active');
                catalogContent.style.display = 'none';
                if(supportContent) supportContent.style.display = 'block';
                if(sidebar) sidebar.style.display = 'none';
                if(searchWrapper) {
                    searchWrapper.style.opacity = '0';
                    searchWrapper.style.pointerEvents = 'none';
                }
            }
        }
        linkKatalog.addEventListener('click', (e) => { e.preventDefault(); wechsleAnsicht('katalog'); });
        linkNeuheiten.addEventListener('click', (e) => { e.preventDefault(); wechsleAnsicht('neuheiten'); });
        linkSupport.addEventListener('click', (e) => { e.preventDefault(); wechsleAnsicht('support'); });
    }
});


