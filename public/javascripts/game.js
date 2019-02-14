
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

    return centerMap();
  }

  if (e.key == 'Escape') {
    return deactivateAll();
  }
};

function setup() {
  $('.view-city .close').click(deactivateAll);
  $('.view-unit .close').click(deactivateAll);

  $('.menu-link').toArray().forEach(element => {
    let $link = $(element);
    let item = $link.attr('item');
    $link.click(() => {
      if ($link.hasClass('active')) {
        $link.removeClass('active');
        $('.menu').hide();
      } else {
        $('.menu-link').removeClass('active');
        $link.addClass('active');
        $('.menu').hide();
        $('.menu.menu-' + item).show();
      }
    });
  });

  $('.unit-roster').toArray().forEach(element => {
    let unitId = $(element).attr('unit-id');
    $(element).click(() => {
      setActiveUnit(unitId, true);
    });
  });
}

function deactivateAll() {
  $('.map-cell').removeClass('active');
  $('.menu-link').removeClass('active');

  $('.view-city').hide();
  $('.view-unit').hide();
  $('form.move-unit').hide();
  $('form.work-tile').hide();
  $('.menu').hide();

  activeUnitOrCityId = null;
}

function setActiveCity(id) {
  deactivateAll();

  activeUnitOrCityId = id;

  $('form.work-tile[city-id="' + id + '"]').show();
  $('.view-city[city-id="' + id + '"]').show();

  if (id && id.length && id != 'null') {
    mapCenter = cities[id].location.concat();
    setActiveMapCell(cities[id].location[0], cities[id].location[1]);
  }

  centerMap();
}

function setActiveUnit(id, showMenu) {
  deactivateAll();

  if (showMenu) {
    $('.menu.menu-units').show();
  }

  activeUnitOrCityId = id;

  $('form.move-unit[unit-id="' + id + '"]').show();
  $('.view-unit[unit-id="' + id + '"]').show();

  if (id && id.length && id != 'null') {
    mapCenter = units[id].location.concat();
    setActiveMapCell(units[id].location[0], units[id].location[1]);
  }

  centerMap();
}

function setActiveMapCell(row, column) {
  $('.map-cell[row="' + row + '"][column="' + column + '"]').addClass('active');
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

function clickMapCell(row, column) {
  let tile = tiles[parseInt(row)][parseInt(column)];

  if (tile.unitsCities) {
    let selectedIndex = tile.unitsCities.indexOf(activeUnitOrCityId);
    if (selectedIndex >= 0 && selectedIndex < tile.unitsCities.length - 1) {
      activeUnitOrCityId = tile.unitsCities[selectedIndex + 1];
    } else {
      activeUnitOrCityId = tile.unitsCities[0];
    }
  }

  if (activeUnitOrCityId) {
    if (units[activeUnitOrCityId]) {
      setActiveUnit(activeUnitOrCityId);
    } else {
      setActiveCity(activeUnitOrCityId);
    }
  }
}

function hoverMapCell(row, column) {
  let tile = tiles[parseInt(row)][parseInt(column)];
  if (!tile.discovered) {
    $('#tile-details').hide();
    return;
  }
  $('#tile-details').show();
  let values = ['[' + row + ', ' + column + ']'];
  values.push(tile.features);
  tile.food ? values.push('food: ' + tile.food) : null;
  tile.gold ? values.push('gold: ' + tile.gold) : null;
  tile.labor ? values.push('labor: ' + tile.labor) : null;
  $('#tile-details').html(values.join('<br>'));
}
