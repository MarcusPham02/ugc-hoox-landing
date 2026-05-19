/**
 * UGC Rights - Scroll Reveal Animations
 * Handles scroll-triggered animations using Intersection Observer API
 */

(function() {
  'use strict';

  // ========== CONFIGURATION ==========
  const config = {
    threshold: 0.15,        // Trigger when 15% of element is visible
    rootMargin: '0px',      // No offset
    once: true              // Only animate once (set to false to animate every time)
  };

  // ========== INTERSECTION OBSERVER FOR SCROLL REVEALS ==========

  /**
   * Creates and initializes the Intersection Observer for reveal animations
   */
  function initScrollReveal() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported. Revealing all elements.');
      revealAllElements();
      return;
    }

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add 'active' class to trigger animation
          entry.target.classList.add('active');

          // If configured to animate only once, stop observing
          if (config.once) {
            observer.unobserve(entry.target);
          }
        } else {
          // If not 'once', remove active class when element leaves viewport
          if (!config.once) {
            entry.target.classList.remove('active');
          }
        }
      });
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    // Observe all elements with reveal classes
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right'
    );

    revealElements.forEach(element => {
      observer.observe(element);
    });

    console.log(`Observing ${revealElements.length} elements for scroll reveal`);
  }

  /**
   * Fallback function to reveal all elements if Intersection Observer is not supported
   */
  function revealAllElements() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right'
    );

    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }

  // ========== NAVIGATION SCROLL BEHAVIOR ==========

  /**
   * Handles navigation bar appearance on scroll
   */
  function initNavScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavBar() {
      const scrollY = window.scrollY;

      // Add 'scrolled' class when scrolled past 50px
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Optional: Hide nav on scroll down, show on scroll up
      // Uncomment the following if you want this behavior:
      /*
      if (scrollY > lastScrollY && scrollY > 200) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
      */

      lastScrollY = scrollY;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateNavBar);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick, { passive: true });

    // Initial check
    updateNavBar();
  }

  // ========== SMOOTH SCROLL FOR NAVIGATION LINKS ==========

  /**
   * Adds smooth scroll behavior to navigation links
   */
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Only handle hash links
        if (!href || !href.startsWith('#')) return;

        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Get header height for offset
          const header = document.getElementById('header');
          const headerHeight = header ? header.offsetHeight : 0;

          // Calculate scroll position
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          // Smooth scroll to target
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update active link
          updateActiveLink(link);

          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });
  }

  /**
   * Updates the active navigation link
   */
  function updateActiveLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    activeLink.classList.add('active');
  }

  /**
   * Highlights the current section in navigation based on scroll position
   */
  function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavigation() {
      const scrollY = window.scrollY;
      const header = document.getElementById('header');
      const headerHeight = header ? header.offsetHeight : 0;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');

            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    let scrollTicking = false;

    function requestHighlightTick() {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          highlightNavigation();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }

    window.addEventListener('scroll', requestHighlightTick, { passive: true });

    // Initial check
    highlightNavigation();
  }

  // ========== MOBILE MENU TOGGLE ==========

  /**
   * Handles mobile hamburger menu
   */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');

    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mainNav.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
      }
    });
  }

  /**
   * Closes the mobile menu
   */
  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');

    if (hamburger && mainNav) {
      hamburger.classList.remove('active');
      mainNav.classList.remove('active');
    }
  }

  // ========== SCROLL PROGRESS INDICATOR (OPTIONAL) ==========

  /**
   * Creates a scroll progress bar at the top of the page
   * Uncomment the call in init() to enable this feature
   */
  function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    document.body.appendChild(progressBar);

    function updateScrollProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

      progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
    }

    let progressTicking = false;

    function requestProgressTick() {
      if (!progressTicking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          progressTicking = false;
        });
        progressTicking = true;
      }
    }

    window.addEventListener('scroll', requestProgressTick, { passive: true });

    // Initial update
    updateScrollProgress();
  }

  // ========== FEATURE DECK (clone cards for seamless loop) ==========

  function initFeatureDeck() {
    const track = document.getElementById('deckTrack');
    if (!track) return;
    const originals = Array.from(track.children);
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  // ========== LANGUAGE SWITCHER ==========

  function initLangSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    const toggle = document.getElementById('langToggle');
    const menu = document.getElementById('langMenu');
    const current = document.getElementById('langCurrent');

    if (!switcher || !toggle || !menu || !current) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = switcher.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('.lang-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        menu.querySelectorAll('.lang-option').forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        current.textContent = opt.dataset.lang || 'EN';
        switcher.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========== INITIALIZATION ==========

  /**
   * Initialize all scroll and navigation features
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('Initializing scroll reveal and navigation features...');

    // Initialize features
    initScrollReveal();
    initNavScroll();
    initSmoothScroll();
    initActiveNavOnScroll();
    initMobileMenu();
    initLangSwitcher();
    initFeatureDeck();

    // Optional: Uncomment to enable scroll progress bar
    // initScrollProgress();

    console.log('Scroll reveal initialization complete!');
  }

  // Start initialization
  init();

})();
