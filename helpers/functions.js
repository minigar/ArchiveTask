const fs = require("fs");

function checkStringInFile(filePath, searchString) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data.includes(searchString);
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  checkStringInFile,
};
