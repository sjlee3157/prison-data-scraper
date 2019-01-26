const csv = require('csvtojson');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

async function writeToJSON() {
    let incarcerationRates = {};
    let countries = fs.readFileSync('countries-list.txt').toString().split('\n');

    for (let i = 0; i < countries.length; i++) {
        let countryObject = {};

        let csvFilePath = `./data/cleaned-data/${countries[i]}.csv`;
        let jsonArray = await csv().fromFile(csvFilePath);

        if (jsonArray[0]) {
            for (let j = 0; j < jsonArray.length; j++) {
                countryObject[jsonArray[j]["Year"]] = jsonArray[j]["Prison population rate"];
            }

            incarcerationRates[countries[i]] = countryObject;
        }
    }

    // Fill in missing data in incarcerationRates
    for (let year = 1950; year <= 2018; year++) {
        for (let country in incarcerationRates) {
            if (incarcerationRates.hasOwnProperty(country)) {
                // if any country in year doesn't have data for year
                if (!incarcerationRates[country].hasOwnProperty(year.toString())) {
                    // Find most recent year with data and fill in forward until year
                    for (let b = year - 1; b >= 1949; b--) {
                        if (incarcerationRates[country].hasOwnProperty(b.toString())) {
                            let mostRecentData = incarcerationRates[country][b.toString()];
                            // Set all years without data after b, up to year, to data for year b
                            for (let u = b + 1; u <= year; u++) {
                                incarcerationRates[country][u] = mostRecentData;
                            }
                        // Exit the outer loop (b)
                        break;
                        }
                        // If you went all the back to 1950 and there was no data, then go forward to next
                        // Don't fill forward
                    }
                }
            }
        }
    }

    fs.writeFile('data/incarcerationRates.json', JSON.stringify(incarcerationRates), function (err) {
        if (err) throw err;
    });

    // Find the #1 and #2 country every year from 1950 - 2018
    // Write it to a CSV
    let countryRanks = [["Year","FirstCountry","FirstRate","SecondCountry","SecondRate"]];

    for (let year = 1950; year <= 2018; year++) {
    // for (let year = 1953; year <= 1954; year++) {
        let yearRow = [year];
        let countryRatesForYear = [];
            
        for (let country in incarcerationRates) {
            if (incarcerationRates.hasOwnProperty(country)) {
                if (incarcerationRates[country].hasOwnProperty(year.toString())) {
                    let rate = incarcerationRates[country][year.toString()];
                    countryRatesForYear.push([country,parseInt(rate)]);
                }
            }
        }
        // console.log(year);
        // console.log(countryRatesForYear);

        if (countryRatesForYear[0]) {
            // If there are any rates for that year
            // Find first place
            let firstCountry = '';
            let firstRate = 0;
            let firstCountryIndex = null;

            for (let i = 0; i < countryRatesForYear.length; i++) {
                let country = countryRatesForYear[i][0];
                let rate = countryRatesForYear[i][1];
                if (rate >= firstRate) {
                    if (rate == firstRate) {
                        console.log("tie: (year, first, second, rate)");
                        console.log(year);
                        console.log(firstCountry);
                        console.log(country);
                        console.log(firstRate);
                    }
                    firstCountry = country;
                    firstRate = rate;
                    firstCountryIndex = i;
                }
            }
            // splice out the winner
            if (firstCountryIndex) {
                countryRatesForYear.splice(firstCountryIndex, 1);
            }

            let secondCountry = '';
            let secondRate = 0;

            if (countryRatesForYear[1]){
                // Find second place

                for (let j = 0; j < countryRatesForYear.length; j++) {
                    let country2 = countryRatesForYear[j][0];
                    let rate2 = countryRatesForYear[j][1];
                    if (rate2 >= secondRate) {
                        if (rate2 == secondRate) {
                            console.log("tie (year, first, second, rate)");
                            console.log(year);
                            console.log(secondCountry);
                            console.log(country2);
                            console.log(secondRate);
                        }
                        secondCountry = country2;
                        secondRate = rate2;
                    }
                }
            }
        
            // console.log(firstCountry, firstRate, secondCountry, secondRate);
            yearRow.push(firstCountry);
            yearRow.push(firstRate);
            yearRow.push(secondCountry);
            yearRow.push(secondRate);
        }

        countryRanks.push(yearRow);
    }
    const csvWriter = createCsvWriter({
        path: './data/countryRanks.csv'
    });
    csvWriter.writeRecords(countryRanks);
}

writeToJSON();

// Year,FirstCountry,FirstRate,SecondCountry,SecondRate