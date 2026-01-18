document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.querySelector(".typing-text");
  if (!textElement) return; // ⛔ stop kalau elemen tidak ada

  const words = ["Ide hadiah awal tahunmu"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    if (isDeleting) {
      textElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 500);
      return;
    }

    setTimeout(typeEffect, typingSpeed);
  }

  typeEffect();
});
