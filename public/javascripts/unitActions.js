
// Fetch info about the given unit's status and available actions.
// Build the html for the action buttons in the info box.
async function loadUnitActionButtons(unitId) {
  const unitStatusInfo = await makeRequest('get', `/unit/${unitId}/status`);

  const $infoBoxButtonArea = $(`.view-unit.info-box[unit-id="${unitId}"] .action-buttons`);
  $infoBoxButtonArea.html('');

  addButtons([
    {
      isDisabled: !unitStatusInfo.orders && !unitStatusInfo.automate,
      onClick: orderUnitCancelOrders,
      text: 'cancel orders',
    },
    {
      isDisabled: unitStatusInfo.orders === 'sleep',
      onClick: orderUnitSleep,
      text: 'sleep',
    },
    {
      isDisabled: unitStatusInfo.movesRemaining === 0 || unitStatusInfo.orders === 'skip turn',
      onClick: orderUnitSkipTurn,
      text: 'skip turn',
    },
    {
      isDisabled: unitStatusInfo.movesRemaining === 0,
      onClick: deleteUnit,
      text: 'delete unit',
    },
  ]);

  if (unitStatusInfo.templateName === 'settler') {
    $infoBoxButtonArea.append('<hr>');
    addButton({
      isDisabled: unitStatusInfo.movesRemaining === 0 || !unitStatusInfo.canFoundCity,
      onClick: orderUnitFoundCity,
      text: 'found city',
    });
  } else if (unitStatusInfo.templateName === 'worker') {
    $infoBoxButtonArea.append('<hr>');
    addButtons([
      {
        isDisabled: unitStatusInfo.automate,
        onClick: orderUnitAction,
        pathName: 'automate',
        text: 'automate',
      },
      {
        isDisabled: !unitStatusInfo.canBuildFarm,
        onClick: orderUnitAction,
        pathName: 'buildFarm',
        text: 'build farm',
      },
      {
        isDisabled: !unitStatusInfo.canBuildMine,
        onClick: orderUnitAction,
        pathName: 'buildMine',
        text: 'build mine',
      },
      {
        isDisabled: !unitStatusInfo.canBuildRoad,
        onClick: orderUnitAction,
        pathName: 'buildRoad',
        text: 'build road',
      },
      {
        isDisabled: !unitStatusInfo.canRemoveImprovement,
        onClick: orderUnitAction,
        pathName: 'removeImprovement',
        text: 'remove improvement',
      },
    ]);
  }

  function addButtons(actions) {
    actions.forEach(addButton);
  }

  function addButton(action) {
    const $button = $(action.isDisabled ? '<button disabled="disabled">' : '<button>')
      .addClass(action.class)
      .click(() => action.onClick(unitStatusInfo, action))
      .text(action.text);

    $infoBoxButtonArea.append($button);
  }
}

function deleteUnit(unit) {
  if (confirm('Delete this unit?')) {
    makeRequest('delete', `/unit/${unit.id}`, onSuccess);
  }

  function onSuccess() {
    deactivateAll();
    $(`[unit-id="${unit.id}"]`).remove();
    toggleNextAction();
    removeClickableClassIfTileIsEmpty(unit.location[0], unit.location[1], {ignoreId: unit.id});
  }
}

function orderUnitAction(unit, action) {
  makeRequest('post', `/unit/${unit.id}/orders/${action.pathName}`, onSuccess);

  function onSuccess() {
    updateUnitInfo({
      unitId: unit.id,
      showDoneInUnitRoster: true,
      closeAndGoToNextAction: true,
      rosterBoxOrderDescription: action.text,
    });
  }
}

function orderUnitCancelOrders(unit) {
  makeRequest('post', `/unit/${unit.id}/orders/cancel`, onSuccess);

  function onSuccess() {
    updateUnitInfo({
      unitId: unit.id,
      showDoneInUnitRoster: unit.movesRemaining === 0,
      closeAndGoToNextAction: false,
      rosterBoxOrderDescription: '',
    });
  }
}

function orderUnitFoundCity(unit) {
  makeRequest('post', `/foundCity/${unit.id}`, refreshThePage);
}

function orderUnitSkipTurn(unit) {
  makeRequest('post', `/unit/${unit.id}/orders/skip`, onSuccess);

  function onSuccess() {
    updateUnitInfo({
      unitId: unit.id,
      showDoneInUnitRoster: true,
      closeAndGoToNextAction: true,
      rosterBoxOrderDescription: 'skip turn',
    });
  }
}

function orderUnitSleep(unit) {
  makeRequest('post', `/unit/${unit.id}/orders/sleep`, onSuccess);

  function onSuccess() {
    updateUnitInfo({
      unitId: unit.id,
      showDoneInUnitRoster: true,
      closeAndGoToNextAction: true,
      rosterBoxOrderDescription: 'sleep',
    });
  }
}

function updateUnitInfo({unitId, ...options}) {
  const $rosterBox = $(`.unit-roster[unit-id="${unitId}"]`);
  $rosterBox.find('.show-current-orders').text(options.rosterBoxOrderDescription);

  const $infoBox = $(`.view-unit.info-box[unit-id="${unitId}"]`);

  if (options.showDoneInUnitRoster) {
    $rosterBox.addClass('done');
    $rosterBox.find('.show-needs-orders').hide();
  } else {
    $rosterBox.removeClass('done');
    $rosterBox.find('.show-needs-orders').show();
  }

  if (options.closeAndGoToNextAction) {
    $infoBox.hide();
    hideUnitMovementArrows();
    toggleNextAction();
  }

  loadUnitActionButtons(unitId);
}
