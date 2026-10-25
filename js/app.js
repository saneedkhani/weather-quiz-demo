/*! © 2026 Saneed Ullah. All rights reserved. Unauthorized copying or reuse is prohibited. */
(function () {
  'use strict';

  var DATA_URL = 'data/quiz.json';
  var LETTERS = 'ABCDEFGH';

  // Default interface text. Any key in quiz.json "ui" overrides these.
  var DEFAULT_UI = {
    howItWorks: ['Pick a scenario', 'Answer 3 questions', 'Learn from official guidance'],
    start: 'Start',
    comingSoon: 'Coming soon',
    questionsLabel: 'questions',
    allScenarios: 'All scenarios',
    questionOf: 'Question {current} of {total}',
    correct: 'Correct!',
    incorrect: 'Not quite',
    correctAnswerIs: 'The correct answer is:',
    officialGuidance: 'Official guidance',
    next: 'Next question',
    seeResults: 'See my results',
    yourScore: 'Your score',
    yourAnswer: 'Your answer:',
    correctAnswer: 'Correct answer:',
    restart: 'Try again',
    chooseAnother: 'Choose another scenario',
    jumpTo: 'Or go straight to:',
    results: {
      perfect: "Excellent, you're weather-ready!",
      good: 'Good job! Review the tips below to close the gaps.',
      low: 'Worth a second look. The official tips below explain what to do.'
    }
  };

  // Inline SVG icons (drawn for this project, no third-party assets).
  var SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
  var ICONS = {
    flood: '<path d="M2 7c1.7 0 1.7-1.5 3.3-1.5S7 7 8.7 7s1.6-1.5 3.3-1.5S13.7 7 15.3 7s1.7-1.5 3.4-1.5S20.3 7 22 7"/><path d="M2 12c1.7 0 1.7-1.5 3.3-1.5S7 12 8.7 12s1.6-1.5 3.3-1.5 1.7 1.5 3.3 1.5 1.7-1.5 3.4-1.5S20.3 12 22 12"/><path d="M2 17c1.7 0 1.7-1.5 3.3-1.5S7 17 8.7 17s1.6-1.5 3.3-1.5 1.7 1.5 3.3 1.5 1.7-1.5 3.4-1.5S20.3 17 22 17"/>',
    heat: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    storm: '<path d="M17.5 17h.5a4 4 0 0 0 .5-7.97A6 6 0 0 0 7.1 8.2 4.5 4.5 0 0 0 7 17h.5"/><path d="M13 12l-3 5h4l-3 5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    cross: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    restart: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'
  };
  var THEMES = ['flood', 'heat', 'storm'];

  var app = document.getElementById('app');
  var quiz = null;   // content loaded from quiz.json
  var ui = DEFAULT_UI;
  var state = null;  // { scenario, index, answers: [{ choice, correct }], answered }

  // ---------- small helpers ----------

  // Builds a DOM element. Content from quiz.json is always added as text, never as HTML.
  function h(tag, props) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key.indexOf('on') === 0) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(node, c); }); return; }
    node.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  function icon(name, extraClass) {
    var span = document.createElement('span');
    span.className = 'icon' + (extraClass ? ' ' + extraClass : '');
    span.innerHTML = SVG_OPEN + (ICONS[name] || '') + '</svg>';
    return span;
  }

  function srOnly(text) {
    return h('span', { class: 'sr-only' }, text);
  }

  function format(template, values) {
    return template.replace(/\{(\w+)\}/g, function (m, key) { return key in values ? values[key] : m; });
  }

  function themeOf(scenario) {
    return THEMES.indexOf(scenario.icon) >= 0 ? scenario.icon : 'flood';
  }

  function isEnabled(scenario) {
    return scenario.enabled !== false;
  }

  function mount(view, focusTarget) {
    app.replaceChildren(view);
    window.scrollTo(0, 0);
    var target = focusTarget || view.querySelector('h1, h2');
    if (target) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }

  // ---------- content loading and validation ----------

  function validate(data) {
    var errors = [];
    if (!data || !Array.isArray(data.scenarios) || data.scenarios.length === 0) {
      return ['"scenarios" must be a list with at least one scenario.'];
    }
    var ids = {};
    data.scenarios.forEach(function (s, si) {
      var where = 'Scenario ' + (si + 1) + (s && s.title ? ' ("' + s.title + '")' : '');
      if (!s || typeof s.id !== 'string' || !s.id) errors.push(where + ': missing "id".');
      else if (ids[s.id]) errors.push(where + ': the id "' + s.id + '" is used twice.');
      else ids[s.id] = true;
      if (!s || !s.title) errors.push(where + ': missing "title".');
      if (!s || !isEnabled(s)) return; // "Coming soon" scenarios may have no questions yet
      if (!Array.isArray(s.questions) || s.questions.length === 0) {
        errors.push(where + ': "questions" must be a list with at least one question.');
        return;
      }
      s.questions.forEach(function (q, qi) {
        var qw = where + ', question ' + (qi + 1);
        if (!q.question) errors.push(qw + ': missing "question" text.');
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(qw + ': "options" needs at least 2 answers.');
        } else if (q.options.length > LETTERS.length) {
          errors.push(qw + ': "options" can have at most ' + LETTERS.length + ' answers.');
        } else if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          errors.push(qw + ': "correctIndex" must be a whole number from 0 to ' + (q.options.length - 1) + ' (0 = first option).');
        }
        if (!q.explanation) errors.push(qw + ': missing "explanation".');
        if (q.sources != null && !Array.isArray(q.sources)) {
          errors.push(qw + ': "sources" must be a list.');
        } else {
          (q.sources || []).forEach(function (src, i) {
            if (!src || !src.label || !/^https?:\/\//.test(src.url || '')) {
              errors.push(qw + ', source ' + (i + 1) + ': needs a "label" and a "url" starting with https://.');
            }
          });
        }
      });
    });
    return errors;
  }

  function load() {
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('The server answered ' + res.status + ' for ' + DATA_URL + '.');
        return res.text();
      })
      .then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(DATA_URL + ' is not valid JSON: ' + e.message);
        }
        var errors = validate(data);
        if (errors.length) { renderError('Some quiz content needs fixing', errors); return; }
        quiz = data;
        ui = Object.assign({}, DEFAULT_UI, data.ui || {});
        ui.results = Object.assign({}, DEFAULT_UI.results, (data.ui && data.ui.results) || {});
        var app_ = data.app || {};
        if (app_.title) document.title = app_.title;
        document.getElementById('disclaimer').textContent = app_.disclaimer || '';
        window.addEventListener('hashchange', route);
        route();
      })
      .catch(function (err) {
        var hint = location.protocol === 'file:'
          ? 'Browsers block loading quiz.json when index.html is opened directly from your disk. Start a local server instead (see README), for example: python -m http.server 8000, then open http://localhost:8000.'
          : err.message;
        renderError('The quiz content could not be loaded', [hint]);
      });
  }

  // ---------- routing: #/ = home, #/<scenario-id> = quiz ----------

  function route() {
    var id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    var scenario = quiz.scenarios.filter(function (s) { return s.id === id && isEnabled(s); })[0];
    if (scenario) {
      startScenario(scenario);
    } else {
      state = null;
      if (id) history.replaceState(null, '', '#/');
      renderHome();
    }
  }

  function startScenario(scenario) {
    state = { scenario: scenario, index: 0, answers: [], answered: false };
    renderQuestion();
  }

  // ---------- views ----------

  function renderHome() {
    var meta = quiz.app || {};
    var cards = quiz.scenarios.map(function (s) {
      var enabled = isEnabled(s);
      var count = (s.questions || []).length;
      var inner = [
        h('span', { class: 'card-icon' }, icon(themeOf(s))),
        h('h2', { class: 'card-title' }, s.title),
        s.description ? h('p', { class: 'card-text' }, s.description) : null,
        h('span', { class: 'card-footer' },
          h('span', { class: 'card-meta' }, enabled ? count + ' ' + ui.questionsLabel : ui.comingSoon),
          enabled ? h('span', { class: 'card-cta' }, ui.start, icon('arrowRight')) : null)
      ];
      return h('li', {},
        enabled
          ? h('a', { class: 'card theme-' + themeOf(s), href: '#/' + encodeURIComponent(s.id) }, inner)
          : h('div', { class: 'card card--disabled theme-' + themeOf(s), 'aria-disabled': 'true' }, inner));
    });

    var steps = (ui.howItWorks || []).map(function (step, i) {
      return h('li', {}, h('span', { class: 'step-num', 'aria-hidden': 'true' }, i + 1), step);
    });

    var view = h('div', { class: 'view home' },
      h('section', { class: 'hero' },
        meta.eyebrow ? h('p', { class: 'eyebrow' }, meta.eyebrow) : null,
        h('h1', { class: 'hero-title' }, meta.title || 'Extreme Weather Safety Quiz'),
        meta.intro ? h('p', { class: 'hero-text' }, meta.intro) : null,
        steps.length ? h('ol', { class: 'steps' }, steps) : null),
      h('ul', { class: 'cards', role: 'list' }, cards));
    mount(view);
  }

  function renderQuestion() {
    var s = state.scenario;
    var q = s.questions[state.index];
    var total = s.questions.length;

    var options = q.options.map(function (opt, i) {
      return h('li', {},
        h('button', { class: 'option', type: 'button', 'data-index': i, onclick: function () { answer(i); } },
          h('span', { class: 'option-letter', 'aria-hidden': 'true' }, LETTERS[i]),
          h('span', { class: 'option-text' }, opt),
          h('span', { class: 'option-mark' })));
    });

    var title = h('h2', { class: 'q-title', id: 'q-title' }, q.question);
    var view = h('section', { class: 'view quiz theme-' + themeOf(s), 'aria-labelledby': 'q-title' },
      quizTop(s),
      h('div', { class: 'quiz-card' },
        h('div', { class: 'progress-row' },
          h('p', { class: 'q-count' }, format(ui.questionOf, { current: state.index + 1, total: total })),
          h('div', { class: 'progress', 'aria-hidden': 'true' },
            h('div', { class: 'progress-bar', style: 'width:' + (state.index / total * 100) + '%' }))),
        q.situation ? h('p', { class: 'q-situation' }, q.situation) : null,
        title,
        h('ul', { class: 'options', role: 'list' }, options),
        h('div', { class: 'feedback-slot' })));
    mount(view, title);
  }

  function quizTop(s) {
    return h('div', { class: 'quiz-top' },
      h('a', { class: 'back-link', href: '#/' }, icon('arrowLeft'), ui.allScenarios),
      h('span', { class: 'quiz-badge' }, icon(themeOf(s)), s.title));
  }

  function answer(choice) {
    if (state.answered) return;
    state.answered = true;

    var s = state.scenario;
    var q = s.questions[state.index];
    var correct = choice === q.correctIndex;
    var isLast = state.index === s.questions.length - 1;
    state.answers.push({ choice: choice, correct: correct });

    Array.prototype.forEach.call(app.querySelectorAll('.option'), function (btn, i) {
      btn.disabled = true;
      var mark = btn.querySelector('.option-mark');
      if (i === q.correctIndex) {
        btn.classList.add('is-correct');
        mark.appendChild(icon('check'));
        mark.appendChild(srOnly(' (correct answer)'));
      } else if (i === choice) {
        btn.classList.add('is-wrong');
        mark.appendChild(icon('cross'));
      } else {
        btn.classList.add('is-dimmed');
      }
      if (i === choice) {
        btn.classList.add('is-chosen');
        mark.appendChild(srOnly(' (your answer)'));
      }
    });
    app.querySelector('.progress-bar').style.width = ((state.index + 1) / s.questions.length * 100) + '%';

    var sources = q.sources || [];
    var heading = h('h3', { class: 'feedback-title', tabindex: '-1' },
      icon(correct ? 'check' : 'cross'), correct ? ui.correct : ui.incorrect);
    var nextBtn = h('button', { class: 'btn btn-primary', type: 'button', onclick: next },
      isLast ? ui.seeResults : ui.next, icon('arrowRight'));

    var feedback = h('div', { class: 'feedback ' + (correct ? 'is-correct' : 'is-wrong') },
      heading,
      correct ? null : h('p', { class: 'feedback-answer' }, ui.correctAnswerIs + ' ', h('strong', {}, q.options[q.correctIndex])),
      h('p', { class: 'feedback-text' }, q.explanation),
      sources.length ? h('div', { class: 'sources' },
        h('p', { class: 'sources-title' }, ui.officialGuidance),
        h('ul', { role: 'list' }, sources.map(function (src) {
          return h('li', {}, h('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer' },
            src.label, icon('external', 'icon-sm'), srOnly(' (opens in a new tab)')));
        }))) : null,
      h('div', { class: 'feedback-actions' }, nextBtn));

    app.querySelector('.feedback-slot').appendChild(feedback);
    heading.focus({ preventScroll: true });
    feedback.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function next() {
    state.index += 1;
    state.answered = false;
    if (state.index >= state.scenario.questions.length) renderSummary();
    else renderQuestion();
  }

  function renderSummary() {
    var s = state.scenario;
    var total = s.questions.length;
    var score = state.answers.filter(function (a) { return a.correct; }).length;
    var ratio = score / total;
    var message = ratio === 1 ? ui.results.perfect : ratio >= 0.5 ? ui.results.good : ui.results.low;

    var recap = s.questions.map(function (q, i) {
      var a = state.answers[i];
      return h('li', { class: 'recap-item ' + (a.correct ? 'is-correct' : 'is-wrong') },
        h('span', { class: 'recap-icon' }, icon(a.correct ? 'check' : 'cross'), srOnly(a.correct ? 'Correct: ' : 'Incorrect: ')),
        h('div', { class: 'recap-body' },
          h('p', { class: 'recap-q' }, q.question),
          h('p', { class: 'recap-a' }, h('span', { class: 'recap-label' }, ui.yourAnswer), ' ', q.options[a.choice]),
          a.correct ? null : h('p', { class: 'recap-a' }, h('span', { class: 'recap-label' }, ui.correctAnswer), ' ', q.options[q.correctIndex])));
    });

    var others = quiz.scenarios.filter(function (o) { return o !== s && isEnabled(o); }).map(function (o) {
      return h('li', {}, h('a', { class: 'chip theme-' + themeOf(o), href: '#/' + encodeURIComponent(o.id) }, icon(themeOf(o)), o.title));
    });

    var view = h('section', { class: 'view summary theme-' + themeOf(s), 'aria-labelledby': 'summary-title' },
      quizTop(s),
      h('div', { class: 'quiz-card summary-card' },
        h('div', { class: 'score' },
          scoreRing(score, total),
          h('div', { class: 'score-text' },
            h('p', { class: 'eyebrow' }, ui.yourScore),
            h('h2', { id: 'summary-title', class: 'score-title' }, message))),
        h('ol', { class: 'recap', role: 'list' }, recap),
        h('div', { class: 'summary-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { startScenario(s); } }, icon('restart'), ui.restart),
          h('a', { class: 'btn btn-secondary', href: '#/' }, icon('grid'), ui.chooseAnother)),
        others.length ? h('div', { class: 'jump' },
          h('p', { class: 'jump-label' }, ui.jumpTo),
          h('ul', { class: 'chips', role: 'list' }, others)) : null));
    mount(view);
  }

  function scoreRing(score, total) {
    var r = 52;
    var c = 2 * Math.PI * r;
    var wrap = h('div', { class: 'ring', role: 'img', 'aria-label': score + ' out of ' + total + ' correct' });
    wrap.innerHTML =
      '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
        '<circle class="ring-track" cx="60" cy="60" r="' + r + '"/>' +
        '<circle class="ring-value" cx="60" cy="60" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - score / total)).toFixed(2) + '"/>' +
      '</svg>';
    append(wrap, h('span', { class: 'ring-label', 'aria-hidden': 'true' }, h('strong', {}, score), '/' + total));
    return wrap;
  }

  function renderError(title, messages) {
    var view = h('section', { class: 'view error-view', role: 'alert' },
      h('div', { class: 'quiz-card' },
        h('h1', { class: 'error-title' }, icon('alert'), title),
        h('ul', { class: 'error-list' }, messages.map(function (m) { return h('li', {}, m); }))));
    mount(view);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  load();
})();
