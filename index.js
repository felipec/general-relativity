const ctx = canvas.getContext('2d');

var size, scale;

const basis_a = [ [1, 0], [0, 1] ];
const basis_b = [ [1, 2], [-0.5, 0.25] ];
const vector = [ [3, 1] ];

ctx.lineCap = 'round';

Array.prototype.sumf = function(f) {
  return this.reduce((m, e, i) => m + f(e, i), 0);
}

function mul(a, b) {
  if (a[0].length != b.length) throw 'Bad size';
  const c = a.map(_ => new Array());
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      c[i][j] = b.sumf((bk, k) => a[i][k] * bk[j]);
    }
  }
  return c;
}

function inv(m) {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]];
}

const trans = inv(basis_b);

function draw_axis(v0, v1, color, axis_color) {
  let dx, dy, sx, sy, step;

  if (Math.abs(v1[0]) > Math.abs(v1[1])) {
    dx = size;
    sx = 0;
    dy = size * v1[1] / v1[0];
    sy = (v0[1] - v0[0] * v1[1] / v1[0]) * scale;
    step = sy;
  } else {
    dx = size * v1[0] / v1[1];
    sx = (v0[0] - v0[1] * v1[0] / v1[1]) * scale;
    dy = size;
    sy = 0;
    step = sx;
  }

  ctx.strokeStyle = color;
  ctx.beginPath();
  const n = Math.min(Math.abs(size / step) | 0, 50);
  for (let i = -n; i <= n; i++) {
    ctx.moveTo(-dx + sx * i, -dy + sy * i);
    ctx.lineTo(dx + sx * i, dy + sy * i);
  }
  ctx.stroke();

  if (!axis_color) return;

  ctx.strokeStyle = axis_color;
  ctx.beginPath();
  ctx.moveTo(-dx, -dy);
  ctx.lineTo(dx, dy);
  ctx.stroke();
}

function draw_grid(b0, b1, color, axis_color) {
  ctx.lineWidth = 2;

  draw_axis(b0, b1, color, axis_color);
  draw_axis(b1, b0, color, axis_color);
}

function draw_arrow(x0, y0, x1, y1, color) {
  const head_size = 16;
  const head_angle = Math.PI / 6;
  const width = 2;

  const angle = Math.atan2(y1 - y0, x1 - x0);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'square';

  const wx = width * Math.cos(angle);
  const wy = width * Math.sin(angle);
  const tox = x1 * scale - wx;
  const toy = y1 * scale - wy;

  ctx.beginPath();
  ctx.moveTo(x0 * scale, y0 * scale);
  ctx.lineTo(tox - wx, toy - wy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - head_size * Math.cos(angle - head_angle), toy - head_size * Math.sin(angle - head_angle));
  ctx.lineTo(tox - head_size * Math.cos(angle + head_angle), toy - head_size * Math.sin(angle + head_angle));
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

function redraw() {
  const p_trans = [
    [1 - (1 - trans[0][0]) * progress, 0 - (0 - trans[0][1]) * progress],
    [0 - (0 - trans[1][0]) * progress, 1 - (1 - trans[1][1]) * progress],
  ];

  const b_a = mul(basis_a, p_trans);
  const b_b = mul(basis_b, p_trans);
  const v = mul(vector, p_trans);

  draw_grid(b_a[0], b_a[1], 'hsl(210, 75%, 75%, 50%)', 'hsl(210, 100%, 90%, 75%)');
  draw_grid(b_b[0], b_b[1], 'hsl(330, 75%, 75%, 50%)');

  draw_arrow(0, 0, b_a[0][0], b_a[0][1], 'hsl(180, 100%, 75%)');
  draw_arrow(0, 0, b_a[1][0], b_a[1][1], 'hsl(150, 100%, 75%)');

  draw_arrow(0, 0, b_b[0][0], b_b[0][1], 'hsl(0, 100%, 75%)');
  draw_arrow(0, 0, b_b[1][0], b_b[1][1], 'hsl(30, 100%, 75%)');

  draw_arrow(0, 0, v[0][0], v[0][1], 'hsl(60, 100%, 75%)');
}

function resize_canvas() {
  const width = document.body.offsetWidth;
  const height = document.body.offsetHeight;
  let pr = window.devicePixelRatio;

  size = Math.max(width, height);

  if (pr > 1)
    pr = Math.floor(((1024 * 4) * Math.min((size * pr) / (1024 * 4), 1)) / size);

  canvas.width = width * pr;
  canvas.height = height * pr;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(pr, -pr);
  scale = size / 16;
  redraw();
}

var progress = 0;

function animation_callback(timestamp) {
  if (!this.first_timestamp) this.first_timestamp = timestamp;

  progress = (timestamp - this.first_timestamp) / (this.seconds * 1000);
  if (progress > 1.0) progress = 1.0;

  ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
  redraw();
  if (progress < 1.0) this.request();
};

const animation = {
  begin(seconds) {
    this.seconds = seconds;
    this.first_timestamp = null;
    this.request();
  },

  request() {
    this.request_id = requestAnimationFrame(animation_callback.bind(this));
  },
}

resize_canvas();
animation.begin(4);

window.addEventListener('resize', resize_canvas, false);
