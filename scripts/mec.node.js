/**
 * mec.node (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain node objects, usually coming from JSON strings.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {number} x - x-coordinate.
 * @property {number} y - y-coordinate.
 * @property {number|'infinite'} [m=1] - mass.
 */
mec.node = {
    extend(node) { Object.setPrototypeOf(node, this.prototype); node.constructor(); return node; },
    prototype: {
        constructor() { // always parameterless .. !
            this.x0 = this.x;
            this.y0 = this.y;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
            this.Qx = this.Qy = 0;     // sum of external loads ...
        },
        init(model) {
            this.model = model;
            this.m = this.m === 'infinite' ? Number.POSITIVE_INFINITY : (this.m || 1);
            this.im = 1/this.m;
            this.Qx = 0; this.Qy = this.model.hasGravity ? -1000 : 0;
            this.xt = this.yt = 0;  // resetting derivatives is obligatory for reinitialization
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
//        get im() { return 1/this.m },
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        reset() {
            this.x = this.x0;
            this.y = this.y0;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
            this.Qx = this.Qy = 0;     // sum of external loads ...
        },
        pre(dt) {
            // symplectic euler ... partially
            this.x += this.model.direc*this.xt*dt;
            this.y += this.model.direc*this.yt*dt;
            // if applied forces are acting, set velocity diffs by forces, else leave them as they are.
            if (this.Qx || this.Qy) {
                this.dxt = this.Qx*this.im * dt;
                this.dyt = this.Qy*this.im * dt;
            }
        },
        post(dt) {
            // symplectic euler ... partially
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt/dt;
            this.ytt = this.dyt/dt;
            // reset loads
            this.Qx = 0; this.Qy = this.model.hasGravity ? -1000 : 0;
        },

        // from old mec
        adjConstraintIds() {
            let contraints = []
            this.model.constraints.forEach(el => { // check for adjacent contraints
                if (typeof (el) === "object" && (el.p1.id === this.id || el.p2.id === this.id)) {
                    contraints.push(el.id);
                }
            });
            return contraints;
        },
        updAdjConstraints() {
            this.adjConstraintIds().forEach(el => this.model.constraintById(el).init(this.model));
            app.model.dirty = true;
        },
        toJSON() {
            const obj = {
                id: this.id,
                x: this.x,  // changed from x0,y0
                y: this.y
            }
            if (this.m !== 1)
                obj.m = this.m === Number.POSITIVE_INFINITY ? 'infinite' : this.m;

            return obj;
        },
        // end old mec

        // interaction
        get isSolid() { return true },
        // get sh() { return this.state & g2.OVER ? [0,0,5,"black"] : false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, 'white'] : this.state & g2.EDIT ? [0, 0, 10, 'yellow'] : false; },
        _info() { return `x:${this.x}<br>y:${this.y}` },
        hitInner({x,y,eps}) {
            return g2.isPntInCir({x,y},this,eps);
        },
        drag({x,y}) {
            this.x = x; this.y = y;
            // this.model.dirty = true;
            app.inversekinematics ? this.model.dirty = true : this.updAdjConstraints();
        },
        // graphics ...
        get r() { return mec.node.radius; },
        g2() {
            const loc = mec.node.locdir[this.idloc || 'n'],
                  xid = this.x + 3*this.r*loc[0], 
                  yid = this.y + 3*this.r*loc[1],
                  g = g2().cir({x:()=>this.x,y:()=>this.y,r:this.r,
                                ls:'#333',fs:'#eee',sh:()=>this.sh});
            if (mec.showNodeLabels)
                g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle',ls:'white'});
            return g;
        }
    },
    radius: 5,
    locdir: { e:[ 1,0],ne:[ Math.SQRT2/2, Math.SQRT2/2],n:[0, 1],nw:[-Math.SQRT2/2, Math.SQRT2/2],
              w:[-1,0],sw:[-Math.SQRT2/2,-Math.SQRT2/2],s:[0,-1],se:[ Math.SQRT2/2,-Math.SQRT2/2] }
}
