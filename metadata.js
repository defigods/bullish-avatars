const fs = require("fs");
const axios = require("axios");
const data = require("./data.json");

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

const buildBear = (indexes, tokenId) => {
  const attrs = [];
  indexes.forEach((index, type) => {
    if (index > 0 && type !== 1) attrs.push(attrIds[type][index - 1]);
  });

  axios
    .post("https://bullishbears.io/api/tokens/", {
      tokenId,
      name: "Bullish Bear " + tokenId,
      description: "They are bullish. Also, they pay dividends.",
      attrs,
    })
    .catch(() => {});
};

const generate = () => {
  let text = fs.readFileSync("14").toString("utf-8");
  const saved = text
    .split("\n")
    .filter((x) => x.length > 0)
    .map((x) => parseInt(x));
  text = fs.readFileSync("array.txt").toString("utf-8");
  Promise.all(
    text
      .split("\n")
      .filter((x) => x.length > 0)
      .map((x, index) => ({ x: x.split(":").map((y) => parseInt(y)), index }))
      .filter(({ index }) => !saved.includes(index))
      .map(({ x, index }) => buildBear(x, index))
  );
};

generate();
