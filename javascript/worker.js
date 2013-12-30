//worker.js
//var lsystem_worker = window.lsystem_worker || {};

var lsystem_worker = function() {

  var RAD = Math.PI / 180;

  onmessage = function(e) {
    var rules = {},
        seed,
        iteration,
        segments,
        cWidth,
        cHeight,
        length = 5,
        offset = new Point(0, 0),
        angle;

    if (e.data) {
      cWidth = e.data.cWidth;
      cHeight = e.data.cHeight;
      seed = e.data.l_system.axoim;
      iteration = e.data.l_system.iteration;
			for (var key in e.data.l_system.rules) {
					rules[key] = e.data.l_system.rules[key];
			}
			angle = e.data.l_system.angle * RAD;
      seed = generateSeed(seed, iteration, rules);
      segments = generateSegment(seed, cWidth, cHeight, length, offset, angle);
      postMessage({'segments': segments, 'xOffset': offset.x, 'yOffset': offset.y});
    }
  };

  function Point(x, y) {
    this.x = x;
    this.y = y;
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

  function Segment(s, e, c) {
    this.start = s;
    this.end = e;
    this.color = c;
  };

  function replace(seed, rules) {
    var newSeed = [];
    for (var i = 0; i < seed.length; ++i) {
      if (rules[seed[i]])
        newSeed = newSeed.concat(rules[seed[i]].split(''));
      else
        newSeed.push(seed[i]);
    }
    return newSeed;
  }

  function generateSeed(seed, iteration, rules) {
    for (var i = 0; i < iteration; ++i)
      seed = replace(seed, rules);
    return seed;
  }

  function generateSegment(seed, cWidth, cHeight, length, offset, angle) {
    var center = new Point(cWidth / 2, cHeight / 2),
        start = new Point(center.x, center.y),
        end = new Point(center.x, center.y),
        stack = [],
				segments = [],
        color = new Color(0, 0, 0, 128),
        r = g = b = 128,
        right = left = cWidth / 2,
        top = bottom = cHeight / 2,
        changeDirection = false,
        currentAngle = -1.57079633;

		//length /= iteration;

    for (var i = 0; i < seed.length; ++i) {
      switch (seed[i]) {
        case "f":
          end.x = start.x + length * Math.cos(currentAngle);
          end.y = start.y + length * Math.sin(currentAngle);
          segments.push(new Segment(new Point(start.x, start.y), new Point(end.x, end.y), new Color(r, g, b, 128)));

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

		/* adjust line length
		 * Augment the pattern by enlarge the line length by a factor that is
		 * determined by 
		 */
		var height = bottom - top,
			 	width = right -left,
			 	d = height - width > 0 ? height : width,
				factor = 600 / d;
		
		length *= factor;

		return segments;
  }

  return {
    onmessage: onmessage
  }

}();