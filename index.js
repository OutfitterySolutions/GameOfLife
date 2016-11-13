/**
 * @function GameOfLife
 * @description Constructor. Creates a new Game of life.
 * @param {object} options Options.
 * @param {-string} options.selector Canvas selector. Defaults to `world`.
 * @param {-number} options.width World width in cells (one cell is 8 pixels as per `CELL_SIZE_IN_PIXELS`). Defaults to `100`.
 * @param {-number} options.width World height in cells (one cell is 8 pixels as per `CELL_SIZE_IN_PIXELS`). Defaults to `100`.
 * @param {-number} options.interval Cycle interval in milliseconds. Defaults to `100`.
 */
function GameOfLife(options) {
  // Read options and set defaults.
  this._options = options || {};
  this._options.selector = this._options.selector || 'world';
  this._options.width = this._options.width || 100;
  this._options.height = this._options.height || 100;
  this._options.interval = this._options.interval || 100;

  // Set constants.
  this.CELL_SIZE_IN_PIXELS = 8; // Because a pixel is too small :)

  // Query DOM elements and resize the canvas.
  this._element = document.getElementById(this._options.selector);
  this._element.width = this._options.width * this.CELL_SIZE_IN_PIXELS;
  this._element.height = this._options.height * this.CELL_SIZE_IN_PIXELS;
  this._context = this._element.getContext('2d');

  // Here we go...
  this.restart();
}

/**
 * @function restart
 * @description Restarts the game.
 */
GameOfLife.prototype.restart = function() {
  // End an already existing cycle.
  if (this._cycle)
    window.clearInterval(this._cycle);

  // Generate a new model of the World with random population.
  this._model = this._generateModel({
    randomizePopulation: true
  });

  // Render the initial state of the World.
  this._render();

  // Start a new cycle based on the `options.interval` setting.
  this._cycle = window.setInterval(function() {
    this._next();
  }.bind(this), this._options.interval);
};

/**
 * @function _generateModel
 * @description Generates a new model of the World. Cells with `1` are alive, whilst cells with `0` are dead.
 * @param {object} args Arguments.
 * @param {-boolean} args.randomizePopulation Randomize population.
 */
GameOfLife.prototype._generateModel = function(args) {
  args = args || {};

  var model = [];

  for (var n = 0, nl = this._options.width; n < nl; ++n) {
    var innerModel = [];

    for (var k = 0, kl = this._options.height; k < kl; ++k)
      innerModel.push(args.randomizePopulation ? Math.round(Math.round(Math.random() * 3) === 3 ? Math.random() * 1 : 0) : 0);

    model.push(innerModel);
  }

  return model;
};

/**
 * @function _next
 * @description Moves forward in the cycle based on the following rules:
 *      1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.
 *      2. Any live cell with two or three live neighbours lives on to the next generation.
 *      3. Any live cell with more than three live neighbours dies, as if by over-population.
 *      4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 * See `https://en.wikipedia.org/wiki/Conway's_Game_of_Life` for more details.
 */
GameOfLife.prototype._next = function() {
  // Generate a new model of the World without population.
  var newModel = this._generateModel();

  for (var n = 0, nl = this._model.length; n < nl; ++n)
    for (var k = 0, kl = this._model[n].length; k < kl; ++k) {
      var aliveNeighbours = 0;

      // Calculate alive neighbours.
      if (!n && !k) {
        // Top left corner.
        aliveNeighbours = this._model[n + 1][k - 1] +
          this._model[n + 1][k] +
          this._model[n + 1][k + 1];
      } else if (n === this._options.width - 1 && !k) {
        // Top right corner.
        aliveNeighbours = this._model[n - 1][k] +
          this._model[n - 1][k - 1] +
          this._model[n][k + 1];
      } else if (n === this._options.width - 1 && k === this._options.height) {
        // Bottom right corner.
        aliveNeighbours = this._model[n - 1][k - 1] +
          this._model[n][k - 1] +
          this._model[n - 1][k];
      } else if (!n && k === this._options.height) {
        // Bottom left corner.
        aliveNeighbours = this._model[n][k - 1] +
          this._model[n + 1][k - 1] +
          this._model[n + 1][k];
      } else if (n && k && n < this._options.width - 1 && k < this._options.height - 1) {
        // Everything else.
        aliveNeighbours = this._model[n - 1][k - 1] +
          this._model[n - 1][k] +
          this._model[n - 1][k + 1] +
          this._model[n][k - 1] +
          this._model[n][k + 1] +
          this._model[n + 1][k - 1] +
          this._model[n + 1][k] +
          this._model[n + 1][k + 1];
      }

      // Define the new state of the new model of the World based on the rules of the game.
      if (this._model[n][k]) {
        if (aliveNeighbours < 2)
          newModel[n][k] = 0;
        else if (aliveNeighbours === 2 || aliveNeighbours === 3)
          newModel[n][k] = 1;
        else if (aliveNeighbours > 3)
          newModel[n][k] = 0;
      } else if (aliveNeighbours === 3)
        newModel[n][k] = 1;
    }

  // Assign the new model of the World.
  this._model = newModel;

  // Render the current state of the World.
  this._render();
};

/**
 * @function _render
 * @description Renders the current representation of the model of the World. Green pixels are alive, whilst white are dead.
 */
GameOfLife.prototype._render = function() {
  for (var n = 0, nl = this._model.length; n < nl; ++n)
    for (var k = 0, kl = this._model[n].length; k < kl; ++k) {
      this._context.beginPath();
      this._context.fillStyle = this._model[n][k] ? '#3AC150' : '#ffffff';
      this._context.rect(n * this.CELL_SIZE_IN_PIXELS, k * this.CELL_SIZE_IN_PIXELS, this.CELL_SIZE_IN_PIXELS, this.CELL_SIZE_IN_PIXELS);
      this._context.fill();
    }
};