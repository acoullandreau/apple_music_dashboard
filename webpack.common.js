const WorkerPlugin = require('worker-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const path = require('path');

module.exports = {
	entry: {
		app: './src/index.js'
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
		},
		{
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		},
		{
	        test: /\.js$/,
	        exclude: /node_modules/,
	        loader: 'eslint-loader'
	    }
		]
	},
	plugins: [
		new CopyPlugin({
			patterns: [
			{ from: 'public', to: 'public' }
			]
		}),
		new WorkerPlugin()
	],
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
};