
function Texture() {
    this.image = new Image();
    this.rect = new Rect();

    this.set_src = function(src, rect) {
        this.image.src = src;
        this.rect = rect;
    }

    this.draw = function(gc, dst_rect) {
        gc.drawImage(this.image, this.rect.left, this.rect.top, this.rect.w, this.rect.h,
                    dst_rect.left, dst_rect.top, dst_rect.w, dst_rect.h);
    }

    this.size = function() {
        return new Vec2D(this.rect.w, this.rect.h);
    }

}


function Sprite() {

    this.pos = new Vec2D();
    this.size = new Vec2D();
    this.origin = new Vec2D();
    this.tex = new Texture();

    this.set_tex = function(tex) {
        this.tex = tex;
        this.size = this.tex.size();
    }

    this.bbox = function() {
        return new Rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    this.set_pos = function(pos) {
        this.pos = new Vec2D(Math.round(pos.x), Math.round(pos.y));
    }
    
    this.set_origin = function(orig) {
        this.origin = new Vec2D(Math.floor(orig.x), Math.floor(orig.y));
    }

    this.set_size = function(size) {
        this.size = size;
    }

    this.draw = function(gc) {
        var bbox = this.bbox();
        bbox.left = bbox.left - this.origin.x;
        bbox.top = bbox.top - this.origin.y;
        this.tex.draw(gc, bbox);
    }
}
