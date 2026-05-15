// Device / preference detection
const isMobile = window.matchMedia('(max-width: 540px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Falling petals ----------
(function generatePetals() {
  if (reduceMotion) return;
  const container = document.querySelector('.petals');
  const petalCount = isMobile ? 12 : 22;
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = 8 + Math.random() * 14;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = (8 + Math.random() * 10) + 's';
    petal.style.animationDelay = (-Math.random() * 12) + 's';
    petal.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
    container.appendChild(petal);
  }
})();

// ---------- Sparkles ----------
(function generateSparkles() {
  if (reduceMotion) return;
  const container = document.querySelector('.sparkles');
  const count = isMobile ? 14 : 28;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    const size = 3 + Math.random() * 5;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 100 + 'vh';
    s.style.animationDuration = (3 + Math.random() * 4) + 's';
    s.style.animationDelay = (-Math.random() * 5) + 's';
    container.appendChild(s);
  }
})();

// ---------- Envelope intro ----------
const envelope = document.getElementById('envelope');
const card = document.getElementById('card');

function openInvitation() {
  if (envelope.classList.contains('opening')) return;
  envelope.classList.add('opening');
  setTimeout(() => {
    envelope.classList.add('opened');
    card.setAttribute('aria-hidden', 'false');
    card.classList.add('show');
    revealSequentially();
    if (navigator.vibrate) navigator.vibrate(20);
  }, 900);
}

envelope.addEventListener('click', openInvitation);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation(); }
});

function revealSequentially() {
  const items = document.querySelectorAll('.card .reveal');
  items.forEach((el, i) => setTimeout(() => el.classList.add('visible'), 120 * i));
}

// Auto-open envelope after a short delay if user doesn't tap
setTimeout(() => {
  if (!envelope.classList.contains('opening')) openInvitation();
}, 3500);

// ---------- Countdown ----------
(function countdown() {
  // Cairo = UTC+2 (no DST). 4:00 PM Cairo = 14:00 UTC.
  const target = new Date(Date.UTC(2026, 4, 29, 14, 0, 0));
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];
  const els = ids.map(id => document.getElementById(id));
  const last = ['', '', '', ''];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    const now = new Date();
    let diff = Math.max(0, target - now);
    const days  = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);  diff -= hours * 3600000;
    const mins  = Math.floor(diff / 60000);    diff -= mins * 60000;
    const secs  = Math.floor(diff / 1000);
    [pad(days), pad(hours), pad(mins), pad(secs)].forEach((v, i) => {
      if (v !== last[i]) {
        els[i].textContent = v;
        els[i].classList.remove('tick');
        void els[i].offsetWidth;
        els[i].classList.add('tick');
        last[i] = v;
      }
    });
  }
  tick();
  setInterval(tick, 1000);
})();

// ---------- Add to Calendar (.ics) ----------
document.getElementById('add-cal').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//Mo'men & Menna//Wedding//EN",
    'BEGIN:VEVENT',
    'UID:moemen-menna-wedding-2026@local',
    'DTSTAMP:20260101T000000Z',
    'DTSTART:20260529T140000Z',
    'DTEND:20260529T200000Z',
    "SUMMARY:Mo'men & Menna's Wedding",
    'LOCATION:Al Aly Al Azeem, Almazah',
    'DESCRIPTION:Join us to celebrate our wedding! https://maps.app.goo.gl/yazivd46UWntYhbt6',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Moemen-Menna-Wedding.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ---------- Share button ----------
document.getElementById('share-btn').addEventListener('click', async () => {
  const shareData = {
    title: "Mo'men & Menna's Wedding",
    text: "You're invited to celebrate Mo'men & Menna's wedding on Friday, 29 May 2026 at 4:00 PM — Al Aly Al Azeem, Almazah.",
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      const btn = document.getElementById('share-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Link copied';
      setTimeout(() => { btn.innerHTML = original; }, 1800);
    }
  } catch (_) { /* user cancelled */ }
});

// ---------- Subtle parallax on device tilt (mobile) ----------
if (!reduceMotion && window.DeviceOrientationEvent && isMobile) {
  const glow1 = document.querySelector('.bg-glow-1');
  const glow2 = document.querySelector('.bg-glow-2');
  window.addEventListener('deviceorientation', (e) => {
    const x = (e.gamma || 0) / 45;
    const y = (e.beta  || 0) / 90;
    if (glow1) glow1.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    if (glow2) glow2.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
  }, true);
}
