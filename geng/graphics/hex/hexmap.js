function Map() {
    this.map = {}
    this.get_tile = function(q, r) {
        if (q instanceof Hex) {
            return this.map[31 * q.q, q.r];
        }
        return this.map[31 * q + r];
    }
    this.insert = function(hex) {
        this.map[31 * hex.q + hex.r] = hex;
    }
    this.as_list = function() {
        tiles = [];
        for (var key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                tiles.push(this.map[key]);
            }
        }
        return tiles;
    }
}

function MapGenerator(opts = {
        elev_weights : [1, 0.5, 0.25, 0.13, 0.06, 0.03],
        moist_weights : [1, 0.75, 0.33, 0.33, 0.33, 0.5],
        e : 0.5,
        island : false,
    }) {

    this.e_seed = Math.floor(Math.random() * Number.MAX_SAFE_INT);
    this.m_seed = Math.floor(Math.random() * Number.MAX_SAFE_INT) ^ this.e_seed;
    this.e_gen = new SimplexNoise();
    this.m_gen = new SimplexNoise();
    this.elev_weights = opts.elev_weights;
    this.moist_weights = opts.moist_weights;
    this.e = opts.e;
    this.island = opts.island;

    this.seed_e = function(seed) {
        this.e_seed = seed;
    }

    this.seed_m = function(seed) {
        this.m_seed = seed;
    }
    
    this.e_noise = function(x, y) {
        return this.e_gen.noise2D(x - this.e_seed, y - this.e_seed ) / 2 + 0.5;
    }

    this.m_noise = function(x, y) {
        return this.m_gen.noise2D(x - this.m_seed, y - this.m_seed) / 2 + 0.5;
    }

    this.generate_hex_map = function(radius, layout) {
        var map = new Map();
        for (var q = -radius; q <= radius; ++q) {
            var r1 = Math.max(-radius, -q - radius);
            var r2 = Math.min(radius, -q + radius);
            for (var r = r1; r <= r2; ++r) {
                map.insert(new Hex(q, r));
            }
        }
        return map;
    }

    this.generate_rect_map = function(width, height, layout, ij_to_qrs={i : 1, j : 0}) {
        var map = new Map();
        for (var i = 0; i < height; ++i) {
            var i_offset = i >> 1;
            for (var j = -i_offset; j < width - i_offset; ++j) {
                var missing = 3 - ij_to_qrs.i - ij_to_qrs.j;
                var q, r;
                switch(ij_to_qrs.i) {
                    case 0: q = i; break;
                    case 1: r = i; break;
                }
                switch(ij_to_qrs.j) {
                    case 0: q = j; break;
                    case 1: r = j; break;
                }
                switch(missing) {
                    case 0: q = -i - j; break;
                    case 1: r = -i - j; break;
                }
                map.insert(new Hex(q, r));
            }
        }
        return map;
    }

    this.generate_rhom_map = function(width, height, layout) {
        var map = new Map();
        for (var r = 0; r < height; ++r) {
            for (var q = 0; q < width; ++q) {
                map.insert(new Hex(q, r));
            }
        }
        return map;
    }

    this.generate_tri_map = function(side_len, layout) {
        var map = new Map();
        for (var q = 0; q < side_len; q++) {
            for (var r = 0; r < side_len - q; r++) {
                map.insert(new Hex(q, r));
            }
        }
        return map;
    }

    this.get_elevation = function(x, y, w, h) {
        var nx = x / w - 0.5, ny = y / h - 0.5;
        var freq = 1, elevation = 0, weight_sum = 0;
        for (var i = 0; i < this.elev_weights.length; ++i) {
            var w = this.elev_weights[i];
            elevation += w * this.e_noise(freq * nx, freq * ny);
            freq *= 2;
            weight_sum += w;
        }
        elevation /= weight_sum;
        return Math.pow(elevation, this.e);
    }

    this.get_moisture = function(x, y, w, h) {
        var nx = x / w - 0.5, ny = y / h - 0.5;
        var freq = 1, moisture = 0, weight_sum = 0;
        m_noise = this.m_noise;
        for (var i = 0; i < this.moist_weights.length; ++i) {
            var w = this.moist_weights[i];
            moisture += w * this.m_noise(freq * nx, freq * ny);
            freq *= 2;
            weight_sum += w;
        }
        moisture /= weight_sum;
        return Math.pow(moisture, this.e);
    }

    this.biome = function(elevation, moisture) {

    }

}
