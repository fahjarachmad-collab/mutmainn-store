(() => {
  const track = document.getElementById("bannerTrack");
  if (!track) return;

  let slides = [...track.children];

  // clone first slide for seamless loop
  const clone = slides[0].cloneNode(true);
  track.appendChild(clone);
  slides = [...track.children];

  const total = slides.length;
  let index = 0;

  const SLIDE_TIME = 1100;
  const ZOOM_TIME = 3000;
  const DELAY = 2500;

  function setActive() {
    slides.forEach(s => s.classList.remove("active"));
    slides[index]?.classList.add("active");
  }

  function go() {
    index++;

    track.style.transition =
      `transform ${SLIDE_TIME}ms cubic-bezier(.4,0,.2,1)`;
    track.style.transform = `translateX(-${index * 100}%)`;

    setActive();

    // seamless reset
    if (index === total - 1) {
      setTimeout(() => {
        track.style.transition = "none";
        index = 0;
        track.style.transform = "translateX(0)";
        setActive();
      }, SLIDE_TIME);
    }
  }

  function start() {
    setActive();
    setInterval(go, DELAY);
  }

  start();
})();
