// ---------- Basics ----------
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

// Hide a photo if it fails to load, so no broken-image icon shows
document.querySelectorAll('img').forEach((img) => {
  const hide = () => { img.style.visibility = 'hidden'; };
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener('error', hide, { once: true });
});

document.getElementById('year').textContent = new Date().getFullYear();

document.querySelector('.demo-close').addEventListener('click', () => {
  document.getElementById('demo-note').classList.add('hidden');
});

// Dietary marks after each menu item, from its data-tags
document.querySelectorAll('.menu-list li').forEach((li) => {
  if (!li.dataset.tags) return;
  const mark = document.createElement('span');
  mark.className = 'diet';
  mark.textContent = li.dataset.tags;
  li.querySelector('.item').append(mark);
});

// ---------- Hours, open status, today's soup ----------
// Opening hours by weekday (0 = Sunday), in 24h decimal hours
const HOURS = { 0: [9, 14], 1: [7, 16], 2: [7, 16], 3: [7, 16], 4: [7, 16], 5: [7, 16], 6: [8, 16] };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SOUPS = [
  'Chicken and wild rice',        // Sunday
  'Roasted tomato and basil',     // Monday
  'Curried lentil (vegan)',       // Tuesday
  'Potato, leek and cheddar',     // Wednesday
  'Beef and barley',              // Thursday
  'Clam chowder',                 // Friday
  'Butternut squash (vegan)',     // Saturday
];

const fmtHour = (h) => {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  return `${hr % 12 || 12}${min ? `:${String(min).padStart(2, '0')}` : ''} ${hr < 12 ? 'am' : 'pm'}`;
};

// Current day and time in St. Albert, whatever time zone the visitor is in
function localNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    hour: Number(get('hour')) + Number(get('minute')) / 60,
    date: new Date(Number(get('year')), Number(get('month')) - 1, Number(get('day'))),
  };
}

const now = localNow();

(function showStatus() {
  const [open, close] = HOURS[now.day];
  const statusEl = document.getElementById('open-status');
  const detailEl = document.getElementById('open-detail');
  const dot = document.getElementById('status-dot');
  document.querySelector(`.hours tr[data-days~="${now.day}"]`)?.classList.add('today');
  document.getElementById('soup').textContent = SOUPS[now.day];

  if (now.hour >= open && now.hour < close) {
    statusEl.textContent = 'Open now';
    detailEl.textContent = `until ${fmtHour(close)}`;
    dot.classList.add('open');
  } else if (now.hour < open) {
    statusEl.textContent = 'Closed';
    detailEl.textContent = `opens at ${fmtHour(open)} today`;
    dot.classList.add('closed');
  } else {
    const tomorrow = (now.day + 1) % 7;
    statusEl.textContent = 'Closed';
    detailEl.textContent = `opens tomorrow at ${fmtHour(HOURS[tomorrow][0])}`;
    dot.classList.add('closed');
  }
})();

// ---------- Menu filters ----------
const filterButtons = document.querySelectorAll('.filter');
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    document.querySelectorAll('.menu-section').forEach((section) => {
      let shown = 0;
      section.querySelectorAll('.menu-list li').forEach((li) => {
        const match = f === 'all' || li.dataset.tags.split(' ').includes(f);
        li.hidden = !match;
        if (match) shown++;
      });
      section.classList.toggle('empty', shown === 0);
    });
  });
});

// ---------- Order ahead ----------
const form = document.getElementById('order-form');
const items = [...document.querySelectorAll('#order-items li')];
const totalEl = document.getElementById('order-total');
const itemsError = document.getElementById('items-error');
const daySel = document.getElementById('pickup-day');
const timeSel = document.getElementById('pickup-time');
const notice = document.getElementById('notice');
const statusMsg = document.getElementById('form-status');
const receiptLines = document.getElementById('receipt-lines');
const whenEl = document.getElementById('receipt-when');
const GST = 0.05;
const BIG_ORDER = 150;
const money = (n) => `$${n.toFixed(2)}`;

function orderTotal() {
  return items.reduce((sum, li) => sum + Number(li.dataset.price) * Number(li.querySelector('output').textContent), 0);
}

function updateTotal() {
  items.forEach((li) => {
    const qty = Number(li.querySelector('output').textContent);
    li.classList.toggle('has-qty', qty > 0);
    li.querySelector('.stepper button').disabled = qty === 0;
  });
  const sub = orderTotal();
  totalEl.textContent = money(sub);
  document.getElementById('order-gst').textContent = money(sub * GST);
  document.getElementById('order-grand').textContent = money(sub * (1 + GST));
  receiptLines.innerHTML = '';
  items.forEach((li) => {
    const qty = Number(li.querySelector('output').textContent);
    if (!qty) return;
    const row = document.createElement('li');
    row.append(`${qty} x ${li.querySelector('.item').textContent}`);
    const amt = document.createElement('span');
    amt.textContent = money(qty * Number(li.dataset.price));
    row.append(amt);
    receiptLines.append(row);
  });
  if (!receiptLines.children.length) receiptLines.innerHTML = '<li class="receipt-empty">Nothing yet.</li>';
  if (orderTotal() > 0) itemsError.hidden = true;
  checkNotice();
}

items.forEach((li) => {
  const [minus, plus] = li.querySelectorAll('.stepper button');
  const out = li.querySelector('output');
  minus.addEventListener('click', () => { out.textContent = Math.max(0, Number(out.textContent) - 1); updateTotal(); });
  plus.addEventListener('click', () => { out.textContent = Math.min(20, Number(out.textContent) + 1); updateTotal(); });
});

// Pickup days: the next 7 days. Today only if it's before 10 am (then pickup from 1 pm).
function buildDays() {
  daySel.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.date);
    d.setDate(d.getDate() + i);
    if (i === 0 && now.hour >= 10) continue;
    const label = d.toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' });
    const opt = new Option(i === 0 ? `Today, ${label}` : i === 1 ? `Tomorrow, ${label}` : label, String(i));
    opt.dataset.weekday = d.getDay();
    daySel.add(opt);
  }
}

// Pickup times: every 30 minutes from 1 hour after opening to 30 minutes before close
function buildTimes() {
  const opt = daySel.selectedOptions[0];
  const offset = Number(opt.value);
  const [open, close] = HOURS[Number(opt.dataset.weekday)];
  const start = offset === 0 ? 13 : open + 1;
  const previous = timeSel.value;
  timeSel.innerHTML = '';
  for (let t = start; t <= close - 0.5; t += 0.5) {
    timeSel.add(new Option(fmtHour(t), String(t)));
  }
  if ([...timeSel.options].some((o) => o.value === previous)) timeSel.value = previous;
  showWhen();
}

function showWhen() {
  whenEl.textContent = `${daySel.selectedOptions[0].text.replace(/, \w+ \d+$/, '')}, ${timeSel.selectedOptions[0]?.text || ''}`;
}
timeSel.addEventListener('change', showWhen);

// Orders over $150 need 48 hours
function bigOrderTooSoon() {
  return orderTotal() > BIG_ORDER && Number(daySel.value) < 2;
}
function checkNotice() {
  if (bigOrderTooSoon()) {
    notice.textContent = `Orders over $${BIG_ORDER} need 48 hours. Please pick a day at least two days from now, or text us and we'll see what we can do.`;
    notice.hidden = false;
  } else {
    notice.hidden = true;
  }
}

daySel.addEventListener('change', () => { buildTimes(); checkNotice(); clearError(daySel); });
buildDays();
buildTimes();

// ---------- Validation ----------
function setError(field, message) {
  const wrap = field.closest('.field');
  wrap.classList.add('invalid');
  let msg = wrap.querySelector('.error');
  if (!msg) { msg = document.createElement('span'); msg.className = 'error'; wrap.appendChild(msg); }
  msg.textContent = message;
  field.setAttribute('aria-invalid', 'true');
}
function clearError(field) {
  const wrap = field.closest('.field');
  wrap.classList.remove('invalid');
  wrap.querySelector('.error')?.remove();
  field.removeAttribute('aria-invalid');
}
form.querySelectorAll('input, textarea').forEach((el) => el.addEventListener('input', () => clearError(el)));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  statusMsg.textContent = '';
  statusMsg.className = 'form-status';
  let firstBad = null;

  if (orderTotal() === 0) {
    itemsError.hidden = false;
    firstBad = items[0].querySelectorAll('.stepper button')[1];
  }
  if (bigOrderTooSoon()) {
    setError(daySel, 'Please pick a day at least two days from now.');
    firstBad ||= daySel;
  }
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  if (name.value.trim().length < 2) { setError(name, 'Please enter your name.'); firstBad ||= name; }
  if (phone.value.replace(/\D/g, '').length < 10) { setError(phone, 'Please enter a 10-digit mobile number.'); firstBad ||= phone; }

  if (firstBad) { firstBad.focus(); return; }

  const first = name.value.trim().split(' ')[0];
  const when = `${daySel.selectedOptions[0].text.replace(/^(Today|Tomorrow), /, '')} at ${timeSel.selectedOptions[0].text}`;
  statusMsg.textContent = `Thanks ${first}. We'll text you to confirm your ${money(orderTotal() * (1 + GST))} order for ${when}. (This is a demo site, so nothing was actually sent.)`;
  statusMsg.classList.add('ok');

  form.reset();
  items.forEach((li) => { li.querySelector('output').textContent = '0'; });
  buildDays();
  buildTimes();
  updateTotal();
});

updateTotal();
