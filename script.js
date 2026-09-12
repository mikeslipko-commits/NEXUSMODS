document.addEventListener("DOMContentLoaded", () => {
    let alleProdukte = [];
    let aktuelleKategorie = 'alle'; // Speichert die aktuell gewählte Kategorie

    // 1. Daten aus der JSON-Datei laden
    fetch('produkte.json')
        .then(response => response.json())
        .then(data => {
            alleProdukte = data;
            rendereProdukte(alleProdukte); // Beim Start alle anzeigen
            setupFilter();                 // Filter aktivieren
            setupSuche();                  // Suchleiste aktivieren
        })
        .catch(error => console.error("Fehler beim Laden der Produkte:", error));

    // 2. Funktion, die das HTML exakt nach deinem Design baut
    function rendereProdukte(produkte) {
        const container = document.getElementById('produkt-container');
        if (!container) return;
        
        container.innerHTML = ''; // Container leeren

        // Aktualisiert die Anzeige der Produktanzahl oben in der Statusleiste
        const anzahlSpan = document.getElementById('produkt-anzahl');
        if (anzahlSpan) {
            anzahlSpan.innerHTML = `Zeige <span>${produkte.length} exklusive${produkte.length === 1 ? 'r' : ''} Artikel</span>`;
        }

        produkte.forEach(item => {
            // Prüfen, ob ein Bild vorhanden ist oder ein Text-Platzhalter genutzt werden soll
            let mediaInhalt = '';
            if (item.bild) {
                mediaInhalt = `<img src="${item.bild}" alt="${item.titel}" class="card-media-image">`;
            } else {
                mediaInhalt = `<span class="card-media-label">${item.platzhalter_text}</span>`;
            }

            // Die exakte HTML-Struktur aus deinem Editor nachbauen
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
                        <a href="#" class="btn-action">Details & Download</a>
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
                // Aktiven Button optisch hervorheben
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Kategorie speichern
                aktuelleKategorie = button.getAttribute('data-kategorie');
                
                // Suchfeld leeren, wenn man die Kategorie wechselt
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

    // 4. NEU: Logik für die Suchleiste oben
    function setupSuche() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const suchBegriff = e.target.value.toLowerCase().trim();

            // Schritt A: Erst nach Kategorie filtern
            let ergebnis = alleProdukte;
            if (aktuelleKategorie !== 'alle') {
                ergebnis = alleProdukte.filter(p => p.kategorie === aktuelleKategorie);
            }

            // Schritt B: Dann nach dem Suchbegriff in Titel oder Beschreibung filtern
            if (suchBegriff !== '') {
                ergebnis = ergebnis.filter(p => {
                    const titelPasst = p.titel.toLowerCase().includes(suchBegriff);
                    const beschreibungPasst = p.beschreibung.toLowerCase().includes(suchBegriff);
                    return titelPasst || beschreibungPasst;
                });
            }

            // Ergebnis anzeigen
            rendereProdukte(ergebnis);
        });
    }
});
