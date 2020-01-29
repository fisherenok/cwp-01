const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    console.log("Not enough arguments");
    process.exit();
}
if (process.argv.length > 3) {
    console.log("Many arguments");
    process.exit();
}

const dir = process.argv[2];
const newDir = `${dir}\\${path.basename(dir)}`;
const logger = fs.createWriteStream('summary.js');
let copyright = "";
let prefix = "";

const createDir = function (cb) {
    fs.mkdir(newDir, (err) => {
        if (err) {
            if (err.code === 'EEXIST') {
                console.error("Error occurred while creating the directory.");
            }
        } else {
            console.log('A new directory has been created.')
        }
    });
    fs.watch(newDir, (eventType, filename) => {
        console.log(`${eventType} - ${filename}`);
    });

    fs.readFile("config.json", (err, data) => {
        if (err) console.error("Error occurred while reading the file.");
        else {
            copyright = JSON.parse(data).copyright;
        }
    });
    cb();
};

const srcSummary = function(dir, prefix) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading files in a directory ${dir}`)
        } else {
            files.forEach((e) => {
                let newUnit = dir + '\\' + e;
                fs.stat(newUnit, (err, stats) => {
                    if (err && err.code === 'ENOENT') {
                        return resolve(false);
                    } else if (err) {
                        return reject(err);
                    }
                    if (stats.isDirectory()) {
                        srcSummary(newUnit, prefix + e + '/')
                    } else {
                        logger.write(`console.log('${prefix}${e}');\n`);
                        const newFile = `${newDir}\\${path.basename(newUnit)}`;
                        const newLogger = fs.createWriteStream(newFile);

                        fs.readFile(newUnit, (err, data) => {
                            if (err) throw err;
                            else newLogger.write(`${copyright}\n\n${data}\n\n${copyright}`);
                        })
                    }
                });
            }, this);
        }

    });
};

createDir(() => srcSummary(dir, prefix));




