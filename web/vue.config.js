const path = require('path');

module.exports = {
    devServer: {
        proxy: 'http://localhost:8081'
    },
    outputDir: path.resolve(__dirname, '../server/public')
}