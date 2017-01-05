(function(){
	//Initialising variables
	var game = document.getElementById('game'),
	    ctx = game.getContext('2d'),
	    snake, food, gamme,
	    fps = 75,
	    foood = {X: Math.floor((Math.random() * (game.width - 50)) + 25), Y: Math.floor((Math.random() * (game.height - 50)) + 25)},
	    score = 0,
	    count = 0, moveCount = 0,
		lastDir = [], lastPos = [],
		dirs = ["left", "up", "right", "down"],
		finishedSnakeAnim = false,
		finishedFoodAnim = false;
	function signature(x, y) {
		ctx.font = "48px serif";
		ctx.fillText("Created by Hayden Hoffman", x, y);
	}

	//The drawbox function which draws the proper boxes
	function drawBox(x, y, width, height, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, width, height);
	}

	function handleKeys(e) {
		var keys = [37, 38, 39, 40];
		snake.dir !== lastDir[lastDir.length - 1] ? lastDir.push(snake.dir) : null;
		lastDir.length > 3 ? lastDir.splice(0, 1) : null;
		for (var i = 0; i < keys.length; i++) {
			function denyInversion(dir) {
				if ([2, -2].indexOf(i - dirs.indexOf(snake.dir)) > -1) { return true; }
				else if ([2, -2].indexOf(dirs.indexOf(snake.dir) - keys.indexOf(e.keyCode)) > -1 && count < 5) {
					snake.dir = snake.dir[dirs.indexOf(snake.dir) + 2];
					return true;
				}
				else { return false; }
			}
			if (!denyInversion(snake.dir) && e.keyCode === keys[i] && count) {
				count = 0;
				snake.dir = dirs[i];
			}
		}
	}

	gamme = {
		height: game.height,
		width: game.width,
		color: 'black',
		drawBorder: function() { // come back to this later
			drawBox(0, 0, this.width, 25, this.color);
			drawBox(this.width - 25, 0, 25, this.height, this.color);
			drawBox(0, this.height - 25, this.width, 25, this.color);
			drawBox(0, 0, 25, this.height, this.color);
		},

		alertScore: function() {
			alert("You scored " + score);
		},


		fixFoodPos: function() {
			var handler = {
				foodGreaterGame_width: function() {if (food.curPos[0] > game.width) food.curPos[0] -= 25},
				foodGreaterGame_height: function() {if (food.curPos[1] > game.height) food.curPos[1] -= 25},
				foodLess0: function() {
					for (var i = 0; i < 2; i++) {
						if (food.curPos[i] < 0) food.curPos[i] += 25;
					}
				}
			};
			for (var func in handler) {
				handler[func]();
			}
			for (var i = 0; i < 2; i++) {
				while (food.curPos[i] % 25 !== 0) food.curPos[i] -= 1;
			}
			return this;
		},
		doNotSegs: function() {
			for (var i = 0; i < snake.segments.length; i += 2) {
				while (snake.segments[i] === food.curPos[0] && snake.segments[i + 1] === food.curPos[1]) {
					food.curPos[0] = Math.floor((Math.random() * (game.width - 50)) + 25);
					food.curPos[1] = Math.floor((Math.random() * (game.height - 50)) + 25);
					food.spawn();
				}
			}
		}
	};

	snake = {
		height: 25,
		width: 25,
		color: 'blue',
		curPos: [100, 100],
		dir: "right", //Direction of which the snake goes
		speed: 25,
		segments: [],
		len: 1,

		// Initiate the snake
		init: function() {
			snake.curPos = [100, 100];
		},
		draw: function() {
			drawBox(snake.curPos[0], snake.curPos[1], snake.width, snake.height, snake.color);
		},
		// Moves the snake based on direction it's set to
		move: function() {
			if (moveCount === 5) {
				switch (snake.dir) {
					case "up":
						snake.curPos[1] -= snake.speed;
						break;
					case "down":
						snake.curPos[1] += snake.speed;
						break;
					case "left":
						snake.curPos[0] -= snake.speed;
						break;
					case "right":
						snake.curPos[0] += snake.speed;
						break;
				}
			}
			return this;
		},

		// Allocates the segments of the snake
		allocSegments: function() {
			function eqArray(arr1, arr2) {
				if (arr1.length !== arr2.length) return false;
				else {
					for (var i = 0; i < arr1.length; i += 2) {
						return ((arr1[i] === arr2[i] && arr1[i + 1] === arr2[i + 1]) ? true : false);
					}
				}
			}
			if (eqArray(snake.curPos, food.curPos)) {
				snake.len += 5;
				foood.X = Math.floor((Math.random() * (game.width - 50)) + 25);
				foood.Y = Math.floor((Math.random() * (game.height - 50)) + 25);
				food.curPos[0] = foood.X;
				food.curPos[1] = foood.Y;
				food.spawn();
				gamme.fixFoodPos();
				score += 10;
			}
			var drawSegments = (function() {
				for (var i = 0; i < snake.segments.length; i += 2) {
					drawBox(snake.segments[i], snake.segments[i + 1], snake.width, snake.height, snake.color);
				}
			})(),
				increaseSegments = (function(){
					if (snake.len > 1 && moveCount === 5) {
						switch(snake.dir) {
							case "up":
								snake.segments.push(snake.curPos[0]);
								snake.segments.push(snake.curPos[1] + 25);
								break;
							case "down":
								snake.segments.push(snake.curPos[0]);
								snake.segments.push(snake.curPos[1] - 25);
								break;
							case "left":
								snake.segments.push(snake.curPos[0] + 25);
								snake.segments.push(snake.curPos[1]);
								break;
							case "right":
								snake.segments.push(snake.curPos[0] - 25);
								snake.segments.push(snake.curPos[1]);
								break;
						}
					}
					(snake.segments.length > snake.len) ? snake.segments.splice(0, 2) : null;
			})();
			return this;
		},

		//Tests for whether the snake died. Returns true if so.
		die: function() {
			if (snake.curPos[0] < 25 ||
				snake.curPos[0] > game.width - 50 ||
				snake.curPos[1] < 25 ||
				snake.curPos[1] > game.height - 50
			) return true;
			for (var i = 0; i < snake.segments.length; i += 2) {
				if (snake.segments[i] === snake.curPos[0] && snake.segments[i + 1] === snake.curPos[1]) {
					return true;
				}
			}
			return false;
		}
	};

	food = {
		color: 'red',
		width: 25,
		height: 25,
		curPos: [foood.X, foood.Y],
		spawn: function() {
			for (var i = 0; i < 2; i++) {
				if (food.curPos[i] % 25 === 0) {
					drawBox(food.curPos[0], food.curPos[1], food.width, food.height, food.color);
				}
			}
		}
	};

	function update() {
		window.addEventListener("keydown", handleKeys);
		ctx.clearRect(0, 0, game.width, game.height);
		if (moveCount === 5) moveCount = 0;
		gamme.fixFoodPos().doNotSegs();
		window.onload = function() {
			snake.init();
		};
		food.spawn();
		snake.draw();
		gamme.drawBorder();
		if (snake.die()) {
			snake.init();
			gamme.alertScore();
			location.reload();
		}
		count++;
		moveCount++;
		snake.move().allocSegments();
	}
	setInterval(update, 1000 / fps);
})();
