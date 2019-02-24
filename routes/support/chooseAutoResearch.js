
function chooseAutoResearch(data) {
  const availableTechs = data.technologyList.filter(tech => tech.isAvailable);

  if (availableTechs.length == 0) {
    return null;
  }

  return availableTechs[0].index;
}

module.exports = chooseAutoResearch;
