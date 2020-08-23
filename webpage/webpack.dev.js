const WorkerPlugin = require('worker-plugin');
const path = require('path');

module.exports = {
	entry: './src/index.js',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		publicPath: '/dist/'
	},
	module: {
		rules: [
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env', '@babel/preset-react', {
                          'plugins': ['@babel/plugin-proposal-class-properties']}]
				}
			}
		}
		]
	},
	plugins: [
		new WorkerPlugin()
	],
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
};