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
asmItrMax: 512,
/**
 * Clamps a numerical value within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
clamp(val,lo,hi) { return Math.min(Math.max(val, lo), hi); },
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
            this.m = (this.m === 'infinite' || this.m === Number.POSITIVE_INFINITY) ? Number.POSITIVE_INFINITY : 1;
            this.x0 = this.x;
            this.y0 = this.y;
        },
        get im() { return 1/this.m },
        reset() {
            this.x = this.x0;
            this.y = this.y0;
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
        draw(g) {
            g.cir({x:()=>this.x,y:()=>this.y,r:5,ls:'#333',lw:2,fs:'orange',_info: () => this.id });  // _info: () => this.id added
        }
    }
}

// constraint interface ...
mec.constraint = {
    get initialized() { return typeof this.p1 === 'object' },
    get ax() { return this.p2.x - this.p1.x },
    get ay() { return this.p2.y - this.p1.y }
}

mec.rotational = {
    extend(cstrnt) { let o = Object.setPrototypeOf(cstrnt, this.prototype); o.constructor(); return o; },
    prototype: mec.mixin({}, mec.constraint, {
        constructor() {}, // always parameterless .. !
        get w() { return Math.atan2(this.ay,this.ax) },
        init() { 
            this.p1 = this.model.nodeById(this.p1);
            this.p2 = this.model.nodeById(this.p2);
            if (('r' in this))
                this.r0 = this.r;
            else
                this.r = Math.hypot(this.ax,this.ay);
        },
        pos() {
            let aa = this.ax**2 + this.ay**2, rr = this.r**2,
                mc = 1/((this.p1.im + this.p2.im)*aa),
                C = (aa - rr)/2,
                impulse = -mc*C;  // pseudo-impulse

            this.p1.x += -this.ax * this.p1.im * impulse;
            this.p1.y += -this.ay * this.p1.im * impulse;
            this.p2.x +=  this.ax * this.p2.im * impulse;
            this.p2.y +=  this.ay * this.p2.im * impulse;

            return aa - rr < 2*this.r*mec.linTol; // position constraint satisfied .. !
        },
        toJSON() {
            const obj = { id:this.id, type:this.type, p1:this.p1.id, p2:this.p2.id };
            if (this.r0) obj.r = this.r0;
            return obj;
        },
        draw(g) {
            g.lin({x1:()=>this.p1.x,y1:()=>this.p1.y,x2:()=>this.p2.x,y2:()=>this.p2.y,ls:()=>this.model.constraintColor,lw:3});
        }
    })
}

mec.translational = {
    extend(cstrnt) { let o = Object.setPrototypeOf(cstrnt, this.prototype); o.constructor(); return o; },
    prototype: mec.mixin({}, mec.constraint, {
        constructor() {}, // always parameterless .. !
        init() { 
            this.p1 = this.model.nodeById(this.p1);
            this.p2 = this.model.nodeById(this.p2);
            this.a0 = Math.hypot(this.ay,this.ax);
            if (('w' in this))
                this.w0 = this.w;
            else
                this.w = Math.atan2(this.ay,this.ax);
        },
        pos() {
            let mc = 1/(this.p1.im + this.p2.im),
            r = Math.hypot(this.ax,this.ay),
            cw = Math.cos(this.w), sw = Math.sin(this.w),
            C_x = this.ax - r*cw, C_y = this.ay - r*sw,
            impulse_x = -mc*C_x,  // pseudo-impulse
            impulse_y = -mc*C_y

            this.p1.x += -this.p1.im * impulse_x;
            this.p1.y += -this.p1.im * impulse_y;
            this.p2.x +=  this.p2.im * impulse_x;
            this.p2.y +=  this.p2.im * impulse_y;

            return C_x**2 + C_y**2 < mec.linTol;       // position constraint satisfied .. !
        },
        toJSON() {
            const obj = { id:this.id, type:this.type, p1:this.p1.id, p2:this.p2.id };
            if (this.w0) obj.w = this.w0;
            return obj;
        },
        draw(g) {
            g.lin({x1:()=>this.p1.x,y1:()=>this.p1.y,x2:()=>this.p2.x,y2:()=>this.p2.y,ls:()=>this.model.constraintColor,lw:3});
        }
    })
}

mec.constrained = {
    extend(cstrnt) { let o = Object.setPrototypeOf(cstrnt, this.prototype); o.constructor(); return o; },
    prototype: mec.mixin({}, mec.constraint, {
        constructor() {}, // always parameterless .. !
        init() { 
            this.p1 = this.model.nodeById(this.p1);
            this.p2 = this.model.nodeById(this.p2);
            if ('r' in this)
                this.r0 = this.r;
            else
                this.r = Math.hypot(this.ax,this.ay);
            if ('w' in this)
                this.w0 = this.w;
            else
                this.w = Math.atan2(this.ay,this.ax);
//            console.log(this);
        },
        pos() {
            let ok = mec.rotational.prototype.pos.apply(this);
            return mec.translational.prototype.pos.apply(this) && ok;
        },
        toJSON() {
            const obj = { id:this.id, type:this.type, p1:this.p1.id, p2:this.p2.id };
            if (this.r0) obj.r = this.r0;
            if (this.w0) obj.w = this.w0;
            return obj;
        },
        draw(g) {
            g.lin({x1:()=>this.p1.x,y1:()=>this.p1.y,x2:()=>this.p2.x,y2:()=>this.p2.y,ls:()=>this.model.constraintColor,lw:3});
        }
    })
}

mec.follower = {
    extend(cstrnt) { let o = Object.setPrototypeOf(cstrnt, this.prototype); o.constructor(); return o; },
    prototype: mec.mixin({}, mec.constraint, {
        constructor() {}, // always parameterless .. !
        init() {
            this.following = this.model.constraintById(this.following);
            if (!this.following.initialized)
                this.following.init();
            this.p1 = this.model.nodeById(this.p1);
            this.p2 = this.model.nodeById(this.p2);

            const w = this.following.w, cw = Math.cos(w), sw = Math.sin(w);
            this.lam = this.ax*cw + this.ay*sw;
            this.mu =  this.ay*cw - this.ax*sw;
//            console.log(this);
        },
        pos() {
            let mc = 1/(this.p1.im + this.p2.im),
                w = this.following.w, cw = Math.cos(w), sw = Math.sin(w),
                C_x = this.ax - this.lam*cw + this.mu*sw,
                C_y = this.ay - this.lam*sw - this.mu*cw,
                impulse_x = -mc*C_x,
                impulse_y = -mc*C_y;

            this.p1.x += -this.p1.im * impulse_x;
            this.p1.y += -this.p1.im * impulse_y;
            this.p2.x +=  this.p2.im * impulse_x;
            this.p2.y +=  this.p2.im * impulse_y;
            return C_x**2 + C_y**2 < mec.linTol;       // position constraint satisfied .. !
        },
        toJSON() {
            return { id:this.id, type:this.type, p1:this.p1.id, p2:this.p2.id,
                     following:this.following.id };
        },
        draw(g) {
            g.lin({x1:()=>this.p1.x,y1:()=>this.p1.y,x2:()=>this.p2.x,y2:()=>this.p2.y,ls:()=>this.model.constraintColor,lw:3});
        }
    })
}

mec.free = {
    extend(cstrnt) { let o = Object.setPrototypeOf(cstrnt, this.prototype); o.constructor(); return o; },
    prototype: mec.mixin({}, mec.constraint, {
        constructor() {}, // always parameterless .. !
        get w() { return Math.atan2(this.ay,this.ax)},
        get r() { return Math.hypot(this.ay,this.ax)},
        init() {
            this.p1 = this.model.nodeById(this.p1);
            this.p2 = this.model.nodeById(this.p2);
        },
        pos() { return true; },
        toJSON() {
            return { id:this.id, type:this.type, p1:this.p1.id, p2:this.p2.id };
        },
        draw(g) {
            g.lin({x1:()=>this.p1.x,y1:()=>this.p1.y,x2:()=>this.p2.x,y2:()=>this.p2.y,ls:()=>this.model.constraintColor,lw:3});
        }
    })
}

mec.model = {
    extend(model) { let o = Object.setPrototypeOf(model, this.prototype); o.constructor(); return o; },
    prototype: {
        constructor() { // always parameterless .. !
            this.import();
            this.constraintColor = mec.model.validConstraintColor;
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
        import() {
            // set ...
            this.id = this.id || 'mec_' + mec.model.maxid++;
            for (let node of this.nodes) {  // do for all nodes ...
                mec.node.extend(node).model = this;
//                this.addNode(mec.node.extend(node));
            }
            for (let constraint of this.constraints) {  // do for all constraints ...
                mec[constraint.type].extend(constraint).model = this;
//                this.addConstraint(mec[constraint.type].extend(constraint));
            }
        },
        // returns an object to be treated by JSON.stringify ...
        toJSON() {
            const obj = {
                id: this.id,
                nodes: [],
                constraints: []
            };
            for (let node of this.nodes)  // do for all nodes ...
                obj.nodes.push(node.toJSON());
            for (let constraint of this.constraints)  // do for all nodes ...
                obj.constraints.push(constraint.toJSON());
            return obj;
        },
        init() {
            for (let constraint of this.constraints)  // do for all constraints ...
                if (!constraint.initialized)
                    constraint.init();
            return this;
        },
        asm() {
            let done = false, itr=0;
            while (!done && itr++ < mec.asmItrMax) {
                done = true;
                for (let constraint of this.constraints) {  // do for all constraints ...
                    done = constraint.pos() && done;
                }
            }
            this.constraintColor = done ? mec.model.validConstraintColor
                                        : mec.model.invalidConstraintColor;
            return this;
        },
        pos() {
            for (let constraint of this.constraints)
                constraint.pos();
        },
        draw(g) {
            for (let constraint of this.constraints)
                constraint.draw(g);
            for (let node of this.nodes)
                node.draw(g);
            return this;
        }
    },
    maxid: 0,
    validConstraintColor: '#777',
    invalidConstraintColor: '#b11',
}
