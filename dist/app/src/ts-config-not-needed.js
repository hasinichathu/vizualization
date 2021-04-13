//for webpack ts 
var path = require('path');
module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
// for babel-js
module.exports = {
    entry: './app/src/main.ts',
    output: {
        filename: 'bundle.js'
    },
    resolve: {
        modules: [
            "node_modules"
        ]
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        port: 3000
    }
};
//# sourceMappingURL=ts-config-not-needed.js.map