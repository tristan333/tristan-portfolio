const ROOM_URL = 'https://reading-base.tristan-paton33.workers.dev/';
const DATA_URL = `${ROOM_URL}data.json`;
const STALE_AFTER_DAYS = 7;
const RECENT_COUNT = 4;
const QUEUE_COUNT = 5;

const root = document.getElementById('reading');
if (root) init(root);

async function init(section) {
    const body = section.querySelector('.reading-body');
    let data;
    try {
        data = await load();
    } catch {
        section.remove();
        return;
    }

    const tabs = buildTabs(data);
    if (!tabs.length) {
        section.remove();
        return;
    }

    renderStatus(section, data.generated);
    body.innerHTML = `
        <div class="reading-tabs" role="tablist" aria-label="Reading">
            ${tabs.map((t, i) => `
                <button class="reading-tab" role="tab" id="reading-tab-${t.id}"
                    aria-controls="reading-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"
                    data-tab="${t.id}">${t.label}${t.count ? `<span class="reading-tab-count">${t.count}</span>` : ''}</button>
            `).join('')}
            <span class="reading-indicator" aria-hidden="true"></span>
        </div>
        <div class="reading-panels">
            <div class="reading-panel" id="reading-panel" role="tabpanel"></div>
        </div>
        <p class="reading-foot"><a href="${ROOM_URL}" target="_blank" rel="noopener" class="journey-link">See what else I've been reading</a></p>
    `;

    const tabEls = [...body.querySelectorAll('.reading-tab')];
    const indicator = body.querySelector('.reading-indicator');
    const panels = body.querySelector('.reading-panels');
    const panel = body.querySelector('.reading-panel');

    const moveIndicator = (tab) => {
        indicator.style.setProperty('--x', `${tab.offsetLeft}px`);
        indicator.style.setProperty('--w', `${tab.offsetWidth}px`);
    };

    const select = (index, { animate = true } = {}) => {
        const tab = tabEls[index];
        tabEls.forEach((t) => {
            const active = t === tab;
            t.setAttribute('aria-selected', active);
            t.tabIndex = active ? 0 : -1;
        });
        moveIndicator(tab);

        const from = panels.offsetHeight;
        panel.setAttribute('aria-labelledby', tab.id);
        panel.dataset.panel = tab.dataset.tab;
        panel.innerHTML = tabs[index].render();
        panel.style.animation = 'none';
        void panel.offsetWidth;
        panel.style.animation = '';
        if (!animate) return;

        const to = panels.scrollHeight;
        panels.style.height = `${from}px`;
        requestAnimationFrame(() => {
            panels.style.height = `${to}px`;
        });
    };

    panels.addEventListener('transitionend', (e) => {
        if (e.target === panels && e.propertyName === 'height') panels.style.height = '';
    });

    tabEls.forEach((tab, i) => {
        tab.addEventListener('click', () => select(i));
        tab.addEventListener('keydown', (e) => {
            const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            const next = (i + step + tabEls.length) % tabEls.length;
            tabEls[next].focus();
            select(next);
        });
    });

    window.addEventListener('resize', () => {
        moveIndicator(body.querySelector('.reading-tab[aria-selected="true"]'));
    });
    document.fonts?.ready.then(() => {
        moveIndicator(body.querySelector('.reading-tab[aria-selected="true"]'));
    });

    select(0, { animate: false });
}

async function load() {
    try {
        const res = await fetch(DATA_URL, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (window.READING_SAMPLE) return window.READING_SAMPLE;
        throw err;
    }
}

function buildTabs(data) {
    const tabs = [];

    const entries = [...(data.entries || [])]
        .filter((e) => e.title && safeUrl(e.url))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (entries.length) {
        const current = entries.find((e) => e.tags?.includes('now'));
        const feature = current || entries[0];
        const rest = entries.filter((e) => e !== feature).slice(0, RECENT_COUNT);
        tabs.push({
            id: 'recent',
            label: 'Recent',
            render: () => `
                ${featureHtml({
                    url: feature.url,
                    kicker: current ? 'Now reading' : 'Latest',
                    aside: feature.topic,
                    title: feature.title,
                    meta: [feature.source, formatDate(feature.date)].filter(Boolean).join(' · '),
                    summary: feature.summary,
                })}
                <ul class="reading-list">
                    ${rest.map((e, i) => rowHtml({ i, url: e.url, mark: formatDate(e.date), title: e.title, aside: e.source })).join('')}
                </ul>
            `,
        });
    }

    const queued = (data.queue || []).flatMap((t) => t.items.map((item) => ({ ...item, theme: t.theme })))
        .filter((q) => q.title && safeUrl(q.url));
    if (queued.length) {
        tabs.push({
            id: 'queue',
            label: 'Up next',
            count: queued.length,
            render: () => `
                <ul class="reading-list">
                    ${queued.slice(0, QUEUE_COUNT).map((q, i) => rowHtml({
                        i,
                        url: q.url,
                        mark: String(i + 1).padStart(2, '0'),
                        title: q.title,
                        aside: q.theme,
                    })).join('')}
                </ul>
            `,
        });
    }

    const digest = [...(data.digests || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
    const threads = digest ? parseThreads(digest.body) : [];
    if (threads.length) {
        const [lead, ...more] = threads;
        tabs.push({
            id: 'dispatch',
            label: 'Dispatch',
            render: () => `
                ${featureHtml({
                    url: ROOM_URL,
                    kicker: 'Weekly dispatch',
                    aside: formatDate(digest.date),
                    title: lead.title,
                    summary: lead.text,
                })}
                <ul class="reading-list">
                    ${more.map((t, i) => rowHtml({ i, url: ROOM_URL, mark: `§${i + 2}`, title: t.title })).join('')}
                </ul>
            `,
        });
    }

    return tabs;
}

function featureHtml({ url, kicker, aside, title, meta, summary }) {
    return `
        <a class="reading-feature" href="${esc(url)}" target="_blank" rel="noopener">
            <span class="reading-kicker"><span>${esc(kicker)}</span>${aside ? `<span>${esc(aside)}</span>` : ''}</span>
            <span class="reading-feature-title">${esc(title)} <span class="reading-arrow" aria-hidden="true">↗</span></span>
            ${meta ? `<span class="reading-meta">${esc(meta)}</span>` : ''}
            ${summary ? `<span class="reading-summary">${esc(plain(summary))}</span>` : ''}
        </a>
    `;
}

function rowHtml({ i, url, mark, title, aside }) {
    return `
        <li>
            <a class="reading-row" href="${esc(url)}" target="_blank" rel="noopener" style="--i:${i}">
                <span class="reading-row-mark">${esc(mark)}</span>
                <span class="reading-row-title">${esc(title)}</span>
                <span class="reading-row-source">${aside ? esc(aside) : ''}<span class="reading-arrow" aria-hidden="true">↗</span></span>
            </a>
        </li>
    `;
}

function renderStatus(section, generated) {
    const status = section.querySelector('.reading-status-text');
    const then = new Date(generated);
    if (!status || Number.isNaN(then.getTime())) return;
    const days = Math.floor((Date.now() - then) / 86_400_000);
    const stale = days > STALE_AFTER_DAYS;
    section.classList.toggle('is-stale', stale);
    status.textContent = `${stale ? 'updated' : 'synced'} ${relative(days)}`;
    status.parentElement.title = then.toLocaleString();
}

function parseThreads(markdown) {
    const section = markdown.split(/^## /m).find((s) => s.startsWith('Threads'));
    if (!section) return [];
    return [...section.matchAll(/^\*\*(.+?)\*\*\s*(.+)$/gm)].map((m) => ({
        title: m[1].replace(/\.$/, ''),
        text: m[2],
    }));
}

function plain(markdown) {
    return markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '');
}

function relative(days) {
    if (days < 1) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 14) return `${days} days ago`;
    if (days < 60) return `${Math.round(days / 7)} weeks ago`;
    return `${Math.round(days / 30)} months ago`;
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function safeUrl(url) {
    return typeof url === 'string' && /^https?:\/\//.test(url);
}

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
}
