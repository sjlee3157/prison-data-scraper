const rp = require('request-promise');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

// Helper function to transpose a matrix
const transpose = (a) => {

  // Calculate the width and height of the matrix
  let cols = a.length || 0;
  let rows = a[0] instanceof Array ? a[0].length : 0;
  // In case it is a zero matrix, no transpose routine needed
  if(rows === 0 || cols === 0) { return []; }

  let i, j, matrix = [];

  // Loop through every item in the outer array (rows)
  for(i=0; i<rows; i++) {

    // Insert a new row (array)
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
const getData = (country) => {
  const baseURL = 'http://www.prisonstudies.org/country/';
  return rp(baseURL + country)
    .then((html) => {
      let $ = cheerio.load(html, {
        normalizeWhitespace: true,
        xmlMode: true
      });

      // Initialize the cheerio plugin(s)
      cheerioTableparser($);

      // Select main table (recent data)
      let mainHtmlTable = $('#views-aggregator-datatable').first();
      let mainTable = mainHtmlTable.parsetable(false, false, true);

      // Get header row from main table in case there is no hidden table
      let headerRow = [[]];
      for(let i = 0; i < mainTable.length; i++){
        headerRow[0].push(mainTable[i].shift());
      }

      // Select hidden table (older data)
      let hiddenHtmlTable = $('#further_info_past_trends').find('table')
      let hiddenTable = hiddenHtmlTable.parsetable(false, false, true);
        // Remove header row from hidden table and parse
      for(let i = 0; i < hiddenTable.length; i++){
        hiddenTable[i].shift();
        hiddenTable[i] = hiddenTable[i][0].split(' ');
      }

      // Stitch recent and older data into a single table
      // and return as an array of arrays
      let dataPartOne = transpose(hiddenTable);
      let dataPartTwo = transpose(mainTable)

        // TODO:
        // check if row is the same as previous before splicing together
        // e.g. if row is the same, then data.splice(data.length -1, 1, secondPartOfData);

      let fullData = headerRow.concat(dataPartOne).concat(dataPartTwo);
      return fullData;
    })
    .catch(() => {
      console.log(`\n............Bad request (check URL for "${country}")`)
    });
}

//////////////////////////////////////////////////////////////////
// Driver code: scrape and write the data to CSVs
//////////////////////////////////////////////////////////////////

//TODO:
// scrape, then load from external CSV
let countries = ['united-states-america', 'canada', 'benin', 'morocco',
                 'indonesia', 'iran', 'mongolia', 'laos', 'macau-china',
                 'denmark', 'belgium', 'france', 'united-kingdom-england-wales',
                 'germany', 'iceland', 'hungary', 'taiwan', 'philippines',
                 'not a real country'];

// Loop through countries list to visit and scrape each country's page
for(let i = 0; i < countries.length; i++) {
  getData(countries[i])
    .then((data) => {
      const csvWriter = createCsvWriter({
        path: `./data/${countries[i]}.csv`
      });
      csvWriter.writeRecords(data)
        .then(() => {
          console.log(countries[i], '...Done');
        })
    })
    .catch(() =>
    console.log('............(Error: no data)\n'));
}
