/**
 * mec (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

const mec = {
    /**
     * minimal float difference to 1.0
     * @const
     * @type {number}
     */
    EPS: 1.19209e-07,
    /**
     * Linear tolerance for position correction.
     * @const
     * @type {number}
     */
    linTol: 0.1,
    /**
     * Angular tolerance for orientation correction.
     * @const
     * @type {number}
     */
    angTol: 2 / 180 * Math.PI,
    /**
     * fixed limit of assembly iteration steps.
     */
    asmItrMax: 128, //512,
    /**
     * Clamps a numerical value within the provided bounds.
     * @param {number} val Value to clamp.
     * @param {number} lo Lower bound.
     * @param {number} hi Upper bound.
     * @returns {number} Value within the bounds.
     */
    clamp(val, lo, hi) { return Math.min(Math.max(val, lo), hi); },
    /**
     * Mixin a set of prototypes into a primary object.
     * @param {object} obj Primary object.
     * @param {objects} ...protos Set of prototype objects.
     */
    mixin(obj, ...protos) {
        protos.forEach(proto => {
            obj = Object.defineProperties(obj, Object.getOwnPropertyDescriptors(proto))
        })
        return obj;
    }

};

mec.node = {
    extend(node) { let o = Object.setPrototypeOf(node, this.prototype); o.constructor(); return o; },
    prototype: {
        constructor() { // always parameterless .. !
            this.x0 = this.x;
            this.y0 = this.y;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },
        init(model) {
            this.model = model;
            // this.m = this.m === 'infinite' || this.m === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : 1;
            this.m = this.m === 'infinite' ? Number.POSITIVE_INFINITY : (this.m || 1);
        },
        // kinematics
        // current velocity state .. only used during iteration.
        get xtcur() { return this.xt + this.dxt },
        get ytcur() { return this.yt + this.dyt },
        // inverse mass
        get im() { return 1 / this.m },
        get dof() { return this.m === Number.POSITIVE_INFINITY ? 0 : 2 },
        reset() {
            this.x = this.x0;
            this.y = this.y0;
            this.xt = this.yt = 0;
            this.xtt = this.ytt = 0;
            this.dxt = this.dyt = 0;
        },
        pre(dt) {
            // symplectic euler ... partially
            this.x += this.model.direc * this.xt * dt;
            this.y += this.model.direc * this.yt * dt;
        },
        post(dt) {
            // symplectic euler ... partially
            this.xt += this.dxt;
            this.yt += this.dyt;
            // get accelerations from velocity differences...
            this.xtt = this.dxt / dt;
            this.ytt = this.dyt / dt;
        },
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
                x: this.x0,
                y: this.y0
            }
            if (this.m !== 1)
                obj.m = this.m === Number.POSITIVE_INFINITY ? 'infinite' : this.m;

            return obj;
        },
        // graphics ...
        get r() { return 5 },
        get isSolid() { return true },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, 'white'] : this.state & g2.EDIT ? [0, 0, 10, 'yellow'] : false; },
        _info() { return `x:${this.x}<br>y:${this.y}` },
        g2() { return g2().cir({ x: () => this.x, y: () => this.y, r: 5, ls: '#333', fs: '#eee', sh: this.sh }); },
        // editing ...
        hitInner({ x, y, eps }) { return g2.isPntInCir({ x, y }, this, eps) },
        drag({ dx, dy, x, y }) {
            this.x = x; this.y = y;
            document.getElementById('inversekin').checked ? this.model.dirty = true : this.updAdjConstraints(); // checkbox flags mode
    }
}

// // constraint interface ...
// mec.constraint = {
//     constructor() { }, // always parameterless .. !
//     get initialized() { return typeof this.p1 === 'object' },
//     get ax() { return this.p2.x - this.p1.x },
//     get ay() { return this.p2.y - this.p1.y },
//     init_rad() { this.r0 = Math.hypot(this.ax, this.ay); return this; },
//     init_ang() { this.w0 = Math.atan2(this.ay, this.ax); return this; },
//     pos_rad() { return true; },
//     pos_ang() { return true; },
//     init() {
//         this.p1 = this.model.nodeById(this.p1);
//         this.p2 = this.model.nodeById(this.p2);
//         //        console.log(this.type+':'+this.p1+','+this.p2)
//         return this.init_ang().init_rad();
//     },
//     update() {
//         this.p1 = this.model.nodeById(this.p1.id);
//         this.p2 = this.model.nodeById(this.p2.id);
//         //        console.log(this.type+':'+this.p1+','+this.p2)
//         return this.init_ang("update").init_rad("update");
//     },
//     pos() {
//         let res = this.pos_ang();
//         return this.pos_rad() && res;
//     },
//     toJSON() {
//         const obj = {
//             id: this.id,
//             p1: this.p1.id,
//             p2: this.p2.id
//         }
//         return obj;
//     },
//     g2() { return g2().lin({ x1: () => this.p1.x, y1: () => this.p1.y, x2: () => this.p2.x, y2: () => this.p2.y, ls: () => this.model.constraintColor, lw: 3 }); }
// }

// // angular interface ... angular motion is considered frozen, referenced or driven
// mec.constraint.angular = {
//     init_ang(flag) {
//         if (typeof this.w === 'object') {
//             const w = Object.assign(this.w)
//             this._w = Object.assign(this.w)

//             this.w0 = Math.atan2(this.ay, this.ax);
//             if (w.ref) {
//                 const ratio = w.ratio || 1;
//                 if (typeof w.ref === 'string')
//                     w.ref = this.model.constraintById(w.ref);
//                 if (!w.ref.initialized)
//                     w.ref.init();
//                 Object.defineProperty(this, 'w', { get: () => this.w0 + ratio * (w.ref.w - w.ref.w0), enumerable: true, configurable: true, writabel: false });
//             }
//             else if (w.dw) {  // driven ...
//                 const t0 = w.t0 || 0,
//                     dt = w.dt || 1,
//                     type = w.type || 'linear',
//                     pos = () => {
//                         const t = this.model.T;
//                         return t <= t0 ? this.w0
//                             : t > t0 + dt ? this.w0 + w.dw
//                                 : this.w0 + w.dw * mec.drive[type].pos((t - t0) / dt);
//                     }
//                 console.log(this.model.T)
//                 Object.defineProperty(this, 'w', { get: pos, enumerable: true, configurable: true, writabel: false });
//             }
//         }
//         if (!('w' in this))
//             this.w = Math.atan2(this.ay, this.ax);
//         //        else
//         //            this.w0 = this.w;
//         /*
//                 this.w0 = Math.atan2(this.ay,this.ax);
//                 if (this.wref) {
//                     const ratio = this.wratio || 1;
//         //            console.log(typeof this.p1);
//                     if (typeof this.wref === 'string') {
//         //                console.log('%'+this.wref)
//                         this.wref = this.model.constraintById(this.wref);
//                         if (!this.wref.initialized) 
//                             this.wref.init();
//                     }
//                     Object.defineProperty(this, 'w', { get: () => this.w0 + ratio*(this.wref.w - this.wref.w0),   enumerable:true, configurable:true, writabel:false });
//                 }
//                 if (!('w' in this))
//                     this.w = Math.atan2(this.ay,this.ax);
//                 else
//                     this.w0 = this.w;
//         */
//         if (flag === "update") { // workaround... maybe rather implement setter for w...?
//             document.getElementById(`${this.for}`).value = Math.atan2(this.ay, this.ax) * 180 / Math.PI;
//         }
//         return this;
//     },
//     pos_ang() {
//         let mc = 1 / (this.p1.im + this.p2.im),
//             r = this.r,
//             C_x = this.ax - r * Math.cos(this.w),  // consider caching sin(w), cos(w) ...
//             C_y = this.ay - r * Math.sin(this.w),
//             impulse_x = -mc * C_x,  // pseudo-impulse
//             impulse_y = -mc * C_y

//         this.p1.x += -this.p1.im * impulse_x;
//         this.p1.y += -this.p1.im * impulse_y;
//         this.p2.x += this.p2.im * impulse_x;
//         this.p2.y += this.p2.im * impulse_y;

//         return C_x ** 2 + C_y ** 2 < mec.linTol;       // position constraint satisfied .. !
//     },
// }

// // radial interface ... radial motion is considered frozen, referenced or driven
// mec.constraint.radial = {
//     //    get w() { return Math.atan2(this.ay,this.ax) },
//     init_rad(flag) {
//         if (!('r' in this) || flag === "update") // r needs to be reevaluated after draggin a node -> invoked with parameter "update" from constraint.prototype.update()
//             this.r = Math.hypot(this.ax, this.ay);
//         this.r0 = this.r;
//         return this;
//     },
//     pos_rad() {
//         let aa = this.ax ** 2 + this.ay ** 2, rr = this.r ** 2,
//             mc = 1 / ((this.p1.im + this.p2.im) * aa),
//             C = 0.5 * (aa - rr),
//             impulse = -mc * C;  // pseudo-impulse
//         this.p1.x += -this.ax * this.p1.im * impulse;
//         this.p1.y += -this.ay * this.p1.im * impulse;
//         this.p2.x += this.ax * this.p2.im * impulse;
//         this.p2.y += this.ay * this.p2.im * impulse;

//         return aa - rr < 2 * this.r0 * mec.linTol; // position constraint satisfied .. !
//     }
// }

// mec.constraint.free = {
//     extend(c) { let o = Object.setPrototypeOf(c, this.prototype); o.constructor(); return o; },
//     prototype: mec.mixin({}, mec.constraint, {
//         get w() { return Math.atan2(this.ay, this.ax) },
//         get r() { return Math.hypot(this.ay, this.ax) },
//         get dof() { return 2 }
//     })
// }

// mec.constraint.tran = {
//     extend(c) { let o = Object.setPrototypeOf(c, this.prototype); o.constructor(); return o; },
//     prototype: mec.mixin({}, mec.constraint, mec.constraint.angular, {
//         get r() { return Math.hypot(this.ay, this.ax) },
//         get dof() { return 1 }
//     })
// }

// mec.constraint.rot = {
//     extend(c) { let o = Object.setPrototypeOf(c, this.prototype); o.constructor(); return o; },
//     prototype: mec.mixin({}, mec.constraint, mec.constraint.radial, {
//         get w() { return Math.atan2(this.ay, this.ax) },
//         get dof() { return 1 }
//     })
// }

// mec.constraint.ctrl = {
//     extend(c) { let o = Object.setPrototypeOf(c, this.prototype); o.constructor(); return o; },
//     prototype: mec.mixin({}, mec.constraint, mec.constraint.radial, mec.constraint.angular, {
//         get dof() { return 0 }
//     })
}

mec.drive = {}

mec.drive.linear = {
    f: (q) => q, fd: (q) => 1, fdd: (q) => 0
}
mec.drive.quadratic = {
    f: (q) => q <= 0.5 ? 2 * q * q : -2 * q * q + 4 * q - 1,
    fd: (q) => q <= 0.5 ? 4 * q : -4 * q + 4,
    fdd: (q) => q <= 0.5 ? 4 : -4
}

mec.model = {
    extend(model) { Object.setPrototypeOf(model, this.prototype); model.constructor(); return model; },
    prototype: {
        constructor() { // always parameterless .. !
            this.t = this.t0 = 0;
            this.direc = 1;
            this.constraintColor = mec.model.validConstraintColor;
        },
        init() {
            for (const node of this.nodes)  // do for all nodes ...
                mec.node.extend(node).init(this);
            for (const constraint of this.constraints)  // do for all constraints ...
                if (!constraint.initialized)
                    mec.constraint.extend(constraint).init(this);
            return this;
        },
        get dof() {
            let dof = 0;
            for (const node of this.nodes)
                dof += node.dof;
            for (const constraint of this.constraints)
                dof -= (2 - constraint.dof);
            return dof;
        },
        addNode(node) {
            node.model = this;
            this.nodes.push(node);
        },
        nodeById(id) {
            for (const node of this.nodes)
                if (node.id === id)
                    return node;
            return false;
        },
        addConstraint(constraint) {
            constraint.model = this;
            this.constraints.push(constraint);
        },
        constraintById(id) {
            for (const constraint of this.constraints)
                if (constraint.id === id)
                    return constraint;
            return false;
        },
        /**
         * Assemble model.
         * @method
         * @returns {object} model
         */
        asm() {
            let valid = false;
            // assemble positions first
            this.positr = 0;
            while (!valid && this.positr++ < mec.asmItrMax) {
                valid = this.pos();
            }

            // adjust velocities
            valid = false;
            this.velitr = 0;
            while (!valid && this.velitr++ < mec.asmItrMax) {
                valid = this.vel();
            }

            this.constraintColor = valid ? mec.model.validConstraintColor
                : mec.model.invalidConstraintColor;
            // console.log('asm-itr=' + this.positr + '/' + this.velitr);
            return this;
        },
        /**
         * Pre-process model.
         * @method
         * @returns {object} model
         */
        pre() {
            // pre process nodes
            for (let node of this.nodes)
                node.pre(this.dt);
            // eliminate drift ...
            let valid = false;
            this.positr = 0;
            while (!valid && this.positr++ < mec.asmItrMax) {
                valid = this.pos();
            }
            // visualize invalid mechanism ...
            this.constraintColor = valid ? mec.model.validConstraintColor
                : mec.model.invalidConstraintColor;
            return this;
        },
        /**
         * Perform iteration steps until constraints are valid or max-iteration 
         * steps for assembly are reached.
         * @method
         * @returns {object} model
         */
        itr() {
            let valid = false;
            // iterate velocities ...
            this.velitr = 0;
            while (!valid && this.velitr++ < mec.asmItrMax) {
                valid = this.vel();
            }
            return this;
        },
        /**
         * Post-process model.
         * @method
         * @returns {object} model
         */
        post() {
            // post process nodes
            for (let node of this.nodes)
                node.post(this.dt);
            // console.log('itr=' + this.positr + '/' + this.velitr);
            return this;
        },
        /**
         * Position iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        pos() {
            let valid = true;  // pre-assume valid constraints positions ...
            for (let constraint of this.constraints)
                valid = constraint.pos() && valid;
            return valid;
        },
        /**
         * Velocity iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        vel() {
            let valid = true;  // pre-assume valid constraints velocities ...
            for (let constraint of this.constraints)
                valid = constraint.vel() && valid;
            return valid;
        },
        // import() {
        //     // set ...
        //     this.id = this.id || 'mec_' + mec.model.maxid++;
        //     for (let node of this.nodes) {  // do for all nodes ...
        //         mec.node.extend(node).model = this;
        //     }
        //     for (let constraint of this.constraints) {  // do for all constraints ...
        //         mec.constraint[constraint.type].extend(constraint).model = this;
        //     }
        // },
        // // returns an object to be treated by JSON.stringify ...
        // toJSON() {
        //     const obj = {
        //         id: this.id,
        //         nodes: [],
        //         constraints: []
        //     };
        //     for (let node of this.nodes)  // do for all nodes ...
        //         obj.nodes.push(node.toJSON());
        //     for (let constraint of this.constraints)  // do for all nodes ...
        //         obj.constraints.push(constraint.toJSON());
        //     return obj;
        // },
        // init() {
        //     for (let constraint of this.constraints)  // do for all constraints ...
        //         if (!constraint.initialized)
        //             constraint.init();
        //     return this;
        // },
        // asm() {
        //     let done = false, itr = 0;
        //     while (!done && itr++ < mec.asmItrMax) {
        //         done = true;
        //         for (let constraint of this.constraints) {  // do for all constraints ...
        //             done = constraint.pos() && done;
        //         }
        //     }
        //     this.constraintColor = done ? mec.model.validConstraintColor
        //         : mec.model.invalidConstraintColor;
        //     return this;
        // },
        // pos() {
        //     for (let constraint of this.constraints)
        //         constraint.pos();
        // },
         /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {
            for (let constraint of this.constraints)
                g.ins(constraint);
            for (let node of this.nodes)
                g.ins(node);
            return this;
        }
    },
    maxid: 0,
    validConstraintColor: '#ffffff99', // default: #777
    invalidConstraintColor: '#b11',
}
