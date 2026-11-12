// ==========================================================================
// Huancavelica: guía turística — Interactividad, soporte móvil y animaciones
// ==========================================================================

(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  // ---------- 0. Detección de dispositivo (PC / Celular) y Modo Oscuro (Sistema + Manual) ----------
  var themeToggle = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');
  var themeLabel = document.getElementById('theme-label');
  var metaThemeColor = document.querySelector('meta[name="theme-color"]');
  var systemDarkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  var themePref = 'auto'; // 'auto' | 'dark' | 'light'
  try {
    var savedTheme = window.localStorage.getItem('hvca_theme_pref');
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'auto') {
      themePref = savedTheme;
    }
  } catch (err) {
    themePref = 'auto';
  }

  function detectDeviceType() {
    var ua = navigator.userAgent || '';
    var isTouchMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (window.matchMedia && window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches) ||
      window.innerWidth < 720;
    return isTouchMobile ? 'celular' : 'pc';
  }

  function getEffectiveTheme() {
    if (themePref === 'dark' || themePref === 'light') {
      return themePref;
    }
    if (systemDarkQuery && systemDarkQuery.matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme() {
    var effective = getEffectiveTheme();
    var device = detectDeviceType();
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.setAttribute('data-device', device);

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effective === 'dark' ? '#0f181d' : '#16232a');
    }

    if (themeIcon && themeLabel && themeToggle) {
      if (effective === 'dark') {
        themeIcon.textContent = '☾';
        themeLabel.textContent = 'Oscuro';
        themeToggle.title = 'Modo oscuro activo. Toca para cambiar a modo claro.';
      } else {
        themeIcon.textContent = '☀';
        themeLabel.textContent = 'Claro';
        themeToggle.title = 'Modo claro activo. Toca para cambiar a modo oscuro.';
      }
      themeToggle.setAttribute('aria-pressed', effective === 'dark' ? 'true' : 'false');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var currentEffective = getEffectiveTheme();
      themePref = currentEffective === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem('hvca_theme_pref', themePref);
      } catch (err) {
        // Ignorar en entornos sin localStorage
      }
      applyTheme();
    });
  }

  if (systemDarkQuery) {
    var onSystemChange = function () {
      // Si el sistema en PC o celular cambia de tema, actualiza automáticamente cuando está en modo auto
      if (themePref === 'auto') {
        applyTheme();
      }
    };
    if (systemDarkQuery.addEventListener) {
      systemDarkQuery.addEventListener('change', onSystemChange);
    } else if (systemDarkQuery.addListener) {
      systemDarkQuery.addListener(onSystemChange);
    }
  }

  window.addEventListener('resize', applyTheme, { passive: true });
  applyTheme();

  // ---------- 1. Menú móvil (hamburguesa) y barra de progreso ----------
  var header = document.querySelector('.top');
  var menuToggle = document.getElementById('menu-toggle');
  var mainNav = document.getElementById('main-nav');
  var scrollProgress = document.getElementById('scroll-progress');
  var backToTop = document.getElementById('back-to-top');

  function closeMobileMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      mainNav.classList.toggle('is-open', !expanded);
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', function (e) {
      if (!mainNav.classList.contains('is-open')) return;
      if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  function updateScrollUI() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    if (scrollProgress) {
      scrollProgress.style.width = progress + '%';
    }
    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 16);
    }
    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollTop > 420);
    }
  }

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- 2. Resaltado de sección activa en la navegación ----------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#main-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(function (sec) { navObserver.observe(sec); });
  }

  // ---------- 3. Animaciones de aparición al hacer scroll (Scroll Reveal) ----------
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  // ---------- 4. Contadores numéricos animados en el Hero ----------
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var useDot = el.getAttribute('data-dot') === 'true';
    if (isNaN(target)) return;

    var duration = 1100;
    var start = null;

    function formatNumber(n) {
      if (useDot && n >= 1000) {
        return Math.floor(n / 1000) + '.' + String(n % 1000).padStart(3, '0');
      }
      return String(n);
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var ratio = Math.min(1, elapsed / duration);
      var eased = 1 - Math.pow(1 - ratio, 3);
      var current = Math.round(target * eased);
      el.textContent = formatNumber(current) + suffix;
      if (ratio < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { countObserver.observe(c); });
  }

  // ---------- 5. Filtro de atractivos, buscador y "Mi Ruta" (Favoritos) ----------
  var chips = document.querySelectorAll('.chip');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#cards .card'));
  var searchInput = document.getElementById('search-places');
  var searchClear = document.getElementById('search-clear');
  var emptyState = document.getElementById('empty-state');
  var resetFiltersBtn = document.getElementById('reset-filters');
  var savedFilterBtn = document.getElementById('saved-filter-btn');
  var savedCountEl = document.getElementById('saved-count');

  var activeFilter = 'todo';
  var onlySaved = false;
  var savedPlaces = {};

  try {
    var raw = window.localStorage.getItem('hvca_saved_places');
    if (raw) savedPlaces = JSON.parse(raw) || {};
  } catch (err) {
    savedPlaces = {};
  }

  function saveFavorites() {
    try {
      window.localStorage.setItem('hvca_saved_places', JSON.stringify(savedPlaces));
    } catch (err) {
      // Ignorar bloqueo de localStorage en iframes restringidos
    }
  }

  function updateSavedUI() {
    var count = Object.keys(savedPlaces).filter(function (k) { return savedPlaces[k]; }).length;
    if (savedCountEl) savedCountEl.textContent = String(count);
    if (savedFilterBtn) {
      savedFilterBtn.classList.toggle('has-items', count > 0 || onlySaved);
      savedFilterBtn.setAttribute('aria-pressed', onlySaved ? 'true' : 'false');
    }
    cards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      var btn = card.querySelector('.fav-btn');
      if (btn && id) {
        var on = !!savedPlaces[id];
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        var label = btn.querySelector('.fav-label');
        if (label) label.textContent = on ? 'Guardado' : 'Guardar';
      }
    });
  }

  function applyCardFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchClear) {
      searchClear.classList.toggle('is-visible', query.length > 0);
    }

    var visibleCount = 0;
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-cat');
      var id = card.getAttribute('data-id');
      var text = card.textContent.toLowerCase();

      var matchCat = (activeFilter === 'todo' || cat === activeFilter);
      var matchQuery = (!query || text.indexOf(query) !== -1);
      var matchSaved = (!onlySaved || !!savedPlaces[id]);
      var show = matchCat && matchQuery && matchSaved;

      card.hidden = !show;
      if (show) {
        visibleCount++;
        card.classList.remove('is-filtering-in');
        void card.offsetWidth;
        card.classList.add('is-filtering-in');
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter') || 'todo';
      onlySaved = false;
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      updateSavedUI();
      applyCardFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyCardFilters);
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      applyCardFilters();
      searchInput.focus();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function () {
      activeFilter = 'todo';
      onlySaved = false;
      if (searchInput) searchInput.value = '';
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', c.getAttribute('data-filter') === 'todo' ? 'true' : 'false');
      });
      updateSavedUI();
      applyCardFilters();
    });
  }

  if (savedFilterBtn) {
    savedFilterBtn.addEventListener('click', function () {
      onlySaved = !onlySaved;
      updateSavedUI();
      applyCardFilters();
      var verSec = document.getElementById('ver');
      if (verSec && onlySaved) {
        verSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  cards.forEach(function (card) {
    var btn = card.querySelector('.fav-btn');
    var id = card.getAttribute('data-id');
    if (btn && id) {
      btn.addEventListener('click', function () {
        savedPlaces[id] = !savedPlaces[id];
        saveFavorites();
        updateSavedUI();
        if (onlySaved) applyCardFilters();
      });
    }
  });

  updateSavedUI();

  // ---------- 6. Pestañas de rutas y checklist interactivo ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next);
        next.focus();
      }
    });
  });

  document.querySelectorAll('.panel').forEach(function (panel) {
    var stepItems = Array.prototype.slice.call(panel.querySelectorAll('.steps li'));
    var statusEl = panel.querySelector('.route-status');

    function updateRouteProgress() {
      if (!statusEl) return;
      var done = stepItems.filter(function (li) { return li.classList.contains('is-done'); }).length;
      statusEl.textContent = done + ' de ' + stepItems.length + ' etapas marcadas';
    }

    stepItems.forEach(function (li) {
      li.addEventListener('click', function () {
        li.classList.toggle('is-done');
        updateRouteProgress();
      });
    });

    updateRouteProgress();
  });

  // ---------- 7. Visor de imágenes (Lightbox con soporte táctil y teclado) ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var lbPrev = document.getElementById('lightbox-prev');
  var lbNext = document.getElementById('lightbox-next');
  var lbClose = document.getElementById('lightbox-close');

  var galleryTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-caption]'));
  var currentIndex = 0;

  function showLightboxAt(index) {
    if (!lightbox || !galleryTriggers.length) return;
    currentIndex = (index + galleryTriggers.length) % galleryTriggers.length;
    var trigger = galleryTriggers[currentIndex];
    var innerImg = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
    var src = innerImg ? innerImg.getAttribute('src') : '';
    var caption = trigger.getAttribute('data-lightbox-caption') || '';
    if (lightboxImg && src) {
      lightboxImg.src = src;
      lightboxImg.alt = caption;
    }
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryTriggers.length;
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  galleryTriggers.forEach(function (el, idx) {
    el.addEventListener('click', function () {
      showLightboxAt(idx);
    });
  });

  if (lbPrev) {
    lbPrev.addEventListener('click', function () { showLightboxAt(currentIndex - 1); });
  }
  if (lbNext) {
    lbNext.addEventListener('click', function () { showLightboxAt(currentIndex + 1); });
  }
  if (lbClose) {
    lbClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeLightbox();
    }
    if (lightbox && lightbox.classList.contains('is-open')) {
      if (e.key === 'ArrowRight') showLightboxAt(currentIndex + 1);
      if (e.key === 'ArrowLeft') showLightboxAt(currentIndex - 1);
    }
  });

  // Soporte swipe táctil en el Lightbox para móviles
  var touchStartX = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var deltaX = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(deltaX) > 45) {
        if (deltaX < 0) showLightboxAt(currentIndex + 1);
        else showLightboxAt(currentIndex - 1);
      }
    }, { passive: true });
  }

  // ---------- 8. Año actual en el pie de página ----------
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
