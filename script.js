(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const header = $('.site-header');
  const nav = $('.main-nav');
  const menuToggle = $('.menu-toggle');
  const navLinks = $$('.main-nav a');

  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 28);
  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();

  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.forEach((link) => link.addEventListener('click', () => {
    nav?.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  const sections = $$('section[id]');
  const updateActive = () => {
    let currentId = '';
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 130) currentId = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', currentId && href.endsWith(`#${currentId}`));
    });
  };
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      observer.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add('in-view'));
  }

  $$('.magnet').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      btn.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  $$('.compare-card').forEach((card) => {
    const range = $('.compare-range', card);
    const before = $('.compare-before', card);
    const beforeImg = $('.compare-before img', card);
    const updateCompare = () => {
      if (!range || !before || !beforeImg) return;
      const wrap = $('.compare-wrap', card);
      const width = wrap.getBoundingClientRect().width;
      const value = Number(range.value);
      before.style.width = `${value}%`;
      beforeImg.style.width = `${width}px`;
      beforeImg.style.maxWidth = 'none';
      const handle = $('.slider-handle', card);
      if (handle) handle.style.left = `${value}%`;
    };
    range?.addEventListener('input', updateCompare);
    window.addEventListener('resize', updateCompare, { passive: true });
    updateCompare();
  });

  const filterButtons = $$('.filter-tabs button');
  const galleryItems = $$('.gallery-item');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      galleryItems.forEach((item) => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hide', !show);
      });
    });
  });

  const lightbox = $('.lightbox');
  const lightboxImg = $('.lightbox img');
  const lightboxClose = $('.lightbox-close');
  const closeLightbox = () => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lightboxImg) lightboxImg.src = '';
  };
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = $('img', item);
      if (!lightbox || !lightboxImg || !img) return;
      lightboxImg.src = item.dataset.img || img.src;
      lightboxImg.alt = img.alt || 'Imagem da galeria Lav Tudo';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  $$('video').forEach((video) => {
    video.addEventListener('play', () => {
      $$('video').forEach((other) => { if (other !== video) other.pause(); });
    });
  });
})();
