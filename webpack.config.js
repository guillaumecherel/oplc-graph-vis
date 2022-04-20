const path = require('path');

module.exports = {
  entry: './src/skill-graph-viz.ts',
  mode: 'development',
  devtool: 'inline-source-map',
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
    path: path.resolve(__dirname, 'dist'),
    filename: 'skill-graph-vis.js',
    library: {
      name: 'oplcSkillGraphVis',
      type: 'umd',
    }
  },
};
