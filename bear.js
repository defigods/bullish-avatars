const fs = require("fs");
const axios = require("axios");
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");

const data = require("./data.json");
const config = data[0];
const attrCounts = [];
const attrIds = [];

let id = 1;
data.forEach((attrs, type) => {
  if (type === 0) return;
  if (type === 2) {
    attrCounts.push(data[3].length);
    attrIds.push([]);
  }
  attrCounts.push(attrs.length);

  const ids = [];
  attrs.forEach((_) => ids.push(id++));
  attrIds.push(ids);
});

const raritiesStatus = new Array(config.rarities.length);
config.rarities.forEach((rarities, type) => {
  const status = {};
  if (type !== 1) Object.keys(rarities).forEach((key) => (status[key] = false));
  raritiesStatus[type] = status;
});

let totalCount = 1;
const usedIndexes = [];

const saveBase64ToFile = (base64, count) => {
  const data = base64.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFile(
    `./output/${count}.png`,
    data,
    { encoding: "base64" },
    (_) => {}
  );
};

const pickImage = (type, index) => {
  return index === 0
    ? ""
    : "./assets/" + config.directories[type] + "/" + index + ".png";
};

const checkValidation = (indexes) => {
  const result = [...indexes];

  // restrictions, body ^ background
  if (Object.keys(config.restrictions).includes("" + result[3])) {
    if (config.restrictions["" + result[3]].includes(result[0])) return null;
  }

  result.forEach((index, type) => {
    if (type === 1 || index === 0) return;

    if (raritiesStatus[type]["" + index]) result[type] = 0;
  });

  // head = body, if bodyMust showing
  if (config.bodyMustClothes.includes(result[2]) || result[2] === 0)
    result[1] = result[3];
  else result[1] = 0;

  if (
    result[0] === 0 || // background is a must
    result[2] === 0 || // clothes is a must
    result[3] === 0 || // head is a must
    result[5] === 0 || // eyes is a must
    result[7] === 0 // mouth is a must
  )
    return null;

  result.forEach((index, type) => {
    if (type === 1 || index === 0) return;
    if (Object.keys(raritiesStatus[type]).includes("" + index))
      raritiesStatus[type]["" + index] = true;
  });

  if (usedIndexes.includes(result.join(":"))) return null;

  config.rarities.forEach((rarities, type) => {
    Object.keys(rarities).forEach((key) => {
      if (totalCount % rarities[key] === 0) raritiesStatus[type][key] = false;
    });
  });
  return result;
};

const getIndexes = () => {
  const indexes = [...raritiesStatus].map((rarities, type) => {
    if (type === 1) return 0;

    let filtered = Object.values(rarities)
      .map((x, index) => ({ x, index }))
      .filter((x) => !x)
      .map(({ index }) => index + 1);
    if (filtered.length === 0) {
      const count = data[type < 1 ? type + 1 : type].length;
      filtered = [];
      for (let i = 0; i < count; i++) filtered.push(i + 1);
      filtered = filtered.filter((x) => !Object.keys(rarities).includes(x));
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  });
  return checkValidation(indexes);
};

const buildBear = () => {
  let indexes = null;
  while (indexes === null) {
    indexes = getIndexes();
  }
  const attrs = [];
  const params = indexes
    .map((index, type) => {
      if (index > 0 && type !== 1) attrs.push(attrIds[type][index - 1]);
      return pickImage(type, index);
    })
    .filter((x) => x !== "");

  const tokenId = totalCount++;
  // axios.post("http://localhost:5000/api/tokens/", {
  //   tokenId,
  //   name: "Bullish Bear " + tokenId,
  //   description: "They are bullish. Also, they pay dividends.",
  //   attrs,
  // });
  mergeImages(params, { Canvas, Image }).then((base64) =>
    saveBase64ToFile(base64, tokenId)
  );
  usedIndexes.push(indexes.join(":"));
};

const generate = async () => {
  while (totalCount <= config.target) {
    await buildBear();
  }
};

generate();
