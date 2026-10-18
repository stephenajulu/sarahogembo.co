/**
 * SARAH OGEMBO - LUXURY PERSONAL BRAND
 * Interactive Client-Side Engine with Scroll Reveal & Micro-Interactions
 * Accessible, High Performance, Zero Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Service Worker Registration (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    });
  }

  // 2. Sticky Header Scroll & Glass Blur Transition
  const header = document.querySelector('.site-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Scrollspy: Active Navigation Link Highlighting
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const trackedSections = document.querySelectorAll('section[id]');

  const updateScrollSpy = () => {
    const scrollPos = window.scrollY + 140;
    trackedSections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateScrollSpy, { passive: true });

  // 4. Scroll Reveal Animations (IntersectionObserver)
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // Select elements to reveal
    const revealElements = document.querySelectorAll(
      '[data-reveal], .service-card, .gallery-item, .stat-item, .difference-card, .showreel-card, .testimonials-card, .booking-form-card, .about-portrait-wrap, .about-bio, .personal-image-frame, .personal-content'
    );

    // Auto-assign stagger delays to card grids
    document.querySelectorAll('.services-grid, .gallery-grid').forEach((grid) => {
      Array.from(grid.children).forEach((child, idx) => {
        child.setAttribute('data-reveal', 'fade-up');
        child.style.transitionDelay = `${(idx % 4) * 0.12}s`;
      });
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    });

    revealElements.forEach((el) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'fade-up');
      }
      revealObserver.observe(el);
    });
  } else {
    // Fallback or reduced motion: reveal immediately
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
  }

  // 5. Stat Plaque Animated Counter Ticker
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0 && !prefersReducedMotion && 'IntersectionObserver' in window) {
    let statsAnimated = false;

    const animateNumber = (el) => {
      const rawText = el.textContent.trim();
      const match = rawText.match(/^([\d,\.]+)(.*)$/);
      if (!match) return;

      const numStr = match[1].replace(/,/g, '');
      const targetVal = parseFloat(numStr);
      const suffix = match[2] || '';
      const hasComma = match[1].includes(',');
      const duration = 1800; // ms
      const startTime = performance.now();

      el.classList.add('is-counting');

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuad curve: 1 - (1 - p) * (1 - p)
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        const currentVal = Math.floor(easeProgress * targetVal);

        const formatted = hasComma ? currentVal.toLocaleString() : currentVal;
        el.textContent = `${formatted}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          const finalFormatted = hasComma ? targetVal.toLocaleString() : targetVal;
          el.textContent = `${finalFormatted}${suffix}`;
          el.classList.remove('is-counting');
        }
      };

      requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statNumbers.forEach(animateNumber);
          observer.disconnect();
        }
      });
    }, { threshold: 0.25 });

    const statsPlaque = document.querySelector('.stats-plaque');
    if (statsPlaque) statsObserver.observe(statsPlaque);
  }

  // 6. Mobile Navigation Drawer Toggle, Backdrop Lock & Focus Management
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navBackdrop = document.querySelector('.nav-backdrop');

  const closeNav = () => {
    if (!navMenu) return;
    navMenu.classList.remove('open');
    mobileToggle?.classList.remove('open');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    if (!navMenu) return;
    navMenu.classList.add('open');
    mobileToggle?.classList.add('open');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close when tapping any link inside the mobile drawer
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    // Close when tapping backdrop overlay
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        closeNav();
      });
    }

    // Close when clicking outside of nav menu & toggle button
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeNav();
        mobileToggle.focus();
      }
    });

    // Close drawer automatically if viewport resized beyond mobile breakpoint (1024px)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('open')) {
        closeNav();
      }
    }, { passive: true });
  }

  // 6B. Navigation Dropdowns Keyboard, Focus & Touch Interaction
  const dropdownWrappers = document.querySelectorAll('.nav-item-dropdown');
  dropdownWrappers.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');

      // Close other open dropdowns
      dropdownWrappers.forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove('is-open');
          d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        trigger?.setAttribute('aria-expanded', 'false');
        trigger?.focus();
      }
    });
  });

  // Global close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      dropdownWrappers.forEach((d) => {
        d.classList.remove('is-open');
        d.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // 7. Testimonials Slider
  const slides = document.querySelectorAll('.test-slide');
  const dots = document.querySelectorAll('.test-dot');
  const prevBtn = document.querySelector('.test-prev');
  const nextBtn = document.querySelector('.test-next');
  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  if (slides.length > 0) {
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        resetAutoplay();
      });
    });

    function startAutoplay() {
      slideInterval = setInterval(nextSlide, 7000);
    }
    function resetAutoplay() {
      clearInterval(slideInterval);
      startAutoplay();
    }
    startAutoplay();
  }

  // 8. Modal Management with WCAG 2.1 AAA Focus Trapping & Restoration
  let lastActiveElement = null;

  function trapFocus(modalElement) {
    if (!modalElement) return;
    const focusableSelectors = 'button, [href], input, select, textarea, video, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modalElement.querySelectorAll(focusableSelectors);
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modalElement.onkeydown = function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
  }

  // 8A. Showreel Video Lightbox Modal
  const videoModal = document.getElementById('video-modal');
  const videoTriggers = document.querySelectorAll('.trigger-video-modal');
  const videoCloseBtn = document.querySelector('.video-modal-close');
  const videoIframe = document.getElementById('showreel-iframe');
  const videoPlayer = document.getElementById('showreel-video-player');
  const videoModalTitle = document.getElementById('video-modal-title');
  const defaultVideoSrc = '/videos/sarah-ogembo-showreel.mp4';
  const defaultVideoPoster = '/images/showreel-poster.jpg';

  function openVideoModal(triggerEl) {
    if (!videoModal) return;
    lastActiveElement = triggerEl || document.activeElement;

    const customUrl = triggerEl?.getAttribute('data-video-url');
    const customPoster = triggerEl?.getAttribute('data-video-poster');
    const customTitle = triggerEl?.getAttribute('data-video-title');

    if (videoModalTitle && customTitle) {
      videoModalTitle.textContent = customTitle;
    }

    if (videoPlayer) {
      const targetSrc = customUrl || defaultVideoSrc;
      const targetPoster = customPoster || defaultVideoPoster;
      let sourceEl = videoPlayer.querySelector('source');
      if (!sourceEl) {
        sourceEl = document.createElement('source');
        sourceEl.type = 'video/mp4';
        videoPlayer.appendChild(sourceEl);
      }
      sourceEl.src = targetSrc;
      videoPlayer.src = targetSrc;
      videoPlayer.poster = targetPoster;
      videoPlayer.load();
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (videoPlayer) {
      const playPromise = videoPlayer.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    trapFocus(videoModal);
    videoCloseBtn?.focus();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.currentTime = 0;
      const sourceEl = videoPlayer.querySelector('source');
      if (sourceEl) sourceEl.src = defaultVideoSrc;
      videoPlayer.src = defaultVideoSrc;
      videoPlayer.poster = defaultVideoPoster;
    }
    if (videoIframe) {
      const src = videoIframe.src;
      videoIframe.src = '';
      videoIframe.src = src;
    }
    if (videoModalTitle) {
      videoModalTitle.textContent = 'Sarah Ogembo Showreel Highlight Video';
    }
    lastActiveElement?.focus();
  }

  // Delegated click handler to guarantee all current and future triggers open the exact video
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.trigger-video-modal');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      openVideoModal(trigger);
    }
  });

  videoCloseBtn?.addEventListener('click', closeVideoModal);

  // 9. Gallery Lightbox Modal with Full-Archive Carousel Cycling
  const galleryModal = document.getElementById('gallery-modal');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const galleryCloseBtn = document.querySelector('.gallery-modal-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const allGalleryModal = document.getElementById('all-gallery-modal');
  const allGalleryCloseBtn = document.querySelector('.all-gallery-modal-close');

  // Collect all gallery items across the complete gallery
  let galleryItems = [];
  let currentGalleryIndex = 0;
  let openedFromAllGallery = false;
  let galleryHasDragged = false;

  const initGalleryItems = () => {
    // Prioritize stage gallery items from the dedicated #gallery section
    let tileElements = document.querySelectorAll('#stage-gallery-track .gallery-item, #gallery .gallery-item, .stage-gallery-grid .gallery-item');
    if (tileElements.length === 0) {
      tileElements = document.querySelectorAll('#all-gallery-modal .all-gallery-tile');
    }
    if (tileElements.length === 0) {
      tileElements = document.querySelectorAll('.gallery-item:not(.gallery-more-tile)');
    }
    
    galleryItems = Array.from(tileElements).map((el, idx) => {
      return {
        index: idx,
        image: el.getAttribute('data-image') || el.querySelector('img')?.currentSrc || el.querySelector('img')?.src || '',
        fallback: el.getAttribute('data-fallback') || el.getAttribute('data-image') || '',
        title: el.getAttribute('data-title') || el.querySelector('img')?.alt || 'Sarah Ogembo on Stage',
        caption: el.getAttribute('data-caption') || '',
        category: el.getAttribute('data-category') || 'Live Event',
        element: el
      };
    });
  };

  initGalleryItems();

  const updateLightboxContent = (index, animate = false) => {
    if (galleryItems.length === 0) initGalleryItems();
    if (galleryItems.length === 0) return;

    // Wrap-around bounds
    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
    }

    if (lightboxImg) {
      if (animate) {
        lightboxImg.classList.add('is-changing');
      }

      lightboxImg.onerror = function() {
        if (item.fallback && this.src !== item.fallback) {
          this.src = item.fallback;
        }
      };
      lightboxImg.src = item.image;
      lightboxImg.alt = item.title;

      if (animate) {
        setTimeout(() => {
          lightboxImg.classList.remove('is-changing');
        }, 120);
      }
    }

    if (lightboxCaption) {
      lightboxCaption.innerHTML = `
        <span class="lightbox-cat-badge">${item.category}</span>
        <h3 class="lightbox-title">${item.title}</h3>
        ${item.caption ? `<p class="lightbox-desc">${item.caption}</p>` : ''}
      `;
    }
  };

  const openLightboxByIndex = (index, triggerEl) => {
    lastActiveElement = triggerEl || document.activeElement;
    openedFromAllGallery = Boolean(allGalleryModal?.classList.contains('active'));
    
    updateLightboxContent(index, false);

    if (galleryModal) {
      galleryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      trapFocus(galleryModal);
      galleryCloseBtn?.focus();
    }
  };

  const showNextPhoto = () => {
    if (!galleryModal?.classList.contains('active')) return;
    updateLightboxContent(currentGalleryIndex + 1, true);
  };

  const showPrevPhoto = () => {
    if (!galleryModal?.classList.contains('active')) return;
    updateLightboxContent(currentGalleryIndex - 1, true);
  };

  const closeLightbox = () => {
    if (galleryModal?.classList.contains('active')) {
      galleryModal.classList.remove('active');
      
      // If we were inside the complete gallery, keep it open and restore scroll lock
      if (openedFromAllGallery && allGalleryModal?.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        trapFocus(allGalleryModal);
        const activeTile = galleryItems[currentGalleryIndex]?.element;
        activeTile?.focus();
        openedFromAllGallery = false;
      } else {
        document.body.style.overflow = '';
        lastActiveElement?.focus();
        openedFromAllGallery = false;
      }
    }
  };

  lightboxPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrevPhoto();
  });

  lightboxNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showNextPhoto();
  });

  galleryCloseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Open single lightbox on photo click
  document.addEventListener('click', (e) => {
    const tile = e.target.closest('.gallery-item:not(.gallery-more-tile)');
    if (tile) {
      if (galleryHasDragged) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      let idx = tile.getAttribute('data-index');
      if (idx !== null && idx !== undefined && idx !== '') {
        idx = parseInt(idx, 10);
      } else {
        const imgSrc = tile.getAttribute('data-image') || tile.querySelector('img')?.src;
        idx = galleryItems.findIndex(item => item.image === imgSrc || item.fallback === imgSrc);
      }
      if (idx < 0) idx = 0;
      openLightboxByIndex(idx, tile);
    }
  });

  // Keyboard Enter / Space on tiles
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest?.('.gallery-item:not(.gallery-more-tile)');
      if (tile) {
        e.preventDefault();
        let idx = tile.getAttribute('data-index');
        idx = idx !== null ? parseInt(idx, 10) : 0;
        openLightboxByIndex(idx, tile);
      }
    }
  });

  // Arrow Key Navigation (Left Arrow & Right Arrow)
  window.addEventListener('keydown', (e) => {
    if (galleryModal?.classList.contains('active')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrevPhoto();
      }
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  galleryModal?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  galleryModal?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes
    if (Math.abs(diffX) > 45 && Math.abs(diffY) < 60) {
      if (diffX < 0) {
        showNextPhoto(); // Swipe left -> next
      } else {
        showPrevPhoto(); // Swipe right -> prev
      }
    }
  }, { passive: true });

  // 9B. Complete Scrollable All-Photos Gallery Modal
  const openAllGallery = (triggerEl) => {
    if (allGalleryModal) {
      lastActiveElement = triggerEl || document.activeElement;
      allGalleryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      trapFocus(allGalleryModal);
      allGalleryCloseBtn?.focus();
    }
  };

  const closeAllGallery = () => {
    if (allGalleryModal?.classList.contains('active')) {
      allGalleryModal.classList.remove('active');
      document.body.style.overflow = '';
      lastActiveElement?.focus();
    }
  };

  // Triggers for all-photos modal:
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.gallery-more-tile') || e.target.closest('.open-all-gallery-btn');
    if (trigger) {
      e.preventDefault();
      openAllGallery(trigger);
    }
  });

  allGalleryCloseBtn?.addEventListener('click', closeAllGallery);

  // Global Close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (galleryModal?.classList.contains('active')) {
        closeLightbox();
      } else if (allGalleryModal?.classList.contains('active')) {
        closeAllGallery();
      } else if (videoModal?.classList.contains('active')) {
        closeVideoModal();
      }
    }
  });

  // Modal Backdrop Clicks (outside of container)
  galleryModal?.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      closeLightbox();
    }
  });

  allGalleryModal?.addEventListener('click', (e) => {
    if (e.target === allGalleryModal) {
      closeAllGallery();
    }
  });

  videoModal?.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeVideoModal();
    }
  });

  // 10. Featured Highlights Horizontal Carousel (Wheel Scroll + Nav Buttons)
  const highlightsTrack = document.getElementById('highlights-carousel-track');
  const highlightsPrevBtn = document.getElementById('highlights-prev-btn');
  const highlightsNextBtn = document.getElementById('highlights-next-btn');

  if (highlightsTrack) {
    const getHighlightStep = () => {
      const firstCard = highlightsTrack.querySelector('.highlight-card');
      return firstCard ? firstCard.offsetWidth + 24 : 380;
    };

    const updateHighlightsNav = () => {
      if (!highlightsPrevBtn || !highlightsNextBtn) return;
      const atStart = highlightsTrack.scrollLeft <= 10;
      const atEnd = highlightsTrack.scrollLeft + highlightsTrack.clientWidth >= highlightsTrack.scrollWidth - 10;
      highlightsPrevBtn.disabled = atStart;
      highlightsNextBtn.disabled = atEnd;
    };

    highlightsTrack.addEventListener('scroll', updateHighlightsNav, { passive: true });
    window.addEventListener('resize', updateHighlightsNav, { passive: true });
    updateHighlightsNav();

    highlightsPrevBtn?.addEventListener('click', () => {
      highlightsTrack.scrollBy({ left: -getHighlightStep(), behavior: 'smooth' });
    });

    highlightsNextBtn?.addEventListener('click', () => {
      highlightsTrack.scrollBy({ left: getHighlightStep(), behavior: 'smooth' });
    });

    // Horizontal wheel-scroll when cursor is over the highlights carousel
    highlightsTrack.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canScrollLeft = highlightsTrack.scrollLeft > 0 && e.deltaY < 0;
        const canScrollRight = highlightsTrack.scrollLeft + highlightsTrack.clientWidth < highlightsTrack.scrollWidth - 2 && e.deltaY > 0;
        if (canScrollLeft || canScrollRight) {
          e.preventDefault();
          highlightsTrack.scrollLeft += e.deltaY * 0.9;
        }
      }
    }, { passive: false });
  }

  // 11. "Moments on Stage" Auto Slow-Scrolling Carousel with Drag & Hover Pause
  const stageGalleryTrack = document.getElementById('stage-gallery-track');
  const stageGalleryPrev = document.getElementById('stage-gallery-prev');
  const stageGalleryNext = document.getElementById('stage-gallery-next');

  if (stageGalleryTrack) {
    let isPaused = false;
    let isPointerDown = false;
    let startX = 0;
    let scrollStart = 0;
    let autoScrollRaf = null;
    const scrollSpeed = 0.6; // Subtle luxury continuous scroll speed (~36px/sec)

    const stepGalleryCard = () => {
      const firstCard = stageGalleryTrack.querySelector('.stage-gallery-card');
      return firstCard ? firstCard.offsetWidth + 24 : 360;
    };

    // Auto Slow-Scroll Loop
    const autoScrollLoop = () => {
      if (!isPaused && !isPointerDown && !prefersReducedMotion) {
        stageGalleryTrack.scrollLeft += scrollSpeed;
        const maxScroll = stageGalleryTrack.scrollWidth - stageGalleryTrack.clientWidth;
        if (stageGalleryTrack.scrollLeft >= maxScroll - 1) {
          stageGalleryTrack.scrollLeft = 0; // Smooth loop restart
        }
      }
      autoScrollRaf = requestAnimationFrame(autoScrollLoop);
    };

    autoScrollRaf = requestAnimationFrame(autoScrollLoop);

    // Pause on Hover & Focus
    stageGalleryTrack.addEventListener('mouseenter', () => { isPaused = true; });
    stageGalleryTrack.addEventListener('mouseleave', () => { if (!isPointerDown) isPaused = false; });
    stageGalleryTrack.addEventListener('focusin', () => { isPaused = true; });
    stageGalleryTrack.addEventListener('focusout', () => { isPaused = false; });

    // Drag / Swipe to Scroll
    stageGalleryTrack.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return; // Only primary button
      isPointerDown = true;
      galleryHasDragged = false;
      startX = e.pageX;
      scrollStart = stageGalleryTrack.scrollLeft;
      stageGalleryTrack.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const walk = e.pageX - startX;
      if (Math.abs(walk) > 6) {
        galleryHasDragged = true;
      }
      stageGalleryTrack.scrollLeft = scrollStart - walk;
    });

    const endDrag = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      stageGalleryTrack.classList.remove('is-dragging');
      setTimeout(() => {
        galleryHasDragged = false;
      }, 60);
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Prev / Next Buttons
    stageGalleryPrev?.addEventListener('click', () => {
      isPaused = true;
      stageGalleryTrack.scrollBy({ left: -stepGalleryCard(), behavior: 'smooth' });
      setTimeout(() => { isPaused = false; }, 2000);
    });

    stageGalleryNext?.addEventListener('click', () => {
      isPaused = true;
      stageGalleryTrack.scrollBy({ left: stepGalleryCard(), behavior: 'smooth' });
      setTimeout(() => { isPaused = false; }, 2000);
    });
  }

  // 12. Booking Concierge Form (Conversion-Optimized 5 Fields)
  const bookingForm = document.getElementById('booking-form');
  const formStatus = document.getElementById('form-status');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const eventType = document.getElementById('event_type')?.value || '';
      const eventDate = document.getElementById('event_date')?.value || '';
      const message = document.getElementById('message')?.value.trim() || '';

      if (!name) {
        alert('Please enter your name.');
        document.getElementById('name')?.focus();
        return;
      }
      if (!email) {
        alert('Please enter your work email.');
        document.getElementById('email')?.focus();
        return;
      }

      let waTextParts = [
        `*New Event Collaboration Inquiry*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `👤 *Name:* ${name}`,
        `✉️ *Email:* ${email}`,
        `🎙️ *Event Type:* ${eventType || 'General Corporate Event'}`
      ];
      if (eventDate) waTextParts.push(`📅 *Date:* ${eventDate}`);
      if (message) waTextParts.push(`📝 *Overview:* ${message}`);
      waTextParts.push(`━━━━━━━━━━━━━━━━━━━━━━`);
      waTextParts.push(`_Sent via sarahogembo.com concierge_`);

      const waUrl = `https://wa.me/254719411433?text=${encodeURIComponent(waTextParts.join('\n'))}`;

      if (formStatus) {
        formStatus.innerHTML = `
          <div style="background: rgba(212,175,55,0.1); border: 1px solid var(--color-gold-primary); color: #F7E7A9; padding: 18px; border-radius: 4px; margin-top: 16px; animation: fadeIn 0.4s ease;">
            <p><strong>Thank you, ${name}.</strong> Your discovery call inquiry has been received.</p>
            <p style="margin-top: 8px; font-size: 0.9rem;">To connect directly via WhatsApp with your inquiry pre-filled, <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color: #25D366; text-decoration: underline; font-weight: bold;">Click Here to Open WhatsApp</a>, or Sarah will reach out to <em>${email}</em> promptly.</p>
          </div>
        `;
      }

      bookingForm.reset();
    });
  }

  // 13. Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
