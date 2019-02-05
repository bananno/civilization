
function showPlayersList(show) {
  $('#players-box').toggle(show);
}

function setActiveUnit(id) {
  $('.unit').removeClass('active');
  $('.unit[unit-id="' + id + '"]').addClass('active');
  $('form.move-unit').hide();
  $('form.move-unit[unit-id="' + id + '"]').show();

  $('.infobox').hide();
  $('.infobox[unit-id="' + id + '"]').show();
}
