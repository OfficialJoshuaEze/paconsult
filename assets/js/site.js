
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
  const phone = '2349077070777';
  const text = encodeURIComponent(`Hello, I'd like to enrol in the "${courseName}" course. Please provide more details on registration and schedule.`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
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

/* P&A photo portfolios — standalone, no third-party dependency */
(function(){
 const dataNode=document.getElementById('pa-gallery-data');
 const overlay=document.getElementById('pa-lightbox');
 if(!dataNode||!overlay)return;
 let data;
 try{data=JSON.parse(dataNode.textContent)}catch(e){console.error('Gallery data invalid',e);return}
 const $=s=>overlay.querySelector(s);
 const photo=$('.pa-lb-photo'),category=$('.pa-lb-kicker'),title=$('.pa-lb-heading'),caption=$('.pa-lb-text'),counter=$('.pa-lb-index'),thumbs=$('.pa-lb-thumbs');
 let current=null,index=0,opener=null,swipeX=0;
 function render(i){
   if(!current)return;
   const project=data[current];
   index=(i+project.images.length)%project.images.length;
   photo.src=project.images[index];photo.alt=project.title+' — photograph '+(index+1);
   category.textContent=project.category+' · '+project.organization;
   title.textContent=project.title;caption.textContent=project.description;
   counter.textContent=(index+1)+' of '+project.images.length;
   thumbs.textContent='';
   project.images.forEach((src,n)=>{
     const b=document.createElement('button');b.type='button';b.className='pa-lb-thumb'+(n===index?' active':'');b.setAttribute('aria-label','View photo '+(n+1));b.setAttribute('aria-current',String(n===index));
     const im=document.createElement('img');im.src=src;im.alt='';im.loading='lazy';b.append(im);b.addEventListener('click',()=>render(n));thumbs.append(b);
   });
   // Keep thumbnail scroll confined to the strip; do not scroll the whole page.
   const selected=thumbs.querySelector('.active');
   if(selected) thumbs.scrollLeft=selected.offsetLeft-thumbs.offsetLeft-(thumbs.clientWidth-selected.clientWidth)/2;
 }
 function open(id,trigger){
   if(!data[id])return;
   opener=trigger;current=id;render(0);
   overlay.hidden=false;overlay.setAttribute('aria-hidden','false');document.body.classList.add('pa-gallery-open');$('.pa-lb-close').focus();
 }
 function close(){
   overlay.hidden=true;overlay.setAttribute('aria-hidden','true');document.body.classList.remove('pa-gallery-open');photo.removeAttribute('src');current=null;opener?.focus();
 }
 document.querySelectorAll('[data-gallery-id]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.galleryId,b)));
 document.querySelectorAll('[data-pa-filter]').forEach(b=>b.addEventListener('click',()=>{
   const f=b.dataset.paFilter;
   document.querySelectorAll('[data-pa-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});
   document.querySelectorAll('[data-gallery-id]').forEach(card=>{card.hidden=f!=='all'&&data[card.dataset.galleryId]?.category!==f});
 }));
 $('.pa-lb-close').addEventListener('click',close);
 $('.pa-lb-prev').addEventListener('click',()=>render(index-1));
 $('.pa-lb-next').addEventListener('click',()=>render(index+1));
 overlay.addEventListener('mousedown',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{
   if(overlay.hidden)return;
   if(e.key==='Escape'){e.preventDefault();close()}
   if(e.key==='ArrowLeft'){e.preventDefault();render(index-1)}
   if(e.key==='ArrowRight'){e.preventDefault();render(index+1)}
   if(e.key==='Tab'){
     const els=Array.from(overlay.querySelectorAll('button:not([disabled])'));
     const first=els[0],last=els[els.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
   }
 });
 $('.pa-lightbox-stage').addEventListener('touchstart',e=>{swipeX=e.changedTouches[0].clientX},{passive:true});
 $('.pa-lightbox-stage').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-swipeX;if(Math.abs(dx)>55)render(index+(dx>0?-1:1))},{passive:true});
 photo.addEventListener('error',()=>{photo.alt='Photo unavailable';});
})();
