const axios = require("axios");
const data = require("./data.json");

let id = 0;
data.forEach((attrs, type) => {
  if (type === 0) return;
  attrs.forEach(async (value) => {
    id++;
    axios
      .post("https://bullishbears.io/api/attrs/", { id, type, value })
      .then((r) => console.log(r.data.message))
      .catch((e) => console.error(e.message));
  });
});
