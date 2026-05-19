/**
 * UGC Hoox - Interactive "See It In Action" demo
 * Tabbed pillar demo: Hook Analyzer is fully interactive (sample chips ->
 * animated 4-dimension scoring). Pitch / Community / Calendar are static
 * preview panels with an on-switch reveal.
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preset hook samples (mock data — no real backend on a static page).
  var HOOK_SAMPLES = [
    {
      text: 'Just launched my new skincare line — check it out and let me know what you think!',
      suggestion: 'Solid energy, but the opener is generic. Lead with a bold claim or a stat to stop the scroll.',
      scores: { creativity: 64, emotion: 58, cta: 81, punch: 49 }
    },
    {
      text: 'I almost quit UGC last month. Then one pitch changed everything — here’s exactly what I sent.',
      suggestion: 'Strong story hook and curiosity gap. Tighten the payoff line so the punch lands faster.',
      scores: { creativity: 88, emotion: 92, cta: 74, punch: 86 }
    },
    {
      text: 'How to film a full week of UGC in 2 hours (the batching system brands pay me for).',
      suggestion: 'Clear value and specificity. Add an emotional stake so it’s not purely transactional.',
      scores: { creativity: 79, emotion: 61, cta: 90, punch: 83 }
    }
  ];

  var KEYS = ['creativity', 'emotion', 'cta', 'punch'];

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Tabs ---------- */

  function activateTab(name) {
    qsa('.demo-tab').forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    qsa('.demo-panel').forEach(function (panel) {
      var on = panel.getAttribute('data-panel') === name;
      panel.classList.toggle('is-active', on);
      if (on) {
        panel.removeAttribute('hidden');
        // one-shot reveal
        panel.classList.remove('panel-reveal');
        // force reflow so the animation re-runs each switch
        void panel.offsetWidth;
        if (!prefersReducedMotion) panel.classList.add('panel-reveal');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  /* ---------- Hook analyzer ---------- */

  function resetHookScores() {
    qsa('#demo-feedback .feedback-item').forEach(function (item) {
      item.classList.remove('show');
      var fill = qs('.mini-score-fill', item);
      if (fill) fill.style.width = '0%';
      var val = qs('.mini-score-value', item);
      if (val) val.textContent = '0%';
    });
    var sug = qs('#feedback-suggestion');
    if (sug) sug.classList.remove('show');
  }

  function applyScores(sample, animate) {
    var sug = qs('#feedback-suggestion');
    var sugText = qs('#suggestion-text');
    if (sugText) sugText.textContent = sample.suggestion;

    var items = qsa('#demo-feedback .feedback-item');

    function paint(item) {
      var key = item.getAttribute('data-delay');
      // map row order -> key
      var k = KEYS[parseInt(key, 10)] || KEYS[0];
      var target = sample.scores[k];
      var fill = qs('.mini-score-fill', item);
      var val = qs('.mini-score-value', item);
      if (fill) fill.style.width = target + '%';
      if (val) val.textContent = target + '%';
      item.classList.add('show');
    }

    if (!animate || prefersReducedMotion) {
      if (sug) sug.classList.add('show');
      items.forEach(paint);
      return;
    }

    if (sug) sug.classList.add('show');
    items.forEach(function (item, i) {
      setTimeout(function () { paint(item); }, 220 + i * 280);
    });
  }

  function showSample(index, animate) {
    var sample = HOOK_SAMPLES[index];
    if (!sample) return;

    qsa('.sample-chip').forEach(function (chip) {
      chip.classList.toggle('active', chip.getAttribute('data-sample') === String(index));
    });

    var textEl = qs('#hook-sample-text');
    if (textEl) textEl.textContent = sample.text;

    resetHookScores();
    if (animate && !prefersReducedMotion) {
      // brief beat so the reset is visible before bars fill
      setTimeout(function () { applyScores(sample, true); }, 120);
    } else {
      applyScores(sample, false);
    }
  }

  /* ---------- Wiring ---------- */

  function bind() {
    qsa('.demo-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.getAttribute('data-tab'));
      });
    });

    // Arrow-key navigation across the tablist
    var tabs = qsa('.demo-tab');
    tabs.forEach(function (tab, i) {
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) {
          e.preventDefault();
          next.focus();
          activateTab(next.getAttribute('data-tab'));
        }
      });
    });

    qsa('.sample-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        showSample(parseInt(chip.getAttribute('data-sample'), 10), true);
      });
    });

    qsa('.to-analyzer').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(btn.getAttribute('data-target-tab') || 'hook');
        showSample(0, true);
      });
    });

    // Initial state: Hook tab, first sample shown statically (no stagger).
    activateTab('hook');
    showSample(0, false);
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    if (!qs('.pillar-demo')) return;
    bind();
  }

  init();

})();
