# README

## Getting Started
Scrape data from http://www.prisonstudies.org.  
Last scraped Jan 2019.  
For almost every country, the most recent year's data was manually entered from http://www.prisonstudies.org/sites/default/files/resources/downloads/wppl_12.pdf.

```
$ npm install
$ node cheerio-scraper.js
$ node write-to-json.js
```

Executing `cheerio-scraper.js` overwrites `'./data/raw-data'`.  
A cleaned (edited) copy is located in `'./data/cleaned-data'`.  
Executing `write-to-json.js` overwrites `'./data/incarcerationRates.json'`.  

## Totals
Total URLS: 226  
No Data: 4  
Total with data: 222 
Edited: 8/226 = 3.6%  

## Edited Data
1. Canada 
    1. (1 yr range, e.g. 1991-92 -> 1991)
1. Curacao-netherlands 
    1. (Old data: misalignment)
1. Djibouti 
    1. (Old data: misalignment)
1. Egypt 
    1. (Old data: misalignment)
1. Isle-Man-United-Kingdom 
    1. (1 yr range, e.g. 1991-92 -> 1991)
1. Jamaica 
    1. (removed *)
1. Martinique-France 
    1. (Old data: misalignment)
1. Netherlands 
    1. (5 yr range, e.g. 1991-1995 -> 1993)
1. Rwanda 
    1. (Failed to parse '+' addition)

## No Data
1. Democratic-Peoples-Republic-North-Korea
1. Equatorial Guinea
1. Eritrea*
1. Guinea-bissau*
1. Laos*
1. San-Marino
1. Somalia
1. South Sudan*

*1-2 years data only.

© 2019 Sammi-Jo Lee  
¯\\_(ツ)_/¯
