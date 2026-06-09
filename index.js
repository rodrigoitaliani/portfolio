document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       0. LETTER GLITCH BACKGROUND
       ========================================== */
    const glitchCanvas = document.getElementById("bg-glitch-canvas");
    if (glitchCanvas) {
        const ctx = glitchCanvas.getContext("2d");
        
        let width, height, columns, rows;
        const fontSize = 18;
        const chars = "0123456789".split("");
        
        function resizeGlitch() {
            width = window.innerWidth;
            height = window.innerHeight;
            glitchCanvas.width = width;
            glitchCanvas.height = height;
            columns = Math.floor(width / fontSize) + 1;
            rows = Math.floor(height / fontSize) + 1;
        }
        
        window.addEventListener("resize", resizeGlitch);
        resizeGlitch();
        
        const grid = [];
        let lastTime = 0;
        const fps = 20;
        const interval = 1000 / fps;

        function drawGlitch(time) {
            requestAnimationFrame(drawGlitch);
            if (time - lastTime < interval) return;
            lastTime = time;

            ctx.clearRect(0, 0, width, height);
            ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;
            ctx.textAlign = "center";
            
            for (let x = 0; x < columns; x++) {
                if (!grid[x]) grid[x] = [];
                for (let y = 0; y < rows; y++) {
                    if (!grid[x][y]) {
                        grid[x][y] = {
                            char: chars[Math.floor(Math.random() * chars.length)],
                            opacity: Math.random() * 0.1
                        };
                    }
                    
                    // Mutate
                    if (Math.random() < 0.05) { 
                        grid[x][y].char = chars[Math.floor(Math.random() * chars.length)];
                    }
                    
                    // Glitch flash
                    if (Math.random() < 0.005) {
                        grid[x][y].opacity = Math.random() * 0.4 + 0.1;
                    }
                    
                    // Fade
                    grid[x][y].opacity -= 0.02;
                    if (grid[x][y].opacity <= 0.02) {
                        if (Math.random() < 0.01) {
                            grid[x][y].opacity = Math.random() * 0.15;
                        } else {
                            grid[x][y].opacity = 0.02;
                        }
                    }
                    
                    const op = grid[x][y].opacity;
                    ctx.fillStyle = `rgba(239, 68, 68, ${op})`;
                    ctx.fillText(grid[x][y].char, x * fontSize + fontSize/2, y * fontSize + fontSize);
                }
            }
        }
        
        requestAnimationFrame(drawGlitch);
    }

    /* ==========================================
       1. MOUSE FOLLOW GLOW EFFECT
       ========================================== */
    const cursorGlow = document.getElementById("cursor-glow");

    if (cursorGlow) {
        window.addEventListener("mousemove", (e) => {
            cursorGlow.style.setProperty("--mouse-x", `${e.clientX}px`);
            cursorGlow.style.setProperty("--mouse-y", `${e.clientY}px`);
        });
    }

    /* ==========================================
       2. CASE STUDIES & SHOWCASE DATA
       ========================================== */
    const projectsData = {
        redacao_youtube: {
            title: "Redação de YouTube",
            subtitle: "Esteira de Conteúdo 100% Autônoma",
            desc: "Uma redação inteira de YouTube (pesquisa, roteiro, voz sintética, visual e montagem) rodando sem intervenção humana, retroalimentada por análise de comentários.",
            image: "assets/tts_factory.png", // Usando o painel de exemplo
            techs: ["Python", "Playwright", "FFmpeg", "Gemini API"]
        },
        tts_factory: {
            title: "TTS Factory",
            subtitle: "Automação Desktop de Voz Realista por IA",
            desc: "Aplicativo desktop construído para otimizar pipelines de canais automatizados. Evita rate limits, elimina sussurros e processa roteiros gigantes em lote.",
            image: "assets/tts_factory.png",
            techs: ["Python", "PySide6", "Gemini TTS", "SQLite"]
        },
        narrator_bot: {
            title: "Narrator Bot",
            subtitle: "Automação de Voz no Google AI Studio",
            desc: "Robô de browser em Playwright para gerar narrações com login persistente, driblando seletores dinâmicos e configurando parâmetros ideais em segundos.",
            image: "assets/narrator_bot.png",
            techs: ["Python", "Playwright", "Google AI", "Automation"]
        },
        gerador_propostas: {
            title: "Gerador de Propostas",
            subtitle: "Automação de PDFs via Figma API",
            desc: "Painel web interativo para vendedores estruturarem escopos e orçamentos, gerando propostas comerciais prontas em PDF direto no Figma sem precisar de design.",
            image: "assets/gerador_propostas.png",
            techs: ["Python", "Figma API", "Cloud Panel", "Automation"]
        }
    };

    /* ==========================================
       3. INTERACTIVE STATE MANAGEMENT
       ========================================== */
    let currentProjectId = "redacao_youtube";
    let isCaseOpen = false;

    // Mobile = where the case reader becomes a full-screen overlay
    const mqMobile = window.matchMedia("(max-width: 1024px)");
    const isMobile = () => mqMobile.matches;

    const showcaseViewer = document.getElementById("showcase-viewer");
    const caseStudyReader = document.getElementById("case-study-reader");
    const articleContent = document.getElementById("reader-article-content");
    const middleCard = document.getElementById("card-showcase");

    const showcaseTitle = document.getElementById("showcase-title");
    const showcaseSubtitle = document.getElementById("showcase-subtitle");
    const showcaseDesc = document.getElementById("showcase-desc");
    const showcaseHeroImg = document.getElementById("showcase-hero-img");
    const openCaseBtn = document.getElementById("btn-open-case");
    const closeCaseBtn = document.getElementById("btn-close-case");

    const wavesAnim = document.getElementById("waves-anim");
    const metaContainer = document.querySelector(".showcase-meta");
    const projectItems = document.querySelectorAll(".project-item");

    /**
     * Swaps the showcase preview layout content
     * @param {string} projectId
     */
    function updateShowcaseContent(projectId) {
        const data = projectsData[projectId];
        if (!data) return;

        showcaseViewer.style.opacity = "0.3";
        showcaseViewer.style.transform = "scale(0.99)";

        setTimeout(() => {
            showcaseTitle.textContent = data.title;
            showcaseSubtitle.textContent = data.subtitle;
            showcaseDesc.textContent = data.desc;
            showcaseHeroImg.src = data.image;
            showcaseHeroImg.alt = `${data.title} UI Mockup`;

            openCaseBtn.setAttribute("data-current-project", projectId);

            // Audio wave visual no longer specifically for tts_factory
            if (wavesAnim) {
                wavesAnim.style.display = "none";
            }

            if (metaContainer) {
                metaContainer.innerHTML = "";
                data.techs.forEach(tech => {
                    const pill = document.createElement("span");
                    pill.className = "meta-pill";
                    pill.textContent = tech;
                    metaContainer.appendChild(pill);
                });
            }

            showcaseViewer.style.opacity = "1";
            showcaseViewer.style.transform = "scale(1)";
        }, 200);
    }

    /**
     * Injects the case study article and switches view to reader
     * @param {string} projectId
     */
    function openCaseStudy(projectId) {
        const template = document.getElementById(`template-case-${projectId}`);
        if (!template) return;

        const clone = template.content.cloneNode(true);
        articleContent.innerHTML = "";
        articleContent.appendChild(clone);

        showcaseViewer.style.display = "none";
        caseStudyReader.style.display = "flex";
        middleCard.classList.add("reader-active");

        const articleScrollArea = document.querySelector(".reader-article");
        if (articleScrollArea) {
            articleScrollArea.scrollTop = 0;
        }

        // On mobile the reader is a full-screen overlay: lock page scroll
        if (isMobile()) {
            document.body.classList.add("case-open");
        }

        isCaseOpen = true;
    }

    /**
     * Closes the reader and returns to featured project overview
     */
    function closeCaseStudy() {
        caseStudyReader.style.display = "none";
        showcaseViewer.style.display = "flex";
        middleCard.classList.remove("reader-active");
        document.body.classList.remove("case-open");
        isCaseOpen = false;
    }

    /* ==========================================
       4. EVENT LISTENERS — SHOWCASE
       ========================================== */
    if (openCaseBtn) {
        openCaseBtn.addEventListener("click", () => {
            const projId = openCaseBtn.getAttribute("data-current-project") || currentProjectId;
            openCaseStudy(projId);
        });
    }

    if (closeCaseBtn) {
        closeCaseBtn.addEventListener("click", closeCaseStudy);
    }

    projectItems.forEach(item => {
        item.addEventListener("click", () => {
            const projectId = item.getAttribute("data-project-id");
            if (!projectId) return;

            currentProjectId = projectId;

            projectItems.forEach(el => el.classList.remove("active"));
            item.classList.add("active");

            updateShowcaseContent(projectId);

            if (isMobile()) {
                // On mobile, tapping a list item opens the case directly
                // (the showcase preview sits above the list, out of view)
                openCaseStudy(projectId);
            } else if (isCaseOpen) {
                // Desktop: if reader is open, swap case study in real-time
                openCaseStudy(projectId);
            }
        });
    });

    // If the viewport crosses the mobile threshold while a case is open,
    // keep the body scroll-lock state consistent.
    mqMobile.addEventListener("change", () => {
        if (!isMobile()) {
            document.body.classList.remove("case-open");
        } else if (isCaseOpen) {
            document.body.classList.add("case-open");
        }
    });

    if (showcaseViewer) {
        showcaseViewer.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    }

    /* ==========================================
       5. TESTIMONIALS LIGHTBOX
       Clicking a filled testimonial frame opens it enlarged.
       ========================================== */
    const gallery = document.getElementById("testi-gallery");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");

    function openLightbox(src, alt) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || "Depoimento ampliado";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImg.src = "";
    }

    if (gallery) {
        gallery.addEventListener("click", (e) => {
            const frame = e.target.closest(".testi-frame");
            if (!frame || frame.classList.contains("is-empty")) return;
            const img = frame.querySelector("img");
            if (img) openLightbox(img.src, img.alt);
        });
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });

    /* ==========================================
       6. PREMIUM BUTTONS MATRIX CANVAS (MODULAR)
       ========================================== */
    function initButtonMatrix() {
        const premiumButtons = document.querySelectorAll(".btn-premium");
        
        premiumButtons.forEach(button => {
            const canvas = button.querySelector(".btn-matrix-canvas");
            if (!canvas) return;
            const ctx = canvas.getContext("2d");

            // Look up color from CSS variables (e.g. --matrix-rgb)
            // This allows Red button to be red and Green button to be green naturally!
            const rgbColor = getComputedStyle(button).getPropertyValue("--matrix-rgb").trim() || "239, 68, 68";

            let animationFrameId = null;
            let isHovered = false;

            // Grid properties
            const cellSize = 3.5; // size of each matrix square
            const gap = 3;      // gap between squares
            let cols = 0;
            let rows = 0;
            let grid = [];

            function resizeCanvas() {
                const rect = button.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;

                cols = Math.ceil(canvas.width / (cellSize + gap));
                rows = Math.ceil(canvas.height / (cellSize + gap));

                grid = [];
                for (let c = 0; c < cols; c++) {
                    grid[c] = [];
                    for (let r = 0; r < rows; r++) {
                        grid[c][r] = {
                            opacity: 0,
                            targetOpacity: 0,
                            offsetX: 0,
                            offsetY: 0
                        };
                    }
                }
            }

            resizeCanvas();
            
            // Use ResizeObserver for accurate size tracking
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => resizeCanvas());
                resizeObserver.observe(button);
            } else {
                window.addEventListener("resize", resizeCanvas);
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Update grid squares
                for (let c = 0; c < cols; c++) {
                    for (let r = 0; r < rows; r++) {
                        const cell = grid[c][r];

                        // Blinking slowly
                        if (Math.random() < 0.008) {
                            cell.targetOpacity = Math.random() < 0.25 ? Math.random() * 0.95 : 0;
                        }

                        // Smooth interpolation for slow blinking
                        cell.opacity += (cell.targetOpacity - cell.opacity) * 0.04;

                        // Shift squares slightly to make them "change places"
                        if (Math.random() < 0.003) {
                            cell.offsetX = (Math.random() - 0.5) * 1.5;
                            cell.offsetY = (Math.random() - 0.5) * 1.5;
                        }

                        if (cell.opacity > 0.01) {
                            const x = c * (cellSize + gap) + gap/2 + cell.offsetX;
                            const y = r * (cellSize + gap) + gap/2 + cell.offsetY;

                            // Vignette mask effect (stronger towards the border)
                            const centerX = canvas.width / 2;
                            const centerY = canvas.height / 2;
                            const dx = x - centerX;
                            const dy = y - centerY;
                            const distance = Math.sqrt(dx*dx + dy*dy);
                            const maxDistance = Math.sqrt(centerX*centerX + centerY*centerY);
                            const vignetteFactor = 0.25 + 0.75 * (distance / maxDistance); // edge-bias

                            const finalOpacity = cell.opacity * vignetteFactor;

                            ctx.fillStyle = `rgba(${rgbColor}, ${finalOpacity})`;
                            ctx.fillRect(x, y, cellSize, cellSize);
                        }
                    }
                }

                if (isHovered) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    // Fade out grid slowly when mouse leaves
                    let active = false;
                    for (let c = 0; c < cols; c++) {
                        for (let r = 0; r < rows; r++) {
                            grid[c][r].targetOpacity = 0;
                            grid[c][r].opacity += (0 - grid[c][r].opacity) * 0.08;
                            if (grid[c][r].opacity > 0.01) {
                                active = true;
                            }
                        }
                    }

                    // Redraw grid fading out
                    for (let c = 0; c < cols; c++) {
                        for (let r = 0; r < rows; r++) {
                            const cell = grid[c][r];
                            if (cell.opacity > 0.01) {
                                const x = c * (cellSize + gap) + gap/2 + cell.offsetX;
                                const y = r * (cellSize + gap) + gap/2 + cell.offsetY;
                                
                                const centerX = canvas.width / 2;
                                const centerY = canvas.height / 2;
                                const dx = x - centerX;
                                const dy = y - centerY;
                                const distance = Math.sqrt(dx*dx + dy*dy);
                                const maxDistance = Math.sqrt(centerX*centerX + centerY*centerY);
                                const vignetteFactor = 0.25 + 0.75 * (distance / maxDistance);

                                ctx.fillStyle = `rgba(${rgbColor}, ${cell.opacity * vignetteFactor * 0.6})`;
                                ctx.fillRect(x, y, cellSize, cellSize);
                            }
                        }
                    }

                    if (active) {
                        animationFrameId = requestAnimationFrame(animate);
                    } else {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                }
            }

            button.addEventListener("mouseenter", () => {
                isHovered = true;
                // Seed random target opacities to start the effect instantly
                for (let c = 0; c < cols; c++) {
                    for (let r = 0; r < rows; r++) {
                        if (Math.random() < 0.35) {
                            grid[c][r].targetOpacity = Math.random() * 0.9;
                        }
                    }
                }
                if (!animationFrameId) {
                    animate();
                }
            });

            button.addEventListener("mouseleave", () => {
                isHovered = false;
            });
        });
    }

    initButtonMatrix();

    /* ==========================================
       7. FLOATING QUICK-CONTACT (SPEED-DIAL)
       ========================================== */
    const fab = document.getElementById("fab-contact");
    const fabToggle = document.getElementById("fab-toggle");

    if (fab && fabToggle) {
        const setFab = (open) => {
            fab.classList.toggle("is-open", open);
            fabToggle.setAttribute("aria-expanded", open ? "true" : "false");
        };

        fabToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            setFab(!fab.classList.contains("is-open"));
        });

        // Tapping an action closes the menu; close on outside tap / Escape
        fab.querySelectorAll(".fab-action").forEach((a) => {
            a.addEventListener("click", () => setFab(false));
        });
        document.addEventListener("click", (e) => {
            if (fab.classList.contains("is-open") && !fab.contains(e.target)) {
                setFab(false);
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") setFab(false);
        });
    }
});
