/*!
 * editor.js: the step editor. Edits one JSON object in the exact data.js shape,
 * sends every change to the live preview iframe (postMessage), and autosaves it.
 * The server validates everything again (JSON Schema) before storing.
 */
(function ($, window, document) {
  'use strict';

  var C = JSON.parse(document.getElementById('editor-config').textContent);
  var data = C.data || {};
  var CATS = window.THEME_CATEGORIES || {};
  var PRESETS = window.THEME_PRESETS || {};
  var DAYS = [['mon', 'Monday', 'सोमवार'], ['tue', 'Tuesday', 'मंगलवार'], ['wed', 'Wednesday', 'बुधवार'], ['thu', 'Thursday', 'गुरुवार'],
    ['fri', 'Friday', 'शुक्रवार'], ['sat', 'Saturday', 'शनिवार'], ['sun', 'Sunday', 'रविवार']];
  var DEFAULT_ORDER = ['hero', 'highlights', 'about', 'services', 'fleet', 'why', 'doctor', 'results',
    'gallery', 'testimonials', 'cta', 'hours', 'faq', 'contact'];
  var SECTION_LABELS = {
    hero: ['Top banner', 'ऊपर का बैनर'], highlights: ['Highlights', 'खास बातें'], about: ['About', 'परिचय'],
    services: ['Services / menu', 'सेवाएँ / मेन्यू'], fleet: ['Vehicles', 'गाड़ियाँ'], why: ['Why choose us', 'हमें क्यों चुनें'],
    doctor: ['Doctor', 'डॉक्टर'], results: ['Results', 'परिणाम'], gallery: ['Gallery', 'गैलरी'], testimonials: ['Reviews', 'रिव्यू'],
    cta: ['Call-to-action band', 'कॉल-टू-एक्शन'], hours: ['Opening hours', 'समय'], faq: ['FAQ', 'सवाल-जवाब'], contact: ['Contact & map', 'संपर्क और मैप']
  };
  var lang = 'en';
  try { lang = localStorage.getItem('ed-lang') || 'en'; } catch (e) { /* storage blocked */ }

  /* ------------------------------------------------------------------
   * helpers
   * ---------------------------------------------------------------- */
  function T(en, hi) { return lang === 'hi' && hi ? hi : en; }
  function trSpan(en, hi) { return '<span class="tr" data-en="' + esc(en) + '" data-hi="' + esc(hi || en) + '">' + esc(T(en, hi)) + '</span>'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function csrf() {
    var m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function getPath(obj, path) {
    return String(path).split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function setPath(obj, path, val) {
    var keys = String(path).split('.'), o = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var k = keys[i], nextIsIndex = /^\d+$/.test(keys[i + 1]);
      if (o[k] == null || typeof o[k] !== 'object') o[k] = nextIsIndex ? [] : {};
      o = o[k];
    }
    o[keys[keys.length - 1]] = val;
  }
  function cat() { return CATS[data.category] || CATS.general || {}; }
  function catInfo() {
    for (var i = 0; i < C.categories.length; i++) if (C.categories[i].key === data.category) return C.categories[i];
    return C.categories[C.categories.length - 1];
  }
  function imageUrl(v) {
    if (!v) return '';
    if (/^https?:/.test(v)) return v;
    for (var i = 0; i < C.images.length; i++) if (C.images[i].path === v) return C.images[i].url;
    return C.imagesBase + v;
  }
  function pad(t) { var m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : ''; }

  /* normalise shapes the editor works with */
  ['social', 'hours', 'seo'].forEach(function (k) { if (!data[k] || typeof data[k] !== 'object' || Array.isArray(data[k])) data[k] = {}; });
  ['highlights', 'services', 'menuCategories', 'vehicles', 'results', 'testimonials', 'faqs', 'gallery', 'sections'].forEach(function (k) {
    if (!Array.isArray(data[k])) data[k] = [];
  });
  data.gallery = data.gallery.map(function (g) { return typeof g === 'string' ? { src: g, caption: '' } : g; });
  if (!data.languages || !data.languages.length) data.languages = ['en', 'hi'];

  /* ------------------------------------------------------------------
   * change tracking, preview, autosave
   * ---------------------------------------------------------------- */
  var dirty = false, saving = false, previewTimer = null, saveTimer = null;
  var frame = document.getElementById('edFrame');
  frame.src = C.frameUrl + '?v=' + Date.now();

  function changed() {
    dirty = true;
    setSaveState('pending');
    clearTimeout(previewTimer);
    previewTimer = setTimeout(sendPreview, 500);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { save(); }, 3000);
  }
  function payload() {
    var out = JSON.parse(JSON.stringify(data));
    if (out.doctor && !Object.keys(out.doctor).some(function (k) { return out.doctor[k] && (!Array.isArray(out.doctor[k]) || out.doctor[k].length); })) delete out.doctor;
    ['rating', 'reviewCount', 'logoWidth'].forEach(function (k) { if (out[k] === '' || out[k] == null || isNaN(out[k])) out[k] = 0; });
    return out;
  }
  function sendPreview() {
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'lbd:data', data: payload() }, window.location.origin);
    }
  }
  function setSaveState(state, text) {
    var $s = $('#saveState');
    var map = {
      pending: ['text-muted', T('Unsaved changes', 'बदलाव सेव नहीं हुए')],
      saving: ['text-muted', '<span class="spinner-border spinner-border-sm"></span> ' + T('Saving…', 'सेव हो रहा है…')],
      saved: ['text-success', '<i class="bi bi-check2-circle"></i> ' + T('Saved', 'सेव हो गया') + (text ? ' ' + text : '')],
      error: ['text-danger', '<i class="bi bi-exclamation-triangle"></i> ' + (text || T('Not saved', 'सेव नहीं हुआ'))]
    };
    $s.removeClass('text-muted text-success text-danger').addClass(map[state][0]).html(map[state][1]);
  }
  function showErrors(errors) {
    $('.is-invalid').removeClass('is-invalid');
    $('.ed-err').remove();
    if (!errors || !errors.length) { $('#edErrors').addClass('d-none').empty(); return; }
    var items = errors.slice(0, 8).map(function (e) {
      var $f = $('[data-path="' + e.field + '"]').first();
      if ($f.length) {
        $f.addClass('is-invalid').after('<div class="invalid-feedback d-block ed-err">' + esc(e.message) + '</div>');
        var step = $f.closest('.step').data('step');
        return '<li><a href="#" data-goto="' + step + '" data-focus="' + esc(e.field) + '">' + esc(e.message) + '</a></li>';
      }
      return '<li>' + esc(e.field + ': ' + e.message) + '</li>';
    });
    $('#edErrors').removeClass('d-none').html('<strong>' + T('Please fix:', 'कृपया ठीक करें:') + '</strong><ul class="mb-0">' + items.join('') + '</ul>');
  }
  function save(opts) {
    opts = opts || {};
    clearTimeout(saveTimer);
    if (saving) { saveTimer = setTimeout(function () { save(opts); }, 800); return $.Deferred().reject().promise(); }
    if (!dirty && !opts.complete) return $.Deferred().resolve({ ok: true }).promise();
    saving = true;
    dirty = false;
    setSaveState('saving');
    return $.ajax({
      url: C.saveUrl, method: 'POST', contentType: 'application/json', dataType: 'json',
      headers: { 'X-CSRFToken': csrf() },
      data: JSON.stringify({ data: payload(), step: opts.step || currentStep, complete: !!opts.complete })
    }).done(function (r) {
      setSaveState('saved', r.savedAt);
      showErrors([]);
      C.stepsDone = r.stepsDone || C.stepsDone;
      renderProgress();
    }).fail(function (xhr) {
      dirty = true;
      var r = xhr.responseJSON || {};
      if (r.errors) { showErrors(r.errors); setSaveState('error'); }
      else setSaveState('error', r.error || T('Not saved: check your internet', 'सेव नहीं हुआ: इंटरनेट देखें'));
    }).always(function () { saving = false; });
  }
  window.addEventListener('beforeunload', function (e) {
    if (dirty || saving) { save(); e.preventDefault(); e.returnValue = ''; }
  });
  window.addEventListener('message', function (e) {
    if (e.origin === window.location.origin && e.data && e.data.type === 'lbd:ready' && dirty) sendPreview();
  });

  /* ------------------------------------------------------------------
   * simple fields: any element with data-path
   * ---------------------------------------------------------------- */
  function fillFields(root) {
    $(root || document).find('input[data-path], textarea[data-path], select[data-path]').each(function () {
      var v = getPath(data, this.getAttribute('data-path'));
      if (this.type === 'checkbox') this.checked = !!v;
      else if (this.getAttribute('data-type')) $(this).val(v ? v : '');     // numbers: 0 shows as empty
      else $(this).val(v == null ? '' : v);
    });
  }
  $(document).on('input change', 'input[data-path], textarea[data-path], select[data-path]', function () {
    var el = this, v;
    if (el.type === 'checkbox') v = el.checked;
    else if (el.getAttribute('data-type') === 'number') v = el.value === '' ? 0 : parseFloat(el.value);
    else if (el.getAttribute('data-type') === 'int') v = el.value === '' ? 0 : parseInt(el.value, 10);
    else if (el.getAttribute('data-kind') === 'wa') v = el.value.replace(/\D/g, '');
    else v = el.value;
    if (typeof v === 'number' && isNaN(v)) v = 0;
    setPath(data, el.getAttribute('data-path'), v);
    if (el.getAttribute('data-path') === 'category') onCategory();
    $(el).removeClass('is-invalid').next('.ed-err').remove();
    updateCounts();
    changed();
  });

  /* ------------------------------------------------------------------
   * category-dependent bits
   * ---------------------------------------------------------------- */
  function onCategory() {
    var c = cat(), info = catInfo();
    $('.cat-only').each(function () {
      var presets = ($(this).data('presets') || '').split(','), styles = ($(this).data('styles') || '').split(',');
      var show = (presets[0] && presets.indexOf(c.preset) > -1) || (styles[0] && styles.indexOf(c.style) > -1);
      $(this).toggle(!!show);
    });
    $('.js-services-title').html(trSpan(info.services[0], info.services[1]));
    $('.ed-step[data-step="services"] .tr').attr({ 'data-en': info.services[0], 'data-hi': info.services[1] }).text(T(info.services[0], info.services[1]));
    renderRepeater('services');
    renderSections();
    if (themeMode() !== 'custom') fillThemeInputs(baseTheme());
  }

  /* ------------------------------------------------------------------
   * repeaters
   * ---------------------------------------------------------------- */
  var REPEATERS = {
    services: {
      add: ['Add item', 'जोड़ें'],
      blank: function () { return { title: '', desc: '', price: '' }; },
      fields: function () {
        var f = [['title', 'Name', 'नाम', 'text', 80], ['desc', 'Description', 'विवरण', 'textarea', 400], ['price', 'Price (optional)', 'कीमत (वैकल्पिक)', 'text', 40],
          ['image', 'Photo (optional)', 'फ़ोटो (वैकल्पिक)', 'image'],
          ['link', 'Online link, e.g. your referral link (optional, https://…)', 'ऑनलाइन लिंक, जैसे आपका रेफ़रल लिंक (वैकल्पिक)', 'url', 500],
          ['linkLabel', 'Button text for the link (optional)', 'लिंक बटन का टेक्स्ट (वैकल्पिक)', 'text', 30]];
        if (cat().style === 'plans' || cat().preset === 'fitness') {
          f.push(['features', 'What is included (one per line)', 'क्या शामिल है (हर लाइन में एक)', 'lines']);
          f.push(['popular', 'Mark as most popular', 'सबसे लोकप्रिय', 'checkbox']);
        }
        return f;
      }
    },
    menuCategories: {
      add: ['Add menu tab', 'मेन्यू टैब जोड़ें'],
      blank: function () { return { name: '', items: [] }; },
      fields: function () { return [['name', 'Tab name (e.g. Starters)', 'टैब का नाम (जैसे स्टार्टर)', 'text', 60], ['items', 'Dishes', 'डिश', 'nested']]; }
    },
    items: {
      add: ['Add dish', 'डिश जोड़ें'],
      blank: function () { return { title: '', price: '', desc: '', veg: true }; },
      fields: function () {
        return [['title', 'Dish', 'डिश', 'text', 80], ['price', 'Price', 'कीमत', 'text', 40], ['desc', 'Description', 'विवरण', 'text', 300],
          ['veg', 'Type', 'प्रकार', 'veg']];
      }
    },
    vehicles: {
      add: ['Add vehicle', 'गाड़ी जोड़ें'],
      blank: function () { return { name: '', models: '', seats: 4, bags: 2, rate: '' }; },
      fields: function () {
        return [['name', 'Type (e.g. Sedan)', 'प्रकार (जैसे सेडान)', 'text', 60], ['models', 'Models', 'मॉडल', 'text', 100],
          ['seats', 'Seats', 'सीटें', 'int'], ['bags', 'Bags', 'बैग', 'int'], ['rate', 'Fare (e.g. ₹12/km)', 'किराया', 'text', 40]];
      }
    },
    results: {
      add: ['Add result', 'परिणाम जोड़ें'],
      blank: function () { return { value: '', label: '' }; },
      fields: function () { return [['value', 'Number (e.g. 95%)', 'संख्या (जैसे 95%)', 'text', 20], ['label', 'What it means', 'मतलब', 'text', 60]]; }
    },
    testimonials: {
      add: ['Add review', 'रिव्यू जोड़ें'],
      blank: function () { return { name: '', text: '', rating: 5 }; },
      fields: function () { return [['name', 'Customer name', 'ग्राहक का नाम', 'text', 60], ['text', 'Review', 'रिव्यू', 'textarea', 600], ['rating', 'Stars', 'स्टार', 'stars']]; }
    },
    faqs: {
      add: ['Add question', 'सवाल जोड़ें'],
      blank: function () { return { q: '', a: '' }; },
      fields: function () { return [['q', 'Question', 'सवाल', 'text', 200], ['a', 'Answer', 'जवाब', 'textarea', 800]]; }
    }
  };

  function fieldHtml(path, f) {
    var id = 'r-' + path.replace(/\./g, '-'), label = '<label class="form-label small" for="' + id + '">' + trSpan(f[1], f[2]) + '</label>';
    var v = getPath(data, path);
    switch (f[3]) {
      case 'textarea':
        return '<div class="mb-2">' + label + '<textarea class="form-control form-control-sm" id="' + id + '" rows="2" maxlength="' + f[4] + '" data-path="' + path + '">' + esc(v || '') + '</textarea></div>';
      case 'int':
        return '<div class="mb-2 col-6">' + label + '<input class="form-control form-control-sm" id="' + id + '" type="number" min="0" data-type="int" data-path="' + path + '" value="' + esc(v || '') + '"></div>';
      case 'checkbox':
        return '<div class="form-check mb-2"><input class="form-check-input" type="checkbox" id="' + id + '" data-path="' + path + '"' + (v ? ' checked' : '') + '><label class="form-check-label small" for="' + id + '">' + trSpan(f[1], f[2]) + '</label></div>';
      case 'stars':
        return '<div class="mb-2">' + label + '<select class="form-select form-select-sm w-auto" id="' + id + '" data-type="int" data-path="' + path + '">' +
          [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (+v === n ? ' selected' : '') + '>' + '★★★★★'.slice(0, n) + '</option>'; }).join('') + '</select></div>';
      case 'veg':
        return '<div class="mb-2">' + label + '<select class="form-select form-select-sm w-auto js-veg" id="' + id + '" data-veg-path="' + path + '">' +
          '<option value="true"' + (v === true ? ' selected' : '') + '>Veg</option><option value="false"' + (v === false ? ' selected' : '') + '>Non-veg</option>' +
          '<option value=""' + (v !== true && v !== false ? ' selected' : '') + '>—</option></select></div>';
      case 'lines':
        return '<div class="mb-2">' + label + '<textarea class="form-control form-control-sm js-lines" id="' + id + '" rows="3" data-lines-path="' + path + '">' + esc((v || []).join('\n')) + '</textarea></div>';
      case 'url':
        return '<div class="mb-2">' + label + '<input class="form-control form-control-sm" id="' + id + '" type="url" maxlength="' + f[4] + '" placeholder="https://" data-path="' + path + '" value="' + esc(v || '') + '"></div>';
      case 'image':
        return '<div class="mb-2">' + label + '<div class="img-field img-field-sm" data-path="' + path + '" data-kind="service"></div></div>';
      case 'nested':
        return '<div class="nested mt-2"><div class="small fw-semibold mb-1">' + trSpan(f[1], f[2]) + '</div><div class="repeater" data-list="' + path + '" data-type="items" data-max="60"></div></div>';
      default:
        return '<div class="mb-2">' + label + '<input class="form-control form-control-sm" id="' + id + '" maxlength="' + f[4] + '" data-path="' + path + '" value="' + esc(v || '') + '"></div>';
    }
  }

  function renderRepeater(listPath) {
    var $r = $('.repeater[data-list="' + listPath + '"]');
    if (!$r.length) return;
    var def = REPEATERS[$r.data('type') || listPath];
    var list = getPath(data, listPath);
    if (!Array.isArray(list)) { list = []; setPath(data, listPath, list); }
    var fields = def.fields();
    var html = list.map(function (item, i) {
      var p = listPath + '.' + i;
      var inner = fields.map(function (f) { return fieldHtml(p + '.' + f[0], f); }).join('');
      if (fields.some(function (f) { return f[3] === 'int'; })) inner = '<div class="row g-2">' + inner + '</div>';
      return '<div class="rep-item" data-index="' + i + '"><div class="rep-tools">' +
        '<span class="rep-num">' + (i + 1) + '</span>' +
        '<button type="button" class="btn btn-sm btn-light js-up" aria-label="Move up"' + (i ? '' : ' disabled') + '><i class="bi bi-arrow-up"></i></button>' +
        '<button type="button" class="btn btn-sm btn-light js-down" aria-label="Move down"' + (i < list.length - 1 ? '' : ' disabled') + '><i class="bi bi-arrow-down"></i></button>' +
        '<button type="button" class="btn btn-sm btn-light text-danger js-remove" aria-label="Remove"><i class="bi bi-trash"></i></button></div>' + inner + '</div>';
    }).join('');
    var max = +$r.data('max') || 50;
    html += list.length < max ? '<button type="button" class="btn btn-sm btn-outline-brand js-add"><i class="bi bi-plus-lg"></i> ' + trSpan(def.add[0], def.add[1]) + '</button>' : '';
    $r.html(html);
    $r.find('.repeater').each(function () { renderRepeater($(this).data('list')); });
    $r.find('.img-field').each(function () { renderImageField($(this)); });
  }
  $(document).on('click', '.repeater .js-add, .repeater .js-remove, .repeater .js-up, .repeater .js-down', function (e) {
    e.stopPropagation();
    var $r = $(this).closest('.repeater'), listPath = $r.data('list'), list = getPath(data, listPath);
    var def = REPEATERS[$r.data('type') || listPath], i = +$(this).closest('.rep-item').data('index');
    if ($(this).hasClass('js-add')) list.push(def.blank());
    else if ($(this).hasClass('js-remove')) { if (!confirm(T('Remove this item?', 'इसे हटाएँ?'))) return; list.splice(i, 1); }
    else if ($(this).hasClass('js-up') && i > 0) list.splice(i - 1, 0, list.splice(i, 1)[0]);
    else if ($(this).hasClass('js-down') && i < list.length - 1) list.splice(i + 1, 0, list.splice(i, 1)[0]);
    renderRepeater(listPath);
    if ($(this).hasClass('js-add')) $r.find('.rep-item').last().find('input,textarea').first().trigger('focus');
    changed();
  });
  $(document).on('change', '.js-veg', function () {
    var v = this.value === 'true' ? true : this.value === 'false' ? false : null;
    setPath(data, $(this).data('vegPath'), v);
    changed();
  });
  $(document).on('input', '.js-lines', function () {
    setPath(data, $(this).data('linesPath'), this.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 12));
    changed();
  });

  /* ------------------------------------------------------------------
   * chips (highlights)
   * ---------------------------------------------------------------- */
  function renderChips() {
    var $c = $('.chip-editor[data-list="highlights"]');
    var list = data.highlights.filter(function (h) { return typeof h === 'string'; });
    data.highlights = list;
    $c.html('<div class="chips">' + list.map(function (h, i) {
      return '<span class="chip">' + esc(h) + ' <button type="button" class="js-chip-x" data-index="' + i + '" aria-label="Remove ' + esc(h) + '">×</button></span>';
    }).join('') + '</div>' + (list.length < 12 ? '<div class="input-group input-group-sm mt-2"><input class="form-control js-chip-in" maxlength="40" placeholder="' +
      esc(T('e.g. Free Parking, AC, Home Delivery', 'जैसे फ्री पार्किंग, एसी, होम डिलीवरी')) + '"><button class="btn btn-outline-brand js-chip-add" type="button">' + esc(T('Add', 'जोड़ें')) + '</button></div>' : ''));
  }
  function addChip() {
    var $in = $('.js-chip-in'), v = $.trim($in.val());
    if (!v) return;
    data.highlights.push(v);
    renderChips();
    $('.js-chip-in').trigger('focus');
    changed();
  }
  $(document).on('click', '.js-chip-add', addChip);
  $(document).on('keydown', '.js-chip-in', function (e) { if (e.key === 'Enter') { e.preventDefault(); addChip(); } });
  $(document).on('click', '.js-chip-x', function () { data.highlights.splice(+$(this).data('index'), 1); renderChips(); changed(); });

  /* ------------------------------------------------------------------
   * images
   * ---------------------------------------------------------------- */
  function upload(file, kind) {
    var fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    return $.ajax({ url: C.uploadUrl, method: 'POST', data: fd, processData: false, contentType: false, dataType: 'json',
      headers: { 'X-CSRFToken': csrf() } }).then(function (r) {
      C.images.push(r.image);
      C.storageUsed += r.image.size || 0;
      renderStorage();
      return r.image;
    }, function (xhr) {
      var msg = (xhr.responseJSON && xhr.responseJSON.error) || T('Upload failed. Please try again.', 'अपलोड नहीं हुआ। फिर से कोशिश करें।');
      alert(msg);
      return $.Deferred().reject(msg).promise();
    });
  }
  function renderImageField($f) {
    var path = $f.data('path'), v = getPath(data, path), url = imageUrl(v);
    $f.html((url ? '<img src="' + esc(url) + '" alt="" class="img-thumb">' : '<div class="img-empty"><i class="bi bi-image"></i></div>') +
      '<div class="img-actions"><label class="btn btn-sm btn-outline-brand mb-0"><i class="bi bi-upload"></i> ' + esc(url ? T('Change', 'बदलें') : T('Upload', 'अपलोड')) +
      '<input type="file" accept="image/jpeg,image/png,image/webp" hidden class="js-img-in"></label>' +
      (v ? ' <button type="button" class="btn btn-sm btn-light js-img-clear">' + esc(T('Remove', 'हटाएँ')) + '</button>' : '') + '</div>');
  }
  $(document).on('change', '.js-img-in', function () {
    var $f = $(this).closest('.img-field'), file = this.files[0];
    if (!file) return;
    $f.addClass('is-uploading');
    upload(file, $f.data('kind')).done(function (im) {
      setPath(data, $f.data('path'), im.path);
      renderImageField($f);
      changed();
    }).always(function () { $f.removeClass('is-uploading'); });
  });
  $(document).on('click', '.js-img-clear', function () {
    var $f = $(this).closest('.img-field');
    setPath(data, $f.data('path'), '');
    renderImageField($f);
    changed();
  });
  $('#f-wide').on('change', function () { data.logoWidth = this.checked ? 140 : 0; changed(); });

  /* gallery */
  function renderGallery() {
    $('#galleryList').html(data.gallery.map(function (g, i) {
      return '<div class="gal-item" data-index="' + i + '"><img src="' + esc(imageUrl(g.src)) + '" alt="">' +
        '<input class="form-control form-control-sm js-cap" maxlength="80" placeholder="' + esc(T('Caption (optional)', 'कैप्शन (वैकल्पिक)')) + '" value="' + esc(g.caption || '') + '">' +
        '<div class="gal-tools"><button type="button" class="btn btn-sm btn-light js-gup" aria-label="Move left"' + (i ? '' : ' disabled') + '><i class="bi bi-arrow-left"></i></button>' +
        '<button type="button" class="btn btn-sm btn-light text-danger js-gdel" aria-label="Remove"><i class="bi bi-trash"></i></button></div></div>';
    }).join(''));
  }
  function addGalleryFiles(files) {
    var list = Array.prototype.slice.call(files, 0, 24 - data.gallery.length);
    var chain = $.Deferred().resolve().promise();
    $('#galleryDrop').addClass('is-uploading');
    list.forEach(function (file) {
      chain = chain.then(function () {
        return upload(file, 'gallery').then(function (im) {
          data.gallery.push({ src: im.path, caption: '' });
          renderGallery();
          changed();
        }, function () { return $.Deferred().resolve().promise(); });
      });
    });
    chain.always(function () { $('#galleryDrop').removeClass('is-uploading'); });
  }
  $('#galleryDrop').on('click keydown', function (e) {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#galleryInput').trigger('click'); }
  }).on('dragover', function (e) { e.preventDefault(); $(this).addClass('is-over'); })
    .on('dragleave', function () { $(this).removeClass('is-over'); })
    .on('drop', function (e) { e.preventDefault(); $(this).removeClass('is-over'); addGalleryFiles(e.originalEvent.dataTransfer.files); });
  $('#galleryInput').on('click', function (e) { e.stopPropagation(); }).on('change', function () { addGalleryFiles(this.files); this.value = ''; });
  $(document).on('input', '.js-cap', function () { data.gallery[+$(this).closest('.gal-item').data('index')].caption = this.value; changed(); });
  $(document).on('click', '.js-gdel', function () { data.gallery.splice(+$(this).closest('.gal-item').data('index'), 1); renderGallery(); changed(); });
  $(document).on('click', '.js-gup', function () {
    var i = +$(this).closest('.gal-item').data('index');
    data.gallery.splice(i - 1, 0, data.gallery.splice(i, 1)[0]);
    renderGallery();
    changed();
  });

  /* ------------------------------------------------------------------
   * opening hours grid
   * ---------------------------------------------------------------- */
  function parseHours(v) {
    var s = String(v || '').trim().toLowerCase();
    if (!s) return { open: false, empty: true, ranges: [['', '']] };
    if (/closed|holiday|\boff\b/.test(s)) return { open: false, ranges: [['', '']] };
    if (/24\s*(h|hours|hrs)|open\s*24/.test(s)) return { open: true, allDay: true, ranges: [['09:00', '21:00']] };
    var ranges = s.split(/[,;&]/).map(function (p) {
      var m = p.split(/\s*(?:-|–|—|to)\s*/);
      return [pad(m[0] && m[0].trim()), pad(m[1] && m[1].trim())];
    }).filter(function (r) { return r[0] || r[1]; });
    return { open: true, ranges: ranges.length ? ranges : [['', '']] };
  }
  function hoursString(h) {
    if (!h.open) return 'closed';
    if (h.allDay) return '24h';
    return h.ranges.filter(function (r) { return r[0] && r[1]; }).map(function (r) { return r[0] + '-' + r[1]; }).join(', ');
  }
  function renderHours() {
    $('#hoursGrid').html(DAYS.map(function (d) {
      var h = parseHours(data.hours[d[0]]);
      var r1 = h.ranges[0] || ['', ''], r2 = h.ranges[1];
      return '<div class="hours-row" data-day="' + d[0] + '">' +
        '<div class="hours-day">' + trSpan(d[1], d[2]) + '</div>' +
        '<div class="form-check form-switch m-0"><input class="form-check-input js-h-open" type="checkbox" role="switch" id="ho-' + d[0] + '"' + (h.open ? ' checked' : '') + '>' +
        '<label class="form-check-label small" for="ho-' + d[0] + '">' + esc(h.open ? T('Open', 'खुला') : T('Closed', 'बंद')) + '</label></div>' +
        '<div class="hours-times"' + (h.open && !h.allDay ? '' : ' hidden') + '>' +
        '<input type="time" class="form-control form-control-sm js-h" data-r="0" data-i="0" value="' + r1[0] + '" aria-label="Opens"> – ' +
        '<input type="time" class="form-control form-control-sm js-h" data-r="0" data-i="1" value="' + r1[1] + '" aria-label="Closes">' +
        (r2 ? '<span class="w-100"></span><input type="time" class="form-control form-control-sm js-h" data-r="1" data-i="0" value="' + r2[0] + '" aria-label="Opens again"> – ' +
          '<input type="time" class="form-control form-control-sm js-h" data-r="1" data-i="1" value="' + r2[1] + '" aria-label="Closes"> <button type="button" class="btn btn-sm btn-link js-h-nobreak">' + esc(T('No break', 'ब्रेक नहीं')) + '</button>'
          : '<button type="button" class="btn btn-sm btn-link js-h-break">' + esc(T('+ Break', '+ ब्रेक')) + '</button>') + '</div>' +
        '<div class="form-check m-0"' + (h.open ? '' : ' hidden') + '><input class="form-check-input js-h-24" type="checkbox" id="h24-' + d[0] + '"' + (h.allDay ? ' checked' : '') + '><label class="form-check-label small" for="h24-' + d[0] + '">24h</label></div>' +
        '</div>';
    }).join(''));
  }
  function readDay($row) {
    var h = { open: $row.find('.js-h-open').prop('checked'), allDay: $row.find('.js-h-24').prop('checked'), ranges: [] };
    $row.find('.js-h').each(function () {
      var r = +$(this).data('r'), i = +$(this).data('i');
      h.ranges[r] = h.ranges[r] || ['', ''];
      h.ranges[r][i] = this.value;
    });
    if (h.open && !h.allDay && !h.ranges.some(function (r) { return r[0] && r[1]; })) h.ranges = [['09:00', '21:00']];
    return h;
  }
  $(document).on('change input', '#hoursGrid input', function () {
    var $row = $(this).closest('.hours-row'), day = $row.data('day');
    data.hours[day] = hoursString(readDay($row));
    if ($(this).is('.js-h-open, .js-h-24')) renderHours();
    changed();
  });
  $(document).on('click', '.js-h-break, .js-h-nobreak', function () {
    var $row = $(this).closest('.hours-row'), h = readDay($row);
    if ($(this).hasClass('js-h-break')) h.ranges = [[h.ranges[0][0] || '10:00', '14:00'], ['17:00', h.ranges[0][1] || '21:00']];
    else h.ranges = [[h.ranges[0][0], (h.ranges[1] || h.ranges[0])[1]]];
    data.hours[$row.data('day')] = hoursString(h);
    renderHours();
    changed();
  });
  $('#copyMonday').on('click', function () {
    DAYS.forEach(function (d) { data.hours[d[0]] = data.hours.mon || ''; });
    renderHours();
    changed();
  });

  /* ------------------------------------------------------------------
   * look & feel
   * ---------------------------------------------------------------- */
  function baseTheme() {
    var c = cat(), p = PRESETS[c.preset] || PRESETS.general || {}, look = c.look || {};
    var pal = $.extend({}, p.palette, look.palette || {});
    return $.extend(pal, {
      headingFont: look.headingFont || p.headingFont, bodyFont: look.bodyFont || p.bodyFont,
      buttonStyle: look.buttonStyle || p.buttonStyle || 'rounded', borderRadius: look.borderRadius || p.borderRadius || '14px'
    });
  }
  function themeMode() {
    if (data.theme === 'auto') return 'auto';
    if (data.theme && typeof data.theme === 'object' && Object.keys(data.theme).length) return 'custom';
    return 'category';
  }
  function fillThemeInputs(th) {
    $('[data-theme]').each(function () {
      var k = $(this).data('theme'), v = th[k] || '';
      if (this.type === 'color') v = /^#[0-9a-f]{6}$/i.test(v) ? v : (/^#[0-9a-f]{3}$/i.test(v) ? '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : '#333333');
      if (this.tagName === 'SELECT' && v && !$(this).find('option[value="' + v + '"]').length) $(this).append('<option value="' + esc(v) + '">' + esc(v) + '</option>');
      $(this).val(v);
    });
  }
  function readTheme() {
    var th = {};
    $('[data-theme]').each(function () { var v = $(this).val(); if (v) th[$(this).data('theme')] = v; });
    return th;
  }
  function renderLook() {
    var fontOpts = C.fonts.map(function (f) { return '<option value="' + esc(f) + '">' + esc(f) + '</option>'; }).join('');
    $('#c-hfont, #c-bfont').html(fontOpts);
    $('#presetRow').html(C.presets.map(function (p, i) {
      return '<button type="button" class="preset-btn" data-preset="' + i + '" title="' + esc(p.label) + '" style="background:linear-gradient(135deg,' + p.primary + ' 50%,' + p.accent + ' 50%)"><span class="visually-hidden">' + esc(p.label) + '</span></button>';
    }).join(''));
    var mode = themeMode();
    $('input[name=themeMode][value=' + mode + ']').prop('checked', true);
    $('#customTheme').toggleClass('d-none', mode !== 'custom');
    fillThemeInputs(mode === 'custom' ? $.extend(baseTheme(), data.theme) : baseTheme());
  }
  $(document).on('change', 'input[name=themeMode]', function () {
    var mode = this.value;
    if (mode === 'auto') data.theme = 'auto';
    else if (mode === 'category') data.theme = {};
    else data.theme = readTheme();
    $('#customTheme').toggleClass('d-none', mode !== 'custom');
    if (mode === 'auto' && !data.logo) alert(T('Upload your logo in step 4 (Photos) to use its colours.', 'लोगो के रंग के लिए स्टेप 4 (फ़ोटो) में लोगो अपलोड करें।'));
    changed();
  });
  $(document).on('input change', '[data-theme]', function () { data.theme = readTheme(); changed(); });
  $(document).on('click', '.preset-btn', function () {
    var p = C.presets[+$(this).data('preset')];
    fillThemeInputs($.extend(readTheme(), { primary: p.primary, accent: p.accent, background: p.background, surface: p.surface, text: p.text }));
    data.theme = readTheme();
    changed();
  });

  /* sections: show/hide + reorder (data.sections; empty = the design's own order) */
  function relevantSections() {
    var c = cat();
    return DEFAULT_ORDER.filter(function (k) {
      if (k === 'fleet') return c.preset === 'taxi';
      if (k === 'doctor') return c.preset === 'medical';
      if (k === 'results') return c.preset === 'education';
      return true;
    });
  }
  function sectionState() {
    var rel = relevantSections(), c = cat();
    var catOrder = (c.order || []).concat(DEFAULT_ORDER.filter(function (k) { return (c.order || []).indexOf(k) < 0; }));
    if (data.sections && data.sections.length) {
      var shown = data.sections.filter(function (k) { return rel.indexOf(k) > -1; });
      return shown.map(function (k) { return [k, true]; })
        .concat(catOrder.filter(function (k) { return rel.indexOf(k) > -1 && shown.indexOf(k) < 0; }).map(function (k) { return [k, false]; }));
    }
    return catOrder.filter(function (k) { return rel.indexOf(k) > -1; }).map(function (k) { return [k, true]; });
  }
  function renderSections(state) {
    state = state || sectionState();
    $('#sectionList').html(state.map(function (s, i) {
      var l = SECTION_LABELS[s[0]];
      return '<li data-key="' + s[0] + '"><div class="form-check m-0"><input class="form-check-input js-sec" type="checkbox" id="sec-' + s[0] + '"' + (s[1] ? ' checked' : '') + (s[0] === 'hero' ? ' disabled' : '') + '>' +
        '<label class="form-check-label" for="sec-' + s[0] + '">' + trSpan(l[0], l[1]) + '</label></div>' +
        '<div class="ms-auto"><button type="button" class="btn btn-sm btn-light js-sup" aria-label="Move up"' + (i ? '' : ' disabled') + '><i class="bi bi-arrow-up"></i></button>' +
        '<button type="button" class="btn btn-sm btn-light js-sdown" aria-label="Move down"' + (i < state.length - 1 ? '' : ' disabled') + '><i class="bi bi-arrow-down"></i></button></div></li>';
    }).join(''));
  }
  function readSections() {
    return $('#sectionList li').map(function () { return [[$(this).data('key'), $(this).find('.js-sec').prop('checked')]]; }).get();
  }
  function storeSections(state) {
    data.sections = state.filter(function (s) { return s[1]; }).map(function (s) { return s[0]; });
    renderSections(state);
    changed();
  }
  $(document).on('change', '.js-sec', function () { storeSections(readSections()); });
  $(document).on('click', '.js-sup, .js-sdown', function () {
    var state = readSections(), i = $(this).closest('li').index(), j = $(this).hasClass('js-sup') ? i - 1 : i + 1;
    state.splice(j, 0, state.splice(i, 1)[0]);
    storeSections(state);
  });
  $('#resetSections').on('click', function () { data.sections = []; renderSections(); changed(); });

  /* SEO + language */
  function updateCounts() {
    $('.js-count').each(function () { $(this).text(($('#' + $(this).data('for')).val() || '').length); });
    var c = catInfo(), city = data.city || '';
    $('#seo-title').attr('placeholder', (data.name || '') + ' | ' + c.title + (city ? ' in ' + city : ''));
    $('#seo-desc').attr('placeholder', [data.tagline, data.address, data.phone ? 'Call ' + data.phone : ''].filter(Boolean).join('. ').slice(0, 160));
  }
  $('#f-hindi').prop('checked', data.languages.indexOf('hi') > -1).on('change', function () {
    data.languages = this.checked ? ['en', 'hi'] : ['en'];
    changed();
  });

  /* ------------------------------------------------------------------
   * steps
   * ---------------------------------------------------------------- */
  var stepKeys = C.steps.map(function (s) { return s.key; });
  var currentStep = stepKeys.indexOf(C.startStep) > -1 ? C.startStep : stepKeys[0];
  function renderProgress() {
    $('#edProgress').css('width', Math.round(100 * C.stepsDone.length / stepKeys.length) + '%');
    $('.ed-step').each(function () { $(this).toggleClass('done', C.stepsDone.indexOf($(this).data('step')) > -1); });
  }
  function showStep(key) {
    currentStep = key;
    $('.step').attr('hidden', true).filter('[data-step="' + key + '"]').removeAttr('hidden');
    $('.ed-step').removeClass('active').filter('[data-step="' + key + '"]').addClass('active')[0].scrollIntoView({ block: 'nearest', inline: 'center' });
    var i = stepKeys.indexOf(key);
    $('#prevStep').prop('disabled', i === 0);
    $('#edFinish').addClass('d-none');
    $('.ed-nav').removeClass('d-none');
    $('.ed-form .ed-body').scrollTop(0);
    try { history.replaceState(null, '', '?step=' + key); } catch (e) { /* ignore */ }
  }
  $(document).on('click', '.ed-step', function () { save(); showStep($(this).data('step')); });
  $(document).on('click', '[data-goto]', function (e) {
    e.preventDefault();
    showStep($(this).data('goto'));
    $('[data-path="' + $(this).data('focus') + '"]').first().trigger('focus');
  });
  $('#prevStep').on('click', function () { save(); showStep(stepKeys[Math.max(0, stepKeys.indexOf(currentStep) - 1)]); });
  $('#nextStep').on('click', function () {
    var step = currentStep, $b = $(this).prop('disabled', true);
    dirty = true;
    save({ step: step, complete: true }).done(function () {
      var i = stepKeys.indexOf(step);
      if (i < stepKeys.length - 1) showStep(stepKeys[i + 1]);
      else { $('.step').attr('hidden', true); $('.ed-nav').addClass('d-none'); $('#edFinish').removeClass('d-none'); }
    }).always(function () { $b.prop('disabled', false); });
  });

  /* ------------------------------------------------------------------
   * preview panel (desktop: side by side; phone: full screen)
   * ---------------------------------------------------------------- */
  $('#openPreview').on('click', function () { $('body').addClass('show-preview'); sendPreview(); });
  $('#closePreview').on('click', function () { $('body').removeClass('show-preview'); });
  $('[data-device]').on('click', function () {
    $('[data-device]').removeClass('active');
    $(this).addClass('active');
    $('#edPreview').toggleClass('is-phone', $(this).data('device') === 'phone');
  });

  /* language of the editor itself */
  function applyLang() {
    $('.tr').each(function () { $(this).text(lang === 'hi' ? $(this).attr('data-hi') : $(this).attr('data-en')); });
    $('#langToggle').text(lang === 'hi' ? 'English' : 'हिंदी').attr('aria-pressed', String(lang === 'hi'));
    document.documentElement.lang = lang;
  }
  $('#langToggle').on('click', function () {
    lang = lang === 'hi' ? 'en' : 'hi';
    try { localStorage.setItem('ed-lang', lang); } catch (e) { /* ignore */ }
    renderAll();
    applyLang();
  });

  /* storage note */
  function renderStorage() {
    var mb = function (b) { return (b / 1048576).toFixed(1); };
    $('.js-storage').text(T('Storage used: ', 'इस्तेमाल: ') + mb(C.storageUsed) + ' / ' + mb(C.storageLimit) + ' MB');
  }

  /* ------------------------------------------------------------------
   * boot
   * ---------------------------------------------------------------- */
  function renderAll() {
    $('#f-category').html(C.categories.map(function (c) { return '<option value="' + c.key + '">' + esc(c.title) + '</option>'; }).join(''));
    fillFields();
    ['services', 'menuCategories', 'vehicles', 'results', 'testimonials', 'faqs'].forEach(renderRepeater);
    renderChips();
    $('.img-field').not('.repeater .img-field').each(function () { renderImageField($(this)); });
    $('#f-wide').prop('checked', +data.logoWidth > 0);
    renderGallery();
    renderHours();
    renderLook();
    onCategory();
    updateCounts();
    renderStorage();
  }
  renderAll();
  applyLang();
  renderProgress();
  showStep(currentStep);
  setSaveState('saved');
  setInterval(function () { if (dirty && !saving) save(); }, 5000);
})(jQuery, window, document);
