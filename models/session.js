module.exports = {
  clearCurrentGameId,
  getCurrentGameId,
  setCurrentGameId,
};

async function clearCurrentGameId(req) {
  if (req.session) {
    await req.session.destroy(); // is this really async?
  }
}

function getCurrentGameId(req) {
  return req.session ? req.session.gameId : undefined;
}

function setCurrentGameId(req, gameId) {
  if (!req.session) {
    req.session = {};
  }
  req.session.gameId = gameId;
}
