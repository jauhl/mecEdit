/**
 * mec.node (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain node objects, usually coming from JSON strings.
 * @method
 * @returns {object} load object.
 * @param {object} - plain javascript load object.
 * @property {string} id - node id.
 * @property {number} x - x-coordinate.
 * @property {number} y - y-coordinate.
 * @property {number} [m=1] - mass.
 * @property {boolean} [base=false] - specify node as base node.
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
        /**
         * Check node properties for validity.
         * @method
         * @param {number} idx - index in node array.
         * @returns {boolean | object} false - if no error was detected, error object otherwise.
         */
        validate(idx) {
            if (!this.id)
                return { mid:'E_ELEM_ID_MISSING',elemtype:'node',idx };
            if (this.model.elementById(this.id) !== this)
                return { mid:'E_ELEM_ID_AMBIGIOUS', id:this.id };
            if (typeof this.m === 'number' && mec.isEps(this.m) )
                return { mid:'E_NODE_MASS_TOO_SMALL', id:this.id, m:this.m };
            return false;
        },
        /**
         * Initialize node. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in node array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            // make inverse mass to first class citizen ...
            this.im = typeof this.m === 'number' ? 1/this.m
                    : this.base === true         ? 0
                    : 1;
            // ... and mass / base to getter/setter
            Object.defineProperty(this,'m',{ get: () => 1/this.im,
                                             set: (m) => this.im = 1/m,
                                             enumerable:true, configurable:true });
            Object.defineProperty(this,'base',{ get: () => this.im === 0,
                                                set: (q) => this.im = q ? 0 : 1,
                                                enumerable:true, configurable:true });
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
        get type() { return 'node' }, // needed for ... what .. ?
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        /**
         * Test, if node is significantly moving
         * @const
         * @type {boolean}
         */
        get isSleeping() {
            return this.base
                || mec.isEps(this.xt,mec.velTol)
                && mec.isEps(this.yt,mec.velTol);
        },
        /**
         * Energy [kgu^2/s^2]
         */
        get energy() {
            var e = 0;
            if (!this.base) {
                if (this.model.hasGravity)
                    e += this.m*(-this.x*this.model.gravity.x - this.y*this.model.gravity.y);
                e += 0.5*this.m*(this.xt**2 + this.yt**2);
            }
            return e;
        },
        reset() {
           if (!this.base) {
               this.x = this.x0;
               this.y = this.y0;
           }
            // resetting kinematic values ...
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },
        pre(dt) {
            // symplectic euler ... partially
            this.x += (this.xt + 0.5*this.dxt)*dt;
            this.y += (this.yt + 0.5*this.dyt)*dt;
//            this.x += this.model.direc*(this.xt + 0.5*this.dxt)*dt;
//            this.y += this.model.direc*(this.yt + 0.5*this.dyt)*dt;
            // position verlet  ... just for investigating in future
//            this.x += this.model.direc*(this.xt - 0.5*this.dxt)*dt;
//            this.y += this.model.direc*(this.yt - 0.5*this.dyt)*dt;
/*
            if (this.usrDrag) {  // node throwing by user occured .. !
                const xt = this.usrDrag.dx / this.usrDrag.dt*1000,
                      yt = this.usrDrag.dy / this.usrDrag.dt*1000,
                      v  = Math.hypot(xt,yt);
                if (v > 20) {    // set upper limit of throwing velocity
                    this.xt = xt/v*Math.min(v,250);
                    this.yt = yt/v*Math.min(v,250);
                }
                else   // set model to rest ..
                    this.model.stop();

                delete this.usrDrag;  // avoid multiple evaluation .. !
            }
*/
            // if applied forces are acting, set velocity diffs initially by forces.
            //console.log('node('+this.id+')=['+this.Qx+','+this.Qy+']')
            if (this.Qx || this.Qy) {
                this.dxt = this.Qx*this.im * dt;
                this.dyt = this.Qy*this.im * dt;
            }
            else
                this.dxt = this.dyt = 0;  // zero out velocity differences .. important !!
        },
        post(dt) {
            // symplectic euler ... partially
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt/dt;
            this.ytt = this.dyt/dt;
        },
        asJSON() {
            return '{ "id":"'+this.id+'","x":'+this.x0+',"y":'+this.y0
                 + (this.base ? ',"base":true' : '')
                 + (this.idloc ? ',"idloc":"'+this.idloc+'"' : '')
                 + ' }';
        },

        // analysis getters
        get force() { return {x:this.Qx,y:this.Qy}; },
        get vel() { return {x:this.xt,y:this.yt}; },
        get acc() { return {x:this.xtt,y:this.ytt}; },
        get forceAbs() { return Math.hypot(this.Qx,this.Qy); },
        get velAbs() { return Math.hypot(this.xt,this.yt); },
        get accAbs() { return Math.hypot(this.xtt,this.ytt); },

        // interaction
        get isSolid() { return true },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
        _info() { return `x:${this.x}<br>y:${this.y}` },
        hitInner({x,y,eps}) {
            return g2.isPntInCir({x,y},this,eps);
        },
        selectBeg({x,y,t}) {
//            if (!this.base)
//                this.usrDrag = {dx:this.x,dy:this.y,dt:t};
        },
        selectEnd({x,y,t}) {
            if (!this.base) {
                this.xt = this.yt = this.xtt = this.ytt = 0;
//                this.usrDrag.dx = this.x - this.usrDrag.dx;
//                this.usrDrag.dy = this.y - this.usrDrag.dy;
//                this.usrDrag.dt = (t - this.usrDrag.dt);
            }
        },
        drag({x,y}) {
//console.log('pntr(%d,%d)',x,y)
            this.x = x; this.y = y;
        },
        // graphics ...
        get r() { return mec.node.radius; },
        g2() {
            let g = g2();
            if (this.model.env.show.nodes) {
                const loc = mec.node.locdir[this.idloc || 'n'],
                      xid = this.x + 3*this.r*loc[0],
                      yid = this.y + 3*this.r*loc[1];

                      g = this.base
                        ? g2().beg({x:this.x,y:this.y,sh:this.sh})
                              .cir({x:0,y:0,r:5,ls:"@nodcolor",fs:"@nodfill"})
                              .p().m({x:0,y:5}).a({dw:Math.PI/2,x:-5,y:0}).l({x:5,y:0})
                              .a({dw:-Math.PI/2,x:0,y:-5}).z().fill({fs:"@nodcolor"})
                              .end()
                        : g2().cir({x:this.x,y:this.y,r:this.r,
                                    ls:'#333',fs:'#eee',sh:()=>this.sh});
                if (this.model.env.show.nodeLabels)
                    g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle',ls:this.model.env.show.txtColor});
            };
            return g;
        }
    },
    radius: 5,
    locdir: { e:[ 1,0],ne:[ Math.SQRT2/2, Math.SQRT2/2],n:[0, 1],nw:[-Math.SQRT2/2, Math.SQRT2/2],
              w:[-1,0],sw:[-Math.SQRT2/2,-Math.SQRT2/2],s:[0,-1],se:[ Math.SQRT2/2,-Math.SQRT2/2] }
}
