/**
 * Motion Portfolio — Main interactions
 * GSAP animations, custom cursor, particles, theme, navigation
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /* ---- Preloader ---- */
    function initPreloader() {
        document.body.classList.add('loading');
        const preloader = document.getElementById('preloader');

        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.classList.remove('loading');
                initHeroAnimation();
            }, prefersReducedMotion ? 0 : 1800);
        });
    }

    /* ---- Theme ---- */
    function initTheme() {
        const toggle = document.getElementById('theme-toggle');
        const saved = localStorage.getItem('theme');
        const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', theme);

        toggle.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    /* ---- Custom Cursor ---- */
    function initCursor() {
        if (isTouchDevice || prefersReducedMotion) return;

        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-tag, .magnetic');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
    }

    /* ---- Magnetic Elements ---- */
    function initMagnetic() {
        if (isTouchDevice || prefersReducedMotion) return;

        document.querySelectorAll('.magnetic').forEach((el) => {
            const strength = parseFloat(el.dataset.strength) || 0.3;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ---- Particle Canvas ---- */
    function initParticles() {
        if (prefersReducedMotion) return;

        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;
        let animationId;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        function createParticles() {
            const count = Math.min(Math.floor(w * h / 12000), 80);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const color = isLight ? '254, 86, 50' : '254, 86, 50';

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / 120)})`;
                        ctx.stroke();
                    }
                }
            });

            animationId = requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            /* redraw picks up new theme on next frame */
        });
    }

    /* ---- GSAP Animations ---- */
    function initHeroAnimation() {
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            document.querySelectorAll('.reveal, .hero-title .word').forEach((el) => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        gsap.set('.hero-badge, .hero-subtitle, .hero-cta, .hero-stats, .hero-visual', {
            opacity: 0,
            y: 30
        });

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.to('.hero-title .word', {
            y: 0,
            duration: 1.2,
            stagger: 0.08
        })
        .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
        .to('.hero-visual', { opacity: 1, y: 0, duration: 1 }, '-=0.8');
    }

    function initScrollAnimations() {
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            document.querySelectorAll('.reveal').forEach((el) => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        gsap.utils.toArray('.reveal').forEach((el) => {
            if (el.closest('#home')) return;

            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out'
            });
        });
    }

    function initCounterAnimation() {
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            document.querySelectorAll('.stat-number').forEach((el) => {
                el.textContent = el.dataset.count;
            });
            return;
        }

        document.querySelectorAll('.stat-number').forEach((el) => {
            const target = parseInt(el.dataset.count, 10);
            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    gsap.to(el, {
                        innerText: target,
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    /* ---- Header scroll ---- */
    function initHeader() {
        const header = document.querySelector('.site-header');
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -40% 0px' });

        sections.forEach((section) => observer.observe(section));
    }

    /* ---- Mobile menu ---- */
    function initMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const navLinks = document.getElementById('nav-links');

        toggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ---- Project card tilt ---- */
    function initTilt() {
        if (isTouchDevice || prefersReducedMotion) return;

        document.querySelectorAll('[data-tilt]').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const inner = card.querySelector('.project-card-inner');
                inner.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                const inner = card.querySelector('.project-card-inner');
                inner.style.transform = '';
            });
        });
    }

    /* ---- Testimonials slider ---- */
    function initTestimonials() {
        const track = document.getElementById('testimonial-track');
        const dotsContainer = document.getElementById('testimonial-dots');
        const cards = track.querySelectorAll('.testimonial-card');
        let current = 0;
        let autoplayInterval;

        function getVisibleCount() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - getVisibleCount());
        }

        function goTo(index) {
            current = Math.max(0, Math.min(index, getMaxIndex()));
            const cardWidth = cards[0].offsetWidth + 24;
            track.style.transform = `translateX(-${current * cardWidth}px)`;
            dotsContainer.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
            });
        }

        const maxDots = cards.length;
        for (let i = 0; i < maxDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => {
                goTo(i);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            if (!prefersReducedMotion) {
                autoplayInterval = setInterval(() => {
                    goTo(current >= getMaxIndex() ? 0 : current + 1);
                }, 5000);
            }
        }

        window.addEventListener('resize', () => goTo(current));
        resetAutoplay();
    }

    /* ---- Smooth anchor scroll ---- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const id = anchor.getAttribute('href');
                if (id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
    }

    /* ---- Init ---- */
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initTheme();
        initCursor();
        initMagnetic();
        initParticles();
        initHeader();
        initMobileMenu();
        initTilt();
        initTestimonials();
        initSmoothScroll();

        if (!prefersReducedMotion) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    initScrollAnimations();
                    initCounterAnimation();
                }, prefersReducedMotion ? 0 : 2000);
            });
        } else {
            initScrollAnimations();
            initCounterAnimation();
        }
    });
})();
