/**
 * mec.load (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain load objects, usually coming from JSON objects.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {string} [type='force'] - load type ['force'|'spring].
 * @property {string} p - node id, the force is acting upon.
 * @property {string} [wref] - constraint id, the force orientation is referring to.
 * @property {number} [value=1] - Force value in [N]
 * @property {number} [w0=0] - initial / offset orientation of force vector.
 * @property {number} [mode='pull'] - drawing mode of force arrow ['push'|'pull'] with regard to node.
 */
mec.load = {
    extend(load) { 
        if (load.type && mec.load[load.type]) {
            Object.setPrototypeOf(load, mec.load[load.type]);
            load.constructor(); 
        }
        return load; 
    }
}

mec.load.force = {
    constructor() {}, // always parameterless .. !
        init(model) {
            this.model = model;
            if (!this.type) this.type = 'force';
            if (this.type === 'force') this.init_force(model);
        },
        init_force(model) {
            if (typeof this.p === 'string')
                this.p = model.nodeById(this.p);
            if (typeof this.wref === 'string')
                this.wref = model.constraintById(this.wref);
            this.value = mec.from_N(this.value || 1);
            this.w0 = typeof this.w0 === 'number' ? this.w0 : 0;
        },
        /**
         * Check load for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p === elem || this.wref === elem;
        },

        // cartesian components
        get w() { return this.wref ? this.wref.w + this.w0 : this.w0; },
        get Qx() { return this.value*Math.cos(this.w)},
        get Qy() { return this.value*Math.sin(this.w)},
        reset() {},
        apply() {
            if (this.type === 'force' && !this.p.base) {
                this.p.Qx += mec.from_N(this.Qx);
                this.p.Qy += mec.from_N(this.Qy);
            }
        },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
        hitContour({x,y,eps}) {
            const len = 45,   // const length for all force arrows
                  p = this.p,
                  cw = Math.cos(this.w), sw = Math.sin(this.w),
                  off = 2*mec.node.radius;
            return g2.isPntOnLin({x,y},{x:p.x+off*cw, y:p.y+off*sw},
                                       {x:p.x+(len+off)*cw,y:p.y+(len+off)*sw},eps);
        },
        g2() {
            if (this.type === 'force') {
                const w = this.w,
                      cw = Math.cos(w), sw = Math.sin(w),
                      p = this.p,
                      len = mec.load.force.arrowLength,
                      off = 2*mec.node.radius,
                      idsign = this.mode === 'push' ? -1 : 1,
                      xid = p.x + idsign*25*cw - 12*sw, 
                      yid = p.y + idsign*25*sw + 12*cw,
                      x = this.mode === 'push' ? () => p.x - (len+off)*cw
                                               : () => p.x + off*cw,
                      y = this.mode === 'push' ? () => p.y - (len+off)*sw
                                               : () => p.y + off*sw,
                      g = g2().beg({x,y,w,scl:1,lw:2,ls:mec.forceColor,
                                    lc:'round',sh:()=>this.sh,fs:'@ls'})
                              .drw({d:mec.load.force.arrow,lsh:true})
                              .end();
                if (mec.showLoadLabels)
                    g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle'});
                return g;
            }
    },
    arrowLength: 45,   // draw all forces of length ...
    arrow: 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z'
}
