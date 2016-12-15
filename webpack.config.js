var webpack = require('webpack');
var path = require('path');

var SRC_DIR = path.resolve(__dirname, 'assets/js');
var BIN_DIR = path.resolve(__dirname, 'bin');

module.exports = {
    entry: SRC_DIR + '/main.js',
    output: {
        path: BIN_DIR,
        filename: 'app.bundle.js',
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            include: SRC_DIR,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            // You can optionally assign namespaces here
            // $: "jquery",
            // jQuery: "jquery",
            // "window.jQuery": "jquery",
            // "algoliasearch": 'algoliasearch' //,
            // "window.algoliasearchHelper": 'algoliasearch-helper'
            // Hogan: "hogan.js"
        })
    //     new webpack.optimize.UglifyJsPlugin({
    //         compress: {
    //             warnings: false,
    //         },
    //         output: {
    //             comments: false,
    //         },
    //     }),
    ]
};

var compiler = webpack(module.exports);
compiler.watch({ // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
}, function(err, stats) {
    // console.log(err);
});