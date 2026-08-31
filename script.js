/* ═══════════════════════════════════════════════════════════════════════
   AIXO — JavaScript
   Features: Theme auto-detection, scroll effects, animations, counters
   ═══════════════════════════════════════════════════════════════════════ */


// ─── Theme Management ──────────────────────────────────────────────────────
const ThemeManager = (() => {
  const STORAGE_KEY = 'aixo-theme';
  const html = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const buttons = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')];
    buttons.forEach(btn => {
      if (btn) {
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
    });
  }

  function init() {
    // Priority: stored preference → system preference
    const stored = getStoredTheme();
    const theme = stored || getSystemTheme();
    applyTheme(theme);

    // Listen for system theme changes (auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const currentStored = getStoredTheme();
      if (!currentStored) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });

    // Toggle buttons (desktop & mobile)
    const toggleBtns = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')];
    toggleBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          const current = html.getAttribute('data-theme') || getSystemTheme();
          const next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
        });
      }
    });
  }

  return { init };
})();


// ─── Navbar ────────────────────────────────────────────────────────────────
const NavbarManager = (() => {
  function init() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileClose = document.getElementById('mobile-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll effect (passive listener for 60fps scrolling)
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Hamburger & Close button
    function closeMobileMenu() {
      if (mobileNav) {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
      if (hamburger) {
        animateHamburger(hamburger, false);
      }
    }

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        animateHamburger(hamburger, isOpen);
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobileMenu);
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function animateHamburger(btn, isOpen) {
    const spans = btn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }

  return { init };
})();


// ─── Particle System ───────────────────────────────────────────────────────
const ParticleSystem = (() => {
  function init() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const count = 20; // Lightweight particle count
    for (let i = 0; i < count; i++) {
      createParticle(container);
    }
  }

  function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.setProperty('--duration', (4 + Math.random() * 8) + 's');
    particle.style.setProperty('--delay', (Math.random() * 6) + 's');
    particle.style.width = (1 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }

  return { init };
})();


// ─── Counter Animation ─────────────────────────────────────────────────────
const CounterAnimation = (() => {
  let hasRun = false;

  function animateValue(el, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOutExpo(progress);
      el.textContent = Math.floor(eased * (end - start) + start);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function init() {
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          const counters = document.querySelectorAll('.stat-number');
          counters.forEach((counter, i) => {
            const target = parseInt(counter.getAttribute('data-target'));
            setTimeout(() => animateValue(counter, 0, target, 2000), i * 150);
          });
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  return { init };
})();


// ─── Scroll Reveal (Instant Load) ──────────────────────────────────────────
const ScrollReveal = (() => {
  function init() {
    const targets = [
      ...document.querySelectorAll('.service-card'),
      ...document.querySelectorAll('.process-step'),
      ...document.querySelectorAll('.why-card'),
      ...document.querySelectorAll('.testimonial-card'),
      document.querySelector('.cta-inner'),
      ...document.querySelectorAll('.section-header'),
      document.querySelector('.why-us-left'),
      document.querySelector('.why-us-right'),
    ].filter(Boolean);

    targets.forEach(el => {
      el.classList.add('visible');
    });
  }

  return { init };
})();


// ─── Active Nav Link ───────────────────────────────────────────────────────
const ActiveNavLink = (() => {
  function init() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = '';
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.style.color = 'var(--gold)';
            }
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
  }

  return { init };
})();


// ─── Form Handler ──────────────────────────────────────────────────────────
function handleFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('email-input');
  const successMsg = document.getElementById('form-success-msg');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!input.value || !input.value.includes('@')) {
    input.style.borderColor = 'red';
    return;
  }

  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  setTimeout(() => {
    input.value = '';
    successMsg.style.display = 'block';
    submitBtn.textContent = 'Get in Touch';
    submitBtn.disabled = false;

    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);
  }, 1200);
}


// ─── Smooth anchor scroll & Service pre-selection ──────────────────────────
const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('.service-check').forEach(label => {
      const input = label.querySelector('input[type="checkbox"]');
      if (input) {
        label.addEventListener('click', () => {
          setTimeout(() => {
            label.classList.toggle('active', input.checked);
          }, 10);
        });
      }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          const serviceName = anchor.getAttribute('data-service');
          if (typeof window.showPanel === 'function') {
            const formSteps = document.querySelector('.form-steps');
            if (formSteps) formSteps.style.display = 'flex';

            window.showPanel(1);

            if (serviceName) {
              const checkboxes = document.querySelectorAll('#service-checkboxes input[type="checkbox"]');
              checkboxes.forEach(cb => {
                const match = (cb.value.toLowerCase().trim() === serviceName.toLowerCase().trim());
                cb.checked = match;
                const parentLabel = cb.closest('.service-check');
                if (parentLabel) {
                  parentLabel.classList.toggle('active', match);
                }
                cb.dispatchEvent(new Event('change', { bubbles: true }));
              });
            }
          }
        }
      });
    });
  }

  return { init };
})();


// ─── Cursor glow effect (GPU Hardware Accelerated translate3d) ─────────────
const CursorGlow = (() => {
  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
      transform: translate3d(-150px, -150px, 0);
      transition: opacity 0.3s ease;
      will-change: transform;
    `;
    document.body.appendChild(glow);

    let mouseX = -500, mouseY = -500;
    let glowX = -500, glowY = -500;
    let isScrolling = false;
    let scrollTimeout = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Pause glow animation during active scroll to ensure 60fps scrolling
    window.addEventListener('scroll', () => {
      isScrolling = true;
      glow.style.opacity = '0';
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        glow.style.opacity = '1';
      }, 150);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (!isScrolling) glow.style.opacity = '1';
    });

    function animate() {
      if (!isScrolling) {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        glow.style.transform = `translate3d(${glowX - 150}px, ${glowY - 150}px, 0)`;
      }
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  return { init };
})();


// ─── Service card tilt (Throttled for 60fps performance) ──────────────────
const CardTilt = (() => {
  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let ticking = false;

    document.querySelectorAll('.service-card, .testimonial-card, .why-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
            card.style.transform = `translate3d(0, -4px, 0) rotateX(${-y}deg) rotateY(${x}deg)`;
            card.style.transition = 'transform 0.1s ease-out';
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease';
      });
    });
  }

  return { init };
})();


// ─── Floating Buttons (Passive scroll listener) ────────────────────────────
const FloatingButtons = (() => {
  function init() {
    const actions = document.getElementById('floating-actions');
    const contactSection = document.getElementById('contact');
    if (!actions) return;

    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          actions.classList.remove('visible');
        } else {
          if (window.scrollY > 300) actions.classList.add('visible');
        }
      });
    }, { threshold: 0.4 });

    if (contactSection) contactObserver.observe(contactSection);

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 300) {
            actions.classList.add('visible');
          } else {
            actions.classList.remove('visible');
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  return { init };
})();


// ─── Multi-Step Form ───────────────────────────────────────────────────────
var currentStep = 1;
var selectedBudget = '';

function updateStepIndicator(step) {
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('dot-' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < step) dot.classList.add('done');
    else if (i === step) dot.classList.add('active');
  }
  for (var j = 1; j <= 2; j++) {
    var line = document.getElementById('line-' + j);
    if (!line) continue;
    line.classList.toggle('done', j < step);
  }
}

function nextStep(from) {
  if (from === 1) {
    showPanel(2);
    return;
  }
  if (from === 2) {
    const name = document.getElementById('input-name');
    const email = document.getElementById('input-email');
    if (!name || !name.value.trim()) {
      name.focus();
      name.style.borderColor = 'rgba(220,80,80,0.6)';
      setTimeout(() => { name.style.borderColor = ''; }, 2000);
      return;
    }
    if (!email || !email.value.includes('@')) {
      email.focus();
      email.style.borderColor = 'rgba(220,80,80,0.6)';
      setTimeout(() => { email.style.borderColor = ''; }, 2000);
      return;
    }
    showPanel(3);
  }
}

function prevStep(from) {
  showPanel(from - 1);
}

function showPanel(step) {
  currentStep = step;
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('step-' + step);
  if (target) target.classList.add('active');
  updateStepIndicator(step);
}

function selectBudget(btn) {
  document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedBudget = btn.getAttribute('data-value');
}

function submitInquiry() {
  const submitBtn = document.getElementById('step3-submit');
  if (submitBtn) {
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
  }
  setTimeout(() => {
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    const success = document.getElementById('step-success');
    if (success) success.classList.add('active');
    const steps = document.querySelector('.form-steps');
    if (steps) steps.style.display = 'none';
  }, 1200);
}

function selectServiceAndScroll(serviceName, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // 1. Restore form steps indicator if hidden by previous submission
  const formSteps = document.querySelector('.form-steps');
  if (formSteps) formSteps.style.display = 'flex';

  // 2. Show Step 1 of form panel
  if (typeof showPanel === 'function') {
    showPanel(1);
  }

  // 3. Select matching service checkbox & highlight golden card
  if (serviceName) {
    const checkboxes = document.querySelectorAll('#service-checkboxes input[type="checkbox"]');
    checkboxes.forEach(cb => {
      const match = (cb.value.toLowerCase().trim() === serviceName.toLowerCase().trim());
      cb.checked = match;
      const parentLabel = cb.closest('.service-check');
      if (parentLabel) {
        parentLabel.classList.toggle('active', match);
      }
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // 4. Smooth scroll to contact section
  const contact = document.getElementById('contact');
  if (contact) {
    const headerOffset = 90;
    const elementPosition = contact.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Expose form functions globally so inline onclick handlers can reach them
window.nextStep = nextStep;
window.prevStep = prevStep;
window.selectBudget = selectBudget;
window.submitInquiry = submitInquiry;
window.selectServiceAndScroll = selectServiceAndScroll;


// ─── Initialize All ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavbarManager.init();
  ParticleSystem.init();
  CounterAnimation.init();
  ScrollReveal.init();
  ActiveNavLink.init();
  SmoothScroll.init();
  CursorGlow.init();
  CardTilt.init();
  FloatingButtons.init();
});
