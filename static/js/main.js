/**
 * SARAH OGEMBO - LUXURY PERSONAL BRAND
 * Interactive Client-Side Engine
 * Accessible, High Performance, Zero Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Service Worker Registration (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    });
  }

  // 2. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Mobile Navigation Drawer Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 4. Testimonials Slider
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

  // 5. Showreel Video Lightbox Modal
  const videoModal = document.getElementById('video-modal');
  const videoTriggers = document.querySelectorAll('.trigger-video-modal');
  const videoCloseBtn = document.querySelector('.video-modal-close');
  const videoIframe = document.getElementById('showreel-iframe');

  // Sarah Ogembo Video Highlight Reel URL (or showcase placeholder)
  const defaultVideoSrc = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // fallback embed

  function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    videoCloseBtn?.focus();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    // Pause video
    if (videoIframe) {
      const src = videoIframe.src;
      videoIframe.src = '';
      videoIframe.src = src;
    }
  }

  videoTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal();
    });
  });

  videoCloseBtn?.addEventListener('click', closeVideoModal);

  // 6. Gallery Lightbox Modal
  const galleryModal = document.getElementById('gallery-modal');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const galleryCloseBtn = document.querySelector('.gallery-modal-close');

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.getAttribute('data-title') || img?.alt || 'Sarah Ogembo on Stage';
      const caption = item.getAttribute('data-caption') || '';

      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = title;
      }
      if (lightboxCaption) {
        lightboxCaption.innerHTML = `<strong>${title}</strong><br><span style="color:#A67C00">${caption}</span>`;
      }
      if (galleryModal) {
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        galleryCloseBtn?.focus();
      }
    });
  });

  galleryCloseBtn?.addEventListener('click', () => {
    galleryModal?.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Global Close on ESC or click outside
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      galleryModal?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  [videoModal, galleryModal].forEach((modal) => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // 7. Booking Concierge Form & Direct WhatsApp Integration
  const bookingForm = document.getElementById('booking-form');
  const formStatus = document.getElementById('form-status');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name')?.value || '';
      const org = document.getElementById('organisation')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const eventType = document.getElementById('event_type')?.value || '';
      const eventDate = document.getElementById('event_date')?.value || '';
      const location = document.getElementById('location')?.value || '';
      const guests = document.getElementById('expected_guests')?.value || '';
      const message = document.getElementById('message')?.value || '';

      // Construct WhatsApp message text
      const waText = encodeURIComponent(
        `*New Event Booking Inquiry*\n\n` +
        `*Name:* ${name}\n` +
        `*Organisation:* ${org}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${phone}\n` +
        `*Event Type:* ${eventType}\n` +
        `*Date:* ${eventDate}\n` +
        `*Location:* ${location}\n` +
        `*Expected Guests:* ${guests}\n` +
        `*Message:* ${message}`
      );

      const waUrl = `https://wa.me/254719411433?text=${waText}`;

      if (formStatus) {
        formStatus.innerHTML = `
          <div style="background: rgba(212,175,55,0.1); border: 1px solid var(--color-gold-primary); color: #F7E7A9; padding: 16px; border-radius: 4px; margin-top: 16px;">
            <p><strong>Thank you, ${name}.</strong> Your event details have been captured.</p>
            <p style="margin-top: 8px; font-size: 0.9rem;">To connect directly via WhatsApp with these details pre-filled, <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color: #25D366; text-decoration: underline; font-weight: bold;">Click Here to Open WhatsApp</a>, or Sarah's executive management team will reach out to <em>${email}</em> promptly.</p>
          </div>
        `;
      }

      bookingForm.reset();
    });
  }

  // 8. Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
