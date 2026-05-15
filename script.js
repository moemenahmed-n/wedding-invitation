// Device / preference detection
const isMobile = window.matchMedia('(max-width: 540px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- One-time flower shower (triggered when envelope opens) ----------
function startFlowerShower() {
  if (reduceMotion) return;
  const container = document.querySelector('.petals');
  if (!container || container.dataset.started) return;
  container.dataset.started = '1';
  const count = isMobile ? 30 : 50;
  const variants = ['f1', 'f2', 'f3'];
  let maxEnd = 0;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal ' + variants[Math.floor(Math.random() * variants.length)];
    const size = 18 + Math.random() * 16;             // 18-34px — small delicate blossoms
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.left = Math.random() * 100 + 'vw';
    const duration = 7 + Math.random() * 5;           // 7-12s fall — quicker shower
    const delay = Math.random() * 3.5;                // staggered start 0-3.5s
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = delay + 's';
    maxEnd = Math.max(maxEnd, duration + delay);
    container.appendChild(petal);
  }
  // Clean up DOM nodes after shower ends
  setTimeout(() => container.replaceChildren(), (maxEnd + 1) * 1000);
}

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
  document.body.classList.add('invitation-open');
  startFlowerShower();
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
