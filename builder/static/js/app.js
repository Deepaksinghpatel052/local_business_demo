/* Small site-wide behaviour (jQuery). */
$(function () {
  'use strict';

  // "Create" modal: open automatically when the dashboard was reached through "Use this design"
  var $create = $('#createModal');
  if ($create.length && $create.data('autoOpen')) {
    bootstrap.Modal.getOrCreateInstance($create[0]).show();
  }
  // Any button with data-template opens the create modal with that design picked
  $(document).on('click', '[data-create-template]', function (e) {
    if (!$create.length) return;
    e.preventDefault();
    $create.find('[name=template]').val($(this).data('createTemplate'));
    $create.find('[name=category]').val($(this).data('category'));
    $create.find('.js-template-name').text($(this).data('templateName') || '');
    bootstrap.Modal.getOrCreateInstance($create[0]).show();
  });
  $create.on('shown.bs.modal', function () { $create.find('[name=business_name]').trigger('focus'); });

  // Password forms: tell people right away whether the two new passwords match
  $('[data-pw-form]').each(function () {
    var $f = $(this), $p1 = $f.find('[name=password1]'), $p2 = $f.find('[name=password2]');
    if (!$p1.length || !$p2.length) return;
    var $hint = $('<div class="pw-match" aria-live="polite"></div>').insertAfter($p2);
    function check() {
      var a = $p1.val(), b = $p2.val();
      if (!b) { $hint.text('').removeClass('ok no'); return; }
      var same = a === b;
      $hint.toggleClass('ok', same).toggleClass('no', !same)
        .html(same ? '<i class="bi bi-check-circle-fill"></i> Passwords match' : '<i class="bi bi-x-circle-fill"></i> Passwords do not match');
    }
    $p1.add($p2).on('input', function () {
      $(this).removeClass('is-invalid').siblings('.invalid-feedback').remove();   // old server error: the live hint takes over
      check();
    });
    $f.on('submit', function (e) {
      if ($p2.val() && $p1.val() !== $p2.val()) { e.preventDefault(); check(); $p2.trigger('focus'); }
    });
  });

  // Confirm dangerous actions
  $(document).on('submit', 'form[data-confirm]', function (e) {
    if (!window.confirm($(this).data('confirm'))) e.preventDefault();
  });

  // Copy-to-clipboard buttons
  $(document).on('click', '[data-copy]', function () {
    var $btn = $(this), text = $($btn.data('copy')).text();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        var old = $btn.text();
        $btn.text('Copied');
        setTimeout(function () { $btn.text(old); }, 1500);
      });
    }
  });

  // Highlight a project card (e.g. ?renew=12 from a reminder link)
  var m = /[?&](?:renew|new)=(\d+)/.exec(location.search);
  if (m) {
    var $card = $('#project-' + m[1]);
    if ($card.length) {
      $card.addClass('is-highlight');
      $('html, body').animate({ scrollTop: $card.offset().top - 90 }, 300);
    }
  }

  // Feedback while something is being sent: spinner on the clicked button, a progress bar at the top
  // and no double submits. Runs after the other submit handlers, so a cancelled submit is left alone.
  // <form data-no-loading> opts out; <form data-loading-reset="4000"> re-enables (downloads stay on the page);
  // <button data-loading-text="Saving..."> sets the busy label.
  var $bar = $('<div class="page-progress" aria-hidden="true"></div>').appendTo('body');
  function unbusy($forms) {
    $forms.removeData('busy').removeAttr('aria-busy').find('.is-loading').each(function () {
      var $b = $(this);
      $b.removeClass('is-loading').css('min-width', '').html($b.data('label'));
    });
    $bar.removeClass('is-on');
    $('.page-busy').remove();
  }
  $(document).on('submit', 'form', function (e) {
    var $f = $(this);
    if (e.isDefaultPrevented() || $f.is('[target=_blank], [data-no-loading]')) return;
    if ($f.data('busy')) { e.preventDefault(); return; }
    $f.data('busy', true).attr('aria-busy', 'true');
    var btn = (e.originalEvent && e.originalEvent.submitter) || $f.find('[type=submit]')[0];
    if (btn && btn.tagName === 'BUTTON') {
      var $b = $(btn), text = $b.data('loadingText') || 'Please wait...';
      $b.data('label', $b.html()).css('min-width', $b.outerWidth()).addClass('is-loading')
        .html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ').append(document.createTextNode(text));
    }
    $bar.addClass('is-on');
    var reset = parseInt($f.data('loadingReset'), 10);
    if (reset) setTimeout(function () { unbusy($f); }, reset);
  });
  // back button (page restored from cache): buttons work again
  $(window).on('pageshow', function (e) { if (e.originalEvent.persisted) unbusy($('form')); });

  // Full-screen "please wait" for work started from script (e.g. confirming a payment)
  window.LBD = window.LBD || {};
  window.LBD.busy = function (text) {
    $('.page-busy').remove();
    $('<div class="page-busy" role="status" aria-live="polite"><div><span class="spinner-border" aria-hidden="true"></span><p></p></div></div>')
      .find('p').text(text || 'Please wait...').end().appendTo('body');
    $bar.addClass('is-on');
  };
});
