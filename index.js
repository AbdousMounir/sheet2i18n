var axios = require("axios");
var fs = require("fs");
var path = require("path");
var parseCSV = require("csv-parse/sync");
var { exportPath, tabsUrl, localesKey } = require("./config");

async function loadCsv() {
  console.log("IMPORTING LOCALES");
  axios.all(tabsUrl.map((urltab) => axios.get(urltab))).then(
    axios.spread((...responses) => {
      var columns = responses
        .map((response) => getParsedCSV(response.data))
        .flat(1);
      handleResponse(columns);
    })
  );
}

function getParsedCSV(file) {
  return parseCSV.parse(file, {
    columns: (header) => header.map((col) => col.split(" ")[0].toLowerCase()),
  });
}

function handleResponse(rows) {
  localesKey.forEach((localeKey) => {
    var content = writeTranslation(rows, localeKey);
    createJson(localeKey, `{\n${content}\n}\n`);
  });
}

function writeTranslation(rows, locale) {
  var fallback =
    localesKey[(localesKey.indexOf(locale) + 1) % localesKey.length];
  return rows
    .map(function (row) {
      var newstring = undefined;
      var key = row.key;
      if (key.length > 0) {
        while (key.indexOf(" ") !== -1) {
          key = key.replace(" ", "");
        }
        var newRow = row[locale];
        if (row[locale].length > 0) {
          while (newRow.indexOf('"') !== -1) {
            newRow = newRow.replace('"', "'");
          }
          while (key.indexOf(" ") !== -1) {
            key = key.replace(" ", "");
          }
          newstring = `  "${key}": "${newRow.replace(
            /(?:\r\n|\r|\n)/g,
            "<br>"
          )}"`;
        } else if (row[fallback].length > 0) {
          newstring = `  "${key}": "${row[fallback]}"`;
        }
      }
      return newstring;
    })
    .filter((row) => row !== undefined)
    .join(",\n");
}

function createJson(locale, string) {
  fs.writeFile(
    path.resolve(__dirname, `${exportPath}/${locale}.json`),
    string,
    (err) => {
      if (err) {
        throw err;
      }
      console.log(`JSON in ${locale} is saved.`);
    }
  );
}

loadCsv();
