//thecode.js
$(document).ready(function () {
  var c = document.getElementById('canvas'),
      ctx = c.getContext('2d'),
      lsystem_worker;
     
	ctx.imageSmoothingEnabled = false;
  //ctx.clearRect(0, 0, c.width, c.height);

  if (typeof(Worker) !== 'undefined') {

    lsystem_worker = new Worker('javascript/worker.js');

    lsystem_worker.onmessage = function(e) { 

		  var points = [],
			    offset = {},
					scale = 0.0;
    
      //ctx.clearRect(0, 0, c.width, c.height);

      if (e) {
        points = e.data.points;
        offset = e.data.offset;
				scale = e.data.scale;

				//ctx.transform(scale, 0, 0, scale, -(scale*660-660)/2, -(scale*660-660)/2);

				ctx.restore();
				ctx.save();
				ctx.translate(-(scale*660-660)/2, -(scale*660-660)/2);
				ctx.scale(scale, scale);
				ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();

        if (points.length !== 0) {
          var i = 0, th;
          th = setInterval(function() {
            if (i < points.length - 1) {
              drawLine(points[i], points[++i], offset); 
            } else {
              clearInterval(th);
               $('.drawButton').prop('disabled', false);
            }
          }, 1);
        } else {
         $('.drawButton').prop('disabled', false);
        }

				/*
				if (points.length !== 0)
				{
						for (var i = 0; i < points.length - 1;)
						{
								drawLine(points[i], points[++i], offset);
						}
				}
        $('.drawButton').prop('disabled', false);
				*/

				ctx.closePath();
      }
    }

    lsystem_worker.onerror = function(error) {
      throw error;
    }

  } else {
    // show message
  };

  function roundToHalf(i) {
    return Math.round(i * 2) / 2 + (Math.round(i * 2) % 2 === 0 ? 0.5 : 0);
  }

  function drawLine(start, end, offset) {
    var startX = roundToHalf(start.x),
        startY = roundToHalf(start.y),
        endX = roundToHalf(end.x),
        endY = roundToHalf(end.y),
				key, sub, rules, ls; 

    ctx.moveTo(startX + offset.x, startY + offset.y);
    ctx.lineTo(endX + offset.x, endY + offset.y);
    ctx.strokeStyle = 'rgb(' + end.color.r + ', ' + end.color.g + ', ' +  end.color.b + ')';
    ctx.stroke();
  }

  $('.drawButton').on('click', function() {
    var ls = buildLS();
		    
    lsystem_worker.postMessage({
             'cWidth': c.width,
             'cHeight': c.height,
             'l_system': ls
             });    
    $(this).prop('disabled', true);
  });

	function buildLS() {
    var key = $.map($('label.key'), function (i) { return $(i).html()[0].toLowerCase(); }),
        sub = $.map($('input.sub'), function (i) { return $(i).val().toLowerCase(); }),
			 	rules = {};

    $.each(key, function (i, v) { rules[v] = sub[i]; });

    ls = new L_system();
 
		//ls.addRule(rules);
    ls.addRule({'f': 'f-f++f-f'});
    //ls.axoim = $('#axoim').val().toLowerCase();
		ls.axoim = 'f++f++f';
    ls.iteration = $('#iteration').val();
    //ls.angle = $('#angle').val(); 
		ls.angle = '60';

		return ls;
	}

  function L_system() {
    this.axoim = '';
    this.rules = {};
    this.iteration = 0;
    this.angle = 0;
  }

  L_system.prototype = {
    addRule: function (rule) {
           for (var key in rule) {
             this.rules[key] = rule[key];
           }
           return this;
         }
  }
});
