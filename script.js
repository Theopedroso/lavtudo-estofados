(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  /* ─── Header scroll ──────────────────────────────── */
  const header = $('.site-header');
  const nav = $('.main-nav');
  const menuToggle = $('.menu-toggle');
  const navLinks = $$('.main-nav a');

  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 28);
  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();

  /* ─── Mobile menu ────────────────────────────────── */
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

  /* ─── Active nav link ────────────────────────────── */
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

  /* ─── Reveal on scroll ───────────────────────────── */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 65}ms`;
      observer.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add('in-view'));
  }

  /* ─── Magnet buttons ─────────────────────────────── */
  $$('.magnet').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      btn.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ─── Before/After sliders ───────────────────────── */
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

  /* ─── Gallery filter ─────────────────────────────── */
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

  /* ─── Lightbox ───────────────────────────────────── */
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
      lightboxImg.alt = img.alt || 'Imagem da galeria LavTudo';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  /* ─── Player de vídeo premium (vcards) ───────────── */
  const allVcardVideos = $$('.vcard-media video');

  const pauseAll = (except) => {
    allVcardVideos.forEach((v) => {
      if (v === except) return;
      v.pause();
      const media = v.closest('.vcard-media');
      if (media) {
        media.classList.remove('is-playing');
        const btn = $('.vplay-btn', media);
        if (btn) btn.classList.remove('is-playing');
      }
    });
  };

  $$('.vcard-media').forEach((media) => {
    const video = $('video', media);
    const btn = $('.vplay-btn', media);
    const progressBar = $('.vcard-progress-bar', media);
    if (!video || !btn) return;

    const setPlaying = (playing) => {
      media.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-playing', playing);
    };

    // Click play button
    btn.addEventListener('click', () => {
      if (video.paused) {
        pauseAll(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    // Also allow clicking the video area itself to pause
    video.addEventListener('click', () => {
      if (!video.paused) video.pause();
    });

    video.addEventListener('play', () => setPlaying(true));
    video.addEventListener('pause', () => setPlaying(false));
    video.addEventListener('ended', () => {
      setPlaying(false);
      if (progressBar) progressBar.style.width = '0%';
    });

    // Progress bar
    if (progressBar) {
      video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${pct}%`;
      });
    }
  });

  /* ─── Pause outros vídeos ao iniciar qualquer um ─── */
  allVcardVideos.forEach((video) => {
    video.addEventListener('play', () => pauseAll(video));
  });

})();
