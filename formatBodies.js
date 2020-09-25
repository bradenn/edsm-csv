let systems = [];
let fs = require('fs');
let converter = require('json-2-csv');

formatBodies(require('./data/bodiesCache.json'));

function formatBodies(bodies) {
    let stars = [];
    let planets = [];
    let moons = [];
    bodies.forEach((system) => {
        let parentStar = null;
        let pMap = [];
        let protoMoons = [];
        if (system.bodies !== 0) {
            system.bodies.forEach(body => {
                if (body.type === "Star") {
                    const newId = create_UUID();
                    parentStar = newId;

                    delete body.bodyId
                    delete body.id64
                    delete body.discovery
                    body.type = body.subType;
                    delete body.subType
                    delete body.parents
                    delete body.isMainStar
                    delete body.distanceToArrival
                    delete body.isScoopable
                    delete body.rotationalPeriodTidallyLocked
                    delete body.orbitalPeriod
                    delete body.semiMajorAxis
                    delete body.orbitalEccentricity
                    delete body.orbitalInclination
                    delete body.argOfPeriapsis
                    delete body.axialTilt
                    delete body.reserveLevel
                    delete body.rings
                    delete body.belts
                    body.id = newId;
                    stars.push(body);
                } else if (body.type === "Planet" && body.parents != null) {
                    delete body.reserveLevel;
                    delete body.materials;
                    delete body.atmosphereComposition;
                    delete body.solidComposition;
                    delete body.rings
                    delete body.belts
                    delete body.volcanismType
                    if (body.parents.filter(key => Object.keys(key).includes('Planet')).length >= 1) {
                        body.id = create_UUID();
                        body.type = "Moon";
                        delete body.discovery
                        delete body.bodyId
                        body.type = body.subType;
                        delete body.subType
                        delete body.terraformingState;
                        delete body.as
                        delete body.id64
                        delete body.isLandable
                        protoMoons.push(body);
                    } else {
                        body.id = create_UUID();
                        pMap.push({bodyId: body.bodyId, planetId: body.id});
                        delete body.parents

                        delete body.bodyId
                        body.type = body.subType;
                        delete body.subType
                        delete body.discovery
                        delete body.id64
                        delete body.isLandable
                        body.starId = parentStar;
                        planets.push(body);
                    }
                }
            });
        }

        protoMoons.forEach(moon => {
            let planetId = pMap.find(data => data.bodyId === moon.parents[0]['Planet']);
            if (typeof planetId !== 'undefined') {
                moon.planetId = planetId['planetId'];
                delete moon.parents
                moons.push(moon);
            }
        })
    });
    storeArray('stars', stars);
    storeArray('planets', planets);
    storeArray('moons', moons);
}


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

function create_UUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
