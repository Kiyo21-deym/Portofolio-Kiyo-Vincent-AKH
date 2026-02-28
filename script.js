document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.querySelector('.header__menu-mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';

      hamburger.setAttribute('aria-expanded', String(!isExpanded));
      // FIX: aria-hidden value must be a string 'true'/'false', not a boolean
      mobileMenu.setAttribute('aria-hidden', String(isExpanded));
      hamburger.classList.toggle('hamburger--open');
      mobileMenu.classList.toggle('active');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        mobileMenu.classList.contains('active') &&
        !hamburger.contains(e.target) &&
        !mobileMenu.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // FIX: Extracted repeated close logic into a reusable helper function
    function closeMobileMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('hamburger--open');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ============================================
  // THEME TOGGLE
  // ============================================
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');

  if (themeToggle) {
    // Load saved theme — fallback to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      }
      // FIX: aria-pressed must be string 'true'/'false'
      themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  // ============================================
  // PROJECT PREVIEW SWITCHER
  // ============================================
  const projectListItems = document.querySelectorAll('.project-list-item');
  const projectPreviews = document.querySelectorAll('.project-preview');

  projectListItems.forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.getAttribute('data-project');

      // Update list items
      projectListItems.forEach(li => {
        li.classList.remove('active');
        li.setAttribute('aria-pressed', 'false');
      });
      item.classList.add('active');
      item.setAttribute('aria-pressed', 'true');

      // Update previews
      projectPreviews.forEach(preview => {
        if (preview.id === projectId) {
          preview.classList.add('active');
          preview.setAttribute('aria-hidden', 'false');
        } else {
          preview.classList.remove('active');
          preview.setAttribute('aria-hidden', 'true');
        }
      });
    });
  });

  // ============================================
  // CONTACT FORM VALIDATION
  // ============================================
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const clearErrors = () => {
    if (nameError) { nameError.textContent = ''; }
    if (emailError) { emailError.textContent = ''; }
    if (messageError) { messageError.textContent = ''; }
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.style.color = '';
    }
  };

  const validateField = (field, errorElement, type = 'text') => {
    if (!field || !errorElement) return true;

    const value = field.value.trim();

    if (!value) {
      errorElement.textContent = 'This field is required';
      field.style.borderColor = '#ef4444';
      return false;
    }

    if (type === 'email' && !emailRegex.test(value)) {
      errorElement.textContent = 'Please enter a valid email address';
      field.style.borderColor = '#ef4444';
      return false;
    }

    errorElement.textContent = '';
    field.style.borderColor = '';
    return true;
  };

  // Real-time validation on blur and on input (clear once valid)
  // FIX: Guard against null inputs before accessing .type (fixes crash when elements missing)
  [
    { input: nameInput,    error: nameError,    type: 'text' },
    { input: emailInput,   error: emailError,   type: 'email' },
    { input: messageInput, error: messageError, type: 'text' },
  ].forEach(({ input, error, type }) => {
    if (!input || !error) return;

    input.addEventListener('blur', () => {
      validateField(input, error, type);
    });

    input.addEventListener('input', () => {
      // Only re-validate on input if there's already an error showing
      if (error.textContent) {
        validateField(input, error, type);
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const isNameValid    = validateField(nameInput,    nameError,    'text');
      const isEmailValid   = validateField(emailInput,   emailError,   'email');
      const isMessageValid = validateField(messageInput, messageError, 'text');

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        if (formStatus) {
          formStatus.textContent = 'Please fix the errors above before submitting.';
          formStatus.style.color = '#ef4444';
        }
        // Focus first invalid field for accessibility
        if (!isNameValid && nameInput) nameInput.focus();
        else if (!isEmailValid && emailInput) emailInput.focus();
        else if (!isMessageValid && messageInput) messageInput.focus();
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';

      contactForm.querySelectorAll('input, textarea').forEach(field => {
        field.disabled = true;
      });

      // Simulate async submission
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;

        contactForm.querySelectorAll('input, textarea').forEach(field => {
          field.disabled = false;
        });

        if (formStatus) {
          formStatus.textContent = "Message sent successfully! I'll get back to you soon.";
          formStatus.style.color = 'var(--accent-color)';
        }

        contactForm.reset();

        // Clear status message after 5 seconds
        setTimeout(() => {
          if (formStatus) {
            formStatus.textContent = '';
            formStatus.style.color = '';
          }
        }, 5000);
      }, 1500);
    });
  }

  // ============================================
  // FOOTER YEAR
  // ============================================
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  // FIX: Indentation was misaligned (mixed 2-space and 4-space indent).
  // Standardised to 2 spaces throughout. Logic is unchanged.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 120;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

          // Close mobile menu if open
          const mob = document.querySelector('.header__menu-mobile');
          const ham = document.getElementById('hamburger-menu');
          if (mob && mob.classList.contains('active')) {
            mob.classList.remove('active');
            mob.setAttribute('aria-hidden', 'true');
            ham.setAttribute('aria-expanded', 'false');
            ham.classList.remove('hamburger--open');
            document.body.style.overflow = '';
          }
        }
      }
    });
  });

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  // FIX: Was directly overwriting header.style.background with a hardcoded colour string,
  // which conflicts with CSS variables and glass theme on scroll-up.
  // Replaced with CSS class toggle for clean separation of concerns.
  const header = document.querySelector('.header');

  if (header) {
    const onScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    };

    // Use passive listener for scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });
  }

});
