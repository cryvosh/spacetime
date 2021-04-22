function Canvas(canvas_element, zoom) {
	this.canvas = canvas_element;
	this.ctx = this.canvas.getContext(`2d`);
	this.view_matrix = [zoom, zoom, this.canvas.width/2, this.canvas.height/2];

	this.resize = function() {
		let old_width = this.canvas.width;
		let old_height = this.canvas.height;
	
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
	
		this.view_matrix[2] += (this.canvas.width-old_width)/2;
		this.view_matrix[3] += (this.canvas.height-old_height)/2;
	}

	this.update_transform = function() {
		this.ctx.setTransform(this.view_matrix[0], 0, 0, this.view_matrix[1], this.view_matrix[2], this.view_matrix[3]);
	}

	this.clear = function(color) {
		this.ctx.fillStyle = color;
		let corners = this.corners();
		this.ctx.fillRect(corners[0][0], corners[0][1], corners[1][0]-corners[0][0], corners[1][1]-corners[0][1]);
	}

	this.corners = function() {
		let top_left = this.inverse_transform(0,0);
		let bottom_right = this.inverse_transform(this.canvas.width, this.canvas.height);
		return [top_left, bottom_right];
	}

	this.pixel_width = function() {
		let pixel_width = this.inverse_transform(1,0)[0] - this.inverse_transform(0,0)[0];
		this.ctx.lineWidth = pixel_width;
		return pixel_width;
	}

	// worldspace to screenspace
	this.forward_transform = function(x, y) {
		return [(x * this.view_matrix[0]) + this.view_matrix[2], (y * this.view_matrix[1]) + this.view_matrix[3]];
	}

	// screenspace to worldspace
	this.inverse_transform = function(x, y) {
		let cross = this.view_matrix[0] * this.view_matrix[1];
		return [
			(x*this.view_matrix[1] / cross) - this.view_matrix[2] * this.view_matrix[1] / cross,
			(y*this.view_matrix[0] / cross) - this.view_matrix[0] * this.view_matrix[3] / cross
		]
	}

	this.wheel = function(e) {
		let sens = 1.2;
		let scale = e.deltaY < 0 ? sens : 1 / sens;
	
		this.view_matrix[0] *= scale;
		this.view_matrix[1] *= scale;
		this.view_matrix[2] = e.offsetX - (e.offsetX - this.view_matrix[2]) * scale;
		this.view_matrix[3] = e.offsetY - (e.offsetY - this.view_matrix[3]) * scale;
	}

	this.draw_axes = function(e) {
		this.ctx.strokeStyle = `rgb(255,0,0)`;

		this.draw_horizontal_line(0);
		this.draw_vertical_line(0);
	}

	this.x_dim = 5000;
	this.y_dim = 2000;
	this.font_pixel_height = 20;

	this.draw_ticks = function() {
		let corners = this.corners();

		let font_height = this.pixel_width()*this.font_pixel_height;
		this.ctx.font = font_height + "px Courier New";
		let char_width = this.ctx.measureText(`#`).width;
		
		let color1 = `rgba(255,0,0, 0.2)`;
		let color2 = `rgba(255,0,0, 0.4)`;
		this.ctx.fillStyle = `rgb(0,0,0)`;

		//this.x_dim = Math.ceil((corners[1][0] - corners[0][0]) / 10);

		let right = corners[1][0] - corners[1][0] % this.x_dim;
		let left = corners[0][0] - corners[0][0] % this.x_dim;
		let width = right - left;

		let top = corners[0][1] - corners[0][1] % this.y_dim;
		let bottom = corners[1][1] - corners[1][1] % this.y_dim;
		let height = bottom-top;

		// // X AXIS
		// this.ctx.textBaseline = "top";
		// for (let i=-1; i<=Math.ceil(width / this.x_dim)+1; i++) {
		// 	let x = left + i*this.x_dim;
		// 	this.ctx.strokeStyle = color2;
		// 	this.ctx.fillText(x, x - char_width*x.toString().length/2, Math.min(0, corners[1][1]-font_height));
		// 	this.draw_vertical_line(x);

		// 	this.ctx.strokeStyle = color1;
		// 	for (let j=1; j<3; j++) {
		// 		this.draw_vertical_line(x+j*this.x_dim/3);
		// 	}
		// }

		// // Y AXIS
		// this.ctx.textBaseline = "middle";
		// for (let i=-1; i<=Math.ceil(height / this.y_dim)+1; i++) {
		// 	let y = top + i*this.y_dim;
		// 	this.ctx.strokeStyle = color2;
		// 	let text_width = char_width*y.toString().length;
		// 	this.ctx.fillText(y, Math.max(-text_width, corners[0][0]), y);
		// 	this.draw_horizontal_line(y);

		// 	this.ctx.strokeStyle = color1;
		// 	for (let j=1; j<3; j++) {
		// 		this.draw_horizontal_line(y+j*this.y_dim/3);
		// 	}
		// }


		// X AXIS
		this.ctx.textBaseline = "top";
		for (let i=0; i<=Math.ceil(corners[1][0] / this.x_dim); i++) {
			this.ctx.strokeStyle = color2;

			let x = i*this.x_dim;			
			let text_width = char_width*x.toString().length;
			this.ctx.fillText(x, x - text_width/2, Math.min(0, corners[1][1]-font_height));
			this.draw_vertical_line(x);

			this.ctx.strokeStyle = color1;
			for (let j=1; j<3; j++) {
				this.draw_vertical_line(x+j*this.x_dim/3);
			}
		}

		// Y AXIS
		this.ctx.textBaseline = "middle";
		for (let i=0; i<=Math.ceil(-corners[0][1] / this.y_dim); i++) {
			this.ctx.strokeStyle = color2;

			let y = i*this.y_dim;			
			let text_width = char_width*y.toString().length;
			this.ctx.fillText(y, Math.max(-text_width, corners[0][0]), -y);
			this.draw_horizontal_line(-y);

			this.ctx.strokeStyle = color1;
			for (let j=1; j<3; j++) {
				this.draw_horizontal_line(-y-j*this.y_dim/3);
			}
		}

		// this.ctx.save();
		// this.ctx.textBaseline = "middle";
		// let y_label = "IA Evaluations";
		// let y_label_length = char_width*y_label.length;
		// this.ctx.translate(-dim*2, y_label_length/2 + corners[0][1] + (corners[1][1] - corners[0][1])/2);
		// this.ctx.rotate(-Math.PI/2);
		// this.ctx.fillText(y_label,0,0);
		// this.ctx.restore();
	}

	this.draw_horizontal_line = function(y) {
		let corners = this.corners();
		this.ctx.beginPath();
		this.ctx.moveTo(corners[0][0], y);
		this.ctx.lineTo(corners[1][0], y);
		this.ctx.stroke();
	}

	this.draw_vertical_line = function(x) {
		let corners = this.corners();
		this.ctx.beginPath();
		this.ctx.moveTo(x, corners[0][1]);
		this.ctx.lineTo(x, corners[1][1]);
		this.ctx.stroke();
	}
}

let canvas1 = new Canvas(document.querySelector(`#canvas1`), 120);
let canvas2 = new Canvas(document.querySelector(`#canvas2`), 0.1);

let divider = document.querySelector(`#divider`);
let divider_ratio = 0.5;
let divider_x = 0;

let dragging_canvas1 = false;
let dragging_canvas2 = false;
let dragging_divider = false;

// Divider listeners

divider.addEventListener(`mousedown`, function(e) {
	if (e.button == 0) {
		dragging_divider = true;
	}
});

divider.addEventListener(`mouseup`, function(e) {
	if (e.button == 0) {
		dragging_divider = false;
	}
});

divider.addEventListener(`contextmenu`, function(e) {
	e.preventDefault();
});

// Canvas1 listeners

canvas1.canvas.addEventListener(`mousedown`, function(e) {
	if (e.button == 0) {
		dragging_canvas1 = true;
	}
})

canvas1.canvas.addEventListener(`mouseup`, function(e) {
	if (e.button == 0) {
		dragging_canvas1 = false;
	}
})

canvas1.canvas.addEventListener(`contextmenu`, function(e) {
	e.preventDefault();

	let world_position = canvas1.inverse_transform(e.offsetX, e.offsetY);
	console.log(domain_regions[draw_mode].get_leaf(world_position[0], world_position[1]));
});

canvas1.canvas.addEventListener(`wheel`, function(e) {
	canvas1.wheel(e);
});

// Canvas2 listeners

canvas2.canvas.addEventListener(`mousedown`, function(e) {
	if (e.button == 0) {
		dragging_canvas2 = true;
	}
})

canvas2.canvas.addEventListener(`mouseup`, function(e) {
	if (e.button == 0) {
		dragging_canvas2 = false;
	}
})

canvas2.canvas.addEventListener(`contextmenu`, function(e) {
	e.preventDefault();
});

canvas2.canvas.addEventListener(`wheel`, function(e) {
	canvas2.wheel(e);
});

// Window listeners

window.addEventListener(`mouseup`, function(e) {
	if (e.button == 0) {
		dragging_divider = false;
		dragging_canvas1 = false;		
		dragging_canvas2 = false;
	}
});

window.addEventListener(`mousemove`, function(e) {
	if (dragging_divider) {

		let divider_width = divider.clientWidth;

		divider_x = e.clientX-divider_width/2;
		divider_x = Math.min(divider_x, window.innerWidth-divider_width/2);
		divider_x = Math.max(divider_x, -divider_width/2);

		divider_ratio = (divider_x+divider_width/2) / window.innerWidth;
		divider.style.transform = `translateX(${divider_x}px)`;

		resize();
	}

	if (dragging_canvas1) {
		canvas1.view_matrix[2] += e.movementX;
		canvas1.view_matrix[3] += e.movementY;
	}

	if (dragging_canvas2) {
		canvas2.view_matrix[2] += e.movementX;
		canvas2.view_matrix[3] += e.movementY;
	}
});


let draw_mode = 1;
window.addEventListener(`keydown`, function(e) {
	if (!isNaN(parseInt(e.key))) {
		draw_mode = parseInt(e.key) - 1;
		//draw();
	}

	if (e.code == `KeyR`) {
		location.reload();
	}

	if (e.code == `Space`) {
		paused = !paused;
	}

	// if (e.code == `ArrowRight`) {
	// 	//console.log("righ");
	// 	if (paused) {
	// 		t += dt;
	// 	}
	// }
});

window.addEventListener(`resize`, function(e) {
	resize();
});

resize();
function resize() {
	divider_x = (divider_ratio * window.innerWidth) - divider.clientWidth/2;
	divider.style.transform = `translateX(${divider_x}px)`;
	
	canvas1.canvas.style.width = `${divider_x+divider.clientWidth/2}px`;
	canvas2.canvas.style.width = `${window.innerWidth - (divider_x+divider.clientWidth/2)}px`;
	canvas2.canvas.style.left = `${divider_x+divider.clientWidth/2}px`;
	
	canvas1.resize();
	canvas2.resize();
}

// Just fixing js bug
function mod(n, m) {
	return ((n % m) + m) % m;
}

function add(a, b) {
	//if (Array.isArray(a) || Array.isArray(b)) {
		a = Array.isArray(a) ? a : [a,a];
		b = Array.isArray(b) ? b : [b,b];
	//}
	
	//if (Array.isArray(a) && Array.isArray(b)) {
		return [a[0] + b[0], a[1] + b[1]];
	//}

	return a + b;
}

function sub(a, b) {
	//if (Array.isArray(a) || Array.isArray(b)) {
		a = Array.isArray(a) ? a : [a,a];
		b = Array.isArray(b) ? b : [b,b];
	//}

	//if (Array.isArray(a) && Array.isArray(b)) {
		let res = [a[0] - b[1], a[1] - b[0]];
		// res[0] = clamp(res[0]);
		// res[1] = clamp(res[1]);
		return res;
	//}

	return a - b;
}

function mult(a, b) {
	//if (Array.isArray(a) || Array.isArray(b)) {
		a = Array.isArray(a) ? a : [a,a];
		b = Array.isArray(b) ? b : [b,b];
	//}

	//if (Array.isArray(a) && Array.isArray(b)) {
		return [
			Math.min(Math.min(a[0]*b[0], a[0]*b[1]), Math.min(a[1]*b[0], a[1]*b[1])),
			Math.max(Math.max(a[0]*b[0], a[0]*b[1]), Math.max(a[1]*b[0], a[1]*b[1]))
		];
	//}

	return a * b;
}

function min(a, b) {
	a = Array.isArray(a) ? a : [a,a];
	b = Array.isArray(b) ? b : [b,b];

	return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
}

function max(a, b) {
	a = Array.isArray(a) ? a : [a,a];
	b = Array.isArray(b) ? b : [b,b];

	return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

function abs(a) {
	a = Array.isArray(a) ? a : [a,a];
	// let x = Math.abs(a[0]);
	// let y = Math.abs(a[1]);
	// return [Math.min(x,y), Math.max(x,y)];

	if (a[0] <= 0 && 0 <= a[1]) {
		return [0, Math.max(-a[0], a[1])];
	} else if (a[1] <= 0) {
		return [-a[1], -a[0]]
	} else {
		return a;
	}
}

function smin(a, b) {
	//https://iquilezles.org/www/articles/smin/smin.htm media molecule smin
	let k = 1.5;
	let h = mult(max(sub(k, abs(sub(a,b))), 0), 1/k);
	return sub(min(a,b), mult(square(h), k/4));
}

function square(a) {
	a = Array.isArray(a) ? a : [a,a];

	let x = a[0]*a[0];
	let y = a[1]*a[1];
	
	//console.log(a, x,y);

	if (a[0] < 0 && a[1] > 0) {
		return [0, Math.max(x,y)];
	} else {
		return [Math.min(x,y), Math.max(x,y)];
	}
}

function sqrt(a) {
	return [Math.sqrt(a[0]), Math.sqrt(a[1])];
}

function circle(x,y,center_x,center_y,radius) {
	return sub(add(square(sub(x,center_x)),square(add(y, center_y))), radius);
}

//https://www.iquilezles.org/www/articles/distfunctions2d/distfunctions2d.htm
function box(x,y,center_x,center_y,width,height) {
	x = sub(x, center_x);
	y = add(y, center_y);
	let d_x = sub(abs(x), width);
	let d_y = sub(abs(y), height);
	let k = min(max(d_x, d_y),0);
	let len = sqrt(add(square(max(d_x,0)), square(max(d_y, 0))));
	return add(len, k);
}

function func(x, y, t) {
	
	let c1 = circle(x,y,-1.5,1.8,1);
	let c2 = circle(x,y,1.5,-1.8,1);
	let b1 = box(x,y,1.5,1.8,1,1);
	let b2 = box(x,y,-1.5,-1.8,1,1);

	let c3 = circle(x,y,sub(mult(t,10),3),0,0.5);
	
	// let c1 = circle(x,y,-1.5,1.8,1);
	// let c2 = circle(x,y,1.5,1.8,1);
	// let c3 = circle(x,y,sub(mult(t,30),2),0,1);
	// let b1 = box(x,y,0,-1.5,1.5,0.7);

	return smin(min(min(c1,c2), min(b1, b2)), c3);

	return min(c1,min(c2,min(b1,min(b2))));
	//return min(func(x,y,t), func2(sub(x,t),y,t));
}

// function func(x, y, t) {
	
// 	return circle(x,y,0,0,mult(t,1));
// }

// function func(x, y, t) {
	
// 	let c1 = circle(x,y,0,0,mult(t,1));

// 	return c1;

// 	let c2 = circle(x,y,-1,1,1);

// 	return min(c1,c2);
// }

function Region(xmin, xmax, ymin, ymax, tmin, tmax) {
	this.xmin = xmin;
	this.xmax = xmax;
	this.ymin = ymin;
	this.ymax = ymax;
	this.tmin = tmin;
	this.tmax = tmax;
	this.fmin = 0;
	this.fmax = 0;

	this.x_interval = [this.xmin, this.xmax];
	this.y_interval = [this.ymin, this.ymax];
	this.t_interval = [this.tmin, this.tmax];
	this.f_interval = [this.fmin, this.fmax];

	this.dx = this.xmax - this.xmin;
	this.dy = this.ymax - this.ymin;
	this.dt = this.tmax - this.tmin;
	this.df = this.fmax - this.fmin;
	this.last_df = -1;
	this.last_df_time = -2;

	this.children = [];
	this.parent;

	this.x_splits = 4;
	this.y_splits = 4;

	// 1 = inside, -1 = outside, 0 = ambiguous
	this.filled = -1; // important that it starts undefined
	this.evaluated = 0;

	this.change_t = function(tmin, tmax) {
		this.tmin = tmin;
		this.tmax = tmax;

		this.t_interval = [this.tmin, this.tmax];
		this.dt = this.tmax - this.tmin;
	}

	this.change_f = function(fmin, fmax) {
		this.fmin = fmin;
		this.fmax = fmax;

		this.f_interval = [this.fmin, this.fmax];
		// this.last_df = this.df;
		this.df = this.fmax - this.fmin;
	}

	this.add_child = function(region) {
		this.children.push(region);
		region.parent = this;
	}

	this.draw_timeleft = function() {
		let len = this.tmax - t;
		len /= this.max_lookahead * dt;
		len *= 255;

		canvas1.ctx.fillStyle = `rgb(${len},${len},${len})`;
		canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);

		for (child of this.children) {
			child.draw_timeleft();
		}
	}

	this.draw_test = function() {
		let len = Math.abs(this.last_df-this.df)*1000;

		canvas1.ctx.fillStyle = `rgb(${len},${len},${len})`;
		canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);

		for (child of this.children) {
			child.draw_test();
		}
	}


	this.draw_outlines = function() {
		canvas1.ctx.strokeStyle = `rgb(255,0,255)`;
		canvas1.ctx.strokeRect(this.xmin, this.ymin, this.dx, this.dy);

		for (child of this.children) {
			child.draw_outlines();
		}
	}

	this.draw = function() {
		//canvas1.ctx.strokeStyle = `rgb(255,0,255)`;
		//canvas1.ctx.strokeRect(this.xmin, this.ymin, this.dx, this.dy);

		//if (this.filled == 1) {
			// let len = this.multiplier;
			// canvas1.ctx.fillStyle = `rgb(${len},${len},${len})`;
			// canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		//}

		if (this.filled == 1) {
			let len = 255;
			canvas1.ctx.fillStyle = `rgb(${len},${len},${len})`;
			canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		}

		// if (this.filled == -1) {
		// 	let len = 255;
		// 	canvas1.ctx.fillStyle = `rgb(0,50,0)`;
		// 	canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		// }




		// //if (this.filled == 1) {

		// 	let max_dt = 500*dt;

		// 	// let len = this.tmax - t;
		// 	// len *= 10000;

		// 	let len = this.tmax - t;
		// 	len /= max_dt;
		// 	len *= 255;

		// 	//let len = Math.log(this.df*100)*50;

		// 	canvas1.ctx.fillStyle = `rgb(${len},${len},${len})`;
		// 	canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		// 	//return;
		// //}

		for (child of this.children) {
			child.draw();
		}
	}

	this.draw_color = function(color) {
		canvas1.ctx.fillStyle = color;
		canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		return;
	}

	this.draw_red = function() {
		canvas1.ctx.fillStyle = `rgba(255,0,0,0.7)`;
		canvas1.ctx.fillRect(this.xmin, this.ymin, this.dx, this.dy);
		return;
	}

	this.child_count = function() {
		return this.children.length;
	}

	this.is_leaf = function() {
		return this.child_count() == 0;
	}

	this.is_valid = function(t) {
		return this.tmin <= t && t <= this.tmax;
	}

	this.intersect_point = function(x, y) {
		return this.xmin <= x && this.xmax >= x && this.ymin <= y && this.ymax >= y;
	}

	this.get_leaf = function(x, y) {
		if (this.is_leaf()) {return this;}

		for (child of this.children) {
			if (child.intersect_point(x,y)) {
				return child.get_leaf(x,y);
			}
		}
	}

	this.eval_no_time = function(t) {
		let f = func(this.x_interval, this.y_interval, [t,t]);
		this.change_t(t[0], t[1]);
		this.change_f(f[0], f[1]);
		this.children = [];
		evaluations += 1;

		if (f[1] < 0) {
			this.filled = 1;
			return;
		} else if (0 < f[0]) {
			this.filled = -1;
			return;
		} else {
			if (this.dx <= min_dx && this.dy <= min_dy) {
				this.filled = 0;
				return;
			}

			let split_dx = this.dx/this.x_splits;
			let split_dy = this.dy/this.y_splits;

			for (let i=0; i<this.x_splits; i++) {
				for (let j=0; j<this.y_splits; j++) {
					let child_region = new Region(
						this.xmin + i*split_dx,
						this.xmin + i*split_dx + split_dx,
						this.ymin + j*split_dy,
						this.ymin + j*split_dy + split_dy,
						t,
						t
					);
					this.add_child(child_region);
					child_region.eval_no_time(t);
				}
			}
		}
	}

	this.max_lookahead = 100;
	this.multiplier = 1;

	this.classify_f = function(f_interval) {
		if (f_interval[1] <= 0) {
			return 1;
		} else if (0 <= f_interval[0]) {
			return -1;
		} else {
			return 0;
		}
	}

	this.eval1 = function(t, t_interval) {
		if (!this.evaluated || t >= this.tmax) {
			//this.change_t(t, t+this.max_lookahead*dt);


			// hmm this doesn't do well here since false positives split spatially
			// let test_t_interval;
			
			// if (this.parent != undefined) {
			// 	test_t_interval = t_interval === undefined ? [t,t+Math.random()*this.parent.df/2] : t_interval;	
			// } else {
			// 	test_t_interval = t_interval === undefined ? [t,t+100*Math.random()*this.max_lookahead*this.multiplier*dt] : t_interval;
			// }
			


			let test_t_interval;
			
			// if (this.parent != undefined) {
			// 	test_t_interval = t_interval == undefined ? [t,t+this.parent.dt*Math.random()*this.max_lookahead*dt] : t_interval;
			// } else {
			// 	test_t_interval = t_interval == undefined ? [t,t+100000000*Math.random()*this.max_lookahead*dt] : t_interval;
			// }
			test_t_interval = t_interval == undefined ? [t,t+Math.random()*0.2*this.max_lookahead*dt] : t_interval;

			// let test_t_interval;
			
			// if (this.parent != undefined) {
			// 	test_t_interval = t_interval === undefined ? [t,t+Math.random()*this.parent.df/8] : t_interval;	
			// 	// test_t_interval = t_interval === undefined ? [t,t+this.multiplier*Math.random()*this.parent.df/4] : t_interval;	
			// } else {
			// 	test_t_interval = t_interval === undefined ? [t,t+Math.random()*this.max_lookahead*dt] : t_interval;
			// }
			

			this.change_t(test_t_interval[0], test_t_interval[1]);
			//this.change_t(t, t+Math.random()*this.max_lookahead*dt);
			//this.change_t(t, dt*Math.max(-(Math.abs(this.last_df-this.df))+this.max_lookahead, dt))

			let f = func(this.x_interval, this.y_interval, this.t_interval);
			this.last_df = this.df;
			this.change_f(f[0], f[1]);
			
			this.evaluated = true;
			evaluations += 1;
			if (draw_mode == 2) {
				this.draw_color(`rgba(255,0,0,0.5)`);
			}
			

			if (f[1] <= 0) {
				this.filled = 1;
				this.children = [];
				//return this.filled;
			} else if (0 <= f[0]) {
				this.filled = -1;
				this.children = [];
				//return this.filled;
			} else {

				if (this.dx <= min_dx && this.dy <= min_dy) {

					// if (Math.abs(this.last_df-this.df) == 0) {
					// 	return this.filled;
					// }

					if (this.dt > 0) {
						this.change_t(t,t);
						this.eval1(t, [t,t]);
						//return this.filled;
					} else {
						this.filled = 0;
						//return this.filled;
					}
					return this.filled;
				}

				this.filled = 0;
				if (this.is_leaf()) {
					let split_dx = this.dx/this.x_splits;
					let split_dy = this.dy/this.y_splits;

					for (let i=0; i<this.x_splits; i++) {
						for (let j=0; j<this.y_splits; j++) {
							let child_region = new Region(
								this.xmin + i*split_dx,
								this.xmin + i*split_dx + split_dx,
								this.ymin + j*split_dy,
								this.ymin + j*split_dy + split_dy,
								t,
								t
							);
							this.add_child(child_region);
						}
					}
				} else {
					
				}
			}
		}
		for (child of this.children) {
			child.eval1(t);
		}

		return this.filled;
	}

	this.children_same_state = false;

	this.eval_mods = function(t, t_interval) {

		this.multiplier = Math.min(this.multiplier, 200);

		if (t >= this.tmax || t_interval !== undefined) {
			let test_t_interval;

			if (t_interval == undefined) {
				
				// if (this.parent == undefined) {
				// 	test_t_interval = [t,t+500*Math.random()*this.max_lookahead*dt];
				// } else {
				// 	test_t_interval = [t,t+this.parent.dt*Math.random()/4];
				// }

				//test_t_interval = [t,t+10*Math.random()*this.max_lookahead*dt];

				//if (this.filled == undefined) {
					//test_t_interval = [t,t+Math.random()*this.max_lookahead*dt];
				//} else {
					if (this.parent != undefined) {
						test_t_interval = [t,t+this.parent.dt*0.5*this.multiplier*Math.random()*this.max_lookahead*dt];
					} else {
						test_t_interval = [t,t+this.multiplier*Math.random()*this.max_lookahead*dt];
					}
					
				//}
			} else {
				test_t_interval = t_interval;
			}

			let f = func(this.x_interval, this.y_interval, test_t_interval);
			let state = this.classify_f(f);
			this.last_df = this.df;
			this.change_f(f[0], f[1]);
			evaluations += 1;
			if (draw_mode == 1) {
				this.draw_color(`rgba(0,255,255,0.4)`);
			}
			

			if (state == 1) {
				if (this.filled == 1) {
					this.multiplier *= 2;
				} else {
					this.multiplier = 1;
				}
				this.change_t(test_t_interval[0], test_t_interval[1]);
				this.filled = state;
				this.children = [];
				return this.filled;
			} else if (state == -1) {
				if (this.filled == -1) {
					this.multiplier *= 2;
				} else {
					this.multiplier = 1;
				}
				this.change_t(test_t_interval[0], test_t_interval[1]);
				this.filled = state;
				this.children = [];
				return this.filled;
			} else {
				
				if (this.filled == 0) {
					this.multiplier *= 2;
				} else {
					this.multiplier = 1;
				}

				if (this.dx <= min_dx && this.dy <= min_dy) {
					if (Math.abs(this.last_df-this.df) == 0) {
						this.change_t(test_t_interval[0], test_t_interval[1]);
						this.multiplier *= 2;
						this.filled = 0;
						return this.filled;
					}
					
					if (test_t_interval[1] - test_t_interval[0] > dt) { // if time interval is large
						this.filled = this.eval_mods(t, [t,t]); // make it small and reevaluate
					} else { // else
						this.change_t(test_t_interval[0], test_t_interval[1]);
						this.filled = 0;
					}
					
					//return this.filled;
				} else {

					// if ((test_t_interval[1] - test_t_interval[0] > 10*dt && this.filled == 0)) {
					// 	// hmm
					// }
					
					if ((test_t_interval[1] - test_t_interval[0] > dt && this.filled != state) && this.filled != undefined) {
						//let new_t = [t,t];

						let new_t = [t, t+(test_t_interval[1]-test_t_interval[0])/32];

						// if (this.filled == undefined) {
						// 	this.filled = 0;
						// }
						this.multiplier = 1;
						this.filled = this.eval_mods(t, new_t); //hmm
						return this.filled; // hmm
					} else {
						this.filled = state;
						this.change_t(test_t_interval[0], test_t_interval[1]);
						if (this.is_leaf()) {
							let split_dx = this.dx/this.x_splits;
							let split_dy = this.dy/this.y_splits;
		
							for (let i=0; i<this.x_splits; i++) {
								for (let j=0; j<this.y_splits; j++) {
									let child_region = new Region(
										this.xmin + i*split_dx,
										this.xmin + i*split_dx + split_dx,
										this.ymin + j*split_dy,
										this.ymin + j*split_dy + split_dy,
										-1,
										-1
									);
									this.add_child(child_region);
								}
							}
						}
					}

				}
			}
		}

		// for (child of this.children) {
		// 	child.eval(t);
		// }

		if (!this.is_leaf()) {
			let filled_children = 0;
			let empty_children = 0;
	
			for (child of this.children) {
				let child_state = child.eval_mods(t);
				if (child_state == 1) {
					filled_children += 1;
				} else if (child_state == -1) {
					empty_children += 1;
				}
			}

			if (filled_children == this.children.length || empty_children == this.children.length) {

				// if we just transitioned to having same state children, trigger a reevaluation
				// if (this.children_same_state == false) {
				// 	//this.tmax = 0;
				// }
				
				this.tmax = 0;
				this.multiplier = 0.01;
				this.children_same_state = true;

				//this.children_same_state = true;

				// if (this.children_same_state) {
				// 	this.multiplier = 1;
				// 	//this.tmax = this.tmin + (this.tmax-this.tmin)/2;
				// 	this.tmax = 0;
				// 	this.children_same_state = false;
				// } else {
				// 	this.children_same_state = true;
				// }

			} else {
				//this.children_same_state = false;
			}
		}
		return this.filled;
	}
}

let t = 0;
let dt = 0.001;

let paused = false;
var evaluations = 0;

let min_dx = 0.1;
let min_dy = 0.1;
let x_scale = 50;

let domain_regions = [
	new Region(-3, 3, -3, 3, -1, -1),
	new Region(-3, 3, -3, 3, -1, -1),
	new Region(-3, 3, -3, 3, -1, -1)
]

let plots = [
	{color: `rgb(0,0,0)`, data: []},
	{color: `rgb(0,0,255)`, data: []},
	{color: `rgb(255,0,0)`, data: []}
];

function draw() {

	//console.log(domain_regions[1].f_interval);

	t += paused ? 0 : dt;

	canvas1.update_transform();
	canvas2.update_transform();

	canvas1.clear(`rgb(0,0,0)`);
	canvas2.clear(`rgb(255,255,255)`);
	
	canvas1.pixel_width();
	canvas2.pixel_width();

	canvas1.draw_axes();
	canvas2.draw_axes();
	canvas2.draw_ticks();
	
	//domain_region2.draw();
	//domain_region.eval(t);
	
	//console.log(evaluations);
	//domain_region2.draw();
	//domain_region2.draw_timeleft();
	//domain_region2.draw_test();

	//domain_region2.draw_outlines();

	domain_regions[draw_mode].draw();
	domain_regions[draw_mode].draw_outlines();

	if (!paused) {
		evaluations = 0;
		domain_regions[0].eval_no_time(t);
		plots[0].data.push(evaluations);

		evaluations = 0;
		domain_regions[1].eval_mods(t);
		plots[1].data.push(evaluations);

		evaluations = 0;
		domain_regions[2].eval1(t);
		plots[2].data.push(evaluations);
	}

	for (plot of plots) {
		canvas2.ctx.strokeStyle = plot.color;
		canvas2.ctx.beginPath();
		canvas2.ctx.beginPath();
		canvas2.ctx.moveTo(0, -plot.data[0]);
		for (let i=1; i<plot.data.length; i++) {
			canvas2.ctx.lineTo(i*x_scale, -plot.data[i]);
		}
		canvas2.ctx.stroke();
	}

	requestAnimationFrame(draw);
}

draw();
