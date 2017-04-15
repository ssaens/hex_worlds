WORLD_RADIUS = 6;
HEX_WIDTH = 37.5;
HEX_HEIGHT = 32;
HEX_BASE = 21;

function Tile(hex, height, layout, biome_id) {
    
    this.hex = hex;
    this.height = height;
    this.L = layout;
    this.biome = biomeManager.get_biome(biome_id);
    
    this.build_stack = function() {
        this.stack = [];
        var pos = hex_to_world(this.L, this.hex);
        var offset = new Vec2D(0, HEX_BASE)
        for (var i = 0; i < height - 1; ++i) {
            var s = new Sprite();
            s.set_tex(textureManager.get_texture(this.biome.base_id))
            s.set_pos(pos);
            s.set_origin(new Vec2D(0.5 * HEX_WIDTH, HEX_HEIGHT));
            pos.sub(offset);
            this.stack.push(s)
        }
        var cap = new Sprite();
        cap.set_tex(textureManager.get_texture(this.biome.cap_id));
        cap.set_pos(pos);
        cap.set_origin(new Vec2D(0.5 * HEX_WIDTH, HEX_HEIGHT));
        this.stack.push(cap);
    }
    
    this.draw = function(gc) {
        for (var i = 0; i < this.stack.length; ++i) {
            this.stack[i].draw(gc);
        }
    }
    
    this.build_stack();

}

function Biome(cap_id, base_id) {
    this.cap_id = cap_id;
    this.base_id = base_id;
}

function World() {
    
    this.map_view = null;
    this.L = null;
    
    this.main = function() {
        this.init();
        this.draw();
    }

    this.init = function() {
        this.time = 0;
        textureManager.load_textures();
        biomeManager.load_biomes();
        this.map_view = document.getElementById('map');
        this.background_view = document.getElementById('background');
        this.stars_view = document.getElementById('stars');
        this.resize();
        this.stars_view.style.backgroundImage = 'url("assets/stars.png")';
        console.log(this.stars_view.style.backgroundImage)
        this.gen = new MapGenerator();
        this.map = this.make_map();
    }
    
    this.resize = function() {
        this.map_view.width = document.body.clientWidth;
        this.map_view.height = document.body.clientHeight;
        this.background_view.width = document.body.clientWidth;
        this.background_view.height = document.body.clientHeight;
        this.stars_view.width = document.body.clientWidth;
        this.stars_view.height = document.body.clientHeight;
        var center = new Vec2D(this.map_view.width / 2, this.map_view.height / 2)
        this.L = new Layout(h_aligned, new Vec2D(HEX_WIDTH, HEX_HEIGHT), center);
    }

    this.make_map = function() {
        var map = this.gen.generate_hex_map(WORLD_RADIUS);
        this.tiles = [];
        for (var q = -WORLD_RADIUS; q <= WORLD_RADIUS; ++q) {
            var r1 = Math.max(-WORLD_RADIUS, -q - WORLD_RADIUS);
            var r2 = Math.min(WORLD_RADIUS, -q + WORLD_RADIUS);
            for (var r = r1; r <= r2; ++r) {
                var curr_hex = map.get_tile(r, q);
                var pos = hex_to_world(this.L, curr_hex);
                var e = this.gen.get_elevation(pos.x, pos.y, WORLD_RADIUS, WORLD_RADIUS);
                var d = Math.max(Math.abs(curr_hex.q), Math.abs(curr_hex.r), Math.abs(curr_hex.s)) / WORLD_RADIUS;
                e = (e + 0.05) * Math.max((1.2 - Math.pow(d, 1.5)), 0);
                e = Math.pow(e, 1.5);
                var m = this.gen.get_moisture(pos.x, pos.y, WORLD_RADIUS, WORLD_RADIUS);
                var height = Math.round(e * MAX_HEIGHT);
                var biome_id = this.get_biome(e, m);
                this.tiles.push(new Tile(map.get_tile(r, q), height, this.L, biome_id));
            }
        }
    }
    
    this.get_biome = function(e, m) {
        if (e < 0.13) return BiomeID.BIOME_OCEAN;
        if (e < 0.2) return BiomeID.BIOME_DESERT;

        if (e > 0.8) {
            if (m < 0.1) return BiomeID.BIOME_MOUNTAIN;
            if (m < 0.2) return BiomeID.BIOME_MOUNTAIN;
            if (m < 0.5) return BiomeID.BIOME_SNOW;
            return BiomeID.BIOME_SNOW;
        }

        if (e > 0.6) {
            if (m < 0.33) return BiomeID.BIOME_DESERT;
            if (m < 0.66) return BiomeID.BIOME_GRASS;
            return BiomeID.BIOME_SNOW;
        }

        if (e > 0.3) {
            if (m < 0.16) return BiomeID.BIOME_DESERT;
            if (m < 0.50) return BiomeID.BIOME_GRASS;
            if (m < 0.83) return BiomeID.BIOME_GRASS;
            return BiomeID.BIOME_GRASS;
        }

        if (m < 0.16) return BiomeID.BIOME_DESERT;
        if (m < 0.33) return BiomeID.BIOME_GRASS;
        if (m < 0.66) return BiomeID.BIOME_GRASS;
                
        return BiomeID.BIOME_GRASS;
    }
    
    this.update = function(dt) {
        var sec = dt / 1000;
        this.time = this.time + sec;
        if (this.time / MIN_PER_HOUR > NUM_HOURS) {
            this.time = 0;
        }
        this.draw();
    }
    
    this.get_backdrop = function() {
        var hour = Math.floor(this.time / MIN_PER_HOUR);
        var next = (hour + 1) % NUM_HOURS;
        var t = (this.time / MIN_PER_HOUR - hour);
        var b1 = Backgrounds[hour];
        var b2 = Backgrounds[next];
        return lerp_background(b1, b2, t);
    }

    this.draw = function() {
        var back_gc = this.background_view.getContext('2d');
        var grd = back_gc.createLinearGradient(0, 0, 0, this.map_view.height);
        var b = this.get_backdrop();
        grd.addColorStop(0, b.top);
        grd.addColorStop(1, b.bottom);
        back_gc.fillStyle = grd;
        back_gc.fillRect(0, 0, this.map_view.width, this.map_view.height);
        this.stars_view.style.opacity = '' + Math.max(Math.cos((this.time / MIN_PER_HOUR + 2) / NUM_HOURS * 2 * Math.PI), 0);
    }
    
    this.draw_map = function() {
        var gc = this.map_view.getContext('2d');
        for (var i = 0; i < this.tiles.length; ++i) {
            this.tiles[i].draw(gc, this.L);
        }
    }
}

function TextureManager() {
    this.textures = new Array(Object.keys(TextureID).length);
    this.sprite_sheet = './assets/fullTiles.png';
    
    this.load_textures = function() {
        var tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(195, 267, 65, 89));
        this.textures[TextureID.TEXTURE_GRASS] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(0, 356, 65, 89));
        this.textures[TextureID.TEXTURE_WATER] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(130, 178, 65, 89));
        this.textures[TextureID.TEXTURE_STONE] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(65, 267, 65, 89));
        this.textures[TextureID.TEXTURE_SNOW] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(130, 0, 65, 89));
        this.textures[TextureID.TEXTURE_SAND] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(65, 356, 65, 89));
        this.textures[TextureID.TEXTURE_DIRT] = tex;
        
        tex = new Texture();
        tex.set_src(this.sprite_sheet, new Rect(65, 0, 65, 89));
        this.textures[TextureID.TEXTURE_BASE] = tex;
    }
    
    this.get_texture = function(id) {
        return this.textures[id];
    }
}

function BiomeManager() {
    this.biomes = new Array(Object.keys(BiomeID).length);
    
    this.load_biomes = function() {
        this.biomes[BiomeID.BIOME_GRASS] = new Biome(TextureID.TEXTURE_GRASS, TextureID.TEXTURE_DIRT);
        this.biomes[BiomeID.BIOME_DESERT] = new Biome(TextureID.TEXTURE_SAND, TextureID.TEXTURE_SAND);
        this.biomes[BiomeID.BIOME_OCEAN] = new Biome(TextureID.TEXTURE_WATER, TextureID.TEXTURE_WATER);
        this.biomes[BiomeID.BIOME_MOUNTAIN] = new Biome(TextureID.TEXTURE_STONE, TextureID.TEXTURE_BASE);
        this.biomes[BiomeID.BIOME_SNOW] = new Biome(TextureID.TEXTURE_SNOW, TextureID.TEXTURE_BASE);
    }
    
    this.get_biome = function(id) {
        return this.biomes[id];
    }
}

var TextureID = {
    TEXTURE_GRASS : 0,
    TEXTURE_WATER : 1,
    TEXTURE_STONE : 2,
    TEXTURE_SNOW : 3,
    TEXTURE_SAND : 4,
    TEXTURE_DIRT : 5,
    TEXTURE_BASE : 6,
}

var BiomeID = {
    BIOME_GRASS : 0,
    BIOME_DESERT : 1,
    BIOME_OCEAN : 2,
    BIOME_MOUNTAIN : 3,
    BIOME_SNOW : 4,
}


function Background(top, bottom) {  
    this.top = top;
    this.bottom = bottom;
}

function lerp_background(b1, b2, t) {
    var top = lerp_color(b1.top, b2.top, t);
    var bottom = lerp_color(b1.bottom, b2.bottom, t);
    return new Background(top, bottom);
}

function lerp_color(a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

var Backgrounds = [
    new Background('#000000', '#000000'),
    new Background('#020111', '#20202c'),
    new Background('#020111', '#3a3a52'),
    new Background('#20202c', '#515175'),
    new Background('#40405c', '#8a76ab'),
    new Background('#4a4969', '#cd82ab'),
    new Background('#757abf', '#eab0d1'),
    new Background('#82addb', '#ebb2b1'),
    new Background('#94c5f8', '#b1b5ea'),
    new Background('#b7eaff', '#94dfff'),
    new Background('#9be2fe', '#67d1fb'),
    new Background('#90dffe', '#38a3d1'),
    new Background('#57c1eb', '#246fa8'),
    new Background('#2d91c2', '#1e528e'),
    new Background('#2473ab', '#5b7983'),
    new Background('#1e528e', '#9da671'),
    new Background('#1e528e', '#e9ce5d'),
    new Background('#154277', '#b26339'),
    new Background('#163c52', '#2f1107'),
    new Background('#071B26', '#240e03'),
    new Background('#010a10', '#2f1107'),
    new Background('#010a10', '#2f1107'),
    new Background('#090401', '#4b1d06'),
    new Background('#090401', '#4b1d06'),
    new Background('#00000c', '#150800'),
]

NUM_HOURS = Object.keys(Backgrounds).length;
MIN_PER_HOUR = 5;
MAX_HEIGHT = 6;
textureManager = new TextureManager();
biomeManager = new BiomeManager();