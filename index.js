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
        fourp: {
            title: "FOURP",
            subtitle: "Inteligência Comercial, Enriquecimento e Pipeline",
            desc: "Reestruturação do processo de prospecção e pipeline no Monday CRM para time comercial de grande porte, integrando Apollo, scoring e validação humana para atender contas como Panobianco e RH Expo.",
            image: "assets/fourp.webp",
            techs: ["Monday CRM", "Apollo.io", "Enriquecimento", "Python"]
        },
        ecorenova: {
            title: "EcoRenova",
            subtitle: "Geração de Demanda Industrial & ABM",
            desc: "Estratégia de LinkedIn Ads e remarketing institucional no Meta Ads para atração de indústrias, resultando na conquista de contas corporativas como a Piracanjuba.",
            image: "assets/ecorenova.webp",
            techs: ["LinkedIn Ads", "Meta Ads", "CRM", "GA4"]
        },
        momix: {
            title: "Momix Engenharia",
            subtitle: "Performance High-Ticket & Server-Side",
            desc: "Google Ads cirúrgico para obras pesadas aliado a GTM Server-Side na borda (Cloudflare) com deduplicação CAPI e qualificação prévia de leads no CRM.",
            image: "assets/momix.webp",
            techs: ["Google Ads", "Meta CAPI", "GTM Server-Side", "Cloudflare"]
        },
        pezzette_loro: {
            title: "Pezzette Loro",
            subtitle: "LinkedIn Ads Corporativo & Higienização",
            desc: "Campanhas no LinkedIn Ads para tomadores de decisão corporativos e camada de validação e enriquecimento de dados na entrada do formulário para o CRM.",
            image: "assets/pezzette_loro.webp",
            techs: ["LinkedIn Ads", "Google Ads", "CRM", "Data Hygiene"]
        }
    };

    /* ==========================================
       3. INTERACTIVE STATE MANAGEMENT
       ========================================== */
    let currentProjectId = "fourp";
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
    // A caixa do hero adota a proporção exata de cada imagem (sem corte, sem sobra)
    

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
    const lightboxClose = document.getElementById("lightbox-close");

    );



