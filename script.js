/**
     * Decodifica i dati binari di un file .ani (RIFF/ACON) 
     * ed estrae fotogrammi, sequenze e durata.
     */
    function parseAni(arrayBuffer) {
        const view = new DataView(arrayBuffer);

        function readStr(off) {
            return String.fromCharCode(view.getUint8(off), view.getUint8(off + 1), view.getUint8(off + 2), view.getUint8(off + 3));
        }

        if (readStr(0) !== 'RIFF' || readStr(8) !== 'ACON') {
            throw new Error("Il file selezionato non è un file .ani valido.");
        }

        let offset = 12;
        let defaultRate = 10;
        let cSteps = 0;
        let rate = [];
        let seq = [];
        const images = [];

        while (offset < arrayBuffer.byteLength - 8) {
            const id = readStr(offset);
            const size = view.getUint32(offset + 4, true);
            const chunkStart = offset + 8;

            if (id === 'anih') {
                cSteps = view.getUint32(chunkStart + 8, true);
                defaultRate = view.getUint32(chunkStart + 24, true);
            }
            else if (id === 'rate') {
                for (let i = 0; i < size; i += 4) {
                    rate.push(view.getUint32(chunkStart + i, true));
                }
            }
            else if (id === 'seq ') {
                for (let i = 0; i < size; i += 4) {
                    seq.push(view.getUint32(chunkStart + i, true));
                }
            }
            else if (id === 'LIST') {
                if (readStr(chunkStart) === 'fram') {
                    let listOff = chunkStart + 4;
                    const listEnd = chunkStart + size;
                    while (listOff < listEnd - 8) {
                        const subId = readStr(listOff);
                        const subSize = view.getUint32(listOff + 4, true);
                        if (subId === 'icon') {
                            images.push(new Uint8Array(arrayBuffer, listOff + 8, subSize));
                        }
                        listOff += 8 + subSize + (subSize % 2);
                    }
                }
            }
            offset += 8 + size + (size % 2);
        }

        if (rate.length === 0) rate = new Array(cSteps || images.length).fill(defaultRate);
        if (seq.length === 0) seq = Array.from({
            length: cSteps || images.length
        }, (_, i) => i);

        return {
            images,
            rate,
            seq
        };
    }

    /**
     * Converte i fotogrammi e la frequenza in regole CSS @keyframes
     */
    function generateAniCss(selector, aniData) {
        const JIFFIES_TO_MS = 1000 / 60; // 1 jiffie = ~16.67ms
        const totalJiffies = aniData.rate.reduce((a, b) => a + b, 0);
        const totalDurationMs = Math.round(totalJiffies * JIFFIES_TO_MS);

        let currentJiffies = 0;
        const keyframes = [];

        aniData.seq.forEach((frameIdx, i) => {
            const percent = (currentJiffies / totalJiffies) * 100;
            const bytes = aniData.images[frameIdx];

            // Convertiamo i byte della GIF/CUR in Base64
            let binary = '';
            for (let j = 0; j < bytes.byteLength; j++) {
                binary += String.fromCharCode(bytes[j]);
            }
            const base64 = window.btoa(binary);
            const dataUrl = `data:image/x-win-bitmap;base64,${base64}`;

            keyframes.push(`${percent.toFixed(2)}% { cursor: url("${dataUrl}"), auto; }`);
            currentJiffies += aniData.rate[i];
        });

        const animName = `ani-cursor-${Math.floor(Math.random() * 100000)}`;

        return `
		    @keyframes ${animName} {
		      ${keyframes.join('\n')}
		    }
		    ${selector}:hover {
		      animation: ${animName} ${totalDurationMs}ms step-end infinite !important;
		    }
		  `;
    }

    // Funzione principale di caricamento
    async function applyAniCursor(elementSelector, aniFileUrl) {
        try {
            const response = await fetch(aniFileUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Impossibile trovare il file '${aniFileUrl}'`);
            }

            const buffer = await response.arrayBuffer();
            const aniData = parseAni(buffer);
            const cssRules = generateAniCss(elementSelector, aniData);

            const styleTag = document.createElement('style');
            styleTag.textContent = cssRules;
            document.head.appendChild(styleTag);
            console.log("Cursore .ani caricato ed applicato con successo!");

        }
        catch (error) {
            console.error("Errore nell'applicazione del cursore:", error);
        }
    }

    // Esecuzione
    applyAniCursor('body', 'Assets/cursor.ani');


    function smDropFunc() {
        document.getElementById("extraDropdown").classList.remove("show");
        document.getElementById("smDropdown").classList.toggle("show");
    }

    function extraDropFunc() {
        document.getElementById("smDropdown").classList.remove("show");
        document.getElementById("extraDropdown").classList.toggle("show");
    }

    window.addEventListener('click', function(event) {
        // Se il click è dentro un dropdown, non fare nulla qui
        if (event.target.closest('.dropdown')) {
            return;
        }

        document
            .querySelectorAll('.dropdown-content')
            .forEach(dropdown => {
                dropdown.classList.remove('show');
            });
    });

    let isHomeActive = true;

    window.onload = () => {
        var r = document.querySelector(':root');
        var max = 0xbbbbbb;
        var min = 0x111121;
        r.style.setProperty('--color1', '#' + Math.round((max - min) * Math.random() + min).toString(16));
        r.style.setProperty('--color2', '#' + Math.round((max - min) * Math.random() + min).toString(16));
        r.style.setProperty('--color3', '#' + Math.round((max - min) * Math.random() + min).toString(16));
        r.style.setProperty('--color4', '#' + Math.round((max - min) * Math.random() + min).toString(16));
        r.style.setProperty('--color5', '#' + Math.round((max - min) * Math.random() + min).toString(16));


        const tab_switchers = document.querySelectorAll('[data-switcher]');

        // ========================================
        // STONE - CANVAS BACKGROUND
        // ========================================

        const canvas = document.getElementById("background-canvas");
        const ctx = canvas.getContext("2d");

        const stoneImage = new Image();

        let stoneX = 0;
        let stoneY = 0;

        let targetX = 0;
        let targetY = 0;

        let moving = false;


        // ========================================
        // RESIZE CANVAS
        // ========================================

        function resizeCanvas() {

            const dpr = window.devicePixelRatio || 1;

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        }


        // ========================================
        // POSIZIONE INIZIALE
        // ========================================

        function initializeStone() {

            stoneX = window.innerWidth / 2 - stoneImage.width / 2;
            stoneY = window.innerHeight / 2 - stoneImage.height / 2;

            targetX = stoneX;
            targetY = stoneY;

        }


        // ========================================
        // DISEGNA LA LUNA
        // ========================================

        function drawStone() {

            ctx.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            if (!isHomeActive) {
                return;
            }

            ctx.drawImage(
                stoneImage,
                stoneX,
                stoneY
            );
        }


        // ========================================
        // ANIMAZIONE
        // ========================================

        function animateStone() {

            if (moving) {

                const dx = targetX - stoneX;
                const dy = targetY - stoneY;

                stoneX += dx * 0.035;
                stoneY += dy * 0.035;


                if (
                    Math.abs(dx) < 0.5 &&
                    Math.abs(dy) < 0.5
                ) {

                    stoneX = targetX;
                    stoneY = targetY;

                    moving = false;

                }

            }

            drawStone();

            requestAnimationFrame(animateStone);

        }


        // ========================================
        // QUANDO ESCO DAL PNG
        // ========================================

        let mouseOverStone = false;

        document.addEventListener("mousemove", (event) => {

            const home = document.querySelector('.page[data-page="1"]');

            if (!home || !home.classList.contains('is-active')) {
                return;
            }

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const isInside =
                mouseX >= stoneX &&
                mouseX <= stoneX + stoneImage.width &&
                mouseY >= stoneY &&
                mouseY <= stoneY + stoneImage.height;

            if (isInside && !mouseOverStone) {
                mouseOverStone = true;
            }

            if (!isInside && mouseOverStone) {
                mouseOverStone = false;

                const maxX =
                    window.innerWidth - stoneImage.width;

                const maxY =
                    window.innerHeight - stoneImage.height;

                targetX =
                    Math.random() * Math.max(0, maxX);

                targetY =
                    Math.random() * Math.max(0, maxY);

                moving = true;
            }
        });


        // ========================================
        // CARICAMENTO PNG
        // ========================================

        stoneImage.onload = () => {

            resizeCanvas();

            initializeStone();

            animateStone();

        };


        stoneImage.onerror = () => {

            console.error(
                "Impossibile caricare Assets/Stone2-30.png"
            );

        };

        stoneImage.src = "Assets/Stone2-30.png";


        // ========================================
        // RESIZE
        // ========================================

        window.addEventListener("resize", () => {

            resizeCanvas();

        });

        tab_switchers.forEach(tab_switcher => {

            tab_switcher.addEventListener('click', (event) => {

                event.preventDefault();
                event.stopPropagation();

                const page_id = tab_switcher.dataset.tab;

                // Rimuove sempre lo stato attivo precedente
                document
                    .querySelectorAll('.tabs .tab.is-active, .dropbtn.is-active')
                    .forEach(element => {
                        element.classList.remove('is-active');
                    });

                // Se il link è dentro una tendina, attiva il bottone
                // principale della tendina, NON l'elemento selezionato.
                const dropdown = tab_switcher.closest('.dropdown');

                if (dropdown) {
                    const dropdownButton = dropdown.querySelector('.dropbtn');

                    if (dropdownButton) {
                        dropdownButton.classList.add('is-active');
                    }
                }
                else {
                    // Per Home, Credits e gli altri tab normali:
                    // mantiene il comportamento originale.
                    const tab = tab_switcher.closest('.tab');

                    if (tab) {
                        tab.classList.add('is-active');
                    }
                }

                SwitchPage(page_id);

                // Chiude i dropdown dopo la selezione
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            });
        });
    }

    function SwitchPage(page_id) {

        const current_page = document.querySelector(
            '.pages .page.is-active'
        );

        const next_page = document.querySelector(
            `.pages .page[data-page="${page_id}"]`
        );

        if (current_page) {
            current_page.classList.remove('is-active');
        }

        if (next_page) {
            next_page.classList.add('is-active');

            isHomeActive = page_id === "1";
        }
        else {
            console.error(
                `Pagina ${page_id} non trovata`
            );
        }
    }

    window.addEventListener("DOMContentLoaded", () => {
        const iframes = document.querySelectorAll('iframe');

        iframes.forEach(iframe => {
            const src = iframe.src;

            // Cerca gli URL di YouTube (esclude Streamable o altri)
            const match = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?]+)/);

            if (match && match[1]) {
                const videoId = match[1];
                // Genera l'URL della miniatura alla massima risoluzione
                const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
                const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                // Crea un documento HTML interno con la copertina e il tasto play
                const srcdoc = `
		                <style>
		                    * { padding: 0; margin: 0; overflow: hidden; box-sizing: border-box; }
		                    html, body { height: 100%; width: 100%; background: #000; }
		                    img, .play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
		                    img { width: 100%; height: 100%; object-fit: contain; }
		                    .play-btn { 
		                        font-size: 60px; 
		                        color: white; 
		                        text-shadow: 0 0 15px rgba(0,0,0,0.8); 
		                        cursor: pointer; 
		                        transition: color 0.2s;
		                        font-family: sans-serif;
		                    }
		                    .play-btn:hover { color: #da4f04; }
		                </style>
		                <a href="${src}${src.includes('?') ? '&' : '?'}autoplay=1">
		                    <img src="${thumbnail}" alt="YouTube Thumbnail" onload="if(this.naturalWidth <= 120 && !this.dataset.fallback){ this.dataset.fallback='1'; this.src='${fallbackThumbnail}'; }">
		                    <div class="play-btn">▶</div>
		                </a>
		            `;

                // Imposta l'attributo srcdoc e il lazy loading
                iframe.setAttribute('srcdoc', srcdoc);
                iframe.setAttribute('loading', 'lazy');
            }
        });
    });