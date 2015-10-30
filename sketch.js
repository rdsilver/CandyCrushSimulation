var grid;
var colors = 5;
var match_min = 4;
var cube_size = 30;
var speed = 10;

function setup() {
  var myCanvas = createCanvas(window.innerWidth, window.innerHeight - 300);
  myCanvas.parent('sketch');
  
  // Create Sliders
  color_slider = createSlider(3, 50, 5);
  color_slider.parent('color_slider');

  match_slider = createSlider(2, 100, 4);
  match_slider.parent('match_slider');

  size_slider = createSlider(20, 100, 30);
  size_slider.parent('size_slider');

  speed_slider = createSlider(1, 200, 10);
  speed_slider.parent('speed_slider');

  // Create object
  grid = new Grid();
}

function draw() {
    if ((frameCount%speed == 0 || frameCount == 1) && grid.state != 'complete') {
      grid.display();
      grid.step();
    }
}

// Grid Class
function Grid() {
  this.size = cube_size;
  this.x = Math.round(width/this.size);
  this.y = Math.round(height/this.size);
  this.colors_array = createColors(colors); 
  this.grid = autoFill(createArray(this.x, this.y));
  this.state = 'check_blocks'; // possible states ['check_blocks', 'falling', 'complete']
  this.cells_to_redraw = [];
  this.draw_all = false;
  this.first_draw = true;


  function autoFill(pre_grid) {
  	for (x=0; x<pre_grid.length; x++)
  		for (y=0; y<pre_grid[0].length; y++)
  			pre_grid[x][y] = Math.floor(Math.random()*colors)

  	return pre_grid;
  }

  this.display = function() {
    // First time through draw the entire grid
    if ((this.first_draw || this.draw_all) && this.state != 'falling') {
      first_draw = false;
      for (x=0; x<this.grid.length; x++)
    		for (y=0; y<this.grid[0].length; y++) { 
          if (this.grid[x][y] !== -1) 
            fill(this.colors_array[this.grid[x][y]]);
          else
            fill(255, 255, 255);
          rect(x*this.size,y*this.size,this.size,this.size);
        }
    }
      
    // Only redraw cells that need to be redrawn  
    if (this.cells_to_redraw.length >= 1 && !this.draw_all) {
      var x = 0;
      var y = 0;
      for (i=0; i<this.cells_to_redraw.length; i++) {
        x = this.cells_to_redraw[i][0];
        y = this.cells_to_redraw[i][1];
        if (this.grid[x][y] !== -1) 
          fill(this.colors_array[this.grid[x][y]]);
        else
          fill(255, 255, 255);
        rect(x*this.size,y*this.size,this.size,this.size);
      }
    }
  }

  this.step = function() {
    switch(this.state) {
    case 'check_blocks':
        this.state = this.check_blocks();
        break;
    case 'falling':
        this.state = this.falling();
        break;
    case 'complete':
        // grid = new Grid();
        break;
    }
  }

  this.check_blocks = function() {
    var blocks_to_destroy = [];    

    // Loops through every block and checks it's neighbors
    for (x=0; x<this.grid.length; x++)
      for (y=0; y<this.grid[0].length; y++) {     
        var current_color = this.grid[x][y];
        var matches = this.check_block(x, y, current_color, [[x,y]]);
        if (matches.length >= match_min) {
          blocks_to_destroy.push(matches);
        }
      }

    if (blocks_to_destroy.length >= 1) {
      for (i=0; i<blocks_to_destroy.length; i++)
          for (b=0; b<blocks_to_destroy[i].length; b++)
            this.grid[blocks_to_destroy[i][b][0]][blocks_to_destroy[i][b][1]] = -1;
      if (frameCount != 1)
        grid.display();
      return 'falling'
    } else {
      return 'complete'
    }
  }

  this.check_block = function(x, y, color, array_of_matched) {

    if (x+1 < this.grid.length) {
      if (this.grid[x+1][y] == color) {
        var not_read = true;
        for (i=0; i<array_of_matched.length; i++)
          if (array_of_matched[i].equals([x+1, y]))
            not_read = false;

        if (not_read) {
          array_of_matched.push([x+1, y]);
          array_of_matched = this.check_block(x+1, y, color, array_of_matched);
        }
      }
    }

    if (x-1 >= 0) {
      if (this.grid[x-1][y] == color) {
        var not_read = true;
        for (i=0; i<array_of_matched.length; i++)
          if (array_of_matched[i].equals([x-1, y]))
            not_read = false;

        if (not_read) {
          array_of_matched.push([x-1, y]);
          array_of_matched = this.check_block(x-1, y, color, array_of_matched);
        }
      }
    }

    if (y+1 < this.grid[0].length) {
      if (this.grid[x][y+1] == color) {
        var not_read = true;
        for (i=0; i<array_of_matched.length; i++)
          if (array_of_matched[i].equals([x, y+1]))
            not_read = false;

        if (not_read) {
          array_of_matched.push([x, y+1])
          array_of_matched = this.check_block(x, y+1, color, array_of_matched);
        }
      }
    }

    if (y-1 >= 0) {
      if (this.grid[x][y-1] == color) {
        var not_read = true;
        for (i=0; i<array_of_matched.length; i++)
          if (array_of_matched[i].equals([x, y-1]))
            not_read = false;

        if (not_read) {
          array_of_matched.push([x, y-1])
          array_of_matched = this.check_block(x, y-1, color, array_of_matched);
        }
      }
    }
    
    return array_of_matched;
  }

  this.falling = function() {
    this.cells_to_redraw = [];
    var falling = false;
    for (x=0; x<this.grid.length; x++)
      for (y=this.grid[0].length-1; y>=0; y--)
        if (this.grid[x][y] == -1) {
          falling = true;
          if (y == 0) { 
            this.grid[x][y] = Math.floor(Math.random()*colors);
            this.cells_to_redraw.push([x,y]);
          } else {
            var temp = this.grid[x][y-1];
            this.grid[x][y-1] = -1;
            this.grid[x][y] = temp;
            this.cells_to_redraw.push([x,y]);
            this.cells_to_redraw.push([x,y-1]);
          }
        }

    if (falling) {
      return 'falling';
    } else {
      return 'check_blocks';
    }  
  }

}; //End of class grid

function createColors(count) {
	var arr = createArray(3);
	for (i=0; i<count; i++) 
		arr[i] = color(Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256));

	return arr;
}

function windowResized() {
  resizeSketch();
}

function resizeSketch() {
  resizeCanvas(window.innerWidth, window.innerHeight - 300);
  grid = new Grid();
}

// That stackoverflow feels
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function mouseReleased() {
  if (cube_size != size_slider.value() || match_min != match_slider.value() || colors != color_slider.value() || speed != speed_slider.value()) {
    cube_size = size_slider.value();
    match_min = match_slider.value();
    colors = color_slider.value();
    speed = speed_slider.value();
    document.querySelector('#color_slider p').innerHTML = "Number of colors : " + colors;
    document.querySelector('#match_slider p').innerHTML = "Minimum number of matched blocks : " + match_min;
    document.querySelector('#size_slider p').innerHTML  = "Length and width of each cube in pixels : " + cube_size;
    document.querySelector('#speed_slider p').innerHTML = "Delay: " + speed;
    fill(255);
    rect(width - cube_size, 0, cube_size, height);
    rect(0, height - cube_size, width, cube_size);
    grid = new Grid();
  }
}

function mouseDragged() {
  if (cube_size != size_slider.value() || match_min != match_slider.value() || colors != color_slider.value() || speed != speed_slider.value()) {
    document.querySelector('#color_slider p').innerHTML = "Number of colors : " + color_slider.value();
    document.querySelector('#match_slider p').innerHTML = "Minimum number of matched blocks : " + match_slider.value();
    document.querySelector('#size_slider p').innerHTML  = "Length and width of each cube in pixels : " + size_slider.value();
    document.querySelector('#speed_slider p').innerHTML = "Delay: " + speed_slider.value();
    
    /* fill(255);
    rect(width - cube_size, 0, cube_size, height);
    rect(0, height - cube_size, width, cube_size);
    grid = new Grid(); */
  }
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}   