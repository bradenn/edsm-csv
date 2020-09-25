let axios = require('axios');


let fs = require('fs');
let converter = require('json-2-csv');
let targets = require('./data/response.json');
fetchManifest();
function fetchManifest() {
    targets.forEach(dat => {
        acquireBodies(dat.name);
    })
}

function acquireBodies(name) {
    axios.get(`https://www.edsm.net/api-system-v1/bodies?systemName=${name}`).then((res) => {
        return (typeof res.data.bodies != 'undefined') ? (res.data.bodies.length >= 1)? appendJson(res.data) : false : false;
    }).catch(err => {
        console.log(`Failed to fetch bodies for ${name} system. Tying again.`);
        acquireBodies(name);
    })
}


// https://www.edsm.net/api-v1/sphere-systems?x=0&y=0&z=0&minRadius=0&radius=40
let cnt = 0;

function appendJson(json) {
    let cache = JSON.parse(fs.readFileSync(`./data/bodiesCache.json`).toString());
    cache.push(json);
    console.log(`Bodies in systems ${json.name} stored.`);
    fs.writeFileSync(`./data/bodiesCache.json`, JSON.stringify(cache));
    cnt = cnt++;
    return true;
}
