document.addEventListener("DOMContentLoaded", () => {

    // Respect users who prefer reduced motion (accessibility)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ==========================================
       0. LETTER GLITCH BACKGROUND
       ========================================== */
    const glitchCanvas = document.getElementById("bg-glitch-canvas");
    if (glitchCanvas && !prefersReducedMotion) {
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
            if (document.hidden) return; // don't burn CPU on background tabs
            if (time - lastTime < interval) return;
            lastTime = time;

            ctx.clearRect(0, 0, width, height);
            ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
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
            image: "assets/narrator_bot.webp",
            techs: ["Python", "Playwright", "FFmpeg", "Gemini API"]
        },
        tts_factory: {
            title: "TTS Factory",
            subtitle: "Automação Desktop de Voz Realista por IA",
            desc: "Aplicativo desktop construído para otimizar pipelines de canais automatizados. Evita rate limits, elimina sussurros e processa roteiros gigantes em lote.",
            image: "assets/tts_factory.webp",
            techs: ["Python", "PySide6", "Gemini TTS", "SQLite"]
        },
        agente_sdr: {
            title: "Agente de Voz IA",
            subtitle: "Qualificação, Agenda e Follow-up",
            desc: "Agente autônomo que realiza chamadas telefônicas para novos leads em menos de 5 minutos, qualificando com RAG, agendando com Round-Robin e gerenciando WhatsApp.",
            image: "assets/agente_sdr.webp",
            techs: ["Vapi.ai", "n8n", "Python", "WhatsApp API"]
        },
        gerador_propostas: {
            title: "Gerador de Propostas",
            subtitle: "Automação de PDFs via Figma API",
            desc: "Painel web interativo para vendedores estruturarem escopos e orçamentos, gerando propostas comerciais prontas em PDF direto no Figma sem precisar de design.",
            image: "assets/gerador_propostas.webp",
            techs: ["Python", "Figma API", "Cloud Panel", "Automation"]
        },
        recuperador_vendas: {
            title: "Recuperador de Vendas",
            subtitle: "Negociador Virtual de Carrinho Abandonado",
            desc: "Sistema de recuperação inteligente via WhatsApp conectado à Hotmart/Stripe. Identifica motivos de falha de pagamento e negocia alternativas sem spammar o cliente.",
            image: "assets/recuperador_vendas.webp",
            techs: ["n8n", "Supabase", "Evolution API", "Gemini"]
        },
        ia_suporte_upsell: {
            title: "Triagem & Upsell por IA",
            subtitle: "Classificador de WhatsApp e Handoff Comercial",
            desc: "Agente de atendimento híbrido que resolve dúvidas recorrentes usando RAG e Whisper, identificando oportunidades de upsell e escalando leads quentes para vendedores.",
            image: "assets/ia_suporte_upsell.webp",
            techs: ["LangChain", "Pinecone", "Evolution API", "Whisper"]
        }
    };

    /* ==========================================
       3. INTERACTIVE STATE MANAGEMENT
       ========================================== */
    let currentProjectId = "agente_sdr";
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

    // A caixa do hero adota a proporção exata de cada imagem (sem corte, sem sobra)
    if (showcaseHeroImg) {
        const fitHeroBox = () => {
            if (!showcaseHeroImg.naturalWidth || !showcaseHeroImg.naturalHeight) return;
            const box = showcaseHeroImg.closest(".showcase-visual");
            if (box) box.style.aspectRatio = showcaseHeroImg.naturalWidth + " / " + showcaseHeroImg.naturalHeight;
        };
        showcaseHeroImg.addEventListener("load", fitHeroBox);
        if (showcaseHeroImg.complete) fitHeroBox();
    }

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

        // Inject zoom wrappers for images in the article
        const articleImages = clone.querySelectorAll('img:not(.ios-avatar)');
        articleImages.forEach(img => {
            const wrapper = document.createElement('div');
            wrapper.className = 'img-zoom-wrapper';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            const btn = document.createElement('div');
            btn.className = 'zoom-overlay-btn';
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
            wrapper.appendChild(btn);
        });

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
        // Keyboard accessibility: items are divs, so expose them as buttons
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");

        const activateItem = () => {
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
        };

        item.addEventListener("click", activateItem);
        item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                activateItem();
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
       5. TESTIMONIALS CAROUSEL + LIGHTBOX
       Carrossel rotatório: slide central em foco,
       laterais com fade, setas e clique para navegar.
       ========================================== */
    const testiStage = document.getElementById("testi-stage");
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

    if (testiStage) {
        const slides = Array.from(testiStage.querySelectorAll(".testi-slide"));
        const prevBtn = document.getElementById("testi-prev");
        const nextBtn = document.getElementById("testi-next");
        const total = slides.length;
        let centerIndex = 0;

        function renderCarousel() {
            slides.forEach((slide, i) => {
                slide.classList.remove("is-center", "is-left", "is-right");
                const offset = (i - centerIndex + total) % total;

                if (offset === 0) {
                    slide.classList.add("is-center");
                } else if (offset === 1) {
                    slide.classList.add("is-right");
                } else if (offset === total - 1 && total > 2) {
                    slide.classList.add("is-left");
                }
                // Demais slides ficam no estado base (escondidos atrás, com fade total)
            });
        }

        function rotate(direction) {
            centerIndex = (centerIndex + direction + total) % total;
            renderCarousel();
        }

        if (prevBtn) prevBtn.addEventListener("click", () => rotate(-1));
        if (nextBtn) nextBtn.addEventListener("click", () => rotate(1));

        // Clique nos slides: lateral navega, central abre o lightbox (se tiver imagem)
        testiStage.addEventListener("click", (e) => {
            const slide = e.target.closest(".testi-slide");
            if (!slide) return;

            if (slide.classList.contains("is-left")) {
                rotate(-1);
            } else if (slide.classList.contains("is-right")) {
                rotate(1);
            } else if (slide.classList.contains("is-center") && !slide.classList.contains("is-empty")) {
                const img = slide.querySelector("img");
                if (img) openLightbox(img.src, img.alt);
            }
        });

        // Navegação por teclado quando o carrossel está em foco
        const carousel = document.getElementById("testi-carousel");
        if (carousel) {
            carousel.setAttribute("tabindex", "0");
            carousel.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") { e.preventDefault(); rotate(-1); }
                if (e.key === "ArrowRight") { e.preventDefault(); rotate(1); }
            });
        }

        // Suporte a swipe no touch
        let touchStartX = null;
        testiStage.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        testiStage.addEventListener("touchend", (e) => {
            if (touchStartX === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) rotate(deltaX < 0 ? 1 : -1);
            touchStartX = null;
        }, { passive: true });

        renderCarousel();
    }

    document.addEventListener("click", (e) => {
        const zoomWrapper = e.target.closest('.img-zoom-wrapper');
        if (zoomWrapper) {
            const img = zoomWrapper.querySelector('img');
            if (img) openLightbox(img.src, img.alt);
        }
    });

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
        if (prefersReducedMotion) return; // skip decorative canvas animations
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
