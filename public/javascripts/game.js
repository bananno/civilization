
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

  $('.map-city.turn').toArray().forEach(city => {
    let $city = $(city);
    let cityId = $city.attr('city-id');
    $city.click(() => {
      setActiveCity(cityId);
    });
  });

  $('.info.city .close').click(deactivateAll);
  $('.info.unit .close').click(deactivateAll);
}

function deactivateAll() {
  $('.map-city').removeClass('active');
  $('.unit').removeClass('active');

  $('.info.city').hide();
  $('.info.unit').hide();

  $('form.move-unit').hide();
}

function setActiveCity(id) {
  deactivateAll();

  $('.info.city[city-id="' + id + '"]').show();
  $('.map-city[city-id="' + id + '"]').addClass('active');
}

function setActiveUnit(id) {
  deactivateAll();

  $('.unit[unit-id="' + id + '"]').addClass('active');
  $('form.move-unit[unit-id="' + id + '"]').show();
  $('.info.unit[unit-id="' + id + '"]').show();

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
