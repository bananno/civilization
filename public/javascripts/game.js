
document.onkeypress = (e) => {
  if (e.key == 'Enter') {
    $('form#end-turn').submit();
  }
};

function setupActiveUnitSelection() {
  $('.unit.turn').toArray().forEach(unit => {
    let $unit = $(unit);
    let unitId = $unit.attr('unit-id');
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

function setActiveCity(id) {
  $('.active-city').hide();
  $('.active-city[city-id="' + id + '"]').show();
}

function setActiveUnit(id) {
  $('.unit').removeClass('active');
  $('.unit[unit-id="' + id + '"]').addClass('active');

  $('form.move-unit').hide();
  $('form.move-unit[unit-id="' + id + '"]').show();

  $('.active-unit').hide();
  $('.active-unit[unit-id="' + id + '"]').show();

  if (id && id.length && id != 'null') {
    mapCenter = units[id].location.concat();
  }

  centerMap();
}

function centerMap() {
  $('.map-row').hide();
  $('.map-cell').addClass('off-screen');

  let startRow = mapCenter[0] - rowRadius;
  if (startRow < 0) {
    startRow = 0;
  }
  let endRow = startRow + (2 * rowRadius);

  let startCol = mapCenter[1] - colRadius;
  let endCol = startCol + (2 * colRadius);

  for (let r = startRow; r <= endRow; r++) {
    $('.map-row').filter('[row="' + r + '"]').show();
    for (let c = startCol; c <= endCol; c++) {

      let selector = '.map-cell';

      if (c < 0) {
        selector += '.boardnum-0[column="' + (c + numCols) + '"]';
      } else if (c >= numCols) {
        selector += '.boardnum-2[column="' + (c - numCols) + '"]';
      } else {
        selector += '.boardnum-1[column="' + c + '"]';
      }

      $(selector).removeClass('off-screen');
    }
  }

  $('.map-cell').removeClass('center');
  $('.map-cell[row="' + mapCenter[0] + '"][column="' + mapCenter[1] + '"]').addClass('center');
}
