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
        get sh() { return this.state & g2.OVER ? [0, 0, 5, "black"] : false },
        g2() { return g2().cir({ x: () => this.x, y: () => this.y, r: 5, ls: '#333', fs: '#eee', sh: this.sh }); },
        // editing ...
        hitInner({ x, y, eps }) { return g2.isPntInCir({ x, y }, this, eps) },
        drag({ dx, dy, x, y }) {
            this.x = x; this.y = y;
            this.model.dirty = true;
        }
    }
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
                dof -= constraint.dof;
            return dof;
        },
        addNode(node) {
            this.nodes.push(node);
        },
        nodeById(id) {
            for (const node of this.nodes)
                if (node.id === id)
                    return node;
            return false;
        },
        addConstraint(constraint) {
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
            console.log('asm-itr=' + this.positr + '/' + this.velitr);
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
            console.log('itr=' + this.positr + '/' + this.velitr);
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
    validConstraintColor: '#777',
    invalidConstraintColor: '#b11',
}
