//worker.js
//var lsystem_worker = window.lsystem_worker || {};

var lsystem_worker = function() {

  var RAD = Math.PI / 180;

  onmessage = function(e) {
    var rules = {},
        seed,
        iteration,
        cWidth,
        cHeight,
        length = 5,
        angle,
				drawIteration,
				drawingElements = {};

    if (e.data) {
      cWidth = e.data.cWidth;
      cHeight = e.data.cHeight;
      seed = e.data.l_system.axoim;
      iteration = e.data.l_system.iteration;
			drawIteration = e.data.drawIteration;
			angle = e.data.l_system.angle * RAD;
			rules = e.data.l_system.rules;

			if (drawIteration)
			{
					for (var i = 0; i < iteration; ++i) {
							seed = generateString(seed, iteration, rules);
							drawingElements = generateDrawingElements(seed, cWidth, cHeight, length, angle);
							postMessage(drawingElements);
					}
			} else {
				 	seed = generateString(seed, iteration, rules);
				 	drawingElements = generateDrawingElements(seed, cWidth, cHeight, length, angle);
				 	postMessage(drawingElements);
			}
    }
  };

  function Point(x, y, c) {
    this.x = x;
    this.y = y;
		this.color = c;
  };

  function Color(r, g, b, o) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.opacity = o;
  };

  function State(c, a) {
    this.point = c;
    this.angle = a;
  };

  function replace(seed, rules) {
    var newSeed = [];
    for (var i = 0; i < seed.length; ++i) {
      if (rules[seed[i]])
        newSeed = newSeed.concat(rules[seed[i]]);
      else
        newSeed.push(seed[i]);
    }
    return newSeed;
  }

  function generateString(seed, iteration, rules) {
    for (var i = 0; i < iteration; ++i)
      seed = replace(seed, rules);
    return seed;
  }

  function generateDrawingElements(seed, cWidth, cHeight, length, angle) {
    var center = new Point(cWidth / 2, cHeight / 2),
        r = g = b = o = 128,
        color = new Color(r, g, b, o),
        start = new Point(center.x, center.y, color),
        end = new Point(center.x, center.y, color),
				offset = new Point(0, 0),
        stack = [],
				points = [start],
        right = left = cWidth / 2,
        top = bottom = cHeight / 2,
        changeDirection = false,
        currentAngle = -1.57079633,
				scale,
				drawingElements;

    for (var i = 0; i < seed.length; ++i) {
      switch (seed[i]) {
        case "f":
          end.x = start.x + length * Math.cos(currentAngle);
          end.y = start.y + length * Math.sin(currentAngle);
          points.push(new Point(end.x, end.y, color));

          // redefine boundaries
          if (start.x < left) left = start.x;
          else if (start.x > right) right = start.x;

          if (start.y < top) top = start.y;
          else if (start.y > bottom) bottom = start.y;

          start.x = end.x;
          start.y = end.y;

          break;
        case "x":
          break;
        case "+":
          currentAngle -= angle;
          break;
        case "-":
          currentAngle += angle;
          break;
        case "[":
          var c = new Point(start.x, start.y);
          stack.push(new State(c, currentAngle));
          break;
        case "]":
          var s = stack.pop();
          start = s.point;
          currentAngle = s.angle;
        default:
          break;
      }
    }
    offset.x = Math.floor(center.x - (left + right) / 2);
    offset.y = Math.floor(center.y - (top + bottom) / 2);

		imageHeight = bottom - top;
	  imageWidth = right -left;

	 	dominant = imageHeight - imageWidth > 0 ? imageHeight : imageWidth;

		scale = 600 / dominant;

		drawingElements = {
        points: points,
				offset: offset,
				scale: scale
		};

		return drawingElements;
  }

  return {
    onmessage: onmessage
  }

}();
