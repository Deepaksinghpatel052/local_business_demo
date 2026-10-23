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
});
