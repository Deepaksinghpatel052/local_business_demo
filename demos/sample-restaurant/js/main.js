/*!
 * main.js: renders the whole one-page website from window.BUSINESS (data.js).
 * Needs: jQuery, Bootstrap 5 bundle, themes.js, data.js (AOS is optional).
 */
(function ($, window, document) {
  'use strict';

  /* =====================================================================
   * CONFIG: the only block you normally touch in this file.
   * When the client pays, set DEMO_MODE = false (or run
   * `python new_demo.py --launch <slug>`). That removes the demo ribbon,
   * theme switcher, pitch mode and the noindex tag in one go.
   * ===================================================================== */
  var DEMO_MODE = true;
  var SHOW_THEME_SWITCHER = true;          // only used while DEMO_MODE is true
  var TIMEZONE = 'Asia/Kolkata';           // used for the "Open now" badge
  var DEFAULT_DEVELOPER = {                // used when data.js has no developer block
    name: 'Your Name', phone: '', whatsapp: '', portfolio: ''
  };
  var COLORTHIEF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.umd.js';
  /* ===================================================================== */

  var PRESETS = window.THEME_PRESETS || {};
  var CATEGORIES = window.THEME_CATEGORIES || {};
  var FONT_WEIGHTS = window.FONT_WEIGHTS || {};
  var HIGHLIGHT_ICONS = window.HIGHLIGHT_ICONS || [];

  var DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var SERIF_FONTS = ['Playfair Display', 'Cormorant Garamond', 'Cinzel', 'Lora', 'DM Serif Display', 'Marcellus', 'Merriweather', 'Yeseva One', 'Rozha One'];
  var BTN_RADIUS = { pill: '50rem', rounded: '10px', square: '3px' };
  var DEFAULT_ORDER = ['hero', 'highlights', 'about', 'services', 'why', 'doctor', 'results',
    'gallery', 'testimonials', 'cta', 'hours', 'faq', 'contact'];

  /* ---------------------------------------------------------------------
   * Translations (key labels, headings and buttons only)
   * ------------------------------------------------------------------- */
  var I18N = {
    en: {
      nav_about: 'About', nav_gallery: 'Gallery', nav_reviews: 'Reviews', nav_hours: 'Timings',
      nav_faq: 'FAQ', nav_contact: 'Contact', langSwitch: 'हिंदी', langSwitchLabel: 'Switch to Hindi',
      callNow: 'Call Now', whatsappUs: 'WhatsApp Us', orderNow: 'Order on WhatsApp', bookSlot: 'Book Your Slot',
      freeTrial: 'Book Free Trial', bookAppointment: 'Book Appointment', bookDemo: 'Book Free Demo Class',
      getQuote: 'Get a Quote', enquireNow: 'Enquire Now', checkAvailability: 'Check Availability',
      getDirections: 'Get Directions', sendWhatsapp: 'Send on WhatsApp', enquire: 'Enquire',
      kick_about: 'Our story', kick_services: 'What we offer', kick_why: 'Our promise', kick_gallery: 'Take a look',
      kick_reviews: 'Testimonials', kick_hours: 'Visit us', kick_faq: 'Good to know', kick_contact: 'Get in touch',
      kick_doctor: 'Your doctor', kick_results: 'Proud moments',
      aboutTitle: 'About Us', since: 'Since {y}', yearsInBusiness: 'Years of service', googleRating: 'Google rating',
      happyCustomers: 'Happy customers', googleReviews: 'Google reviews',
      menu: 'Our Menu', services: 'Our Services', treatments: 'Treatments', collections: 'Our Collections',
      plans: 'Membership Plans', departments: 'Departments', programs: 'Our Programs', courses: 'Courses',
      rooms: 'Rooms & Stays', products: 'Our Products', properties: 'Properties', specials: 'House specials',
      whyTitle: 'Why Choose Us', doctorTitle: 'Meet the Doctor', resultsTitle: 'Our Results', galleryTitle: 'Gallery',
      reviewsTitle: 'What Our Customers Say', hoursTitle: 'Opening Hours', faqTitle: 'Frequently Asked Questions',
      contactTitle: 'Contact Us', experience: 'Experience', popular: 'Most popular',
      openNow: 'Open now', closedNow: 'Closed now', today: 'Today', closed: 'Closed', open24: 'Open 24 hours',
      closesAt: 'Closes at {t}', opensAt: 'Opens at {t}', opensTomorrow: 'Opens tomorrow at {t}', opensDay: 'Opens {d} at {t}',
      mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
      address: 'Address', phone: 'Phone', email: 'Email', whatsapp: 'WhatsApp',
      formTitle: 'Send us a message', formNote: 'Your message opens in WhatsApp, ready to send.',
      yourName: 'Your name', yourPhone: 'Your phone number', yourMessage: 'Your message',
      interestedIn: 'Interested in', selectOption: 'Select (optional)', formError: 'Please enter your name and a valid phone number.',
      quickLinks: 'Quick links', followUs: 'Follow us', rights: 'All rights reserved.', websiteBy: 'Website by',
      ratingFrom: '{r} ★ from {n} Google reviews', ratingOnly: 'Rated {r} ★ on Google',
      readReviews: 'Read all reviews on Google', ratedBy: 'Rated {r} out of 5 by {n} customers on Google',
      viewOnMap: 'Open in Google Maps', backToTop: 'Back to top',
      ribbon: 'This is a demo website concept prepared for {name} by {dev}. Like it? Let\'s make it yours.',
      ribbonBtn: 'Let\'s talk', dismiss: 'Dismiss',
      pitchTitle: 'What you get with this website', pitchCta: 'Get this website',
      pitch1: 'Mobile-friendly design that looks great on every phone',
      pitch2: 'WhatsApp and Google Maps built right in',
      pitch3: 'Fast loading, even on slow mobile data',
      pitch4: 'Your own domain name (yourbusiness.com)',
      pitch5: 'Better visibility on Google search',
      pitch6: 'Basic SEO setup with your business details',
      themeTitle: 'Try a colour theme', brandColors: 'Brand colors'
    },
    hi: {
      nav_about: 'हमारे बारे में', nav_gallery: 'गैलरी', nav_reviews: 'समीक्षाएँ', nav_hours: 'समय',
      nav_faq: 'सवाल-जवाब', nav_contact: 'संपर्क', langSwitch: 'English', langSwitchLabel: 'Switch to English',
      callNow: 'अभी कॉल करें', whatsappUs: 'व्हाट्सऐप करें', orderNow: 'व्हाट्सऐप पर ऑर्डर करें', bookSlot: 'अपना स्लॉट बुक करें',
      freeTrial: 'फ्री ट्रायल बुक करें', bookAppointment: 'अपॉइंटमेंट बुक करें', bookDemo: 'फ्री डेमो क्लास बुक करें',
      getQuote: 'कोटेशन पाएँ', enquireNow: 'अभी पूछें', checkAvailability: 'उपलब्धता जानें',
      getDirections: 'रास्ता देखें', sendWhatsapp: 'व्हाट्सऐप पर भेजें', enquire: 'पूछें',
      kick_about: 'हमारी कहानी', kick_services: 'हम क्या देते हैं', kick_why: 'हमारा वादा', kick_gallery: 'एक झलक',
      kick_reviews: 'ग्राहकों की राय', kick_hours: 'हमसे मिलें', kick_faq: 'जानने योग्य बातें', kick_contact: 'संपर्क में रहें',
      kick_doctor: 'आपके डॉक्टर', kick_results: 'गर्व के पल',
      aboutTitle: 'हमारे बारे में', since: '{y} से', yearsInBusiness: 'साल की सेवा', googleRating: 'गूगल रेटिंग',
      happyCustomers: 'खुश ग्राहक', googleReviews: 'गूगल रिव्यू',
      menu: 'हमारा मेन्यू', services: 'हमारी सेवाएँ', treatments: 'ट्रीटमेंट', collections: 'हमारा कलेक्शन',
      plans: 'मेंबरशिप प्लान', departments: 'विभाग', programs: 'हमारे प्रोग्राम', courses: 'कोर्स',
      rooms: 'कमरे', products: 'हमारे प्रोडक्ट', properties: 'प्रॉपर्टी', specials: 'खास पेशकश',
      whyTitle: 'हमें क्यों चुनें', doctorTitle: 'डॉक्टर से मिलें', resultsTitle: 'हमारे परिणाम', galleryTitle: 'गैलरी',
      reviewsTitle: 'हमारे ग्राहक क्या कहते हैं', hoursTitle: 'खुलने का समय', faqTitle: 'अक्सर पूछे जाने वाले सवाल',
      contactTitle: 'संपर्क करें', experience: 'अनुभव', popular: 'सबसे लोकप्रिय',
      openNow: 'अभी खुला है', closedNow: 'अभी बंद है', today: 'आज', closed: 'बंद', open24: '24 घंटे खुला',
      closesAt: '{t} बजे बंद होगा', opensAt: '{t} बजे खुलेगा', opensTomorrow: 'कल {t} बजे खुलेगा', opensDay: '{d} को {t} बजे खुलेगा',
      mon: 'सोमवार', tue: 'मंगलवार', wed: 'बुधवार', thu: 'गुरुवार', fri: 'शुक्रवार', sat: 'शनिवार', sun: 'रविवार',
      address: 'पता', phone: 'फ़ोन', email: 'ईमेल', whatsapp: 'व्हाट्सऐप',
      formTitle: 'हमें संदेश भेजें', formNote: 'आपका संदेश व्हाट्सऐप में खुलेगा, भेजने के लिए तैयार।',
      yourName: 'आपका नाम', yourPhone: 'आपका फ़ोन नंबर', yourMessage: 'आपका संदेश',
      interestedIn: 'किसमें रुचि है', selectOption: 'चुनें (वैकल्पिक)', formError: 'कृपया अपना नाम और सही फ़ोन नंबर लिखें।',
      quickLinks: 'क्विक लिंक', followUs: 'हमें फ़ॉलो करें', rights: 'सर्वाधिकार सुरक्षित।', websiteBy: 'वेबसाइट:',
      ratingFrom: '{n} गूगल रिव्यू में {r} ★', ratingOnly: 'गूगल पर {r} ★ रेटिंग',
      readReviews: 'गूगल पर सभी रिव्यू पढ़ें', ratedBy: 'गूगल पर {n} ग्राहकों ने 5 में से {r} रेटिंग दी',
      viewOnMap: 'गूगल मैप में खोलें', backToTop: 'ऊपर जाएँ',
      ribbon: 'यह {name} के लिए {dev} द्वारा बनाई गई एक डेमो वेबसाइट है। पसंद आई? इसे अपना बनाइए।',
      ribbonBtn: 'बात करें', dismiss: 'बंद करें',
      pitchTitle: 'इस वेबसाइट के साथ आपको क्या मिलेगा', pitchCta: 'यह वेबसाइट पाएँ',
      pitch1: 'मोबाइल-फ्रेंडली डिज़ाइन, हर फ़ोन पर शानदार',
      pitch2: 'व्हाट्सऐप और गूगल मैप्स जुड़े हुए',
      pitch3: 'धीमे इंटरनेट पर भी तेज़ लोडिंग',
      pitch4: 'आपका अपना डोमेन नाम (yourbusiness.com)',
      pitch5: 'गूगल सर्च में बेहतर पहचान',
      pitch6: 'आपकी जानकारी के साथ बेसिक SEO सेटअप',
      themeTitle: 'रंग बदल कर देखें', brandColors: 'ब्रांड रंग'
    }
  };

  /* ---------------------------------------------------------------------
   * Small helpers
   * ------------------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function store(kind, key, val) {
    try {
      var s = kind === 'local' ? window.localStorage : window.sessionStorage;
      if (val === undefined) return s.getItem(key);
      s.setItem(key, val);
    } catch (e) { /* storage blocked: ignore */ }
    return null;
  }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function isPlaceholder(v) { return /^\s*(\[.*\]|TODO\b.*)?\s*$/i.test(String(v == null ? '' : v)); }

  /* "TODO..." values from new_demo.py are treated as empty so a half-filled
     demo still renders cleanly. */
  function clean(v) {
    if (typeof v === 'string') return /^\s*TODO\b/i.test(v) ? '' : v.trim();
    if (Array.isArray(v)) {
      return v.map(clean).filter(function (x) {
        if (x === '' || x == null) return false;
        if (typeof x === 'object' && !Array.isArray(x)) {
          return Object.keys(x).some(function (k) { return x[k] !== '' && x[k] != null && !(Array.isArray(x[k]) && !x[k].length); });
        }
        return true;
      });
    }
    if (v && typeof v === 'object') {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = clean(v[k]); });
      return o;
    }
    return v;
  }

  /* Image paths: relative ("images/a.jpg") or full https URLs. Leading "/"
     is stripped so the folder works as the root of any subdomain. */
  function srcOf(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (/^(https?:|data:|blob:)/i.test(u)) return u;
    return u.replace(/^\.?\/+/, '');
  }
  function absUrl(u) {
    if (!u) return '';
    try { return new URL(u, window.location.href).href; } catch (e) { return u; }
  }

  /* ---------------------------------------------------------------------
   * Colour helpers
   * ------------------------------------------------------------------- */
  function normHex(h, fallback) {
    h = String(h || '').trim();
    var m = h.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return fallback || null;
    var x = m[1];
    if (x.length === 3) x = x[0] + x[0] + x[1] + x[1] + x[2] + x[2];
    return '#' + x.toUpperCase();
  }
  function hexToRgb(h) {
    h = normHex(h, '#000000');
    return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
  }
  function rgbToHex(r) {
    return '#' + r.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join('').toUpperCase();
  }
  function mix(a, b, w) { // w = weight of b (0..1)
    var x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex([0, 1, 2].map(function (i) { return x[i] * (1 - w) + y[i] * w; }));
  }
  function shade(h, amt) { return amt < 0 ? mix(h, '#000000', -amt) : mix(h, '#FFFFFF', amt); }
  function lum(h) {
    var c = hexToRgb(h).map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function onColor(bg) { return contrast(bg, '#FFFFFF') >= contrast(bg, '#111111') ? '#FFFFFF' : '#111111'; }
  function ensureContrast(fg, bg, ratio) {
    if (contrast(fg, bg) >= ratio) return fg;
    var target = lum(bg) > 0.35 ? '#000000' : '#FFFFFF';
    for (var t = 0.05; t <= 1; t += 0.05) {
      var c = mix(fg, target, t);
      if (contrast(c, bg) >= ratio) return c;
    }
    return target;
  }
  function rgbStr(h) { return hexToRgb(h).join(', '); }
  function rgbToHsl(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  /* ---------------------------------------------------------------------
   * Data + category setup
   * ------------------------------------------------------------------- */
  var B = clean(window.BUSINESS || {});
  var CAT_KEY = CATEGORIES[B.category] ? B.category : 'general';
  var CAT = CATEGORIES[CAT_KEY] || { preset: 'general', label: 'local business', schema: 'LocalBusiness', services: 'services', style: 'cards', icon: 'bi-shop', defaultServices: [] };
  var PRESET_KEY = PRESETS[CAT.preset] ? CAT.preset : 'general';
  var PRESET = PRESETS[PRESET_KEY];
  var PH = 'placeholders/' + PRESET_KEY + '/';
  var DEV = $.extend({}, DEFAULT_DEVELOPER, B.developer || {});
  Object.keys(DEV).forEach(function (k) { if (isPlaceholder(DEV[k])) DEV[k] = DEFAULT_DEVELOPER[k] || ''; });

  ['name', 'category', 'phone', 'address'].forEach(function (k) {
    if (!B[k]) console.warn('[demo] data.js: required field "' + k + '" is empty.');
  });
  B.name = B.name || 'Your Business';

  function guessCity(addr) {
    var parts = String(addr || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) return '';
    var last = parts[parts.length - 1];
    if (/\d{6}|^[A-Z]{2}\b/.test(last) && parts.length > 1) return parts[parts.length - 2];
    return last.replace(/\s*\d{6}\s*$/, '');
  }
  var CITY = B.city || guessCity(B.address) || '';
  var IN_CITY = CITY ? ' in ' + CITY : '';
  var TOKENS = { name: B.name, city: CITY || 'your area', category: CAT.label };
  var CAT_TITLE = CAT.label.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

  function waNumber(n) {
    var d = digits(n);
    if (d.length === 10) d = '91' + d;
    if (d.length === 11 && d[0] === '0') d = '91' + d.slice(1);
    return d;
  }
  function fmtWa(d) { // 919876543210 -> +91 98765 43210
    return /^91\d{10}$/.test(d) ? '+91 ' + d.slice(2, 7) + ' ' + d.slice(7) : '+' + d;
  }
  var WA = waNumber(B.whatsapp || B.phone);
  var TEL = B.phone ? 'tel:' + String(B.phone).replace(/[^\d+]/g, '') : '';
  var DEV_WA = waNumber(DEV.whatsapp || DEV.phone);
  var MAP_QUERY = B.mapQuery || [B.name, B.address].filter(Boolean).join(', ');
  var MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(MAP_QUERY);

  function waLink(msg, number) {
    var n = number || WA;
    if (!n) return TEL || '#contact';
    return 'https://wa.me/' + n + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  var CTA_MESSAGES = {
    orderNow: 'Hi {name}, I would like to place an order.',
    bookSlot: 'Hi {name}, I would like to book an appointment.',
    freeTrial: 'Hi {name}, I would like to book a free trial session.',
    bookAppointment: 'Hi {name}, I would like to book an appointment.',
    bookDemo: 'Hi {name}, I would like to book a free demo class.',
    getQuote: 'Hi {name}, I would like a quote.',
    enquireNow: 'Hi {name}, I would like to know more about your collection.',
    checkAvailability: 'Hi {name}, I would like to check room availability.',
    whatsappUs: 'Hi {name}, I found your website and would like to know more.'
  };
  function ctaLink(key) { return waLink(fill(CTA_MESSAGES[key] || CTA_MESSAGES.whatsappUs, TOKENS)); }

  /* ---------------------------------------------------------------------
   * i18n
   * ------------------------------------------------------------------- */
  var LANGS = (B.languages && B.languages.length ? B.languages : ['en']).filter(function (l) { return I18N[l]; });
  if (!LANGS.length) LANGS = ['en'];
  var lang = store('local', 'lbd-lang');
  if (LANGS.indexOf(lang) === -1) lang = LANGS[0];

  function t(key, args) {
    var s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    return args ? fill(s, args) : s;
  }
  function tr(key, args, tag) { // translatable inline element
    tag = tag || 'span';
    var a = args ? " data-i18n-args='" + esc(JSON.stringify(args)) + "'" : '';
    return '<' + tag + ' data-i18n="' + key + '"' + a + '>' + esc(t(key, args)) + '</' + tag + '>';
  }
  function applyLang() {
    $('[data-i18n]').each(function () {
      var $el = $(this), args = $el.attr('data-i18n-args');
      $el.text(t($el.attr('data-i18n'), args ? JSON.parse(args) : null));
    });
    $('[data-i18n-placeholder]').each(function () { this.placeholder = t(this.getAttribute('data-i18n-placeholder')); });
    $('[data-i18n-aria]').each(function () { this.setAttribute('aria-label', t(this.getAttribute('data-i18n-aria'))); });
    document.documentElement.lang = lang;
    if (lang === 'hi') loadFonts(['Noto Sans Devanagari']);
    updateOpenStatus();
  }

  /* ---------------------------------------------------------------------
   * Theme system: preset → data.js overrides → CSS variables on :root
   * ------------------------------------------------------------------- */
  var loadedFonts = {};
  function loadFonts(list) {
    var fams = list.filter(function (f) { return f && !loadedFonts[f]; });
    if (!fams.length) return;
    var q = fams.map(function (f) {
      loadedFonts[f] = true;
      var w = FONT_WEIGHTS[f];
      return 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + (w && w !== '400' ? ':wght@' + w : '');
    }).join('&');
    $('<link rel="stylesheet">').attr('href', 'https://fonts.googleapis.com/css2?' + q + '&display=swap').appendTo('head');
  }
  function fontStack(f) {
    var generic = SERIF_FONTS.indexOf(f) > -1 ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    return '"' + f + '", "Noto Sans Devanagari", ' + generic;
  }

  function baseTheme() {
    return $.extend({}, PRESET.palette, {
      headingFont: PRESET.headingFont, bodyFont: PRESET.bodyFont,
      buttonStyle: PRESET.buttonStyle, borderRadius: PRESET.borderRadius
    });
  }
  var userTheme = (B.theme && typeof B.theme === 'object') ? B.theme : {};
  var AUTO_THEME = String(B.theme).toLowerCase() === 'auto' || userTheme.mode === 'auto';
  var brandTheme = $.extend(baseTheme(), userTheme);

  function applyTheme(th) {
    var P = PRESET.palette;
    var primary = normHex(th.primary, P.primary);
    var accent = normHex(th.accent, P.accent);
    var bg = normHex(th.background, P.background);
    var surface = normHex(th.surface, P.surface);
    var text = normHex(th.text, P.text);
    var isDark = lum(bg) < 0.2;
    var primaryDark = normHex(th.primaryDark) || shade(primary, -0.22);
    var border = mix(bg, text, isDark ? 0.16 : 0.11);
    var muted = ensureContrast(mix(text, bg, 0.3), bg, 4.5);
    var footer = isDark ? mix(bg, '#000000', 0.45) : mix('#0D0D12', primary, 0.16);
    var heading = th.headingFont || PRESET.headingFont;
    var body = th.bodyFont || PRESET.bodyFont;
    var vars = {
      '--primary': primary,
      '--primary-rgb': rgbStr(primary),
      '--primary-dark': primaryDark,
      '--primary-dark-rgb': rgbStr(primaryDark),
      '--on-primary': onColor(primary),
      '--primary-ink': ensureContrast(primary, bg, 4.5),
      '--primary-soft': mix(bg, primary, isDark ? 0.16 : 0.09),
      '--accent': accent,
      '--accent-rgb': rgbStr(accent),
      '--accent-dark': shade(accent, -0.2),
      '--on-accent': onColor(accent),
      '--accent-ink': ensureContrast(accent, surface, 3),
      '--bg': bg,
      '--surface': surface,
      '--surface-alt': mix(bg, primary, isDark ? 0.07 : 0.04),
      '--text': text,
      '--text-muted': muted,
      '--border': border,
      '--footer-bg': footer,
      '--on-footer': onColor(footer),
      '--heading-font': fontStack(heading),
      '--body-font': fontStack(body),
      '--radius': th.borderRadius || PRESET.borderRadius || '14px',
      '--btn-radius': BTN_RADIUS[th.buttonStyle] || BTN_RADIUS[PRESET.buttonStyle] || '10px',
      /* Bootstrap bridge */
      '--bs-body-bg': bg, '--bs-body-color': text, '--bs-emphasis-color': text, '--bs-heading-color': text,
      '--bs-border-color': border, '--bs-secondary-color': muted, '--bs-tertiary-bg': mix(bg, text, 0.05),
      '--bs-primary': primary, '--bs-primary-rgb': rgbStr(primary),
      '--bs-link-color': ensureContrast(primary, bg, 4.5), '--bs-link-color-rgb': rgbStr(ensureContrast(primary, bg, 4.5)),
      '--bs-link-hover-color': primaryDark, '--bs-body-font-family': fontStack(body)
    };
    var root = document.documentElement;
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
    root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    $('meta[name="theme-color"]').attr('content', primary);
    loadFonts([heading, body]);
  }

  /* Auto theme: dominant logo colours via ColorThief, preset as fallback. */
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url; s.async = true; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function pickLogoColors(palette) {
    var cands = palette.map(function (rgb) {
      var hsl = rgbToHsl(rgb);
      return { hex: rgbToHex(rgb), h: hsl[0], s: hsl[1], l: hsl[2] };
    });
    var usable = cands.filter(function (c) { return c.s > 0.22 && c.l > 0.12 && c.l < 0.78; });
    usable.sort(function (a, b) { return (b.s * (1 - Math.abs(b.l - 0.45))) - (a.s * (1 - Math.abs(a.l - 0.45))); });
    var primary = usable[0] || cands.filter(function (c) { return c.l < 0.6; })[0];
    if (!primary) return null;
    var accent = usable.slice(1).filter(function (c) {
      var d = Math.abs(c.h - primary.h); d = Math.min(d, 360 - d);
      return d > 28;
    })[0];
    return { primary: primary.hex, accent: accent ? accent.hex : null };
  }
  function extractLogoTheme() {
    var logo = srcOf(B.logo);
    if (!logo) return Promise.reject(new Error('no logo'));
    if (location.protocol === 'file:' && !/^https?:/i.test(logo)) {
      return Promise.reject(new Error('reading local logo colours needs http(s); open the site through a web server'));
    }
    var ready = window.ColorThief ? Promise.resolve() : loadScript(COLORTHIEF_URL);
    return ready.then(function () {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        if (/^https?:/i.test(logo)) img.crossOrigin = 'anonymous';
        img.onload = function () {
          try {
            var picked = pickLogoColors(new window.ColorThief().getPalette(img, 6) || []);
            picked ? resolve(picked) : reject(new Error('no usable colours'));
          } catch (e) { reject(e); }
        };
        img.onerror = function () { reject(new Error('logo failed to load')); };
        img.src = logo;
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Images with automatic placeholder fallback
   * ------------------------------------------------------------------- */
  function phImg(i) { return PH + ((Math.abs(i) % 4) + 1) + '.jpg'; }
  function gradientSvg() {
    var cs = getComputedStyle(document.documentElement);
    var a = (cs.getPropertyValue('--primary') || '#888').trim(), b = (cs.getPropertyValue('--accent') || '#bbb').trim();
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/></svg>');
  }
  window.LBD = window.LBD || {};
  window.LBD.imgError = function (el) {
    var fb = el.getAttribute('data-fallback');
    if (fb && !el.getAttribute('data-failed') && el.getAttribute('src') !== fb) {
      el.setAttribute('data-failed', '1');
      el.src = fb;
    } else {
      el.onerror = null;
      el.src = gradientSvg();
    }
  };
  window.LBD.logoError = function (el) { $(el).replaceWith(textLogo()); };

  function img(u, alt, o) {
    o = o || {};
    var fb = o.fallback || phImg(0);
    var s = srcOf(u) || fb;
    return '<img src="' + esc(s) + '" alt="' + esc(alt) + '"' +
      (o.cls ? ' class="' + o.cls + '"' : '') +
      (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') +
      ' decoding="async"' + (o.w ? ' width="' + o.w + '" height="' + o.h + '"' : '') +
      ' data-fallback="' + esc(fb) + '" onerror="LBD.imgError(this)">';
  }
  function altText(what) { return B.name + ', ' + CAT.label + IN_CITY + (what ? ': ' + what : ''); }

  /* ---------------------------------------------------------------------
   * Opening hours (Asia/Kolkata)
   * ------------------------------------------------------------------- */
  function parseTime(s) {
    var m = String(s).trim().toLowerCase().replace(/\./g, ':').match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!m) return null;
    var h = +m[1], mi = +(m[2] || 0);
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    return h > 24 || mi > 59 ? null : h * 60 + mi;
  }
  function parseDay(v) {
    var s = String(v || '').trim().toLowerCase();
    if (!s || /closed|holiday|\boff\b/.test(s)) return { closed: true };
    if (/24\s*(h|hours|hrs)|open\s*24|00:00\s*-\s*24:00/.test(s)) return { allDay: true };
    var ranges = [];
    s.split(/[,;&]|\band\b/).forEach(function (part) {
      var p = part.split(/\s*(?:-|–|—|\bto\b)\s*/);
      if (p.length !== 2) return;
      var a = parseTime(p[0]), b = parseTime(p[1]);
      if (a != null && b != null) ranges.push([a, b <= a ? b + 1440 : b]);
    });
    return ranges.length ? { ranges: ranges } : { closed: true };
  }
  var HOURS = null;
  if (B.hours && typeof B.hours === 'object' && DAY_KEYS.some(function (d) { return B.hours[d]; })) {
    HOURS = DAY_KEYS.map(function (d) { return parseDay(B.hours[d]); });
  }
  function fmtTime(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + ('0' + m).slice(-2) + ' ' + ap;
  }
  function fmtDay(d) {
    if (d.allDay) return t('open24');
    if (d.closed) return t('closed');
    return d.ranges.map(function (r) { return fmtTime(r[0]) + ' – ' + fmtTime(r[1]); }).join(', ');
  }
  function fmtDayHtml(d) { // one unbroken line per time range
    if (d.allDay || d.closed) return esc(fmtDay(d));
    return d.ranges.map(function (r) { return '<span class="text-nowrap">' + fmtTime(r[0]) + ' – ' + fmtTime(r[1]) + '</span>'; }).join('<br>');
  }
  function nowLocal() {
    try {
      var parts = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      return { day: DAY_KEYS.indexOf(parts.weekday.toLowerCase().slice(0, 3)), min: (+parts.hour % 24) * 60 + (+parts.minute) };
    } catch (e) {
      var d = new Date();
      return { day: (d.getDay() + 6) % 7, min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function openStatus() {
    if (!HOURS) return null;
    var now = nowLocal(), d = now.day, m = now.min, today = HOURS[d], yest = HOURS[(d + 6) % 7], i;
    if (today.allDay) return { open: true, key: 'open24' };
    if (today.ranges) {
      for (i = 0; i < today.ranges.length; i++) {
        if (m >= today.ranges[i][0] && m < today.ranges[i][1]) return { open: true, key: 'closesAt', args: { t: fmtTime(today.ranges[i][1]) } };
      }
    }
    if (yest.ranges) {
      for (i = 0; i < yest.ranges.length; i++) {
        if (yest.ranges[i][1] > 1440 && m < yest.ranges[i][1] - 1440) return { open: true, key: 'closesAt', args: { t: fmtTime(yest.ranges[i][1]) } };
      }
    }
    if (today.ranges) {
      for (i = 0; i < today.ranges.length; i++) {
        if (today.ranges[i][0] > m) return { open: false, key: 'opensAt', args: { t: fmtTime(today.ranges[i][0]) } };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var nd = HOURS[(d + k) % 7];
      if (nd.closed) continue;
      var start = nd.allDay ? 0 : nd.ranges[0][0];
      return k === 1 ? { open: false, key: 'opensTomorrow', args: { t: fmtTime(start) } }
        : { open: false, key: 'opensDay', args: { d: t(DAY_KEYS[(d + k) % 7]), t: fmtTime(start) } };
    }
    return { open: false, key: null };
  }
  function updateOpenStatus() {
    var st = openStatus();
    if (!st) return;
    var label = t(st.open ? 'openNow' : 'closedNow');
    var detail = st.key ? t(st.key, st.args) : '';
    $('.js-open-status').each(function () {
      $(this).toggleClass('is-open', st.open).toggleClass('is-closed', !st.open)
        .html('<span class="status-dot" aria-hidden="true"></span><strong>' + esc(label) + '</strong>' +
          (detail ? '<span class="status-sep" aria-hidden="true"> · </span><span class="status-detail">' + esc(detail) + '</span>' : ''));
    });
    var today = nowLocal().day;
    $('.hours-table tr').removeClass('is-today').filter('[data-day="' + today + '"]').addClass('is-today');
    $('.hours-table tr').each(function () {
      var day = +$(this).attr('data-day');
      $(this).find('td').first().html(fmtDayHtml(HOURS[day]));
    });
  }

  /* ---------------------------------------------------------------------
   * Markup helpers
   * ------------------------------------------------------------------- */
  var USE_AOS = !!window.AOS && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NARROW = window.innerWidth < 992;
  function aos(effect, delay) {
    if (!USE_AOS) return '';
    // sideways slides push content off-screen on phones (horizontal scroll)
    if (NARROW && /left|right/.test(effect || '')) effect = 'fade-up';
    return ' data-aos="' + (effect || 'fade-up') + '"' + (delay ? ' data-aos-delay="' + delay + '"' : '');
  }
  function head(kicker, titleKey, sub, align) {
    return '<div class="section-head ' + (align || 'text-center') + '"' + aos() + '>' +
      '<span class="kicker">' + tr(kicker) + '</span>' +
      '<h2 class="section-title">' + tr(titleKey) + '</h2>' +
      (sub ? '<p class="section-sub">' + esc(sub) + '</p>' : '') + '</div>';
  }
  function stars(r) {
    r = Math.max(0, Math.min(5, +r || 0));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<i class="bi ' + (r >= i ? 'bi-star-fill' : r >= i - 0.5 ? 'bi-star-half' : 'bi-star') + '" aria-hidden="true"></i>';
    }
    return '<span class="stars" role="img" aria-label="Rated ' + r + ' out of 5">' + out + '</span>';
  }
  function initials(name) {
    var w = String(name).replace(/[^\p{L}\p{N}\s&]/gu, ' ').split(/\s+/).filter(function (x) { return x && x !== '&'; });
    return ((w[0] || 'B')[0] + (w.length > 1 ? w[1][0] : '')).toUpperCase();
  }
  function textLogo() {
    return '<span class="text-logo" aria-hidden="true">' + esc(initials(B.name)) + '</span>';
  }
  function brandMark() {
    var logo = srcOf(B.logo);
    var mark = logo
      ? '<img class="brand-logo" src="' + esc(logo) + '" alt="' + esc(B.name + ' logo') + '" width="44" height="44" onerror="LBD.logoError(this)">'
      : textLogo();
    return mark + '<span class="brand-name">' + esc(B.name) + '</span>';
  }
  function btn(href, icon, key, cls, extra) {
    var ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return '<a class="btn ' + cls + '" href="' + esc(href) + '"' + ext + (extra || '') + '>' +
      (icon ? '<i class="bi ' + icon + '" aria-hidden="true"></i> ' : '') + tr(key) + '</a>';
  }
  function iconFor(text) {
    for (var i = 0; i < HIGHLIGHT_ICONS.length; i++) if (HIGHLIGHT_ICONS[i][0].test(text)) return HIGHLIGHT_ICONS[i][1];
    return PRESET.highlightIcon || 'bi-check2-circle';
  }
  function highlights() {
    return (B.highlights || []).map(function (h) {
      return typeof h === 'string' ? { text: h, icon: iconFor(h) } : { text: h.text || h.title || '', icon: h.icon || iconFor(h.text || '') };
    }).filter(function (h) { return h.text; });
  }
  function niceCount(n) {
    if (n >= 1000) return Math.floor(n / 100) * 100;
    if (n >= 100) return Math.floor(n / 10) * 10;
    return n;
  }

  /* ---------------------------------------------------------------------
   * Sections
   * ------------------------------------------------------------------- */
  var S = {};

  S.hero = function () {
    var rating = B.rating ? (B.reviewCount
      ? tr('ratingFrom', { r: B.rating, n: Number(B.reviewCount).toLocaleString('en-IN') })
      : tr('ratingOnly', { r: B.rating })) : '';
    return '<section id="home" class="hero">' +
      img(B.heroImage, altText('front view'), { cls: 'hero-bg', fallback: PH + 'hero.jpg', eager: true, w: 1600, h: 900 }) +
      '<div class="hero-overlay"></div>' +
      '<div class="container hero-content">' +
      '<span class="hero-kicker"><i class="bi ' + CAT.icon + '" aria-hidden="true"></i> ' + esc(CAT_TITLE) + (CITY ? ' · ' + esc(CITY) : '') + '</span>' +
      '<h1 class="hero-title">' + esc(B.name) + '</h1>' +
      '<p class="hero-tagline">' + esc(B.tagline || fill(PRESET.taglineDefault, TOKENS)) + '</p>' +
      '<div class="hero-meta">' +
      (rating ? '<a class="rating-badge" href="' + esc(MAPS_LINK) + '" target="_blank" rel="noopener">' +
        '<i class="bi bi-google" aria-hidden="true"></i> ' + rating + '</a>' : '') +
      (HOURS ? '<span class="status-badge js-open-status" role="status"></span>' : '') +
      '</div>' +
      '<div class="hero-cta">' +
      (TEL ? btn(TEL, 'bi-telephone-fill', 'callNow', 'btn-primary btn-lg') : '') +
      (WA ? btn(waLink(fill(CTA_MESSAGES.whatsappUs, TOKENS)), 'bi-whatsapp', 'whatsappUs', 'btn-whatsapp btn-lg') : '') +
      '</div></div></section>';
  };

  S.highlights = function () {
    var list = highlights();
    if (!list.length) return '';
    return '<section class="highlights" aria-label="Highlights"><div class="container"><ul class="highlight-list">' +
      list.map(function (h, i) {
        return '<li' + aos('fade-up', i * 60) + '><i class="bi ' + esc(h.icon) + '" aria-hidden="true"></i><span>' + esc(h.text) + '</span></li>';
      }).join('') + '</ul></div></section>';
  };

  S.about = function () {
    var year = new Date().getFullYear(), est = parseInt(B.established, 10);
    var counters = [];
    if (est && est < year) counters.push({ to: year - est, suffix: '+', key: 'yearsInBusiness' });
    if (B.rating) counters.push({ to: +B.rating, dec: 1, suffix: '★', key: 'googleRating' });
    var happy = +B.happyCustomers || (B.reviewCount ? niceCount(B.reviewCount * 10) : 0);
    if (happy) counters.push({ to: happy, suffix: '+', key: 'happyCustomers' });
    if (B.reviewCount) counters.push({ to: +B.reviewCount, key: 'googleReviews' });
    var pic = B.aboutImage || (B.gallery && B.gallery[0] && (B.gallery[0].src || B.gallery[0]));
    return '<section id="about" class="section about"><div class="container"><div class="row g-4 g-lg-5 align-items-center">' +
      '<div class="col-lg-6"' + aos('fade-right') + '><div class="about-media">' +
      img(pic, altText('inside'), { cls: 'about-img', fallback: phImg(0), w: 800, h: 600 }) +
      (est ? '<div class="since-badge">' + tr('since', { y: est }) + '</div>' : '') +
      '</div></div>' +
      '<div class="col-lg-6"' + aos('fade-left') + '>' +
      '<span class="kicker">' + tr('kick_about') + '</span>' +
      '<h2 class="section-title">' + tr('aboutTitle') + '</h2>' +
      '<p class="about-text">' + esc(B.about || fill(PRESET.aboutDefault, TOKENS)) + '</p>' +
      (B.owner && PRESET_KEY !== 'medical' ? '<p class="about-owner">— ' + esc(B.owner) + '</p>' : '') +
      (counters.length ? '<div class="counters">' + counters.map(function (c) {
        return '<div class="counter"><span class="counter-num" data-count-to="' + c.to + '" data-dec="' + (c.dec || 0) + '" data-suffix="' + esc(c.suffix || '') + '">0</span>' +
          '<span class="counter-label">' + tr(c.key) + '</span></div>';
      }).join('') + '</div>' : '') +
      '</div></div></div></section>';
  };

  function serviceCards(list, withImages) {
    return '<div class="row g-4 justify-content-center">' + list.map(function (s, i) {
      var media = withImages && s.image
        ? '<div class="service-media">' + img(s.image, altText(s.title), { fallback: phImg(i), w: 800, h: 600 }) + '</div>'
        : '<div class="service-icon"><i class="bi ' + esc(s.icon || CAT.icon) + '" aria-hidden="true"></i></div>';
      return '<div class="col-sm-6 col-lg-' + (list.length % 3 === 0 ? 4 : 3) + '"' + aos('fade-up', (i % 4) * 80) + '>' +
        '<article class="service-card' + (withImages && s.image ? ' has-media' : '') + '">' + media +
        '<div class="service-body"><h3 class="service-title">' + esc(s.title) + '</h3>' +
        (s.desc ? '<p class="service-desc">' + esc(s.desc) + '</p>' : '') +
        '<div class="service-foot">' + (s.price ? '<span class="price">' + esc(s.price) + '</span>' : '<span></span>') +
        (WA ? '<a class="service-link" href="' + esc(waLink('Hi ' + B.name + ', I am interested in ' + s.title + '.')) + '" target="_blank" rel="noopener" aria-label="Enquire about ' + esc(s.title) + ' on WhatsApp">' +
          tr('enquire') + ' <i class="bi bi-arrow-right" aria-hidden="true"></i></a>' : '') +
        '</div></div></article></div>';
    }).join('') + '</div>';
  }
  function planCards(list) {
    return '<div class="row g-4 justify-content-center">' + list.map(function (p, i) {
      return '<div class="col-md-6 col-lg-4"' + aos('fade-up', i * 100) + '>' +
        '<article class="plan-card' + (p.popular ? ' is-popular' : '') + '">' +
        (p.popular ? '<span class="plan-badge">' + tr('popular') + '</span>' : '') +
        '<h3 class="plan-title">' + esc(p.title) + '</h3>' +
        (p.price ? '<div class="plan-price">' + esc(p.price) + '</div>' : '') +
        (p.desc ? '<p class="plan-desc">' + esc(p.desc) + '</p>' : '') +
        (p.features && p.features.length ? '<ul class="plan-features">' + p.features.map(function (f) {
          return '<li><i class="bi bi-check2" aria-hidden="true"></i> ' + esc(f) + '</li>';
        }).join('') + '</ul>' : '') +
        btn(waLink('Hi ' + B.name + ', I am interested in the ' + p.title + ' plan.'), 'bi-whatsapp', 'enquireNow', p.popular ? 'btn-primary w-100' : 'btn-outline-primary w-100') +
        '</article></div>';
    }).join('') + '</div>';
  }
  function menuTabs(cats) {
    var id = 'menu-tabs';
    return '<div class="menu-wrap"' + aos() + '><ul class="nav nav-pills menu-pills" id="' + id + '" role="tablist">' +
      cats.map(function (c, i) {
        return '<li class="nav-item" role="presentation"><button class="nav-link' + (i ? '' : ' active') + '" id="mt-' + i + '" data-bs-toggle="pill" data-bs-target="#mp-' + i + '" type="button" role="tab" aria-controls="mp-' + i + '" aria-selected="' + (i ? 'false' : 'true') + '">' +
          (c.icon ? '<i class="bi ' + esc(c.icon) + '" aria-hidden="true"></i> ' : '') + esc(c.name) + '</button></li>';
      }).join('') + '</ul><div class="tab-content">' +
      cats.map(function (c, i) {
        return '<div class="tab-pane fade' + (i ? '' : ' show active') + '" id="mp-' + i + '" role="tabpanel" aria-labelledby="mt-' + i + '" tabindex="0"><div class="row g-3">' +
          (c.items || []).map(function (it) {
            var veg = it.veg === true ? '<span class="veg-mark veg" title="Vegetarian" aria-label="Vegetarian"></span>'
              : it.veg === false ? '<span class="veg-mark nonveg" title="Non-vegetarian" aria-label="Non-vegetarian"></span>' : '';
            return '<div class="col-md-6"><div class="menu-item"><div class="menu-line">' + veg +
              '<span class="menu-name">' + esc(it.title || it.name) + '</span>' +
              (it.tag ? '<span class="menu-tag">' + esc(it.tag) + '</span>' : '') +
              '<span class="menu-dots" aria-hidden="true"></span>' +
              (it.price ? '<span class="menu-price">' + esc(it.price) + '</span>' : '') + '</div>' +
              (it.desc ? '<p class="menu-desc">' + esc(it.desc) + '</p>' : '') + '</div></div>';
          }).join('') + '</div></div>';
      }).join('') + '</div></div>';
  }

  S.services = function () {
    var services = B.services && B.services.length ? B.services : (CAT.defaultServices || []);
    var cats = (B.menuCategories || []).filter(function (c) { return c.name && c.items && c.items.length; });
    var style = CAT.style;
    var anyImages = services.some(function (s) { return s.image; });
    var body = '';
    if (style === 'plans' || services.some(function (s) { return s.features && s.features.length; })) {
      body = planCards(services);
    } else if (cats.length) {
      if (B.services && B.services.length) {
        body += '<h3 class="sub-title"' + aos() + '>' + tr('specials') + '</h3>' + serviceCards(services, anyImages) + '<div class="mb-5"></div>';
      }
      body += menuTabs(cats);
    } else {
      body = serviceCards(services, anyImages);
    }
    if (!body) return '';
    return '<section id="services" class="section services alt-bg"><div class="container">' +
      head('kick_services', CAT.services) + body + '</div></section>';
  };

  S.why = function () {
    var lines = ['Something our customers mention again and again.', 'A big part of why people in {city} keep coming back.'];
    var fromHighlights = highlights().slice(0, 2).map(function (h, i) {
      return { icon: h.icon, title: h.text, text: fill(lines[i], TOKENS) };
    });
    // highlight-based points first, then preset defaults that don't repeat the same idea (same icon)
    var used = fromHighlights.map(function (p) { return p.icon; });
    var defaults = (PRESET.whyChooseUs || []).filter(function (p) { return used.indexOf(p.icon) === -1; });
    var points = (B.whyChooseUs && B.whyChooseUs.length ? B.whyChooseUs : fromHighlights.concat(defaults)).slice(0, 4);
    if (!points.length) return '';
    return '<section id="why" class="section why"><div class="container">' + head('kick_why', 'whyTitle') +
      '<div class="row g-4">' + points.map(function (p, i) {
        return '<div class="col-sm-6 col-lg-3"' + aos('fade-up', i * 80) + '><div class="why-card">' +
          '<div class="why-icon"><i class="bi ' + esc(p.icon || PRESET.highlightIcon) + '" aria-hidden="true"></i></div>' +
          '<h3 class="why-title">' + esc(p.title) + '</h3><p class="why-text">' + esc(p.text || '') + '</p></div></div>';
      }).join('') + '</div></div></section>';
  };

  S.doctor = function () {
    if (PRESET_KEY !== 'medical') return '';
    var d = B.doctor || (B.owner ? { name: B.owner } : null);
    if (!d || !d.name) return '';
    var photo = srcOf(d.photo);
    return '<section id="doctor" class="section doctor alt-bg"><div class="container">' + head('kick_doctor', 'doctorTitle') +
      '<div class="doctor-card"' + aos() + '>' +
      '<div class="doctor-photo">' + (photo ? img(photo, d.name + ', ' + CAT.label + IN_CITY, { fallback: phImg(1), w: 400, h: 400 })
        : '<span class="doctor-initials">' + esc(initials(d.name.replace(/^dr\.?\s*/i, ''))) + '</span>') + '</div>' +
      '<div class="doctor-info"><h3>' + esc(d.name) + '</h3>' +
      (d.qualification ? '<p class="doctor-qual">' + esc(d.qualification) + '</p>' : '') +
      (d.experience ? '<p class="doctor-exp"><i class="bi bi-award" aria-hidden="true"></i> ' + tr('experience') + ': ' + esc(d.experience) + '</p>' : '') +
      (d.about ? '<p>' + esc(d.about) + '</p>' : '') +
      (d.specialities && d.specialities.length ? '<ul class="chips">' + d.specialities.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '') +
      btn(ctaLink('bookAppointment'), 'bi-calendar-check', 'bookAppointment', 'btn-primary') +
      '</div></div></div></section>';
  };

  S.results = function () {
    if (PRESET_KEY !== 'education' || !B.results || !B.results.length) return '';
    return '<section id="results" class="section results"><div class="container">' + head('kick_results', 'resultsTitle') +
      '<div class="row g-4 justify-content-center">' + B.results.map(function (r, i) {
        return '<div class="col-6 col-lg-3"' + aos('zoom-in', i * 80) + '><div class="result-card">' +
          '<span class="result-value">' + esc(r.value) + '</span><span class="result-label">' + esc(r.label) + '</span></div></div>';
      }).join('') + '</div></div></section>';
  };

  var GALLERY = [];
  /* Pick a grid that never leaves an empty cell next to the big first photo. */
  function galleryLayout(n) {
    var cls = n % 2 ? 'odd' : 'even';                                 // phones: 2 columns
    if (n >= 5 && n % 4 === 1) return cls + ' featured';              // 5, 9: big first tile + 4 columns
    return cls + (n % 3 === 0 || n < 4 ? ' cols-3' : ' cols-4');
  }
  S.gallery = function () {
    var list = (B.gallery || []).map(function (g) { return typeof g === 'string' ? { src: g } : g; }).filter(function (g) { return g.src; });
    if (!list.length) list = [1, 2, 3, 4].map(function (i) { return { src: PH + i + '.jpg' }; });
    GALLERY = list.map(function (g, i) {
      return { src: srcOf(g.src), caption: g.caption || '', alt: g.caption ? altText(g.caption) : altText('photo ' + (i + 1)), fallback: phImg(i) };
    });
    return '<section id="gallery" class="section gallery alt-bg"><div class="container">' + head('kick_gallery', 'galleryTitle') +
      '<div class="gallery-grid ' + galleryLayout(GALLERY.length) + '">' + GALLERY.map(function (g, i) {
        return '<button type="button" class="gallery-item" data-index="' + i + '" aria-label="Open photo ' + (i + 1) + ' of ' + GALLERY.length + '"' + aos('zoom-in', (i % 4) * 60) + '>' +
          img(g.src, g.alt, { fallback: g.fallback, w: 800, h: 600 }) + '<span class="gallery-zoom"><i class="bi bi-arrows-fullscreen" aria-hidden="true"></i></span></button>';
      }).join('') + '</div></div></section>';
  };

  S.testimonials = function () {
    var list = (B.testimonials || []).filter(function (x) { return x.text; });
    var summary = B.rating ? '<div class="rating-summary"' + aos() + '><div class="rating-big">' + esc(B.rating) + '</div>' + stars(B.rating) +
      '<p>' + (B.reviewCount ? tr('ratedBy', { r: B.rating, n: Number(B.reviewCount).toLocaleString('en-IN') }) : tr('ratingOnly', { r: B.rating })) + '</p>' +
      '<a href="' + esc(MAPS_LINK) + '" target="_blank" rel="noopener" class="link-arrow">' + tr('readReviews') + ' <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a></div>' : '';
    if (!list.length && !summary) return '';
    var slides = '';
    if (list.length) {
      slides = '<div id="reviewCarousel" class="carousel slide review-carousel" data-bs-ride="carousel" data-bs-interval="6000"' + aos() + '>' +
        '<div class="carousel-inner">' + list.map(function (r, i) {
          return '<div class="carousel-item' + (i ? '' : ' active') + '"><figure class="review-card">' +
            '<i class="bi bi-quote review-quote" aria-hidden="true"></i>' + stars(r.rating || 5) +
            '<blockquote><p>' + esc(r.text) + '</p></blockquote>' +
            '<figcaption><span class="review-avatar" aria-hidden="true">' + esc(initials(r.name || 'G')) + '</span>' + esc(r.name || 'Google user') + '</figcaption></figure></div>';
        }).join('') + '</div>' +
        (list.length > 1 ? '<button class="carousel-control-prev" type="button" data-bs-target="#reviewCarousel" data-bs-slide="prev" aria-label="Previous review"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>' +
          '<button class="carousel-control-next" type="button" data-bs-target="#reviewCarousel" data-bs-slide="next" aria-label="Next review"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>' +
          '<div class="carousel-indicators">' + list.map(function (r, i) {
            return '<button type="button" data-bs-target="#reviewCarousel" data-bs-slide-to="' + i + '"' + (i ? '' : ' class="active" aria-current="true"') + ' aria-label="Review ' + (i + 1) + '"></button>';
          }).join('') + '</div>' : '') + '</div>';
    }
    return '<section id="reviews" class="section reviews"><div class="container">' + head('kick_reviews', 'reviewsTitle') +
      slides + summary + '</div></section>';
  };

  S.cta = function () {
    var c = PRESET.cta;
    if (!c || !WA) return '';
    return '<section class="cta-band"><div class="container"><div class="cta-inner"' + aos('zoom-in') + '>' +
      '<div><h2>' + esc(c.title) + '</h2><p>' + esc(c.text) + '</p></div>' +
      '<div class="cta-actions">' + btn(ctaLink(c.button), 'bi-whatsapp', c.button, 'btn-light btn-lg') +
      (TEL ? btn(TEL, 'bi-telephone-fill', 'callNow', 'btn-outline-light btn-lg') : '') + '</div></div></div></section>';
  };

  S.hours = function () {
    if (!HOURS) return '';
    return '<section id="hours" class="section hours alt-bg"><div class="container">' + head('kick_hours', 'hoursTitle') +
      '<div class="row g-4 justify-content-center">' +
      '<div class="col-lg-7"' + aos('fade-right') + '><div class="hours-card"><table class="table hours-table mb-0"><caption class="visually-hidden">Weekly opening hours</caption><tbody>' +
      DAY_KEYS.map(function (d, i) {
        return '<tr data-day="' + i + '"><th scope="row">' + tr(d) + ' <span class="today-tag">' + tr('today') + '</span></th><td>' + fmtDayHtml(HOURS[i]) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="col-lg-5"' + aos('fade-left') + '><div class="status-card">' +
      '<i class="bi bi-clock-history status-icon" aria-hidden="true"></i>' +
      '<div class="status-badge status-lg js-open-status" role="status"></div>' +
      (B.address ? '<p class="status-address"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + esc(B.address) + '</p>' : '') +
      '<div class="d-grid gap-2">' + (TEL ? btn(TEL, 'bi-telephone-fill', 'callNow', 'btn-primary') : '') +
      btn(MAPS_LINK, 'bi-sign-turn-right', 'getDirections', 'btn-outline-primary') + '</div>' +
      '</div></div></div></div></section>';
  };

  S.faq = function () {
    var list = (B.faqs && B.faqs.length ? B.faqs : (PRESET.faqs || [])).filter(function (f) { return f.q && f.a; });
    if (!list.length) return '';
    return '<section id="faq" class="section faq"><div class="container">' + head('kick_faq', 'faqTitle') +
      '<div class="accordion faq-accordion" id="faqAcc"' + aos() + '>' + list.map(function (f, i) {
        return '<div class="accordion-item"><h3 class="accordion-header" id="fh' + i + '">' +
          '<button class="accordion-button' + (i ? ' collapsed' : '') + '" type="button" data-bs-toggle="collapse" data-bs-target="#fc' + i + '" aria-expanded="' + (i ? 'false' : 'true') + '" aria-controls="fc' + i + '">' + esc(fill(f.q, TOKENS)) + '</button></h3>' +
          '<div id="fc' + i + '" class="accordion-collapse collapse' + (i ? '' : ' show') + '" aria-labelledby="fh' + i + '" data-bs-parent="#faqAcc">' +
          '<div class="accordion-body">' + esc(fill(f.a, TOKENS)) + '</div></div></div>';
      }).join('') + '</div></div></section>';
  };

  S.contact = function () {
    var services = (B.services && B.services.length ? B.services : (CAT.defaultServices || [])).map(function (s) { return s.title; }).filter(Boolean);
    var rows = [];
    if (B.address) rows.push(['bi-geo-alt-fill', 'address', esc(B.address) + '<br><a href="' + esc(MAPS_LINK) + '" target="_blank" rel="noopener" class="link-arrow small">' + tr('viewOnMap') + ' <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>']);
    if (B.phone) rows.push(['bi-telephone-fill', 'phone', '<a href="' + esc(TEL) + '">' + esc(B.phone) + '</a>']);
    if (WA) rows.push(['bi-whatsapp', 'whatsapp', '<a href="' + esc(waLink(fill(CTA_MESSAGES.whatsappUs, TOKENS))) + '" target="_blank" rel="noopener">' + esc(fmtWa(WA)) + '</a>']);
    if (B.email) rows.push(['bi-envelope-fill', 'email', '<a href="mailto:' + esc(B.email) + '">' + esc(B.email) + '</a>']);
    var mapSrc = 'https://www.google.com/maps?q=' + encodeURIComponent(MAP_QUERY) + '&output=embed';
    return '<section id="contact" class="section contact"><div class="container">' + head('kick_contact', 'contactTitle') +
      '<div class="row g-4">' +
      '<div class="col-lg-5"' + aos('fade-right') + '><div class="contact-card"><ul class="contact-list">' +
      rows.map(function (r) {
        return '<li><span class="contact-icon"><i class="bi ' + r[0] + '" aria-hidden="true"></i></span><div><span class="contact-label">' + tr(r[1]) + '</span><div>' + r[2] + '</div></div></li>';
      }).join('') + '</ul>' +
      (HOURS ? '<div class="status-badge js-open-status mt-2" role="status"></div>' : '') + '</div></div>' +
      '<div class="col-lg-7"' + aos('fade-left') + '><form class="contact-form" id="enquiryForm" novalidate>' +
      '<h3 class="form-title">' + tr('formTitle') + '</h3>' +
      '<div class="row g-3">' +
      '<div class="col-sm-6"><label class="form-label" for="ef-name">' + tr('yourName') + '</label><input class="form-control" id="ef-name" name="name" autocomplete="name" required></div>' +
      '<div class="col-sm-6"><label class="form-label" for="ef-phone">' + tr('yourPhone') + '</label><input class="form-control" id="ef-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>' +
      (services.length ? '<div class="col-12"><label class="form-label" for="ef-service">' + tr('interestedIn') + '</label><select class="form-select" id="ef-service" name="service"><option value="" data-i18n="selectOption">' + esc(t('selectOption')) + '</option>' +
        services.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="col-12"><label class="form-label" for="ef-msg">' + tr('yourMessage') + '</label><textarea class="form-control" id="ef-msg" name="message" rows="3"></textarea></div>' +
      '<div class="col-12"><div class="form-error text-danger small d-none" role="alert">' + tr('formError') + '</div>' +
      '<button class="btn btn-whatsapp btn-lg w-100" type="submit"><i class="bi bi-whatsapp" aria-hidden="true"></i> ' + tr('sendWhatsapp') + '</button>' +
      '<p class="form-note">' + tr('formNote') + '</p></div>' +
      '</div></form></div></div>' +
      '<div class="map-wrap"' + aos() + '><iframe title="Map showing ' + esc(B.name) + '" src="' + esc(mapSrc) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>' +
      '</div></section>';
  };

  /* ---------------------------------------------------------------------
   * Page chrome: navbar, footer, floating buttons, lightbox
   * ------------------------------------------------------------------- */
  function navItems(rendered) {
    var map = [['about', 'nav_about'], ['services', CAT.services], ['gallery', 'nav_gallery'], ['reviews', 'nav_reviews'],
      ['hours', 'nav_hours'], ['faq', 'nav_faq'], ['contact', 'nav_contact']];
    return map.filter(function (m) { return rendered.indexOf(m[0]) > -1; });
  }
  function renderNav(items) {
    var langBtn = LANGS.indexOf('hi') > -1 && LANGS.length > 1
      ? '<button type="button" class="btn btn-lang js-lang" data-i18n-aria="langSwitchLabel" aria-label="' + esc(t('langSwitchLabel')) + '"><i class="bi bi-translate" aria-hidden="true"></i> ' + tr('langSwitch') + '</button>' : '';
    return '<nav class="navbar navbar-expand-lg site-nav" aria-label="Main navigation"><div class="container">' +
      '<a class="navbar-brand" href="#home">' + brandMark() + '</a>' +
      '<div class="d-flex align-items-center gap-2 order-lg-last">' +
      (TEL ? '<a class="btn btn-primary btn-call d-none d-sm-inline-flex" href="' + esc(TEL) + '"><i class="bi bi-telephone-fill" aria-hidden="true"></i> ' + tr('callNow') + '</a>' +
        '<a class="btn btn-primary btn-icon d-sm-none" href="' + esc(TEL) + '" aria-label="Call ' + esc(B.name) + '"><i class="bi bi-telephone-fill" aria-hidden="true"></i></a>' : '') +
      '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation"><i class="bi bi-list" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav ms-auto me-lg-3">' +
      items.map(function (m) { return '<li class="nav-item"><a class="nav-link" href="#' + m[0] + '">' + tr(m[1]) + '</a></li>'; }).join('') +
      '</ul>' + langBtn + '</div></div></nav>';
  }
  function renderFooter(items) {
    var social = [['instagram', 'bi-instagram', 'Instagram'], ['facebook', 'bi-facebook', 'Facebook'], ['youtube', 'bi-youtube', 'YouTube'],
      ['twitter', 'bi-twitter-x', 'X'], ['linkedin', 'bi-linkedin', 'LinkedIn']]
      .filter(function (s) { return B.social && B.social[s[0]]; });
    var devLink = DEV.portfolio ? '<a href="' + esc(DEV.portfolio) + '" target="_blank" rel="noopener">' + esc(DEV.name) + '</a>' : esc(DEV.name);
    return '<div class="container"><div class="row g-4">' +
      '<div class="col-lg-5"><a class="footer-brand" href="#home">' + brandMark() + '</a>' +
      '<p class="footer-tagline">' + esc(B.tagline || fill(PRESET.taglineDefault, TOKENS)) + '</p>' +
      (B.address ? '<p class="small"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + esc(B.address) + '</p>' : '') + '</div>' +
      '<div class="col-6 col-lg-3"><h3 class="footer-title">' + tr('quickLinks') + '</h3><ul class="footer-links">' +
      items.map(function (m) { return '<li><a href="#' + m[0] + '">' + tr(m[1]) + '</a></li>'; }).join('') + '</ul></div>' +
      '<div class="col-6 col-lg-4"><h3 class="footer-title">' + tr('contactTitle') + '</h3><ul class="footer-links">' +
      (B.phone ? '<li><a href="' + esc(TEL) + '"><i class="bi bi-telephone" aria-hidden="true"></i> ' + esc(B.phone) + '</a></li>' : '') +
      (B.email ? '<li><a href="mailto:' + esc(B.email) + '"><i class="bi bi-envelope" aria-hidden="true"></i> ' + esc(B.email) + '</a></li>' : '') +
      '</ul>' +
      (social.length ? '<h3 class="footer-title mt-3">' + tr('followUs') + '</h3><div class="social">' + social.map(function (s) {
        return '<a href="' + esc(B.social[s[0]]) + '" target="_blank" rel="noopener" aria-label="' + esc(B.name + ' on ' + s[2]) + '"><i class="bi ' + s[1] + '" aria-hidden="true"></i></a>';
      }).join('') + '</div>' : '') + '</div></div>' +
      '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(B.name) + '. ' + tr('rights') + '</span>' +
      '<span>' + tr('websiteBy') + ' ' + devLink + '</span></div></div>';
  }
  function renderFloating() {
    return (WA ? '<a class="fab fab-whatsapp" href="' + esc(waLink(fill(CTA_MESSAGES.whatsappUs, TOKENS))) + '" target="_blank" rel="noopener" aria-label="Chat with ' + esc(B.name) + ' on WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>' : '') +
      (TEL ? '<a class="fab fab-call d-md-none" href="' + esc(TEL) + '" aria-label="Call ' + esc(B.name) + '"><i class="bi bi-telephone-fill" aria-hidden="true"></i></a>' : '') +
      '<button type="button" class="fab fab-top" data-i18n-aria="backToTop" aria-label="' + esc(t('backToTop')) + '"><i class="bi bi-arrow-up" aria-hidden="true"></i></button>';
  }
  function renderLightbox() {
    return '<div class="modal fade lightbox" id="lightbox" tabindex="-1" aria-label="Photo viewer" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-xl"><div class="modal-content">' +
      '<button type="button" class="lb-close" data-bs-dismiss="modal" aria-label="Close"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="Previous photo"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>' +
      '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
      '<button type="button" class="lb-nav lb-next" aria-label="Next photo"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>' +
      '</div></div></div>';
  }

  /* ---------------------------------------------------------------------
   * Demo / pitch features (only when DEMO_MODE = true)
   * ------------------------------------------------------------------- */
  function devWaLink() {
    return DEV_WA ? 'https://wa.me/' + DEV_WA + '?text=' + encodeURIComponent('Hi, I saw the demo website for ' + B.name) : '';
  }
  function renderRibbon() {
    if (store('session', 'lbd-ribbon-closed') === '1') return '';
    var link = devWaLink();
    return '<div class="demo-ribbon" role="region" aria-label="Demo notice"><div class="container">' +
      '<i class="bi bi-stars" aria-hidden="true"></i><span>' + tr('ribbon', { name: B.name, dev: DEV.name }) + '</span>' +
      (link ? '<a class="btn btn-sm btn-ribbon" href="' + esc(link) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i> ' + tr('ribbonBtn') + '</a>' : '') +
      '<button type="button" class="ribbon-close" data-i18n-aria="dismiss" aria-label="' + esc(t('dismiss')) + '"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
      '</div></div>';
  }
  function themeOptions() {
    var keep = { headingFont: brandTheme.headingFont, bodyFont: brandTheme.bodyFont, buttonStyle: brandTheme.buttonStyle, borderRadius: brandTheme.borderRadius };
    return [{ name: t('brandColors'), i18n: 'brandColors', theme: brandTheme }].concat((PRESET.alternatives || []).slice(0, 2).map(function (a) {
      return { name: a.name, theme: $.extend({}, keep, a) };
    }));
  }
  function renderThemeSwitcher() {
    return '<div class="theme-switcher"><button type="button" class="ts-toggle" aria-expanded="false" aria-controls="tsMenu" data-i18n-aria="themeTitle" aria-label="' + esc(t('themeTitle')) + '"><i class="bi bi-palette" aria-hidden="true"></i></button>' +
      '<div class="ts-menu" id="tsMenu" hidden><p class="ts-title">' + tr('themeTitle') + '</p>' +
      themeOptions().map(function (o, i) {
        return '<button type="button" class="ts-option' + (i ? '' : ' active') + '" data-theme-index="' + i + '">' +
          '<span class="ts-swatch" style="background:linear-gradient(135deg,' + esc(normHex(o.theme.primary, PRESET.palette.primary)) + ' 50%,' + esc(normHex(o.theme.accent, PRESET.palette.accent)) + ' 50%)"></span>' +
          (o.i18n ? tr(o.i18n) : esc(o.name)) + '</button>';
      }).join('') + '</div></div>';
  }
  function renderPitch() {
    var link = devWaLink();
    return '<aside class="pitch-panel" aria-label="What you get"><button type="button" class="pitch-close" aria-label="Minimise"><i class="bi bi-dash-lg" aria-hidden="true"></i></button>' +
      '<h2 class="pitch-title"><i class="bi bi-gift" aria-hidden="true"></i> ' + tr('pitchTitle') + '</h2><ul class="pitch-list">' +
      [['bi-phone', 'pitch1'], ['bi-whatsapp', 'pitch2'], ['bi-lightning-charge', 'pitch3'], ['bi-globe2', 'pitch4'], ['bi-google', 'pitch5'], ['bi-search', 'pitch6']]
        .map(function (p) { return '<li><i class="bi ' + p[0] + '" aria-hidden="true"></i> ' + tr(p[1]) + '</li>'; }).join('') +
      '</ul>' + (link ? '<a class="btn btn-whatsapp w-100" href="' + esc(link) + '" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i> ' + tr('pitchCta') + '</a>' : '') +
      '</aside><button type="button" class="pitch-reopen" hidden aria-label="Show what you get"><i class="bi bi-gift" aria-hidden="true"></i></button>';
  }

  /* ---------------------------------------------------------------------
   * SEO: title, description, Open Graph, favicon, LocalBusiness JSON-LD
   * ------------------------------------------------------------------- */
  function setMeta(attr, key, val) {
    if (!val) return;
    var $m = $('meta[' + attr + '="' + key + '"]');
    if (!$m.length) $m = $('<meta>').attr(attr, key).appendTo('head');
    $m.attr('content', val);
  }
  function applySeo() {
    var title = B.name + ' | ' + CAT_TITLE + IN_CITY;
    var desc = (B.tagline || fill(PRESET.taglineDefault, TOKENS)) + '. ' + (B.address ? B.address + '. ' : '') + (B.phone ? 'Call ' + B.phone + '.' : '');
    desc = desc.replace(/\.\./g, '.').slice(0, 160);
    var page = /^https?:/.test(location.protocol) ? location.origin + location.pathname : '';
    var heroAbs = absUrl(srcOf(B.heroImage) || PH + 'hero.jpg');
    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', heroAbs);
    setMeta('property', 'og:url', page);
    setMeta('property', 'og:site_name', B.name);

    var icon = srcOf(B.logo) || 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + brandTheme.primary + '"/>' +
      '<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="28" fill="' + onColor(normHex(brandTheme.primary, '#333333')) + '">' + esc(initials(B.name)) + '</text></svg>');
    $('link[rel="icon"]').remove();
    $('<link rel="icon">').attr('href', icon).appendTo('head');

    var ld = {
      '@context': 'https://schema.org', '@type': CAT.schema || 'LocalBusiness', name: B.name,
      description: B.about || B.tagline || undefined, image: heroAbs, logo: B.logo ? absUrl(srcOf(B.logo)) : undefined,
      telephone: B.phone || undefined, email: B.email || undefined, url: page || undefined,
      foundingDate: B.established || undefined, founder: B.owner || undefined,
      address: B.address ? {
        '@type': 'PostalAddress', streetAddress: B.address, addressLocality: CITY,
        postalCode: (String(B.address).match(/\b\d{6}\b/) || [])[0], addressCountry: 'IN'
      } : undefined,
      hasMap: MAPS_LINK,
      aggregateRating: B.rating && B.reviewCount ? { '@type': 'AggregateRating', ratingValue: B.rating, reviewCount: B.reviewCount, bestRating: 5 } : undefined,
      sameAs: B.social ? Object.keys(B.social).map(function (k) { return B.social[k]; }).filter(Boolean) : undefined
    };
    if (HOURS) {
      ld.openingHoursSpecification = [];
      HOURS.forEach(function (d, i) {
        if (d.closed) return;
        var ranges = d.allDay ? [[0, 1439]] : d.ranges;
        ranges.forEach(function (r) {
          var hhmm = function (m) { m = m >= 1440 ? (m === 1440 ? 1439 : m - 1440) : m; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); };
          ld.openingHoursSpecification.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: SCHEMA_DAYS[i], opens: hhmm(r[0]), closes: hhmm(r[1]) });
        });
      });
    }
    $('#ld-business').remove();
    $('<script type="application/ld+json" id="ld-business">').text(JSON.stringify(ld)).appendTo('head');
  }

  /* ---------------------------------------------------------------------
   * Behaviour
   * ------------------------------------------------------------------- */
  function animateCounters() {
    var els = document.querySelectorAll('[data-count-to]');
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count-to')), dec = +el.getAttribute('data-dec'), suffix = el.getAttribute('data-suffix') || '';
      var start = null, dur = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1), v = to * (1 - Math.pow(1 - p, 3));
        el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { [].forEach.call(els, run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }

  function bindLightbox() {
    var $lb = $('#lightbox'), idx = 0;
    if (!$lb.length || !GALLERY.length) return;
    var modal = window.bootstrap ? window.bootstrap.Modal.getOrCreateInstance($lb[0]) : null;
    function show(i) {
      idx = (i + GALLERY.length) % GALLERY.length;
      var g = GALLERY[idx];
      $lb.find('.lb-img').attr({ src: g.src || g.fallback, alt: g.alt, 'data-fallback': g.fallback }).removeAttr('data-failed')
        .off('error').on('error', function () { window.LBD.imgError(this); });
      $lb.find('.lb-caption').text((g.caption ? g.caption + ' · ' : '') + (idx + 1) + ' / ' + GALLERY.length);
    }
    $(document).on('click', '.gallery-item', function () { show(+$(this).attr('data-index')); if (modal) modal.show(); });
    $lb.on('click', '.lb-prev', function () { show(idx - 1); }).on('click', '.lb-next', function () { show(idx + 1); });
    $(document).on('keydown', function (e) {
      if (!$lb.hasClass('show')) return;
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var x0 = null;
    $lb.on('touchstart', function (e) { x0 = e.originalEvent.touches[0].clientX; })
      .on('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.originalEvent.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      });
  }

  function bindForm() {
    $('#enquiryForm').on('submit', function (e) {
      e.preventDefault();
      var f = this, name = $.trim(f.name.value), phone = $.trim(f.phone.value);
      var ok = name && digits(phone).length >= 10;
      $(f).find('.form-error').toggleClass('d-none', !!ok);
      $(f.name).toggleClass('is-invalid', !name);
      $(f.phone).toggleClass('is-invalid', digits(phone).length < 10);
      if (!ok) return;
      var lines = ['Hi ' + B.name + ',', 'Name: ' + name, 'Phone: ' + phone];
      if (f.service && f.service.value) lines.push('Interested in: ' + f.service.value);
      if ($.trim(f.message.value)) lines.push('Message: ' + $.trim(f.message.value));
      lines.push('(Sent from your website)');
      var url = waLink(lines.join('\n'));
      // ('noopener' in the features string makes window.open return null, so detach manually)
      var w = window.open(url, '_blank');
      if (w) w.opener = null; else window.location.href = url;   // popup blocked: open in this tab
    });
  }

  function bindChrome() {
    var $nav = $('.site-nav'), $top = $('.fab-top');
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset;
      $nav.toggleClass('is-scrolled', y > 10);
      $top.toggleClass('is-visible', y > 600);
    };
    $(window).on('scroll', onScroll);
    onScroll();
    $top.on('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // close the mobile menu after picking a link
    $('#mainNav').on('click', 'a.nav-link', function () {
      var el = document.getElementById('mainNav');
      if (el.classList.contains('show') && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(el).hide();
    });

    // highlight the current section in the navbar
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $('.site-nav .nav-link').removeClass('active').removeAttr('aria-current')
            .filter('[href="#' + e.target.id + '"]').addClass('active').attr('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $('main > section[id]').each(function () { io.observe(this); });
    }

    $(document).on('click', '.js-lang', function () {
      lang = lang === 'hi' ? 'en' : 'hi';
      store('local', 'lbd-lang', lang);
      applyLang();
    });
  }

  function bindDemo() {
    $(document).on('click', '.ribbon-close', function () {
      $('.demo-ribbon').slideUp(200, function () { $(this).remove(); });
      store('session', 'lbd-ribbon-closed', '1');
    });

    var $ts = $('.theme-switcher'), opts = themeOptions();
    $ts.on('click', '.ts-toggle', function () {
      var $m = $ts.find('.ts-menu'), open = $m.prop('hidden');
      $m.prop('hidden', !open);
      $(this).attr('aria-expanded', String(open));
    });
    $ts.on('click', '.ts-option', function () {
      var i = +$(this).attr('data-theme-index');
      opts = themeOptions();
      applyTheme(opts[i].theme);
      $ts.find('.ts-option').removeClass('active');
      $(this).addClass('active');
      store('session', 'lbd-theme-index', String(i));
    });
    $(document).on('click', function (e) {
      if (!$(e.target).closest('.theme-switcher').length) {
        $ts.find('.ts-menu').prop('hidden', true);
        $ts.find('.ts-toggle').attr('aria-expanded', 'false');
      }
    });
    var saved = +store('session', 'lbd-theme-index');
    if (saved > 0 && opts[saved]) $ts.find('.ts-option[data-theme-index="' + saved + '"]').trigger('click');

    $(document).on('click', '.pitch-close', function () {
      $('.pitch-panel').attr('hidden', true);
      $('.pitch-reopen').prop('hidden', false);
    }).on('click', '.pitch-reopen', function () {
      $('.pitch-panel').removeAttr('hidden');
      $(this).prop('hidden', true);
    });
  }

  /* ---------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------- */
  function boot() {
    applyTheme(brandTheme);

    var order = (B.sections && B.sections.length ? B.sections : DEFAULT_ORDER).filter(function (k) { return S[k]; });
    var rendered = [], html = '';
    order.forEach(function (k) {
      var out = S[k]();
      if (out) { html += out; rendered.push(k === 'testimonials' ? 'reviews' : k); }
    });

    $('#main').html(html);
    $('#site-header').html(renderNav(navItems(rendered)));
    $('#site-footer').html(renderFooter(navItems(rendered)));
    $('#floating').html(renderFloating());
    $('body').append(renderLightbox());

    if (DEMO_MODE) {
      $('#demo-ribbon').html(renderRibbon());
      if (SHOW_THEME_SWITCHER) $('body').append(renderThemeSwitcher());
      if (/[?&]pitch=1\b/.test(location.search)) $('body').append(renderPitch()).addClass('has-pitch');
    } else {
      $('meta[name="robots"]').remove();
    }

    $('body').addClass('preset-' + PRESET_KEY + ' cat-' + CAT_KEY + ' btn-' + (brandTheme.buttonStyle || PRESET.buttonStyle));
    applySeo();
    applyLang();
    bindChrome();
    bindLightbox();
    bindForm();
    if (DEMO_MODE) bindDemo();
    animateCounters();
    setInterval(updateOpenStatus, 60000);

    if (USE_AOS) window.AOS.init({ once: true, duration: 650, offset: 40, easing: 'ease-out-cubic' });
    $('#boot-loader').remove();
    $('body').removeClass('is-loading');

    if (AUTO_THEME) {
      extractLogoTheme().then(function (c) {
        brandTheme = $.extend({}, brandTheme, { primary: c.primary, accent: c.accent || brandTheme.accent });
        if (!(+store('session', 'lbd-theme-index') > 0)) applyTheme(brandTheme);
        $('.ts-option[data-theme-index="0"] .ts-swatch').css('background', 'linear-gradient(135deg,' + brandTheme.primary + ' 50%,' + brandTheme.accent + ' 50%)');
        applySeo();
      }).catch(function (err) {
        console.info('[demo] theme "auto": using the ' + PRESET_KEY + ' preset (' + (err && err.message ? err.message : err) + ').');
      });
    }
  }

  $(boot);
})(jQuery, window, document);
