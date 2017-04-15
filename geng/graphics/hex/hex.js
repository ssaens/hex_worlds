
const SQRT_3 = Math.sqrt(3);

DIRS = {
    HEX_NW : new Hex(0, -1),
    HEX_NE : new Hex(1, 1),
    HEX_E : new Hex(1, 0),
    HEX_SE : new Hex(0, 1),
    HEX_SW : new Hex(-1, 1),
    HEX_W : new Hex(-1, 0),
}

function Hex(q=0, r=0) {

    if (q instanceof Vec2D) {
        this.v = q.copy();
    } else {
        this.v = new Vec2D(q, r);
    }

    this.q = this.v.x;
    this.r = this.v.y;
    this.s = - this.q - this.r;

    this.add = function(h) {
        return Hex(this.v.copy().add(h.v));
    }

    this.sub = function(h) {
        return Hex(this.v.copy().sub(h.v));
    }

    this.mul = function(k) {
        return Hex(this.v.copy().mul(k));
    }

    this.len = function(h) {
        if (Math.sign(h.q) == Math.sign(h.r))
            return Math.abs(h.q + h.r)
        else
            return Math.max(Math.abs(h.q), Math.abs(h.r))
    }

    this.dist = function(h) {
        return this.len(new Hex(this.v.copy().sub(h.v)));
    }

    this.neighbor = function(dir) {
        return new Hex(this.add(dir));
    }

    this.corners = function(layout) {
        var corners = [];
        var center = hex_to_world(layout, this);
        for (var i = 0; i < 6; i++) {
            var offset = hex_corner_offset(layout, i);
            corners.push(new Vec2D(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }

    this.copy = function() {
        return new Hex(this.v);
    }

    this.equals = function(h) {
        return this.q == h.q && this.r == h.r && this.s == h.s;
    }

    this.trace = function(gc, layout) {
        var corners = this.corners(layout);
        corners.push(corners[0]);
        var center = hex_to_world(layout, this);
        gc.moveTo(corners[0].x, corners[0].y);
        gc.beginPath();
        for (var i = 0; i < 6; ++i) {
            var c = corners[i];
            gc.lineTo(c.x, c.y);
        }
        gc.closePath();
    }

    this.draw = function(gc, layout, opts={lineWidth: 1, color: '#000000', fill: "rgba(255, 255, 255, 0)"}) {
        this.trace(gc, layout);
        gc.lineWidth = opts.lineWidth;
        gc.strokeColor = opts.color;
        gc.fillStyle = opts.fill;
        gc.fill();
        gc.stroke();
    }

    this.toString = function() {
        return this.v.toString();
    }
}

function Orientation(   f0, f1, f2, f3,
                        b0, b1, b2, b3,
                        start_angle) {
    this.f0 = f0;
    this.f1 = f1;
    this.f2 = f2;
    this.f3 = f3;
    this.b0 = b0;
    this.b1 = b1;
    this.b2 = b2;
    this.b3 = b3;
    this.start_angle = start_angle;
}

const h_aligned = new Orientation(  SQRT_3, SQRT_3/2, 0, 1.5,
                                    SQRT_3/3, -1/3, 0, 2/3,
                                    0.5);
const v_aligned = new Orientation(  1.5, 0, SQRT_3/2, SQRT_3,
                                    2/3, 0, -1/3, SQRT_3/3,
                                    0.0);

function Layout(orientation, size_v, orig_v) {
    this.orientation = orientation;
    this.size = size_v;
    this.origin = orig_v;
}

function hex_to_world(layout, h) {
    var M = layout.orientation;
    var x = (M.f0 * h.q + M.f1 * h.r) * layout.size.x;
    var y = (M.f2 * h.q + M.f3 * h.r) * layout.size.y;
    return new Vec2D(x + layout.origin.x, y + layout.origin.y);
}

function hex_round(h) {
    var q = Math.round(h.q);
    var r = Math.round(h.r);
    var s = Math.round(h.s);
    var dq = Math.abs(q - h.q);
    var dr = Math.abs(r - h.r);
    var ds = Math.abs(s - h.s);
    if (dq > dr && dq > ds) {
        q = -r - s;
    } else if (dr > ds) {
        r = -q - s;
    } else {
        s = -q - r;
    }
    return new Hex(q, r);
}

function world_to_hex(layout, p) {
    var M = layout.orientation;
    var pt = new Vec2D((p.x - layout.origin.x) / layout.size.x,
                                   (p.y - layout.origin.y) / layout.size.y);
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;
    return hex_round(Hex(q, r));
}

function hex_corner_offset(layout, corner_num) {
    var size = layout.size;
    var angle = 2.0 * Math.PI * (layout.orientation.start_angle + corner_num) / 6;
    return new Vec2D(size.x * Math.cos(angle), size.y * Math.sin(angle));
}

function lerp(a, b, t) {
    return a * (1-t) + b * t;
}

function hex_lerp(a, b, t) {
    return new Hex(lerp(a.q, b.q, t), lerp(a.r, b.r, t));
}

function hex_path(a, b) {
    var N = a.dist(b);
    var a_nudge = new Hex(a.q + 1e-6, a.r + 1e-6);
    var b_nudge = new Hex(b.q + 1e-6, b.r + 1e-6);
    var path = [];
    var step = 1.0 / Math.max(N, 1);
    for (var i = 0; i <= N; i++) {
        path.push(hex_round(hex_lerp(a_nudge, b_nudge, step * i)));
    }
    return path;
}
