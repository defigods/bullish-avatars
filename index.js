const fs = require("fs");

const data = require("./data.json");
const config = data[0];

const raritiesStatus = new Array(config.rarities.length);
config.rarities.forEach((rarities, type) => {
  raritiesStatus[type] = [...rarities];
});

let totalCount = 1;
const usedIndexes = [];

const checkValidation = (indexes) => {
  const result = [...indexes];

  // restrictions, body ^ background
  if (Object.keys(config.restrictions).includes("" + result[3])) {
    if (config.restrictions["" + result[3]].includes(result[0])) {
      console.log("cant");
      return null;
    }
  }

  // head = body, if bodyMust showing
  if (config.bodyMustClothes.includes(result[2]) || result[2] === 0)
    result[1] = result[3];
  else result[1] = 0;

  if (usedIndexes.includes(result.join(":"))) return null;

  result.forEach((index, type) => {
    if (type === 1 || index === 0) return;
    raritiesStatus[type][index - 1]--;
  });
  return result;
};

const getIndexes = () => {
  const bodyIndexes = Object.keys(config.restrictions).map((x) => parseInt(x));
  const indexes = new Array(raritiesStatus.length).fill(0);
  let restricted = false;
  for (let type = raritiesStatus.length - 1; type >= 0; type--) {
    if (type == 1) continue;

    if (type === 3) {
      let j = 0;
      for (; j < bodyIndexes.length; j++) {
        if (raritiesStatus[type][bodyIndexes[j] - 1] > 0) break;
      }
      if (j < bodyIndexes.length) {
        indexes[type] = bodyIndexes[j];
        restricted = true;
        continue;
      }
    }

    if (type === 0 && restricted) {
      const available = [1, 2, 3, 4, 5, 6]
        .filter((x) => !config.restrictions["" + indexes[3]].includes(x))
        .filter((x) => raritiesStatus[type][x - 1] > 0);
      indexes[type] = available[Math.floor(Math.random() * available.length)];
      break;
    }

    let i,
      spot = Math.floor(Math.random() * (config.target - totalCount + 1));
    for (i = 0; i < raritiesStatus[type].length; i++) {
      spot -= raritiesStatus[type][i];
      if (spot < 0) break;
    }
    indexes[type] = i + 1;
  }
  return checkValidation(indexes);
};

const generateIndex = () => {
  let indexes = null;
  while (indexes === null) {
    indexes = getIndexes();
  }
  totalCount++;
  usedIndexes.push(indexes.join(":"));
};

const generate = async () => {
  while (totalCount <= config.target) {
    await generateIndex();
  }

  const indexesToSave = [];
  while (usedIndexes.length > 0) {
    const index = Math.floor(Math.random() * usedIndexes.length);
    const indexes = usedIndexes[index].split(":");
    if (indexes[4] === "20") indexes[4] = "0";
    if (indexes[6] === "8") indexes[6] = "0";
    indexesToSave.push(indexes.join(":"));
    usedIndexes.splice(index, 1);
  }

  const file = fs.createWriteStream("array.txt");
  indexesToSave.forEach((str) => file.write(str + "\n"));
  file.end();
};

generate();
