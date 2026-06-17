
/* ── Shared P&A site interactions ── */
(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const navbar = document.getElementById('navbar');
  if (navbar) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  window.addEventListener('load', () => {
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('loaded');
  });

  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  window.openMenu = function openMenu() {
    if (!hamburger || !mobileMenu || !menuOverlay) return;
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeMenu = function closeMenu() {
    if (!hamburger || !mobileMenu || !menuOverlay) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (hamburger && mobileMenu && menuOverlay) {
    hamburger.addEventListener('click', () => hamburger.classList.contains('open') ? window.closeMenu() : window.openMenu());
    menuOverlay.addEventListener('click', window.closeMenu);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { window.closeMenu(); hamburger.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) window.closeMenu(); });
  }

  const spySections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu a');
  if ('IntersectionObserver' in window && spySections.length && navLinks.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          const isActive = href === '#' + id || href.endsWith('#' + id);
          if (isActive && !link.classList.contains('btn-nav')) link.classList.add('active');
          else if (!link.dataset.keepActive) link.classList.remove('active');
          isActive ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    spySections.forEach(s => spyObserver.observe(s));
  }

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutQuart(progress) * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.counter').forEach(animateCounter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }
})();

function showToast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    ${msg}
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function goToService(service) {
  const contact = document.getElementById('contact');
  const select = document.getElementById('f-service');
  if (select && service) select.value = service;
  if (contact) {
    contact.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const form = document.querySelector('.contact-form-wrap');
      if (form) {
        form.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.25), 0 16px 64px rgba(11,28,61,0.12)';
        setTimeout(() => { form.style.boxShadow = ''; }, 1800);
      }
    }, 600);
  } else {
    window.location.href = 'index.html#contact';
  }
}

function enrollCourse(courseName) {
  const select = document.getElementById('f-service');
  const msg = document.getElementById('f-msg');
  if (select) select.value = 'Academy / Training';
  if (msg) msg.value = `I am interested in enrolling in the "${courseName}" course. Please send me more details.`;
  goToService('Academy / Training');
}

const coursePrices = {
  USD: ['$299', '$449', '$399', '$349'],
  NGN: ['₦478,400', '₦718,400', '₦638,400', '₦558,400']
};
let currentCurrency = 'USD';
function toggleCurrency() {
  currentCurrency = currentCurrency === 'USD' ? 'NGN' : 'USD';
  document.querySelectorAll('.course-price').forEach((el, i) => { if (coursePrices[currentCurrency][i]) el.textContent = coursePrices[currentCurrency][i]; });
  const btn = document.getElementById('currency-btn');
  if (btn) btn.textContent = currentCurrency === 'USD' ? '₦ View in NGN' : '$ View in USD';
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.form-submit');
  const origHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Sending…`;

  try {
    const data = new FormData(form);
    data.append('_subject', 'New Enquiry — P&A Consulting Website');
    data.append('_template', 'table');

    const res = await fetch('https://formsubmit.co/ajax/hello@paconsulting.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    });

    const result = await res.json();
    if (result.success === 'true' || result.success === true) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Message Sent — we'll be in touch soon!`;
      btn.style.background = 'linear-gradient(135deg,#059669,#047857)';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.style.background = '';
        btn.disabled = false;
      }, 8000);
    } else {
      throw new Error('Submission rejected');
    }
  } catch (err) {
    btn.innerHTML = `⚠ Something went wrong — please try again`;
    btn.style.background = 'linear-gradient(135deg,#dc2626,#b91c1c)';
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 4000);
  }
}
