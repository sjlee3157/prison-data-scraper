const csv = require('csvtojson');
const fs = require('fs');

async function writeToJSON() {
    let countryData = {};
    let countries = fs.readFileSync('countries-list.txt').toString().split('\n');

    for (let i = 0; i < countries.length; i++) {
        let countryObject = {};

        let csvFilePath = `./data/cleaned-data/${countries[i]}.csv`;
        let jsonArray = await csv().fromFile(csvFilePath);

        if (jsonArray[0]) {
            for (let j = 0; j < jsonArray.length; j++) {
                countryObject[jsonArray[j]["Year"]] = jsonArray[j]["Prison population rate"];
            }

            // console.log(countryObject);
            countryData[countries[i]] = countryObject;
        }
    }

    fs.writeFile('data/incarcerationRates.json', JSON.stringify(countryData), function (err) {
        if (err) throw err;
    });
}

writeToJSON();