const path = require('path');
const url = require('url');
const request = require('sync-request');
const fs = require('fs');

module.exports = function(locales, jsonURIObj) {
    let jsons = [];
    let errors = [];

    locales.forEach(locale => {
        let jsonFileURI;
        let jsonFile;

        try {
            if (url.parse(jsonURIObj.baseURI).protocol){
                jsonFileURI = url.resolve(jsonURIObj.baseURI, `${locale}.json`);
                let res = request('GET', jsonFileURI, {
                    cache: 'memory',
                });
                jsonFile = res.getBody('utf8');
            } else {
                jsonFileURI = path.resolve(jsonURIObj.baseURI, `${locale}.json`);
                jsonFile = fs.readFileSync(jsonFileURI, 'utf8');
            }
            
            let jsonObj = JSON.parse(jsonFile);
            jsons.push({
                path: jsonFileURI,
                content: jsonObj,
            });
        } catch(e) {
            errors.push(`Error reading or parsing: ${jsonFileURI} ${e}`);
            return;
        }
    });

    return {jsons, errors};
}
