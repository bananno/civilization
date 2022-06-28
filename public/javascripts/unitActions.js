
function deleteUnit(unitId, row, col) {
  if (confirm('Delete this unit?')) {
    makeRequest('delete', `/unit/${unitId}`, onSuccess);
  }

  function onSuccess() {
    deactivateAll();
    $(`[unit-id="${unitId}"]`).remove();
    toggleNextAction();
    removeClickableClassIfTileIsEmpty(row, col, {ignoreId: unitId});
  }
}

function orderUnitSkipTurn(unitId, row, col) {
  makeRequest('post', `/unit/${unitId}/orders/skip`, onSuccess);

  function onSuccess() {
    const $rosterBox = $(`.unit-roster[unit-id="${unitId}"]`);
    $rosterBox.addClass('done');
    $rosterBox.find('.show-current-orders').text('skip turn');
    $rosterBox.find('.show-needs-orders').remove();

    const $infoBox = $(`.view-unit.info-box[unit-id="${unitId}"]`);
    $infoBox.find('.show-current-orders').text('skip turn');
    $infoBox.find('.unit-action-button-skip').attr('disabled', 'disabled');
    $infoBox.hide();

    hideUnitMovementArrows();
    toggleNextAction();
  }
}

function orderUnitSleep(unitId, row, col) {
  makeRequest('post', `/unit/${unitId}/orders/sleep`, onSuccess);

  function onSuccess() {
    const $rosterBox = $(`.unit-roster[unit-id="${unitId}"]`);
    $rosterBox.addClass('done');
    $rosterBox.find('.show-current-orders').text('sleep');
    $rosterBox.find('.show-needs-orders').remove();

    const $infoBox = $(`.view-unit.info-box[unit-id="${unitId}"]`);
    $infoBox.find('.show-current-orders').text('sleep');
    $infoBox.find('.unit-action-button-sleep').attr('disabled', 'disabled');
    $infoBox.hide();

    hideUnitMovementArrows();
    toggleNextAction();
  }
}
