
function setupActiveUnitSelection() {
  $('.unit.turn').toArray().forEach(unit => {
    let $unit = $(unit);
    $unit.click(() => {
      setActiveUnit($unit.attr('unit-id'));
    });
  });

  $('.active-unit .close').click(() => {
    setActiveUnit(null);
  });
}

function showPlayersList(show) {
  $('#players-box').toggle(show);
}

function setActiveUnit(id) {
  $('.unit').removeClass('active');
  $('.unit[unit-id="' + id + '"]').addClass('active');

  $('form.move-unit').hide();
  $('form.move-unit[unit-id="' + id + '"]').show();

  $('.active-unit').hide();
  $('.active-unit[unit-id="' + id + '"]').show();
}
