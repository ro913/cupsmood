const cols = [["Біла", "#ffffff"], ["Помаранчева", "#ff7a1a"], ["Графітова", "#3b3d42"], ["Кремова", "#f1e3cc"]];
const $ = id => document.getElementById(id);
function lum(h) { const n = parseInt(h.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; return (.299 * r + .587 * g + .114 * b) / 255 }
function setColor(c) {
    $('body').setAttribute('fill', c); $('handle').setAttribute('stroke', c);
    $('txt').setAttribute('fill', $('pic').getAttribute('visibility') === 'visible' ? '#fff' : (lum(c) > .55 ? '#2a2c30' : '#fff'));
    document.querySelectorAll('.sw').forEach(b => b.setAttribute('aria-pressed', b.dataset.c === c));
}
cols.forEach(([n, c], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.dataset.c = c;
    b.style.background = c; b.title = n; b.setAttribute('aria-label', n); b.onclick = () => setColor(c); $('sws').appendChild(b)
});
let cur = "#ffffff";
document.querySelectorAll('.sw').forEach(b => b.addEventListener('click', () => cur = b.dataset.c));
setColor(cur);
$('t').oninput = e => { $('txt').textContent = e.target.value || ' ' };
$('f').onchange = e => {
    const f = e.target.files[0];
    if (!f) { $('pic').setAttribute('visibility', 'hidden'); $('shade').setAttribute('opacity', 0); setColor(cur); return }
    const r = new FileReader();
    r.onload = () => {
        $('pic').setAttribute('href', r.result); $('pic').setAttribute('visibility', 'visible');
        $('shade').setAttribute('opacity', .35); $('txt').setAttribute('fill', '#fff')
    };
    r.readAsDataURL(f);
};
function modeUpd() {
    const m = $('mode').value;
    $('wt').style.display = m === 'photo' ? 'none' : '';
    $('wf').style.display = m === 'text' ? 'none' : '';
    if (m === 'text') { $('f').value = ''; $('pic').setAttribute('visibility', 'hidden'); $('shade').setAttribute('opacity', 0); setColor(cur) }
    $('txt').style.display = m === 'photo' ? 'none' : '';
    const names = { both: 'фото та напис', photo: 'лише фото', text: 'лише напис' };
    $('sum').textContent = 'Ваш макет: ' + names[m] + ', чашка ' + (cols.find(c => c[1] === cur) || cols[0])[0].toLowerCase() + '. Змініть його в конструкторі вище.';
}
$('mode').onchange = modeUpd;
document.querySelectorAll('.sw').forEach(b => b.addEventListener('click', modeUpd));
modeUpd();
$('form').onsubmit = async e => {
    e.preventDefault();
    const o = $('ok'), m = $('mode').value, file = $('f').files[0];
    o.style.display = 'block';
    if (m !== 'text' && !file) { o.textContent = 'Додайте фото в конструкторі або оберіть «Лише напис».'; return }
    if (m !== 'photo' && !$('t').value.trim()) { o.textContent = 'Впишіть напис у конструкторі або оберіть «Лише фото».'; return }
    const fd = new FormData();
    fd.append('mode', m);
    fd.append('text', m === 'photo' ? '' : $('t').value.trim());
    fd.append('color', (cols.find(c => c[1] === cur) || cols[0])[0]);
    fd.append('type', $('ty').value);
    fd.append('name', $('nm').value);
    fd.append('contact', $('ph').value);
    fd.append('comment', $('cm').value);
    if (m !== 'text' && file) fd.append('photo', file);
    $('send').disabled = true; o.textContent = 'Надсилаємо...';
    try {
        const r = await fetch('/api/order', { method: 'POST', body: fd });
        if (!r.ok) throw 0;
        o.textContent = 'Дякуємо, ' + $('nm').value + '! Замовлення надіслано, ми зв\'яжемося з вами та погодимо макет.';
        e.target.reset();
    } catch (x) { o.textContent = 'Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Telegram: @CupsMood_bot'; }
    $('send').disabled = false;
};