//thecode.js
$(document).ready(function () {
  var c = document.getElementById('canvas'),
      ctx = c.getContext('2d'),
      lsystem_worker;
     
	ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, c.width, c.height);

  if (typeof(Worker) !== 'undefined') {

    lsystem_worker = new Worker('javascript/worker.js');

    lsystem_worker.onmessage = function(e) { 

		  var points,
			    xOffset,
					yOffset;
    
      ctx.clearRect(0, 0, c.width, c.height);

      if (e) {
        points = e.data.points;
        xOffset = e.data.xOffset;
        yOffset = e.data.yOffset;
        
        ctx.beginPath();

        if (points.length !== 0) {
          var i = 0, th;
          th = setInterval(function() {
            if (i < points.length - 1) {
              drawLine(points[i], points[++i], xOffset, yOffset); 
            } else {
              clearInterval(th);
               $('.drawButton').prop('disabled', false);
            }
          }, 1);
        } else {
         $('.drawButton').prop('disabled', false);
         }
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

  function drawLine(start, end, xOffset, yOffset) {
    var startX = roundToHalf(start.x),
        startY = roundToHalf(start.y),
        endX = roundToHalf(end.x),
        endY = roundToHalf(end.y); 

    ctx.moveTo(startX + xOffset, startY + yOffset);
    ctx.lineTo(endX + xOffset, endY + yOffset);
    ctx.strokeStyle = 'rgb(' + end.color.r + ', ' + end.color.g + ', ' +  end.color.b + ')';
    ctx.stroke();
  }

  $('.drawButton').on('click', function() {

    ctx.clearRect(0, 0, c.width, c.height);

		var key = $.map($('label.key'), function (i) { return $(i).html()[0].toLowerCase(); }),
		    sub = $.map($('input.sub'), function (i) { return $(i).val().toLowerCase(); }),
				rules = {};

    $.each(key, function (i, v) { rules[v] = sub[i]; });

    var ls = new L_system();
 
		ls.addRule(rules);
    //ls.addRule({'x': 'f[+x]f[-x]+x'}).addRule({'f': 'ff'});
    ls.axoim = $('#axoim').val().toLowerCase();
    ls.iteration = $('#iteration').val();
    ls.angle = $('#angle').val(); 
    
    lsystem_worker.postMessage({
             'cWidth': c.width,
             'cHeight': c.height,
             'l_system': ls
             });    
    $(this).prop('disabled', true);
  });

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
