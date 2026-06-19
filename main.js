/**
 * Portfolio — Inter + Lithos spotlight hero
 * Vanilla JS for GitHub Pages
 */

(function () {
    'use strict';

    const SPOTLIGHT_R = 260;
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
            }, prefersReducedMotion ? 0 : 1200);
        });
    }

    /* ---- Cursor spotlight reveal (Lithos mechanic) ---- */
    function initSpotlight() {
        const reveal = document.getElementById('hero-reveal');
        const canvas = document.getElementById('spotlight-canvas');
        if (!reveal || !canvas) return;

        const ctx = canvas.getContext('2d');
        const mouse = { x: -999, y: -999 };
        const smooth = { x: -999, y: -999 };
        let rafId = null;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function applyMask(x, y) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_R);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
            gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
            gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2);
            ctx.fill();

            const dataUrl = canvas.toDataURL();
            reveal.style.maskImage = `url(${dataUrl})`;
            reveal.style.webkitMaskImage = `url(${dataUrl})`;
        }

        function tick() {
            smooth.x += (mouse.x - smooth.x) * 0.1;
            smooth.y += (mouse.y - smooth.y) * 0.1;
            applyMask(smooth.x, smooth.y);
            rafId = requestAnimationFrame(tick);
        }

        function onMouseMove(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }

        function onTouchMove(e) {
            if (e.touches.length) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if (prefersReducedMotion) {
            reveal.style.opacity = '0.85';
            reveal.style.maskImage = 'none';
            reveal.style.webkitMaskImage = 'none';
            return;
        }

        window.addEventListener('mousemove', onMouseMove);
        if (isTouchDevice) {
            window.addEventListener('touchmove', onTouchMove, { passive: true });
        }

        tick();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', resizeCanvas);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }

    /* ---- GSAP scroll reveals ---- */
    function initScrollAnimations() {
        if (prefersReducedMotion || typeof gsap === 'undefined') {
            document.querySelectorAll('.reveal').forEach((el) => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.reveal').forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out'
            });
        });
    }

    /* ---- Nav scroll + active section ---- */
    function initNav() {
        const nav = document.getElementById('hero-nav');
        const links = document.querySelectorAll('.nav-pill-link, .mobile-nav-link');
        const sections = document.querySelectorAll('section[id]');
        const hero = document.getElementById('home');

        window.addEventListener('scroll', () => {
            if (!hero) return;
            const heroBottom = hero.offsetTop + hero.offsetHeight;
            nav.classList.toggle('nav-scrolled', window.scrollY > heroBottom - 80);
        }, { passive: true });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    links.forEach((link) => {
                        const href = link.getAttribute('href');
                        link.classList.toggle('nav-pill-link--active', href === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px' });

        sections.forEach((section) => observer.observe(section));
    }

    /* ---- Mobile menu ---- */
    function initMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const drawer = document.getElementById('mobile-nav');

        toggle.addEventListener('click', () => {
            const isOpen = drawer.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        drawer.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                drawer.classList.remove('open');
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
                inner.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.querySelector('.project-card-inner').style.transform = '';
            });
        });
    }

    /* ---- Testimonials slider ---- */
    function initTestimonials() {
        const track = document.getElementById('testimonial-track');
        const dotsContainer = document.getElementById('testimonial-dots');
        if (!track || !dotsContainer) return;

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

        for (let i = 0; i < cards.length; i++) {
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
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
    }

    /* ---- Init ---- */
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initSpotlight();
        initNav();
        initMobileMenu();
        initTilt();
        initTestimonials();
        initSmoothScroll();

        window.addEventListener('load', () => {
            setTimeout(initScrollAnimations, prefersReducedMotion ? 0 : 1300);
        });
    });
})();
