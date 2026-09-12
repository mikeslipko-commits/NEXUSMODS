document.addEventListener("DOMContentLoaded", () => {
    let alleProdukte = [];
    let aktuelleKategorie = 'alle';

    // 1. Daten aus der JSON-Datei laden
    fetch(`produkte.json?v=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            alleProdukte = data;
            rendereProdukte(alleProdukte);
            setupFilter();
            setupSuche();
        })
        .catch(error => console.error("Fehler beim Laden der Produkte:", error));

    // 2. Funktion, die das HTML mit den neuen Elementen baut
    function rendereProdukte(produkte) {
        const container = document.getElementById('produkt-container');
        if (!container) return;
        
        container.innerHTML = '';

        const anzahlSpan = document.getElementById('produkt-anzahl');
        if (anzahlSpan) {
            anzahlSpan.innerHTML = `Zeige <span>${produkte.length} exklusive${produkte.length === 1 ? 'r' : ''} Artikel</span>`;
        }

        produkte.forEach(item => {
            let mediaInhalt = '';
            if (item.bild) {
                mediaInhalt = `<img src="${item.bild}" alt="${item.titel}" class="card-media-image">`;
            } else {
                mediaInhalt = `<span class="card-media-label">${item.platzhalter_text}</span>`;
            }

            // DYNAMISCHE ZUSÄTZE FÜR DIE NEUEN FUNKTIONEN:
            
            // A) Passwort-Bereich (Wird nur angezeigt, wenn ein Passwort existiert)
            let passwortHTML = '';
            if (item.passwort && item.passwort.trim() !== "") {
                passwortHTML = `
                    <div style="font-size: 12px; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px dashed rgba(251, 191, 36, 0.4); padding: 6px 10px; border-radius: 6px; margin-bottom: 12px; font-family: monospace; display: flex; justify-content: space-between; align-items: center;">
                        <span>🔑 PW: <strong>${item.passwort}</strong></span>
                        <span style="font-size: 10px; color: #9ca3af; cursor:pointer;" onclick="navigator.clipboard.writeText('${item.passwort}'); alert('Passwort kopiert!');">Kopieren</span>
                    </div>
                `;
            }

            // B) YouTube-Button (Wird nur angezeigt, wenn ein YouTube-Link existiert)
            let youtubeHTML = '';
            if (item.youtube_link && item.youtube_link.trim() !== "") {
                youtubeHTML = `
                    <a href="${item.youtube_link}" target="_blank" class="btn-action" style="background-color: rgba(225, 29, 72, 0.1); color: #e11d48; border-color: rgba(225, 29, 72, 0.3); margin-bottom: 8px;">
                        📺 Video-Vorschau
                    </a>
                `;
            }

            // Das fertige HTML-Template für die Karte
            const produktHTML = `
                <div class="product-card">
                    <div>
                        <div class="card-media">
                            ${mediaInhalt}
                            <div class="category-tag ${item.kategorie_klasse}">${item.kategorie_text}</div>
                            <div class="type-badge">${item.typ_badge}</div>
                        </div>
                        <div class="card-body">
                            <h4 class="product-title">${item.titel}</h4>
                            <p class="product-desc">${item.beschreibung}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="price-row">
                            <div class="price-box">
                                <span class="current-price">${item.preis}</span>
                                <span class="old-price">${item.alter_preis}</span>
                            </div>
                            <span class="free-tag">${item.free_tag}</span>
                        </div>
                        
                        <!-- Hier werden Passwort und YouTube dynamisch geladen -->
                        ${passwortHTML}
                        ${youtubeHTML}
                        
                        <!-- Download-Button leitet nun direkt auf den eingetragenen Link weiter -->
                        <a href="${item.download_link || '#'}" target="_blank" class="btn-action">Details & Download</a>
                    </div>
                </div>
            `;
            container.innerHTML += produktHTML;
        });
    }

    // 3. Logik für die Filter-Buttons links
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

    // 4. Logik für die Suchleiste oben
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
                    const titelPasst = p.titel.toLowerCase().includes(suchBegriff);
                    const beschreibungPasst = p.beschreibung.toLowerCase().includes(suchBegriff);
                    return titelPasst || beschreibungPasst;
                });
            }
            rendereProdukte(ergebnis);
        });
    }
});
