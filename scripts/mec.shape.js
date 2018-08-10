/**
 * mec.shape (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * @method
 * @param {object} - plain javascript shape object.
 * @property {string} type - shape type ['fix'|'flt'|'slider'|'bar'|'beam'|'wheel'|'img'].
 */
mec.shape = {
    extend(shape) {
        if (shape.type && mec.shape[shape.type]) {
            Object.setPrototypeOf(shape, Object.assign({},this.prototype,mec.shape[shape.type]));
            shape.constructor();
        }
        return shape; 
    },
    prototype: {
        constructor() {}, // always parameterless .. !
        dependsOn(elem) { return false; }
    }
}

/**
 * @param {object} - fixed node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0] - initial angle.
 */
mec.shape.fix = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":'+this.p.id
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ' }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && this.w0 > 0.0001) // ~0.006°
            obj.w0 = this.w0;

        return obj;
    },
    draw(g) {
        g.use({grp:'nodfix',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - floating node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0] - initial angle.
 */
mec.shape.flt = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":'+this.p.id
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ' }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && this.w0 > 0.0001) // ~0.006°
            obj.w0 = this.w0;

        return obj;
    },
    draw(g) {
        g.use({grp:'nodflt',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
}

/**
 * @param {object} - slider shape.
 * @property {string} p - referenced node id for position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0] - initial angle / -difference.
 */
mec.shape.slider = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    /**
     * Check shape for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":'+this.p.id
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + (this.wref ? ',"wref":'+this.wref.id : '')
                + ' }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
        };

        if (this.w0 && this.w0 > 0.0001) // ~0.006°
            obj.w0 = this.w0;
        if (this.wref)
            obj.wref = this.wref.id;

        return obj;
    },
    draw(g) {
        const w = this.wref ? ()=>this.wref.w : this.w0 || 0;
        g.beg({x:()=>this.p.x,y:()=>this.p.y,w})
           .rec({x:-16,y:-10,b:32,h:20,ls:"@nodcolor",fs:"@linkfill",lw:1,lj:"round"})
         .end()
    }
}

/**
 * @param {object} - bar shape.
 * @property {string} p1 - referenced node id for start point position.
 * @property {string} p2 - referenced node id for end point position.
 */
mec.shape.bar = {
    init(model) {
        if (typeof this.p1 === 'string' && typeof this.p2 === 'string') {
            this.p1 = model.nodeById(this.p1);
            this.p2 = model.nodeById(this.p2);
        }
    },
    dependsOn(elem) {
        return this.p1 === elem || this.p2 === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p1":"'+this.p1.id+'","p2":"'+this.p2.id+'" }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p1: this.p1.id,
            p2: this.p2.id,
        };

        return obj;
    },
    draw(g) {
        const x1 = () => this.p1.x,
              y1 = () => this.p1.y,
              x2 = () => this.p2.x,
              y2 = () => this.p2.y;
        g.lin({x1,y1,x2,y2,ls:"@nodcolor",lw:8,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill2",lw:5.5,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill",lw:3,lc:"round"})
    }
}

/**
 * @param {object} - beam shape.
 * @property {string} p - referenced node id for start point position.
 * @property {string} wref - referenced constraint id for orientation.
 * @property {number} len - beam length
 */
mec.shape.beam = {
    init(model) {
        if (typeof this.wref === 'string' && this.len > 0) {
            this.p = model.nodeById(this.p);
            this.wref = model.constraintById(this.wref);
        } else {
            console.log('invalid definition of beam shape in model');
        }
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'","wref":"'+this.wref.id+'","len":"'+this.len+'" }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
            wref: this.wref.id,
            len: this.len
        };

        return obj;
    },
    draw(g) {
        const x1 = () => this.p.x,
              y1 = () => this.p.y,
              x2 = () => this.p.x + this.len*Math.cos(this.wref.w),
              y2 = () => this.p.y + this.len*Math.sin(this.wref.w);
        g.lin({x1,y1,x2,y2,ls:"@nodcolor",lw:8,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill2",lw:5.5,lc:"round"})
         .lin({x1,y1,x2,y2,ls:"@nodfill",lw:3,lc:"round"})
    }
}

/**
 * @param {object} - wheel shape.
 * @property {string} p - referenced node id for center point position, and ...
 * @property {string} [wref] - referenced constraint id for orientation and ...
 * @property {number} w0 - start / offset angle [rad].
 * @property {number} r - radius
 */
mec.shape.wheel = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'","w0":'+this.w0+',"r":'+this.r
                + (this.wref ? ',"wref":"'+this.wref.id+'"' : '')
                + ' }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            p: this.p.id,
            w0: this.w0,
            r: this.r
        };

        if (this.wref)
            obj.wref = this.wref.id;

        return obj;
    },
    draw(g) {
        const w = this.wref ? ()=>this.wref.w : this.w0 || 0, r = this.r, 
              sgamma = Math.sin(2*Math.PI/3), cgamma = Math.cos(2*Math.PI/3);
        g.beg({x:()=>this.p.x,y:()=>this.p.y,w})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:r-4,y2:0,ls:"@nodfill",lw:3,lc:"round"})

            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:(r-4)*sgamma,ls:"@nodfill",lw:3,lc:"round"})

            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodcolor",lw:8,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodfill2",lw:5.5,lc:"round"})
            .lin({x1:0,y1:0,x2:(r-4)*cgamma,y2:-(r-4)*sgamma,ls:"@nodfill",lw:3,lc:"round"})

            .cir({x:0,y:0,r:r-2.5,ls:"#e6e6e6",fs:"transparent",lw:5})
            .cir({x:0,y:0,r,ls:"@nodcolor",fs:"transparent",lw:1})
            .cir({x:0,y:0,r:r-5,ls:"@nodcolor",fs:"transparent",lw:1})
         .end()
    }
}

/**
 * @param {object} - image shape.
 * @property {string} uri - image uri
 * @property {string} p - referenced node id for center point position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0] - start / offset angle [rad].
 * @property {number} [xoff] - x offset value.
 * @property {number} [yoff] - y offset value.
 * @property {number} [scl] - scaling factor.
 */
mec.shape.img = {
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        if (typeof this.wref === 'string')
            this.wref = model.constraintById(this.wref);
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","uri":"'+this.uri+'","p":'+this.p.id+'"'
                + (this.wref ? ',"wref":'+this.wref.id : '')
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ((this.xoff && Math.abs(this.xoff) > 0.0001) ? ',"xoff":'+this.xoff : '')
                + ((this.yoff && Math.abs(this.yoff) > 0.0001) ? ',"yoff":'+this.yoff : '')
                + ((this.scl && Math.abs(this.scl - 1) > 0.0001) ? ',"scl":'+this.scl : '')
                + ' }';
    },
    toJSON() {
        const obj = {
            type: this.type,
            uri: this.uri,
            p: this.p.id
        };

        if (this.wref)
            obj.wref = this.wref.id;
        if (this.w0 && this.w0 > 0.0001) // ~0.006°
            obj.w0 = this.w0;
        if (this.xoff && Math.abs(this.xoff) > 0.0001)
            obj.xoff = this.xoff;
        if (this.yoff && Math.abs(this.yoff) > 0.0001)
            obj.yoff = this.yoff;
        if (this.scl && Math.abs(this.scl - 1) > 0.0001)
            obj.scl = this.scl;

        return obj;
    },
    draw(g) {
        const w0 = this.w0 || 0, w = this.wref ? ()=>this.wref.w + w0 : w0; 
        g.img({uri:this.uri,x:()=>this.p.x,y:()=>this.p.y,w,scl:this.scl,xoff:this.xoff,yoff:this.yoff})
    }
}