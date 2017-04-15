
function Vec2D(x=0, y=0) {
    this.x = x;
    this.y = y;

    this.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    this.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    this.mul = function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    }

    this.div = function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    }

    this.dot = function(v) {
        return this.x * v.x + this.y * v.y;
    }

    this.unit = function() {
        var norm = this.norm()
        if (norm == 0) {
            return new Vec2D(0, 0);
        }
        return new Vec2D(this.x / norm, this.y / norm);
    }

    this.normalize = function() {
        var norm = this.norm();
        if (norm != 0) {
            this.x /= norm;
            this.y /= norm;
        }
        return this;
    }

    this.norm = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    this.list = function() {
        return [this.x, this.y];
    }

    this.copy = function() {
        return new Vec2D(this.x, this.y);
    }

    this.toString = function() {
        return '(' + this.x + ', ' + this.y + ')';
    }

}

function Vec3D(x=0, y=0, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    this.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    this.mul = function(k) {
        this.x *= k;
        this.y *= k;
        this.z *= k;
        return this;
    }

    this.div = function(k) {
        this.x /= k;
        this.y /= k;
        this.z /= k;
        return this;
    }

    this.dot = function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    this.unit = function() {
        var norm = this.norm()
        if (norm == 0) {
            return new Vec3D(0, 0, 0);
        }
        return new Vec3D(this.x / norm, this.y / norm, this.z / norm);
    }

    this.normalize = function() {
        var norm = this.norm();
        if (norm != 0) {
            this.x /= norm;
            this.y /= norm;
            this.z /= norm;
        }
        return this;
    }

    this.norm = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    this.list = function() {
        return [this.x, this.y, this.z];
    }

    this.copy = function() {
        return new Vec3D(this.x, this.y, this.z);
    }

    this.toString = function() {
        return '(' + this.x + ', ' + this.y + ', ' + this.z  + ')';
    }
}

function vec_add(v1, v2) {
    return v1.copy().add(v2);
}

function vec_sub(v1, v2) {
    return v1.copy().sub(v2);
}

function vec_mul(v1, k) {
    return v1.copy().mul(k);
}

function vec_div(v1, k) {
    return v1.copy().div(k);
}

function vec_dot(v1, v2) {
    return v1.copy().dot(v2);
}

function Rect(left = 0, top = 0, w = 0, h = 0) {
    this.left = left;
    this.top = top;
    this.w = w;
    this.h = h;

    this.containns = function(p) {
        return (this.left <= this.p.x && this.p.x <= this.left + this.w) &&
            (this.top <= this.p.x && this.p.x <= this.top + this.h);
    }
}
