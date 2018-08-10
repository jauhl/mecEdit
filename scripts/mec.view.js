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
 * @property {string} id - view id.
 * @property {string} type - view type ['vector','trace'].
 */
mec.view = {
    extend(view) {
        if (view.type && mec.view[view.type]) {
            Object.setPrototypeOf(view, mec.view[view.type]);
            view.constructor();
        }
        return view; 
    }
}

/**
 * @param {object} - vector view.
 * @property {string} p - referenced node id.
 * @property {string} [value] - node value to view.
 */
mec.view.vector = {
    constructor() {}, // always parameterless .. !
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
//        if (this.value && this.p[this.value]) ; // node analysis value exists ? error handling required .. !
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    reset() {},
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + (this.value ? ',"value":'+this.value : '')
                + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, mec.hoveredElmColor] : false; },
    get endPoints() {
        const scale = mec.aly[this.value].scl;
        const v = this.p[this.value]();
        const vabs = Math.hypot(v.y,v.x);
        const vview = !mec.isEps(vabs) 
                    ? mec.asympClamp(scale*vabs,25,150)
                    : 0;
        return { p1:this.p, 
                 p2:{ x:this.p.x + v.x/vabs*vview, y:this.p.y + v.y/vabs*vview }
        };
    },
    hitContour({x,y,eps}) {
        const pts = this.endPoints;
        return g2.isPntOnLin({x,y},pts.p1,pts.p2,eps);
    },
    g2() {
        const pts = this.endPoints;
//        console.log(pts.p1.x+' / '+pts.p2.x+' % '+pts.p1.y+' / '+pts.p2.y)
        return g2().vec({x1:pts.p1.x, 
                         y1:pts.p1.y, 
                         x2:pts.p2.x,
                         y2:pts.p2.y,
                         ls:mec.color[this.value],
                         lw:1.5,
                         sh:this.sh
        });
    }
}

/**
 * @param {object} - trace view.
 * @property {string} p - referenced node id.
 * @property {number} Dt - trace duration [s].
 * @property {string} fill - web color.
 */
mec.view.trace = {
    constructor() {}, // always parameterless .. !
    init(model) {
        if (typeof this.p === 'string')
            this.p = model.nodeById(this.p);
        this.pts = [];
        this.t0 = 0;
        this.model = model;   // only used for timer access ... see below !
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    reset() {
        this.pts.length = 0;
        this.t0 = 0;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'","Dt":'+this.Dt+',"fill":"'+this.fill+'" }';
    },
    post(dt) {  // add model.timer.t to parameter list .. or use timer as parameter everywhere !
        this.pts.push({x:this.p.x,y:this.p.y});
        if (this.model.timer.t - this.t0 > this.Dt) // remove first trace point !
            this.pts.shift();
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, mec.hoveredElmColor] : false; },
    hitContour({x,y,eps}) {
        return false;
    },
    g2() {
        return g2().ply({pts:this.pts,
                         format:'{x,y}',
                         ls:'navy',
                         lw:1.5,
                         fs: this.fill || 'transparent',
                         sh:this.sh
        });
    }
}