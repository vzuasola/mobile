const fs = require('fs');

class VersionPlugin {
    constructor(file) {
        this.file = file;
    }

    apply(compiler) {
        compiler.plugin('run', (compilation, callback) => {
            const version = Math.floor(Date.now() / 1000);

            fs.writeFile(this.file, JSON.stringify({
                version: version,
            }), 'UTF8', () => {
                callback();
            });
        });
    }
}

module.exports = VersionPlugin;
