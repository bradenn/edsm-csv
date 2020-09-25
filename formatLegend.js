let targets = require('./data/response.json');
let stars = require('./export/json/stars.json');
let fs = require('fs');
let converter = require('json-2-csv');
function create_UUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
storeArray('systems', targets.map(target => {
    let cache = target;
    delete cache.coordsLocked;
    delete cache.id64;
    cache.id = create_UUID();
    cache.x = cache.coords.x;
    cache.y = cache.coords.y;
    cache.z = cache.coords.z;
    let matches = stars.filter(star => star.name.includes(cache.name));
    if (matches.length >= 1) {
        cache.starId = matches[0]['id']
    }
    delete cache.coords;
    return cache;
}));

function storeArray(name, json) {
    storeToCsv(name, json);
    storeToJson(name, json);
}

function storeToJson(name, json) {
    fs.writeFile(`./export/json/${name}.json`, JSON.stringify(json), function (err) {
        console.log(`Storing ${json.length} json rows to ${name}.json | Errors: ${err ? 'Failed' : 'Success'}`);
    });
}

function storeToCsv(name, json) {
    converter.json2csvAsync(json, {}).then(data => {
        fs.writeFile(`./export/csv/${name}.csv`, data, function (err) {
            console.log('Converting json to csv...');
            console.log(`Storing ${json.length} json->csv rows to ${name}.csv | Errors: ${err ? 'Failed' : 'Success'}`);
        });
    });
}
