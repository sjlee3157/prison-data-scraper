const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

// TODO:
// write tests

//////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////

// Helper function to transpose a matrix (i.e. rows <--> cols)
const transpose = (a) => {
  // Calculate the width and height of the matrix
  let cols = a.length || 0;
  let rows = a[0] instanceof Array ? a[0].length : 0;
  if(rows === 0 || cols === 0) { return []; }

  let i, j, matrix = [];

  // Loop through every item in the outer array (rows)
  for(i=0; i<rows; i++) {
    // Insert a new row
    matrix[i] = [];
    // Loop through every item per item in outer array (cols)
    for(j=0; j<cols; j++) {
      // Save transposed matrix
      matrix[i][j] = a[j][i];
    }
  }
  return matrix;
}

// Helper function to parse HTML and return array of data
const getData = async (country) => {
  try {
    const html = await rp(`http://www.prisonstudies.org/country/${country}`);
    let $ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: true
    });
    // Initialize the cheerio plugin(s)
    cheerioTableparser($);
    // Select main table (recent data)
    let mainHtmlTable = $('#views-aggregator-datatable').first();
    let mainTable = mainHtmlTable.parsetable(false, false, true);

    // Delete everything that's not a number
    let regex = /[^0-9]/g;
    for (let j = 0; j < mainTable.length; j++) {
      for (let k = 1; k < mainTable[j].length; k++) {
        mainTable[j][k] = mainTable[j][k].replace(regex, '');
      }
    }

    // Get header row from main table in case there is no hidden table
    let headerRow = [[]];
    for (let i = 0; i < mainTable.length; i++) {
      headerRow[0].push(mainTable[i].shift());
    }

    // Select hidden table (older data)
    let hiddenHtmlTable = $('#further_info_past_trends').find('table');
    let hiddenTable = hiddenHtmlTable.parsetable(false, false, true);

    let newRegex = /[a-zA-Z]|\.|,/g;

    // Remove header row from hidden table and parse
    for (let j = 0; j < hiddenTable.length; j++) {
      hiddenTable[j].shift();
      // Delete everything that's not a number
      hiddenTable[j][0] = hiddenTable[j][0].replace(newRegex, '').replace('  ', ' ');
      hiddenTable[j] = hiddenTable[j][0].split(' ');
    }
    // Stitch recent and older data into a single table
    // and return as an array of arrays
    let dataPartOne = transpose(hiddenTable);
    let dataPartTwo = transpose(mainTable);

    // check if row is the same as previous before splicing together
    if (dataPartOne[0] && dataPartTwo[0]) { 
      let tailYear = dataPartOne[dataPartOne.length - 1][0];
      let headYear = dataPartTwo[0][0];    
      if (tailYear == headYear) {
        dataPartOne.pop();
      }
    }

    // splice
    let fullData = headerRow.concat(dataPartOne).concat(dataPartTwo);
    return fullData;
  }
  catch (e) {
    console.log(e);
    console.log(`\n............Bad request (check URL for "${country}")`);
  }
}

//////////////////////////////////////////////////////////////////
// Driver code: scrape and write the data to CSVs
//////////////////////////////////////////////////////////////////

//TODO:
// scrape, then load from external CSV
// let countries = ['united-states-america', 'canada', 'benin', 'morocco',
//                  'indonesia', 'iran', 'mongolia', 'laos', 'macau-china',
//                  'denmark', 'belgium', 'france', 'united-kingdom-england-wales',
//                  'germany', 'iceland', 'hungary', 'taiwan', 'philippines',
//                  'some bogus url'];

// let countries = ['antigua-and-barbuda'];

let countries = fs.readFileSync('countries-list.txt').toString().split('\n');
for(let country in countries) {
  console.log(countries[country]);
}
console.log(`Successfully read ${countries.length} country URLs. \n`)

// Loop through countries list to visit and scrape each country's page
let successCounter = (function() {
  let successes = 0;
  function addOne() {
    successes += 1;
  }
  return {
    increment: function() {
      addOne();
    },
    value: function() {
      return successes;
    }
  };
})();

let failureCounter = (function () {
  let failures = 0;

  function addOne() {
    failures += 1;
  }
  return {
    increment: function () {
      addOne();
    },
    value: function () {
      return failures;
    }
  };
})();

for (let i = 0; i < countries.length; i++) {
  getData(countries[i])
    .then((data) => {
      const csvWriter = createCsvWriter({
        path: `./data/raw-data/${countries[i]}.csv`
      });
      csvWriter.writeRecords(data)
        .then(() => {
          successCounter.increment();
          console.log(countries[i], '...Done');
          if (i == countries.length - 1) {
            console.log(`\nSuccessfully wrote ${successCounter.value()} files`);
            console.log(`Failed to write ${failureCounter.value()} files`);
          }
        })
    })
    .catch((e) => {
      console.log(e);
      failureCounter.increment();
      console.log('............(Error: no data)\n');
      if (i == countries.length - 1) {
        console.log(`\nSuccessfully wrote ${successCounter.value()} files`);
        console.log(`Failed to write ${failureCounter.value()} files`);
      }
    });
}

//TODO: the final console.log isn't printing synchronously
