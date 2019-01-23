# README

## Getting Started

Scrape data from http://www.prisonstudies.org.
Last scraped Jan 2019.

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
No Data: 8
Total with data: 218
Edited: 8/226 = 3.6%

## Edited Data
- Canada (1 yr range, e.g. 1991-92 -> 1991)
- Curacao-netherlands (Old data: misalignment)
- Djibouti (Old data: misalignment)
- Egypt (Old data: misalignment)
- Isle-Man-United-Kingdom (1 yr range, e.g. 1991-92 -> 1991)
- Jamaica (removed *)
- Martinique-France (Old data: misalignment)
- Netherlands (5 yr range, e.g. 1991-1995 -> 1993)
- Rwanda (Failed to parse '+' addition)

## No Data
- Democratic-Peoples-Republic-North-Korea
- Equatorial Guinea
- Eritrea
- Guinea-bissau
- Laos
- San-Marino
- Somalia
- South Sudan

© 2019 Sammi-Jo Lee
¯\\_(ツ)_/¯
