const axios = require("axios");
const data = require("./data.json");

let id = 0;
data.forEach((attrs, type) => {
  if (type === 0) return;
  attrs.forEach((value) => {
    id++;
    axios.post("http://localhost:5000/api/attrs/", { id, type, value });
  });
});
