module.exports = {
  entry: './src/main.ts',
  target: 'node',
  externals: [
    // Exclude node_modules from the bundle, but include Prisma client
    function ({ context, request }, callback) {
      if (/node_modules/.test(context) && !/@prisma/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: __dirname + '/dist',
  },
};