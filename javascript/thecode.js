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

		  var lines,
			    xOffset,
					yOffset;
    
      ctx.clearRect(0, 0, c.width, c.height);

      if (e) {
        lines = e.data.segments;
        xOffset = e.data.xOffset;
        yOffset = e.data.yOffset;
        
        ctx.beginPath();

        if (lines.length !== 0) {
          var i = 0, th;
          th = setInterval(function() {
            if (i < lines.length) {
              drawLine(lines[i++], xOffset, yOffset); 
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

  function drawLine(line, xOffset, yOffset) {
    var startX = roundToHalf(line.start.x),
        startY = roundToHalf(line.start.y),
        endX = roundToHalf(line.end.x),
        endY = roundToHalf(line.end.y); 

    ctx.moveTo(startX + xOffset, startY + yOffset);
    ctx.lineTo(endX + xOffset, endY + yOffset);
    ctx.strokeStyle = 'rgb(' + line.color.r + ', ' + line.color.g + ', ' +  line.color.b + ')';
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
