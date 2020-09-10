const WorkerPlugin = require('worker-plugin');
const path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		publicPath: '',
		library: 'apple-music-dashboard'
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