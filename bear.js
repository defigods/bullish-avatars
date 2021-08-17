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

let totalCount = 1;

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

const buildBear = (indexes) => {
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
};

const generate = () => {
  const time = new Date().getTime();
  const text = fs.readFileSync("array.txt").toString("utf-8");
  text
    .split("\n")
    .filter((x) => x.length > 0)
    .forEach(
      async (indexes) =>
        await buildBear(indexes.split(":").map((x) => parseInt(x)))
    );
  console.log(new Date().getTime() - time);
};

generate();
