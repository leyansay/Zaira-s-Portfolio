// ── Carousel ──
const carousels = {};

function initCarousel(id) {
  const track    = document.getElementById(id + '-track');
  const viewport = document.getElementById(id + '-viewport');
  if (!track || !viewport) return;
  carousels[id] = { index: 0, track, viewport };
}

function slideCarousel(id, dir) {
  if (!carousels[id]) initCarousel(id);
  const c      = carousels[id];
  const cards  = c.track.querySelectorAll('.work-card');
  const total  = cards.length;
  const visible = 3;
  const max    = total - visible;
  c.index = Math.max(0, Math.min(c.index + dir, max));
  const cardW  = cards[0].offsetWidth + 16; // width + gap
  c.track.style.transform = `translateX(-${c.index * cardW}px)`;
  // update button states
  const section = c.track.closest('section');
  if (section) {
    section.querySelector('.carousel-btn--prev').disabled = c.index === 0;
    section.querySelector('.carousel-btn--next').disabled = c.index >= max;
  }
}

// init on load
window.addEventListener('load', () => {
  initCarousel('layouts');
  initCarousel('websites');
  // set initial button states
  ['layouts','websites'].forEach(id => slideCarousel(id, 0));
});

// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

function animateFollower() {
  fx += (mx - fx) * 0.1;
  fy += (my - fy) * 0.1;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .work-card, .service-row, .cert-badge-wrap').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '20px';
    cursor.style.height = '20px';
    follower.style.width  = '60px';
    follower.style.height = '60px';
    cursor.style.background = 'var(--gold)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '12px';
    cursor.style.height = '12px';
    follower.style.width  = '36px';
    follower.style.height = '36px';
    cursor.style.background = 'var(--black)';
  });
});

// ── Scroll Reveal ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

document.querySelectorAll('.skill-bar-fill').forEach(bar => {
  const parent = bar.closest('.reveal');
  if (!parent) bar.style.width = bar.dataset.width + '%';
});

// ── Smooth nav scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Video Lightbox ──
function openVideoLightbox(src, title, cat, year) {
  const vid = document.getElementById('lightboxVideo');
  vid.src = src;
  vid.load();
  vid.play();
  document.getElementById('lightboxVideoTitle').textContent = title;
  document.getElementById('lightboxVideoCat').textContent   = cat;
  document.getElementById('lightboxVideoYear').textContent  = year;
  document.getElementById('videoLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVideoLightbox() {
  const vid = document.getElementById('lightboxVideo');
  vid.pause();
  vid.src = '';
  document.getElementById('videoLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Lightbox ──
function openLightbox(src, title, cat, year) {
  document.getElementById('lightboxImg').src   = src;
  document.getElementById('lightboxTitle').textContent = title;
  document.getElementById('lightboxCat').textContent   = cat;
  document.getElementById('lightboxYear').textContent  = year;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeVideoLightbox(); }
});

// ── EmailJS Contact Form ──
const EMAILJS_SERVICE_ID  = 'service_3f1ipgm';
const EMAILJS_TEMPLATE_ID = 'template_s14fizo';
const EMAILJS_PUBLIC_KEY  = 'BG1magE7ds3ZTNC0H';

emailjs.init(EMAILJS_PUBLIC_KEY);

function validateField(id, errId, checkFn) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  const ok  = checkFn(el.value.trim());
  el.classList.toggle('invalid', !ok);
  el.classList.toggle('valid',    ok);
  err.classList.toggle('visible', !ok);
  return ok;
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

document.getElementById('from_name').addEventListener('blur',    () => validateField('from_name',    'err-name',    v => v.length >= 2));
document.getElementById('reply_to').addEventListener('blur',     () => validateField('reply_to',     'err-email',   v => isValidEmail(v)));
document.getElementById('project_type').addEventListener('blur', () => validateField('project_type', 'err-project', v => v.length >= 2));
document.getElementById('message').addEventListener('blur',      () => validateField('message',      'err-message', v => v.length >= 10));

function sendEmail() {
  const okName    = validateField('from_name',    'err-name',    v => v.length >= 2);
  const okEmail   = validateField('reply_to',     'err-email',   v => isValidEmail(v));
  const okProject = validateField('project_type', 'err-project', v => v.length >= 2);
  const okMsg     = validateField('message',      'err-message', v => v.length >= 10);

  if (!okName || !okEmail || !okProject || !okMsg) return;

  const btn    = document.getElementById('send-btn');
  const status = document.getElementById('form-status');

  btn.textContent = 'Sending...';
  btn.disabled    = true;
  status.className = 'form-status';

  const params = {
    from_name:    document.getElementById('from_name').value.trim(),
    reply_to:     document.getElementById('reply_to').value.trim(),
    project_type: document.getElementById('project_type').value.trim(),
    message:      document.getElementById('message').value.trim(),
    to_email:     'diocsonleannzaira0@gmail.com'
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(() => {
      status.textContent = "Message sent! I'll get back to you soon.";
      status.className   = 'form-status success';
      btn.textContent    = 'Sent ✓';
      btn.style.background = 'var(--gold)';
      ['from_name', 'reply_to', 'project_type', 'message'].forEach(id => {
        const el = document.getElementById(id);
        el.value     = '';
        el.className = 'form-input';
      });
    })
    .catch(err => {
      status.textContent = 'Something went wrong. Please email me directly.';
      status.className   = 'form-status error';
      btn.textContent    = 'Send Message';
      btn.disabled       = false;
      console.error('EmailJS error:', err);
    });
}