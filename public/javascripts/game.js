
document.onkeydown = (e) => {
  if (e.key == 'Enter') {
    $('form#end-turn').submit();
    return;
  }

  if (e.key.match('Arrow')) {
    if (e.key == 'ArrowUp') {
      mapCenter[0] -= 1;
    } else if (e.key == 'ArrowDown') {
      mapCenter[0] += 1;
    } else if (e.key == 'ArrowLeft') {
      mapCenter[1] -= 1;
    } else if (e.key == 'ArrowRight') {
      mapCenter[1] += 1;
    }

    centerMap();
  }
};

function setupActiveUnitSelection() {
  $('.unit.turn').toArray().forEach(unit => {
    let $unit = $(unit);
    let unitId = $unit.attr('unit-id');
    $unit.click(() => {
      setActiveUnit(unitId);
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

  $('.map-cell').mouseover(hoverMapCell);
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

  if (id && id.length && id != 'null') {
    mapCenter = cities[id].location.concat();
  }

  centerMap();
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
  if (mapCenter[0] < rowRadius) {
    mapCenter[0] = rowRadius;
  } else if (mapCenter[0] + rowRadius >= numRows) {
    mapCenter[0] = numRows - rowRadius - 1;
  }

  if (mapCenter[1] >= numCols) {
    mapCenter[1] -= numCols;
  } else if (mapCenter[1] < 0) {
    mapCenter[1] += numCols;
  }

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

function hoverMapCell(e) {
  let $mapCell = $(e.target);
  let row = parseInt($mapCell.attr('row'));
  let column = parseInt($mapCell.attr('column'));
  let tile = tiles[row][column];
  let food = tile.food;
  let gold = tile.gold;

  let values = ['Row: ' + row, 'Column: ' + column, 'Food: ' + food, 'Gold: ' + gold];

  $('.info.tile').html(values.join('<br>'));
}
