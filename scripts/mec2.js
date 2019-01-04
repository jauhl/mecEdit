/**
 * mec (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec namespace for the mec library.
 * It includes mainly constants and some general purpose functions.
 */
const mec = {
/**
 * user language shortcut (for messages)
 * @const
 * @type {string}
 */
lang: 'en',
/**
 * namespace for user language neutral messages
 * @const
 * @type {object}
 */
msg: {},
/**
 * minimal float difference to 1.0
 * @const
 * @type {number}
 */
EPS: 1.19209e-07,
/**
 * Length tolerance for position correction.
 * @const
 * @type {number}
 */
lenTol: 0.01,
/**
 * Angular tolerance for orientation correction.
 * @const
 * @type {number}
 */
angTol: 1 / 180 * Math.PI,
/**
 * Velocity tolerance.
 * @const
 * @type {number}
 */
velTol: 0.01,
/**
 * Force tolerance.
 * @const
 * @type {number}
 */
forceTol: 0.1,
/**
 * Moment tolerance.
 * @const
 * @type {number}
 */
momentTol: 0.01,
/**
 * Maximal value for position correction.
 * @const
 * @type {number}
 */
maxLinCorrect: 20,
/**
 * fixed limit of assembly iteration steps.
 */
asmItrMax: 512, // 512,
/**
 * itrMax: fixed limit of simulation iteration steps.
 */
itrMax: 256,
/**
 * corrMax: fixed number of position correction steps.
 */
corrMax: 64,
/**
* graphics options
* @const
* @type {object}
*/
show: {
    /**
     * flag for darkmode.
     * @const
     * @type {boolean}
     */
    darkmode: false,
    /**
     * flag for showing labels of nodes.
     * @const
     * @type {boolean}
     */
    nodeLabels: true,
    /**
     * flag for showing labels of constraints.
     * @const
     * @type {boolean}
     */
    constraintLabels: true,
    /**
     * flag for showing labels of loads.
     * @const
     * @type {boolean}
     */
    loadLabels: true,
    /**
     * flag for showing nodes.
     * @const
     * @type {boolean}
     */
    nodes: true,
    /**
     * flag for showing constraints.
     * @const
     * @type {boolean}
     */
    constraints: true,
    colors: {
        invalidConstraintColor: '#b11',
        validConstraintColor:   { dark: '#ffffff99',        light: '#777' },
        forceColor:             { dark: 'crimson',          light: 'orange' },
        springColor:            { dark: 'lightslategray',   light: '#aaa' },
        constraintVectorColor:  { dark: 'orange',           light: 'green' },
        hoveredElmColor:        { dark: 'white',            light: 'gray' },
        selectedElmColor:       { dark: 'yellow',           light: 'blue' },
        txtColor:               { dark: 'white',            light: 'black' },
        velVecColor:            { dark: 'lightsteelblue',   light: 'steelblue' },
        accVecColor:            { dark: 'lightsalmon',      light: 'firebrick' },
        forceVecColor:          { dark: 'wheat',            light: 'saddlebrown' }
    },
    /**
     * color for drawing valid constraints.
     * @return {string}
     */
    get validConstraintColor() { return this.darkmode ? this.colors.validConstraintColor.dark : this.colors.validConstraintColor.light },
    /**
     * color for drawing forces.
     * @return {string}
     */
    get forceColor() { return this.darkmode ?  this.colors.forceColor.dark : this.colors.forceColor.light },
    /**
     * color for drawing springs.
     * @return {string}
     */
    get springColor() { return this.darkmode ? this.colors.springColor.dark : this.colors.springColor.light },
    /**
     * color for vectortypes of constraints.
     * @return {string}
     */
    get constraintVectorColor() { return this.darkmode ? this.colors.constraintVectorColor.dark : this.colors.constraintVectorColor.light },
    /**
     * hovered element shading color.
     * @return {string}
     */
    get hoveredElmColor() { return this.darkmode ? this.colors.hoveredElmColor.dark : this.colors.hoveredElmColor.light },
    /**
     * selected element shading color.
     * @return {string}
     */
    get selectedElmColor() { return this.darkmode ? this.colors.selectedElmColor.dark : this.colors.selectedElmColor.light },
    /**
     * color for g2.txt (ls).
     * @return {string}
     */
    get txtColor() { return this.darkmode ? this.colors.txtColor.dark : this.colors.txtColor.light },
    /**
     * color for velocity arrow (ls).
     * @const
     * @type {string}
     */
    get velVecColor() { return this.darkmode ? this.colors.velVecColor.dark : this.colors.velVecColor.light },
    /**
     * color for acceleration arrow (ls).
     * @const
     * @type {string}
     */
    get accVecColor() { return this.darkmode ? this.colors.accVecColor.dark : this.colors.accVecColor.light },
    /**
     * color for acceleration arrow (ls).
     * @const
     * @type {string}
     */
    get forceVecColor() { return this.darkmode ? this.colors.forceVecColor.dark : this.colors.forceVecColor.light }
},
/**
 * default gravity.
 * @const
 * @type {object}
 */
gravity: {x:0,y:-10,active:false},
/*
 * analysing values
 */
aly: {
    mass: { get scl() { return 1}, type:'num', name:'m', unit:'kg' },
    vel: { get scl() {return mec.m_u}, type:'vec', name:'v', unit:'m/s', get drwscl() {return 40*mec.m_u} },
    acc: { get scl() {return mec.m_u}, type:'vec', name:'a', unit:'m/s^2', get drwscl() {return 10*mec.m_u} },
    w: { get scl() { return 180/Math.PI}, type:'num', name:'φ', unit:'°' },
    wt: { get scl() { return 1}, type:'num', name:'ω', unit:'rad/s' },
    wtt: { get scl() { return 1}, type:'num', name:'α', unit:'rad/s^2' },
    r: { get scl() { return mec.m_u}, type:'num', name:'r', unit:'m' },
    rt: { get scl() { return mec.m_u}, type:'num', name:'rt', unit:'m/s' },
    rtt: { get scl() { return mec.m_u}, type:'num', name:'rtt', unit:'m/s^2' },
    force: { get scl() {return mec.m_u}, type:'vec', name:'F', unit:'N', get drwscl() {return 5*mec.m_u} },
    velAbs: { get scl() {return mec.m_u}, type:'num', name:'v', unit:'m/s' },
    accAbs: { get scl() {return mec.m_u}, type:'num', name:'a', unit:'m/s' },
    forceAbs: { get scl() {return mec.m_u}, type:'num', name:'F', unit:'N' },
    moment: { get scl() {return mec.m_u**2}, type:'num', name:'M', unit:'Nm' },
},
/**
 * unit specifiers and relations
 */
/**
 * default length scale factor (meter per unit) [m/u].
 * @const
 * @type {number}
 */
m_u: 0.01,
/**
 * convert [u] => [m]
 * @return {number} Value in [m]
 */
to_m(x) { return x*mec.m_u; },
/**
 * convert [m] = [u]
 * @return {number} Value in [u]
 */
from_m(x) { return x/mec.m_u; },
/**
 * convert [kgu/m^2] => [kgm/s^2] = [N]
 * @return {number} Value in [N]
 */
to_N(x) { return x*mec.m_u; },
/**
 * convert [N] = [kgm/s^2] => [kgu/s^2]
 * @return {number} Value in [kgu/s^2]
 */
from_N(x) { return x/mec.m_u; },
/**
 * convert [kgu^2/m^2] => [kgm^2/s^2] = [Nm]
 * @return {number} Value in [Nm]
 */
to_Nm(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [Nm] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_Nm(x) { return x/mec.m_u/mec.m_u; },
/**
 * convert [N/m] => [kg/s^2] = [N/m] (spring rate)
 * @return {number} Value in [N/m]
 */
to_N_m(x) { return x; },
/**
 * convert [N/m] = [kg/s^2] => [k/s^2]
 * @return {number} Value in [kg/s^2]
 */
from_N_m(x) { return x; },
/**
 * convert [kgu/m^2] => [kgm^2/s^2] = [J]
 * @return {number} Value in [N]
 */
to_J(x) { return mec.to_Nm(x) },
/**
 * convert [J] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_J(x)  { return mec.from_Nm(x) },
/**
 * convert [kgu^2] => [kgm^2]
 * @return {number} Value in [kgm^2]
 */
to_kgm2(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [kgm^2] => [kgu^2]
 * @return {number} Value in [kgu^2]
 */
from_kgm2(x) { return x/mec.m_u/mec.m_u; },
/**
 * Helper functions
 */
/**
 * Test, if the absolute value of a number `a` is smaller than eps.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {boolean} test result.
 */
isEps(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS);
 },
 /**
 * If the absolute value of a number `a` is smaller than eps, it is set to zero.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {number} original value or zero.
 */
toZero(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS) ? 0 : a;
},
/**
 * Clamps a numerical value linearly within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
clamp(val,lo,hi) { return Math.min(Math.max(val, lo), hi); },
/**
 * Clamps a numerical value asymptotically within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
asympClamp(val,lo,hi) {
    const dq = hi - lo;
    return dq ? lo + 0.5*dq + Math.tanh(((Math.min(Math.max(val, lo), hi) - lo)/dq - 0.5)*5)*0.5*dq : lo;
},
/**
 * Convert angle from degrees to radians.
 * @param {number} deg Angle in degrees.
 * @returns {number} Angle in radians.
 */
toRad(deg) { return deg*Math.PI/180; },
/**
 * Convert angle from radians to degrees.
 * @param {number} rad Angle in radians.
 * @returns {number} Angle in degrees.
 */
toDeg(rad) { return rad/Math.PI*180; },
/**
 * Continuously rotating objects require infinite angles, both positives and negatives.
 * Setting an angle `winf` to a new angle `w` does this with respect to the
 * shortest angular distance from  `winf` to `w`.
 * @param {number} winf infinite extensible angle in radians.
 * @param {number} w  Destination angle in radians [-pi,pi].
 * @returns {number} Extended angle in radians.
 */
infAngle(winf, w) {
    let pi = Math.PI, pi2 = 2*pi, d = w - winf % pi2;
    if      (d >  pi) d -= pi2;
    else if (d < -pi) d += pi2;
    return winf + d;
},
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
},
/**
 * Assign getters to an objects prototype.
 * @param {object} obj Primary object.
 * @param {objects} ...protos Set of prototype objects.
 */
assignGetters(obj,getters) {
    for (const key in getters)
        Object.defineProperty(obj, key, { get: getters[key], enumerable:true, configurable:true });
},
/**
 * Create message string from message object.
 * @param {object} msg message/warning/error object.
 * @returns {string} message string.
 */
messageString(msg) {
    const entry = mec.msg[mec.lang][msg.mid];
    return entry ? msg.mid[0]+': '+entry(msg) : '';
}
}
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
        /**
         * Check node for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} always false.
         */
        dependsOn(elem) { return false; },
        /**
         * Check node for deep (indirect) dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} dependency exists.
         */
        deepDependsOn(elem) {
            return elem === this;
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
//            console.log(`${this.id}:${this.dxt}/${this.dyt},${dt}`)
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
        selectBeg({x,y,t}) { },
        selectEnd({x,y,t}) {
            if (!this.base) {
                this.xt = this.yt = this.xtt = this.ytt = 0;
            }
        },
        drag({x,y,mode}) {
            if (mode === 'edit' && !this.base) { this.x0 = x; this.y0 = y; }
            else                               { this.x = x; this.y = y; }
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
/**
 * mec.constraint (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.drive.js
 * @requires mec.model.js
 * @requires g2.js
 */
"use strict";

/**
 * Wrapper class for extending plain constraint objects, usually coming from JSON objects.
 * @method
 * @returns {object} constraint object.
 * @param {object} - plain javascript constraint object.
 * @property {string} id - constraint id.
 * @property {string|number} [idloc='left'] - label location ['left','right',-1..1]
 * @property {string} p1 - first point id.
 * @property {string} p2 - second point id.
 * @property {object} [ori] - orientation object.
 * @property {string} [ori.type] - type of orientation constraint ['free'|'const'|'drive'].
 * @property {number} [ori.w0] - initial angle [rad].
 * @property {string} [ori.ref] - referenced constraint id.
 * @property {string} [ori.reftype] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [ori.func] - drive function name from `mec.drive` object ['linear'|'quadratic', ...].
 *                                 If the name points to a function in `mec.drive` (not an object as usual)
 *                                 it will be called with `ori.arg` as an argument.
 * @property {string} [ori.arg] - drive function argument.
 * @property {number} [ori.t0] - drive parameter start value.
 * @property {number} [ori.Dt] - drive parameter value range.
 * @property {number} [ori.Dw] - drive angular range [rad].
 * @property {boolean} [ori.bounce=false] - drive oscillate between drivestart and driveend.
 * @property {number} [ori.repeat] - drive parameter scaling Dt.
 * @property {boolean} [ori.input=false] - drive flags for actuation via an existing range-input with the same id.
 * @property {object} [len] - length object.
 * @property {string} [len.type] - type of length constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [len.r0] - initial length.
 * @property {string} [len.ref] - referenced constraint id.
 * @property {string} [len.reftype] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [len.ratio] - ratio to referencing value.
 * @property {string} [len.func] - drive function name ['linear'|'quadratic', ...].
 * @property {string} [len.arg] - drive function argument.
 * @property {number} [len.t0] - drive parameter start value.
 * @property {number} [len.Dt] - drive parameter value range.
 * @property {number} [len.Dr] - drive linear range.
 * @property {boolean} [len.bounce=false] - drive oscillate between drivestart and driveend.
 * @property {number} [len.repeat] - drive parameter scaling Dt.
 * @property {boolean} [len.input=false] - drive flags for actuation via an existing range-input with the same id.
 */
mec.constraint = {
    extend(c) { Object.setPrototypeOf(c, this.prototype); c.constructor(); return c; },
    prototype: {
        constructor() {}, // always parameterless .. !
        /**
         * Check constraint properties for validity.
         * @method
         * @param {number} idx - index in constraint array.
         * @returns {boolean | object} true - if no error was detected, error object otherwise.
         */
        validate(idx) {
            let tmp, warn = false;

            if (!this.id)
                return { mid:'E_ELEM_ID_MISSING',elemtype:'constraint',idx };
            if (this.model.elementById(this.id) !== this)
                return { mid:'E_ELEM_ID_AMBIGIOUS', id:this.id };
            if (!this.p1)
                return { mid:'E_CSTR_NODE_MISSING', id:this.id, loc:'start', p:'p1' };
            if (!this.p2)
                return { mid:'E_CSTR_NODE_MISSING', id:this.id, loc:'end', p:'p2' };
            if (typeof this.p1 === 'string') {
                if (!(tmp=this.model.nodeById(this.p1)))
                    return { mid:'E_CSTR_NODE_NOT_EXISTS', id:this.id, loc:'start', p:'p1', nodeId:this.p1 };
                else
                    this.p1 = tmp;
            }
            if (typeof this.p2 === 'string') {
                if (!(tmp=this.model.nodeById(this.p2)))
                    return { mid:'E_CSTR_NODE_NOT_EXISTS', id:this.id, loc:'end', p:'p2', nodeId:this.p2 };
                else
                    this.p2 = tmp;
            }
            if (mec.isEps(this.p1.x - this.p2.x) && mec.isEps(this.p1.y - this.p2.y))
                warn = { mid:'W_CSTR_NODES_COINCIDE', id:this.id, p1:this.p1.id, p2:this.p2.id };

            if (!this.hasOwnProperty('ori'))
                this.ori = { type:'free' };
            if (!this.hasOwnProperty('len'))
                this.len = { type:'free' };

            if (typeof this.ori.ref === 'string') {
                if (!(tmp=this.model.constraintById(this.ori.ref)))
                    return { mid:'E_CSTR_REF_NOT_EXISTS', id:this.id, sub:'ori', ref:this.ori.ref };
                else
                    this.ori.ref = tmp;

                if (this.ori.type === 'drive') {
                    if (this.ori.ref[this.ori.reftype || 'ori'].type === 'free')
                        return { mid:'E_CSTR_DRIVEN_REF_TO_FREE', id:this.id, sub:'ori', ref:this.ori.ref.id, reftype:this.ori.reftype || 'ori' };
                    if (this.ratio !== undefined && this.ratio !== 1)
                        return { mid:'E_CSTR_RATIO_IGNORED', id:this.id, sub:'ori', ref:this.ori.ref.id, reftype:this.ori.reftype || 'ori' };
                }
            }
            if (typeof this.len.ref === 'string') {
                if (!(tmp=this.model.constraintById(this.len.ref)))
                    return { mid:'E_CSTR_REF_NOT_EXISTS', id:this.id, sub:'len', ref:this.len.ref };
                else
                    this.len.ref = tmp;

                if (this.len.type === 'drive') {
                    if (this.len.ref[this.len.reftype || 'len'].type === 'free')
                        return { mid:'E_CSTR_DRIVEN_REF_TO_FREE', id:this.id, sub:'len', ref:this.len.ref.id, reftype:this.len.reftype || 'len' };
                    if (this.ratio !== undefined && this.ratio !== 1)
                        return { mid:'E_CSTR_RATIO_IGNORED', id:this.id, sub:'len', ref:this.ori.ref.id, reftype:this.ori.reftype || 'len' };
                }
            }
            return warn
        },
        /**
         * Initialize constraint. Multiple initialization allowed.
         * @method
         * @param {object} model - model parent.
         * @param {number} idx - index in constraint array.
         */
        init(model, idx) {
            this.model = model;
            if (!this.model.notifyValid(this.validate(idx))) return;

            const ori = this.ori, len = this.len;

            this._angle = 0;   // infinite extensible angle

            if      (ori.type === 'free')  this.init_ori_free(ori);
            else if (ori.type === 'const') this.init_ori_const(ori);
            else if (ori.type === 'drive') this.init_ori_drive(ori);

            if      (len.type === 'free')  this.init_len_free(len);
            else if (len.type === 'const') this.init_len_const(len);
            else if (len.type === 'drive') this.init_len_drive(len);

            // trigonometric cache
            this.sw = Math.sin(this.w); this.cw = Math.cos(this.w);

            // lagrange identifiers
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        /**
         * Track unlimited angle
         */
        angle(w) {
            return this._angle = mec.infAngle(this._angle,w);
        },
        /**
         * Reset constraint
         */
        reset() {
//        console.log('reset')
            this.r0 = this.len.hasOwnProperty('r0') ? this.len.r0 : Math.hypot(this.ay,this.ax);
            this.w0 = this.ori.hasOwnProperty('w0') ? this.angle(this.ori.w0) : this.angle(Math.atan2(this.ay,this.ax));
            this._angle = this.w0;
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        get type() {
            const ori = this.ori, len = this.len;
            return ori.type === 'free' && len.type === 'free' ? 'free'
                 : ori.type === 'free' && len.type !== 'free' ? 'rot'
                 : ori.type !== 'free' && len.type === 'free' ? 'tran'
                 : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
                 : 'invalid';
        },
        get initialized() { return this.model !== undefined },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) +
                   (this.len.type === 'free' ? 1 : 0);
        },

        // analysis getters
        /**
         * Force value in [N]
         */
        get forceAbs() { return -this.lambda_r; },
        /**
         * Moment value in [Nm]
         */
        get moment() { return -this.lambda_w/this.r; },

        /**
         * Check constraint for unfinished drives.
         * @method
         * @param {number} t - current time.
         * @returns {boolean} true, if any drive is active.
         */
        hasActiveDrives(t) {
            let ori = this.ori, len = this.len;
            return ori.type === 'drive'
                && (ori.input || t <= ori.t0 + ori.Dt*(ori.bounce ? 2 : 1)*(ori.repeat || 1) + 0.5*this.model.timer.dt)
                || len.type === 'drive'
                && (len.input || t <= len.t0 + len.Dt*(len.bounce ? 2 : 1)*(len.repeat || 1) + 0.5*this.model.timer.dt);
        },
        /**
         * Check constraint for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} dependency exists.
         */
        dependsOn(elem) {
            return this.p1 === elem
                || this.p2 === elem
                || this.ori && this.ori.ref === elem
                || this.len && this.len.ref === elem;
        },
        /**
         * Check constraint for deep (indirect) dependency on another element.
         * @method
         * @param {object} elem - element to test deep dependency for.
         * @returns {boolean} dependency exists.
         */
        /*
        deepDependsOn(target) {
            return this === target
                || this.dependsOn(target) 
                || this.model.deepDependsOn(this.p1,target)
                || this.model.deepDependsOn(this.p2,target)
                || this.ori && this.model.deepDependsOn(this.ori.ref,target)
                || this.len && this.model.deepDependsOn(this.len.ref,target);
        },
        */
        // privates
        get ax() { return this.p2.x - this.p1.x },
        get ay() { return this.p2.y - this.p1.y },
        get axt() { return this.p2.xtcur - this.p1.xtcur },
        get ayt() { return this.p2.ytcur - this.p1.ytcur },
        get axtt() { return this.p2.xtt - this.p1.xtt },
        get aytt() { return this.p2.ytt - this.p1.ytt },
        // default orientational constraint equations
        get ori_C() { return this.ay*this.cw - this.ax*this.sw; },
        get ori_Ct() { return this.ayt*this.cw - this.axt*this.sw - this.wt*this.r; },
        get ori_mc() {
            const imc = mec.toZero(this.p1.im + this.p2.im);
            return imc ? 1/imc : 0;
        },
        // default magnitude constraint equations
        get len_C() { return this.ax*this.cw + this.ay*this.sw - this.r; },
        get len_Ct() { return this.axt*this.cw + this.ayt*this.sw - this.rt; },
        get len_mc() {
            let imc = mec.toZero(this.p1.im + this.p2.im);
            return (imc ? 1/imc : 0);
        },

        /**
         * Perform preprocess step.
         * @param {number} dt - time increment.
         */
        pre(dt) {
            let w = this.w;
            // perfect location to update trig. cache
            this.cw = Math.cos(w);
            this.sw = Math.sin(w);
            // apply angular impulse (warmstarting)
            this.ori_impulse_vel(this.lambda_w * dt);
            // apply axial impulse (warmstarting)
            this.len_impulse_vel(this.lambda_r * dt);

            this.dlambda_r = this.dlambda_w = 0; // important !!
        },
        post(dt) {
            // apply angular impulse  Q = J^T * lambda
            this.lambda_w += this.dlambda_w;
            this.ori_apply_Q(this.lambda_w)
            // apply radial impulse  Q = J^T * lambda
            this.lambda_r += this.dlambda_r;
            this.len_apply_Q(this.lambda_r)
        },
        /**
         * Perform position step.
         */
        posStep() {
            let res, w = this.w;
            // perfect location to update trig. cache
            this.cw = Math.cos(w);
            this.sw = Math.sin(w);
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_pos()
                 : this.type === 'tran' ? this.ori_pos()
                 : this.type === 'ctrl' ? (res = this.ori_pos(), (this.len_pos() && res))
                 : false;
        },
        /**
         * Perform velocity step.
         */
        velStep(dt) {
            let res;
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_vel(dt)
                 : this.type === 'tran' ? this.ori_vel(dt)
                 : this.type === 'ctrl' ? (res = this.ori_vel(dt), (this.len_vel(dt) && res))
                 : false;
        },

        /**
         * Calculate orientation.
         */
        ori_pos() {
            const C = this.ori_C, impulse = -this.ori_mc * C;

            this.ori_impulse_pos(impulse);
            if (this.ori.ref) {
                const ref = this.ori.ref;
                if (this.ori.reftype === 'len')
                    ref.len_impulse_pos(-(this.ori.ratio||1)*impulse);
                else
                    ref.ori_impulse_pos(-(this.ori.ratio||1)*this.r/ref.r*impulse);
            }

            return mec.isEps(C, mec.lenTol);  // orientation constraint satisfied .. !
        },
        /**
         * Calculate orientational velocity.
         * @param {dt} - time increment.
         */
        ori_vel(dt) {
            const Ct = this.ori_Ct, impulse = -this.ori_mc * Ct;

            this.ori_impulse_vel(impulse);
            this.dlambda_w += impulse/dt;
//            console.log(this.id+'; dlambda_w='+this.dlambda_w)
            if (this.ori.ref) {
                const ref = this.ori.ref,
                      ratio = this.ori.ratio || 1;
                if (this.ori.reftype === 'len') {
                    ref.len_impulse_vel(-ratio*impulse);
                    ref.dlambda_r -= ratio*impulse/dt;
                }
                else {
                    ref.ori_impulse_vel(this.r/ref.r*ratio*impulse);
                    ref.dlambda_w -= this.r/ref.r*ratio*impulse/dt;
                }
            }

//            return Math.abs(impulse/dt) < mec.forceTol;  // orientation constraint satisfied .. !
            return mec.isEps(Ct*dt, mec.lenTol);  // orientation constraint satisfied .. !
        },
        /**
         * Apply pseudo impulse `impulse` from ori constraint to its node positions.
         * 'delta q = -W * J^T * m_c * C'
         * @param {number} impulse - pseudo impulse.
         */
        ori_impulse_pos(impulse) {
            this.p1.x +=  this.p1.im * this.sw * impulse;
            this.p1.y += -this.p1.im * this.cw * impulse;
            this.p2.x += -this.p2.im * this.sw * impulse;
            this.p2.y +=  this.p2.im * this.cw * impulse;
        },
        /**
         * Apply impulse `impulse` from ori constraint to its node displacements.
         * 'delta dot q = -W * J^T * m_c * dot C'
         * @param {number} impulse - impulse.
         */
        ori_impulse_vel(impulse) {
            this.p1.dxt +=  this.p1.im * this.sw * impulse;
            this.p1.dyt += -this.p1.im * this.cw * impulse;
            this.p2.dxt += -this.p2.im * this.sw * impulse;
            this.p2.dyt +=  this.p2.im * this.cw * impulse;
        },
        /**
         * Apply constraint force `lambda` from ori constraint to its nodes.
         * 'Q_c = J^T * lambda'
         * @param {number} lambda - moment.
         */
        ori_apply_Q(lambda) {
            this.p1.Qx +=  this.sw * lambda;
            this.p1.Qy += -this.cw * lambda;
            this.p2.Qx += -this.sw * lambda;
            this.p2.Qy +=  this.cw * lambda;
        },

        /**
         * Calculate length.
         */
        len_pos() {
            const C = this.len_C, impulse = -this.len_mc * C;

            this.len_impulse_pos(impulse);
            if (this.len.ref) {
                if (this.len.reftype === 'ori')
                    this.len.ref.ori_impulse_pos(-(this.len.ratio||1)*impulse);
                else
                    this.len.ref.len_impulse_pos(-(this.len.ratio||1)*impulse);
            }
            return mec.isEps(C, mec.lenTol); // length constraint satisfied .. !
        },
        /**
         * Calculate length velocity.
         * @param {number} dt - time increment.
         */
        len_vel(dt) {
            const Ct = this.len_Ct, impulse = -this.len_mc * Ct;

            this.len_impulse_vel(impulse);
            this.dlambda_r += impulse/dt;
            if (this.len.ref) {
                const ref = this.len.ref,
                      ratio = this.ori.ratio || 1;
                if (this.len.reftype === 'ori') {
                    ref.ori_impulse_vel(-ratio*impulse);
                    ref.dlambda_w -= ratio*impulse/dt;
                }
                else {
                    ref.len_impulse_vel(-ratio*impulse);
                    ref.dlambda_r -= ratio*impulse/dt;
                }
            }
            return mec.isEps(Ct*dt, mec.lenTol); // velocity constraint satisfied .. !
        },
        /**
         * Apply pseudo impulse `impulse` from len constraint to its node positions.
         * 'delta q = -W * J^T * m_c * C'
         * @param {number} impulse - pseudo impulse.
         */
        len_impulse_pos(impulse) {
            this.p1.x += -this.p1.im * this.cw * impulse;
            this.p1.y += -this.p1.im * this.sw * impulse;
            this.p2.x +=  this.p2.im * this.cw * impulse;
            this.p2.y +=  this.p2.im * this.sw * impulse;
        },
        /**
         * Apply impulse `impulse` from len constraint to its node displacements.
         * 'delta dot q = -W * J^T * m_c * dot C'
         * @param {number} impulse - impulse.
         */
        len_impulse_vel(impulse) {
            this.p1.dxt += -this.p1.im * this.cw * impulse;
            this.p1.dyt += -this.p1.im * this.sw * impulse;
            this.p2.dxt +=  this.p2.im * this.cw * impulse;
            this.p2.dyt +=  this.p2.im * this.sw * impulse;
        },
        /**
         * Apply force `lambda` from len constraint to its node forces.
         * 'Q_c = J^T * lambda'
         * @param {number} lambda - force.
         */
        len_apply_Q(lambda) {
            this.p1.Qx += -this.cw * lambda;
            this.p1.Qy += -this.sw * lambda;
            this.p2.Qx +=  this.cw * lambda;
            this.p2.Qy +=  this.sw * lambda;
        },
        /**
         * Initialize a free orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_free(ori) {
            this.w0 = this.angle(Math.atan2(this.ay,this.ax));
            mec.assignGetters(this, {
                w:  () => this.angle(Math.atan2(this.ay,this.ax)),
                wt: () => (this.ayt*this.cw - this.axt*this.sw)/this.r,
                wtt:() => (this.aytt*this.cw - this.axtt*this.sw)/this.r
            });
        },
        /**
         * Initialize a const orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_const(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : this.angle(Math.atan2(this.ay,this.ax));

            if (!!ori.ref) {
                const ref = ori.ref = this.model.constraintById(ori.ref) || ori.ref,
                      reftype = ori.reftype || 'ori',
                      ratio = ori.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'ori')
                    mec.assignGetters(this, {
                        w:  () => this.w0 + ratio*(ref.w - ref.w0),
                        wt: () => ratio*ref.wt,
                        wtt:() => ratio*ref.wtt,
                        ori_C:  () => this.r*(this.angle(Math.atan2(this.ay,this.ax)) - this.w0) - ratio*this.r*(ref.w - ref.w0),
                        ori_Ct: () => this.ayt*this.cw - this.axt*this.sw - ratio*this.r/ref.r*(ref.ayt*ref.cw - ref.axt*ref.sw),
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio**2*this.r**2/ref.r**2*mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                });
                else { // reftype === 'len'
                    mec.assignGetters(this, {
                        w:  () => this.w0 + ratio*(ref.r - ref.r0)/this.r,
                        wt: () => ratio*ref.rt,
                        wtt:() => ratio*ref.rtt,
                        ori_C:  () => this.r*(this.angle(Math.atan2(this.ay,this.ax)) - this.w0) - ratio*(ref.ax*ref.cw + ref.ay*ref.sw - ref.r0),
                        ori_Ct: () => this.ayt*this.cw - this.axt*this.sw - ratio*(ref.axt*ref.cw + ref.ayt*ref.sw),
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio**2*mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                    });
                }
            }
            else {
                mec.assignGetters(this, {
                    w:  () => this.w0,
                    wt: () => 0,
                    wtt:() => 0,
                });
            }
        },
        /**
         * Initialize a driven orientation constraint.
         * @param {object} ori - orientational sub-object.
         */
        init_ori_drive(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : this.angle(Math.atan2(this.ay,this.ax));

            ori.Dw = ori.Dw || 2*Math.PI;
            ori.t0 = ori.t0 || 0;
            ori.Dt = ori.Dt || 1;

            if (ori.input) {
                // maintain a local input controlled time 'local_t'.
                ori.local_t = 0;
                ori.t = () => !this.model.state.preview ? ori.local_t : this.model.timer.t;
                ori.inputCallbk = (w) => { ori.local_t = w*Math.PI/180*ori.Dt/ori.Dw; };
            }
            else
                ori.t = () => this.model.timer.t;

            ori.drive = mec.drive.create({ func: ori.func || ori.input && 'static' || 'linear',
                                            z0: ori.ref ? 0 : this.w0,
                                            Dz: ori.Dw,
                                            t0: ori.t0,
                                            Dt: ori.Dt,
                                            t: ori.t,
                                            bounce: ori.bounce,
                                            repeat: ori.repeat });

            if (!!ori.ref) {
                const ref = ori.ref = this.model.constraintById(ori.ref) || ori.ref,
                      reftype = ori.reftype || 'ori',
                      ratio = ori.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'ori')
                    mec.assignGetters(this, {
                        w:  () => this.w0 + (ref.w - ref.w0) + ori.drive.f(),
                        wt: () => ref.wt + ori.drive.ft(),
                        wtt:() => ref.wtt + ori.drive.ftt(),
                        ori_C:  () => this.r*(this.angle(Math.atan2(this.ay,this.ax)) - this.w0) -this.r*(ref.angle(Math.atan2(ref.ay,ref.ax)) - ref.w0) - this.r*ori.drive.f(),
                        ori_Ct: () => {console.log('ft='+ori.drive.ft()); return this.ayt*this.cw - this.axt*this.sw - this.r/ref.r*(ref.ayt*ref.cw - ref.axt*ref.sw) - this.r*ori.drive.ft()},
                        ori_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + this.r**2/ref.r**2*mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                    });

                else // reftype === 'len'
                    mec.assignGetters(this, {
                        w:  () => this.w0 + ratio*(ref.r - ref.r0) + ori.drive.f(),
                        wt: () => ratio*ref.rt + ori.drive.ft(),
                        wtt:() => ratio*ref.rtt + ori.drive.ftt()
                    });
            }
            else {
                mec.assignGetters(this, {
                    w:   ori.drive.f,
                    wt:  ori.drive.ft,
                    wtt: ori.drive.ftt
                });
            }
        },
        /**
         * Initialize a free elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_free(len) {
            this.r0 = Math.hypot(this.ay,this.ax);
            mec.assignGetters(this, {
                r:  () => this.ax*this.cw + this.ay*this.sw,
                rt: () => this.axt*this.cw + this.ayt*this.sw,
                rtt:() => this.axtt*this.cw + this.aytt*this.sw,
            })
        },
        /**
         * Initialize a constant elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_const(len) {
            this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);

            if (!!len.ref) {
                const ref = len.ref = this.model.constraintById(len.ref) || len.ref,
                      reftype = len.reftype || 'len',
                      ratio = len.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'len')
                    mec.assignGetters(this, {
                        r:  () => this.r0 + ratio*(ref.r - ref.r0),
                        rt: () => ratio*ref.rt,
                        rtt:() => ratio*ref.rtt,
                        len_C:  () => (this.ax*this.cw + this.ay*this.sw - this.r0) - ratio*(ref.ax*ref.cw + ref.ay*ref.sw - ref.r0),
                        len_Ct: () =>  this.axt*this.cw + this.ayt*this.sw - ratio*(ref.axt*ref.cw + ref.ayt*ref.sw),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio**2*mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                    });
                else // reftype === 'ori'
                    mec.assignGetters(this, {
                        r:  () => this.r0 + ratio*ref.r*(ref.w - ref.w0),
                        rt: () => ratio*ref.wt,
                        rtt:() => ratio*ref.wtt,
                        len_C:  () => this.ax*this.cw + this.ay*this.sw - this.r0 - ratio*ref.r*(ref.angle(Math.atan2(ref.ay,ref.ax)) - ref.w0),
                        len_Ct: () => this.axt*this.cw + this.ayt*this.sw - ratio*(ref.ayt*ref.cw - ref.axt*ref.sw),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + ratio**2*mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                    });
            }
            else {
                mec.assignGetters(this, {
                    r:  () => this.r0,
                    rt: () => 0,
                    rtt:() => 0,
                });
            }
        },
        /**
         * Initialize a driven elementary magnitude constraint.
         * @param {object} len - elementary magnitude constraint.
         */
        init_len_drive(len) {
            this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);

            len.Dr = len.Dr || 100;
            len.t0 = len.t0 || 0;
            len.Dt = len.Dt || 1;

            if (len.input) {
                // maintain a local input controlled time 'local_t'.
                len.local_t = 0;
                len.t = () => len.local_t;
                len.inputCallbk = (u) => { len.local_t = u*len.Dt/len.Dr; };
            }
            else
                len.t = () => this.model.timer.t;


            len.drive = mec.drive.create({func: len.func || len.input && 'static' || 'linear',
                                          z0: this.r0,
                                          Dz: len.Dr,
                                          t0: len.t0,
                                          Dt: len.Dt,
                                          t: len.t,
                                          bounce: len.bounce,
                                          repeat: len.repeat });

            if (!!len.ref) {
                const ref = len.ref = this.model.constraintById(len.ref) || len.ref,
                      reftype = len.reftype || 'len',
                      ratio = len.ratio || 1;

                if (!ref.initialized)
                    ref.init(this.model);

                if (reftype === 'len')
                    mec.assignGetters(this, {
                        r:  () => this.r0 + ratio*(ref.r - ref.r0) + len.drive.f(),
                        rt: () => ref.rt + len.drive.ft(),
                        rtt:() => ref.rtt + len.drive.ftt(),
                        len_C:  () => (this.ax*this.cw + this.ay*this.sw - this.r0) - (ref.ax*ref.cw + ref.ay*ref.sw - ref.r0) - len.drive.f(),
                        len_Ct: () =>  this.axt*this.cw + this.ayt*this.sw - (ref.axt*ref.cw + ref.ayt*ref.sw) - len.drive.ft(),
                        len_mc: () => {
                            let imc = mec.toZero(this.p1.im + this.p2.im) + mec.toZero(ref.p1.im + ref.p2.im);
                            return imc ? 1/imc : 0;
                        }
                    });
                else // reftype === 'ori'
                    mec.assignGetters(this, {
                        r:  () => this.r0 + ratio*(ref.w - ref.w0) + len.drive.f(),
                        rt: () => ratio*ref.wt + len.drive.ft(),
                        rtt:() => ratio*ref.wtt + len.drive.ftt()
                    });
            }
            else {
                mec.assignGetters(this, {
                    r:   len.drive.f,
                    rt:  len.drive.ft,
                    rtt: len.drive.ftt
                });
            }
        },
        asJSON() {
            let jsonString = '{ "id":"'+this.id+'","p1":"'+this.p1.id+'","p2":"'+this.p2.id+'"';

            if (this.len && !(this.len.type === 'free')) {
                jsonString += (this.len.type === 'const' ? ',"len":{ "type":"const"' : '')
                            + (this.len.type === 'drive' ? ',"len":{ "type":"drive"' : '')
                            + (this.len.ref ? ',"ref":"'+this.len.ref.id+'"' : '')
                            + (this.len.reftype ? ',"reftype":"'+this.len.reftype+'"' : '')
                            + (this.len.r0 && this.len.r0 > 0.0001 ? ',"r0":'+this.len.r0 : '')
                            + (this.len.ratio && Math.abs(this.len.ratio-1)>0.0001 ? ',"ratio":'+this.len.ratio : '')
                            + (this.len.func ? ',"func":"'+this.len.func+'"' : '')
                            + (this.len.arg ? ',"arg":"'+this.len.arg+'"' : '')
                            + (this.len.t0 && this.len.t0 > 0.0001 ? ',"t0":'+this.len.t0 : '')
                            + (this.len.Dt ? ',"Dt":'+this.len.Dt : '')
                            + (this.len.Dr ? ',"Dr":'+this.len.Dr : '')
                            + (this.len.bounce ? ',"bounce":true' : '')
                            + (this.len.input ? ',"input":true' : '')
                            + ' }'
            };

            if (this.ori && !(this.ori.type === 'free')) {
                jsonString += (this.ori.type === 'const' ? ',"ori":{ "type":"const"' : '')
                            + (this.ori.type === 'drive' ? ',"ori":{ "type":"drive"' : '')
                            + (this.ori.ref ? ',"ref":"'+this.ori.ref.id+'"' : '')
                            + (this.ori.reftype ? ',"reftype":"'+this.ori.reftype+'"' : '')
                            + (this.ori.w0 && this.ori.w0 > 0.0001 ? ',"r0":'+this.ori.w0 : '')
                            + (this.ori.ratio && Math.abs(this.ori.ratio-1)>0.0001 ? ',"ratio":'+this.ori.ratio : '')
                            + (this.ori.func ? ',"func":"'+this.ori.func+'"' : '')
                            + (this.ori.arg ? ',"arg":"'+this.ori.arg+'"' : '')
                            + (this.ori.t0 && this.ori.t0 > 0.0001 ? ',"t0":'+this.ori.t0 : '')
                            + (this.ori.Dt ? ',"Dt":'+this.ori.Dt : '')
                            + (this.ori.Dw ? ',"Dw":'+this.ori.Dw : '')
                            + (this.ori.bounce ? ',"bounce":true' : '')
                            + (this.ori.input ? ',"input":true' : '')
                            + ' }'
            };

            jsonString += ' }';

            return jsonString;
        },
        // interaction
        get isSolid() { return false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
        hitContour({x,y,eps}) {
            const p1 = this.p1, p2 = this.p2,
                  dx = this.p2.x - this.p1.x, dy = this.p2.y - this.p1.y,
                  off = 2*mec.node.radius/Math.hypot(dy,dx);
            return g2.isPntOnLin({x,y},{x:p1.x+off*dx,y:p1.y+off*dy},
                                       {x:p2.x-off*dx,y:p2.y-off*dy},eps);
        },
        // drawing
        get color() { return this.model.valid
                           ? this.model.env.show.validConstraintColor
                           : this.model.env.show.colors.invalidConstraintColor;  // due to 'this.model.env.show.invalidConstraintColor' undefined
        },
        g2() {
            let g = g2();
            if (this.model.env.show.constraints) {
                const {p1,p2,w,r,type,ls,ls2,lw,id,idloc} = this;
                g.beg({x:p1.x,y:p1.y,w,scl:1,lw:2,
                        ls:this.model.env.show.constraintVectorColor,fs:'@ls',lc:'round',sh:()=>this.sh})
                    .stroke({d:`M50,0 ${r},0`,ls:()=>this.color,
                            lw:lw+1,lsh:true})
                    .drw({d:mec.constraint.arrow[type],lsh:true})
                  .end();

                if (this.model.env.show.constraintLabels) {
                    let idstr = id || '?', cw = Math.cos(w), sw = Math.sin(w),
                        u = idloc === 'left' ? 0.5
                          : idloc === 'right' ? -0.5
                          : idloc + 0 === idloc ? idloc  // is numeric
                          : 0.5,
                        lam = Math.abs(u)*40, mu = u > 0 ? 10 : -15,
                        xid = p1.x + lam*cw - mu*sw,
                        yid = p1.y + lam*sw + mu*cw;
                    if (this.ori.type === 'ref' || this.len.type === 'ref') {
                        const comma = this.ori.type === 'ref' && this.len.type === 'ref' ? ',' : '';
                        idstr += '('
                              +  (this.ori.type === 'ref' ? this.ori.ref.id : '')
                              +  comma
                              +  (this.len.type === 'ref' ? this.len.ref.id : '')
                              +')';
                        xid -= 3*sw;
                        yid += 3*cw;
                    };
                    g.txt({str:idstr,x:xid,y:yid,thal:'center',tval:'middle',ls:this.model.env.show.txtColor})
                };
            };
            return g;
        }
    },
    arrow: {
        'ctrl': 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'rot': 'M12,0 8,6 12,0 8,-6Z M0,0 8,0M15,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'tran': 'M0,0 12,0M16,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'free': 'M12,0 8,6 12,0 8,-6ZM0,0 8,0M15,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z'
    }
}/**
 * mec.drive (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 */
"use strict";

/**
 * @namespace mec.drive namespace for drive types of the mec library.
 * They are named and implemented after VDI 2145 and web easing functions.
 */
mec.drive = {
    create({func,z0,Dz,t0,Dt,t,bounce,repeat}) {
        const isin = (x,x1,x2) => x >= x1 && x < x2;
        let drv = func && func in mec.drive ? mec.drive[func] :  mec.drive.linear;

        if (bounce  && func !== 'static') {
            drv = mec.drive.bounce(drv);
            Dt *= 2;  // preserve duration per repetition
        }
        if (repeat && func !== 'static') {
            drv = mec.drive.repeat(drv,repeat);
            Dt *= repeat;  // preserve duration per repetition
        }
        return {
            f:   () => z0 + drv.f(Math.max(0,Math.min((t() - t0)/Dt,1)))*Dz,
            ft:  () => isin(t(),t0,t0+Dt) ? drv.fd((t()-t0)/Dt)*Dz/Dt : 0,
            ftt: () => isin(t(),t0,t0+Dt) ? drv.fdd((t()-t0)/Dt)*Dz/Dt/Dt : 0
        };
    },
    linear: {
        f: (q) =>q, fd: (q) => 1, fdd: (q) => 0
    },
    quadratic: {
        f: (q) =>  q <= 0.5 ? 2*q*q : -2*q*q + 4*q - 1,
        fd: (q) =>  q <= 0.5 ? 4*q : -4*q + 4,
        fdd: (q) =>  q <= 0.5 ? 4 : -4
    },
    harmonic: {
        f:   (q) => (1 - Math.cos(Math.PI*q))/2,
        fd:  (q) => Math.PI/2*Math.sin(Math.PI*q),
        fdd: (q) => Math.PI*Math.PI/2*Math.cos(Math.PI*q)
    },
    sinoid: {
        f:   (q) => q - Math.sin(2*Math.PI*q)/2/Math.PI,
        fd:  (q) => 1 - Math.cos(2*Math.PI*q),
        fdd: (q) =>     Math.sin(2*Math.PI*q)*2*Math.PI
    },
    poly5: {
        f: (q) => (10 - 15*q + 6*q*q)*q*q*q,
        fd: (q) => (30 - 60*q +30*q*q)*q*q,
        fdd: (q) => (60 - 180*q + 120*q*q)*q
    },
    static: {   // used for actuators (Stellantrieb) without velocities and accelerations
        f: (q) =>q, fd: (q) => 0, fdd: (q) => 0
    },
    ramp(dq) {
        dq = mec.clamp(dq,0,0.5);
        if (dq === 0)
            return mec.drive.linear;
        else if (dq === 0.5)
            return mec.drive.quadratic;
        else {
            const a =  1/((1-dq)*dq);
            return {f: function(q) {
                        return (q < dq)   ? 1/2*a*q*q
                             : (q < 1-dq) ? a*(q - 1/2*dq)*dq
                             :              a*(1 - 3/2*dq)*dq + a*(q+dq-1)*dq - 1/2*a*(q+dq-1)*(q+dq-1);
                    },
                    fd: function(q) {
                        return (q < dq)   ? a*q
                             : (q < 1-dq) ? a*dq
                             :              a*dq - a*(q+dq-1);
                    },
                    fdd: function(q) {
                        return (q < dq)   ? a
                             : (q < 1-dq) ? 0
                             :             -a;
                    }
            };
        }
    },
    // todo .. test valid velocity and acceleration signs with bouncing !!
    bounce: function(drv) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f(q < 0.5 ? 2*q : 2-2*q),
            fd: q => drv.fd(q < 0.5 ? 2*q : 2-2*q)*(q < 0.5 ? 1 : -1),
            fdd: q => drv.fdd(q < 0.5 ? 2*q : 2-2*q)*(q < 0.5 ? 1 : -1)
        }
    },
    repeat: function(drv,n) {
        if (typeof drv === 'string') drv = mec.drive[drv];
        return {
            f: q => drv.f((q*n)%1),
            fd: q => drv.fd((q*n)%1),
            fdd: q => drv.fdd((q*n)%1)
        }
    },
    // Penner's' simple potential functions ... why are they so popular ?
    pot : [ { f: q => 1,         fd: q => 0,          fdd: q => 0 },
            { f: q => q,         fd: q => 1,          fdd: q => 0 },
            { f: q => q*q,       fd: q => 2*q,        fdd: q => 2 },
            { f: q => q*q*q,     fd: q => 3*q*q,      fdd: q => 6*q },
            { f: q => q*q*q*q,   fd: q => 4*q*q*q,    fdd: q => 12*q*q },
            { f: q => q*q*q*q*q, fd: q => 5*q*q*q*q,  fdd: q => 20*q*q*q } ],

    inPot(n) { return this.pot[n]; },

    outPot(n) {
        const fn = this.pot[n];
        return { f:   q => 1 - fn.f(1-q),
                 fd:  q =>    fn.fd(1-q),
                 fdd: q =>  -fn.fdd(1-q) }
    },

    inOutPot(n) {
        const fn = this.pot[n], exp2 = Math.pow(2,n-1);
        return { f:   q => q < 0.5 ? exp2*fn.f(q)         : 1 - exp2*fn.f(1-q),
                 fd:  q => q < 0.5 ? exp2*fn.fd(q)        :  exp2*fn.fd(1-q),
                 fdd: q => q < 0.5 ? exp2*(n-1)*fn.fdd(q) : -exp2*(n-1)*fn.fdd(1-q) }
    },

    get inQuad() { return this.inPot(2); },
    get outQuad() { return this.outPot(2); },
    get inOutQuad() { return this.inOutPot(2); },
    get inCubic() { return this.inPot(3); },
    get outCubic() { return this.outPot(3); },
    get inOutCubic() { return this.inOutPot(3); },
    get inQuart() { return this.inPot(4); },
    get outQuart() { return this.outPot(4); },
    get inOutQuart() { return this.inOutPot(4); },
    get inQuint() { return this.inPot(5); },
    get outQuint() { return this.outPot(5); },
    get inOutQuint() { return this.inOutPot(5); }
}
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
 * @param {object} - plain javascript load object.
 * @property {string} id - load id.
 * @property {string} type - load type ['force'|'spring'].
 */
mec.load = {
    extend(load) {
        if (!load.type)
            load.type = 'force';
        if (mec.load[load.type]) {
            Object.setPrototypeOf(load, mec.load[load.type]);
            load.constructor();
        }
        return load;
    }
}

/**
 * @param {object} - force load.
 * @property {string} p - node id, the force is acting upon.
 * @property {string} [wref] - constraint id, the force orientation is referring to.
 * @property {number} [value=1] - Force value in [N]
 * @property {number} [w0=0] - initial / offset orientation of force vector.
 * @property {number} [mode='pull'] - drawing mode of force arrow ['push'|'pull'] with regard to node.
 */
mec.load.force = {
    constructor() {}, // always parameterless .. !
    /**
     * Check force properties for validity.
     * @method
     * @param {number} idx - index in load array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        let warn = false;

        if (!this.id)
            warn = { mid:'W_ELEM_ID_MISSING',elemtype:'force',idx };
        if (this.p === undefined)
            return { mid:'E_ELEM_REF_MISSING',elemtype:'force',id:this.id,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p))
            return { mid:'E_ELEM_INVALID_REF',elemtype:'force',id:this.id,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref && !this.model.constraintById(this.wref))
            return { mid:'E_ELEM_INVALID_REF',elemtype:'force',id:this.id,reftype:'constraint',name:'wref'};
        else
            this.wref = this.model.constraintById(this.wref);

        if (typeof this.value === 'number' && mec.isEps(this.value)) 
            return { mid:'E_FORCE_VALUE_INVALID',val:this.value,id:this.id };

        return warn;
    },
    /**
     * Initialize force. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in load array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this._value = mec.from_N(this.value || 1);  // allow multiple init's
        this.w0 = typeof this.w0 === 'number' ? this.w0 : 0;
    },
    /**
     * Check load for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p === elem
            || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + ((!!this.mode && (this.mode === 'push')) ? ',"mode":"push"' : '')
                + ((this.w0 && Math.abs(this.w0) > 0.001) ? ',"w0":'+this.w0 : '')
                + (this.wref ? ',"wref":'+this.wref.id+'"' : '')
                + (this._value && Math.abs(this._value - mec.from_N(1)) > 0.01 ? ',"value":'+mec.to_N(this._value) : '')
                + ' }';
    },

 // cartesian components
    get w() { return this.wref ? this.wref.w + this.w0 : this.w0; },
    get Qx() { return this._value*Math.cos(this.w)},
    get Qy() { return this._value*Math.sin(this.w)},
    reset() {},
    apply() {
        this.p.Qx += this.Qx;
        this.p.Qy += this.Qy;
    },
    // analysis getters
    get forceAbs() { return this._value; },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
    hitContour({x,y,eps}) {
        const len = 45,   // const length for all force arrows
              p = this.p,
              cw = Math.cos(this.w), sw = Math.sin(this.w),
              off = 2*mec.node.radius,
              x1 = this.mode === 'push' ? p.x - (len+off)*cw
                                        : p.x + off*cw,
              y1 = this.mode === 'push' ? p.y - (len+off)*sw
                                        : p.y + off*sw;
         return g2.isPntOnLin({x,y},{x:x1+off*cw, y:y1+off*sw},
                                    {x:x1+(len+off)*cw,y:y1+(len+off)*sw},eps);
    },
    g2() {
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
              g = g2().beg({x,y,w,scl:1,lw:2,ls:this.model.env.show.forceColor,
                            lc:'round',sh:()=>this.sh,fs:'@ls'})
                      .drw({d:mec.load.force.arrow,lsh:true})
                      .end();
        if (this.model.env.show.loadLabels)
            g.txt({str:this.id||'?',x:xid,y:yid,thal:'center',tval:'middle',ls:this.model.env.show.txtColor});
        return g;
    },
    arrowLength: 45,   // draw all forces of length ...
    arrow: 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z'
}

/**
 * @param {object} - spring load.
 * @property {string} [p1] - referenced node id 1.
 * @property {string} [p2] - referenced node id 2.
 * @property {number} [k = 1] - spring rate.
 * @property {number} [len0] - unloaded spring length. If not specified,
 * the initial distance between p1 and p2 is taken.
 */
mec.load.spring = {
    constructor() {}, // always parameterless .. !
    /**
     * Check spring properties for validity.
     * @method
     * @param {number} idx - index in load array.
     * @returns {boolean} false - if no error / warning was detected.
     */
    validate(idx) {
        let warn = false;

        if (!this.id)
            warn = { mid:'W_ELEM_ID_MISSING',elemtype:'spring',idx };

        if (this.p1 === undefined)
            return { mid:'E_ELEM_REF_MISSING',elemtype:'spring',id:this.id,reftype:'node',name:'p1'};
        if (!this.model.nodeById(this.p1))
            return { mid:'E_ELEM_INVALID_REF',elemtype:'spring',id:this.id,reftype:'node',name:this.p1};
        else
            this.p1 = this.model.nodeById(this.p1);

        if (this.p2 === undefined)
            return { mid:'E_ELEM_REF_MISSING',elemtype:'spring',id:this.id,reftype:'node',name:'p2'};
        if (!this.model.nodeById(this.p2))
            return { mid:'E_ELEM_INVALID_REF',elemtype:'spring',id:this.id,reftype:'node',name:this.p2};
        else
            this.p2 = this.model.nodeById(this.p2);

        if (typeof this.k === 'number' && mec.isEps(this.k))
            return { mid:'E_SPRING_RATE_INVALID',id:this.id,val:this.k};

        return warn;
    },
    /**
     * Initialize spring. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in load array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this._k = mec.from_N_m(this.k || 0.01);
        this.len0 = typeof this.len0 === 'number'
                  ? this.len0
                  : Math.hypot(this.p2.x-this.p1.x,this.p2.y-this.p1.y);
    },
    /**
     * Check load for dependencies on another element.
     * @method
     * @param {object} elem - element to test dependency for.
     * @returns {boolean} true, dependency exists.
     */
    dependsOn(elem) {
        return this.p1 === elem
            || this.p2 === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p1":"'+this.p1.id+'","p2":"'+this.p2.id+'"'
                + (this._k && Math.abs(this._k - mec.from_N_m(0.01)) > 0.01 ? ',"k":'+mec.to_N_m(this._k) : '')
                + ((this.len0 && Math.abs(this.len0 - Math.hypot(this.p2.x0-this.p1.x0,this.p2.y0-this.p1.y0)) > 0.0001) ? ',"len0":'+this.len0 : '')
                + ' }';
    },

    // cartesian components
    get len() { return Math.hypot(this.p2.y-this.p1.y,this.p2.x-this.p1.x); },
    get w() { return Math.atan2(this.p2.y-this.p1.y,this.p2.x-this.p1.x); },
    get force() { return this._k*(this.len - this.len0); },                           // todo: rename due to analysis convention .. !
    get Qx() { return this.force*Math.cos(this.w)},
    get Qy() { return this.force*Math.sin(this.w)},
    reset() {},
    apply() {
        const f = this.force, w = this.w,
              Qx = f * Math.cos(w), Qy = f * Math.sin(w);
        this.p1.Qx += Qx;
        this.p1.Qy += Qy;
        this.p2.Qx -= Qx;
        this.p2.Qy -= Qy;
    },
    // analysis getters
    get forceAbs() { return this.force; },
    // interaction
    get isSolid() { return false },
    // get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : this.state & g2.EDIT ? [0, 0, 10, this.model.env.show.selectedElmColor] : false; },
    hitContour({x,y,eps}) {
        const p1 = this.p1, p2 = this.p2,
              cw = Math.cos(this.w), sw = Math.sin(this.w),
              off = 2*mec.node.radius;
        return g2.isPntOnLin({x,y},{x:p1.x+off*cw, y:p1.y+off*sw},
                                   {x:p2.x-off*cw, y:p2.y-off*sw},eps);
    },
    g2() {
        const h = 16;
        const x1 = this.p1.x, y1 = this.p1.y;
        const x2 = this.p2.x, y2 = this.p2.y;
        const len = Math.hypot(x2-x1,y2-y1);
        const xm = (x1+x2)/2;
        const ym = (y1+y2)/2;
        const ux = (x2-x1)/len;
        const uy = (y2-y1)/len;
        const off = 2*mec.node.radius;
        return g2().p()
                   .m({x:x1+ux*off,y:y1+uy*off})
                   .l({x:xm-ux*h/2,y:ym-uy*h/2})
                   .l({x:xm+(-ux/6+uy/2)*h,y:ym+(-uy/6-ux/2)*h})
                   .l({x:xm+( ux/6-uy/2)*h,y:ym+( uy/6+ux/2)*h})
                   .l({x:xm+ux*h/2,y:ym+uy*h/2})
                   .l({x:x2-ux*off,y:y2-uy*off})
                   .stroke(Object.assign({}, {ls:this.model.env.show.springColor},this,{fs:'transparent',lc:'round',lw:2,lj:'round',sh:()=>this.sh,lsh:true}));
    }
}/**
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
 * @property {string} type - view type ['vector','trace','info'].
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
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        const keys = ['vel','acc','force'];
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'vector',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'vector',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.value === undefined) 
            return { mid:'E_ALY_REF_MISSING',elemtype:'vector',id:this.id,idx,reftype:'node',name:'value',keys:'['+keys.join(',')+']'};
        
        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model,idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    preview() {},
    reset() {},
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + (this.value ? ',"value":"'+this.value+'"' : '')
                + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    get endPoints() {
        const scale = mec.aly[this.value].drwscl;
        const v = this.p[this.value];
        const vabs = Math.hypot(v.y,v.x);
        const vview = !mec.isEps(vabs,0.5)
                    ? mec.asympClamp(scale*vabs,25,100)
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
        return g2().vec({x1:pts.p1.x,
                         y1:pts.p1.y,
                         x2:pts.p2.x,
                         y2:pts.p2.y,
                         ls:this.model.env.show[this.value+'VecColor'],
                         lw:1.5,
                         sh:this.sh
        });
    }
}

/**
 * @param {object} - trace view.
 * @property {string} p - referenced node id.
 * @property {number} [t0=0] - trace begin [s].
 * @property {number} [Dt=1] - trace duration [s].
 * @property {boolean} [mode='dynamic'] - ['static','dynamic','preview'].
 * @property {string} [stroke='navy'] - web color.
 * @property {string} [fill='transparent'] - web color.
 */
mec.view.trace = {
    constructor() {
        this.pts = [];  // allocate array
    }, // always parameterless .. !
    /**
     * Check vector view properties for validity.
     * @method
     * @param {number} idx - index in views array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'trace',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'trace',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);
        
        return false;
    },
    /**
     * Initialize view. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in views array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) 
            return;

        this.t0 = this.t0 || 0;
        this.Dt = this.Dt || 1;
        this.mode = this.mode || 'dynamic';
        this.pts.length = 0;  // clear points array ...
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    build() {
        const t = this.model.timer.t;
        if (this.mode === 'static' || this.mode === 'preview') {
            if (this.t0 <= t && t <= this.t0 + this.Dt)
                this.pts.push({x:this.p.x,y:this.p.y});
        }
        else if (this.mode === 'dynamic') {
            if (this.t0 < t)
                this.pts.push({x:this.p.x,y:this.p.y});
            if (this.t0 + this.Dt < t)
                this.pts.shift();
        }
    },
    preview() {
        if (this.mode === 'preview')
            this.build();
    },
    reset(preview) {
        if (preview || this.mode !== 'preview')
            this.pts.length = 0;
    },
    post(dt) {  // add model.timer.t to parameter list .. or use timer as parameter everywhere !
        if (this.mode !== 'preview')
            this.build();
    },
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","p":"'+this.p.id+'"'
                + (this.Dt ? ',"Dt":'+this.Dt : '')
                + (this.stroke && !(this.stroke === 'navy') ? ',"stroke":"'+this.stroke+'"' : '')
                + (this.fill && !(this.stroke === 'transparent') ? ',"fill":"'+this.fill+'"' : '')
                + ' }';
    },
    // interaction
    get isSolid() { return false },
    get sh() { return this.state & g2.OVER ? [0, 0, 10, this.model.env.show.hoveredElmColor] : false; },
    hitContour({x,y,eps}) {
        return false;
    },
    g2() {
//    console.log('!')
        return g2().ply({pts: this.pts,
                         format: '{x,y}',
                         ls: this.stroke || 'navy',
                         lw: 1.5,
                         fs: this.fill || 'transparent',
                         sh: this.sh
        });
    }
}

/**
 * @param {object} - info view.
 * @property {string} elem - referenced elem id.
 * @property {string} value - elem value to view.
 * @property {string} [name] - elem value name to show.
 */
mec.view.info = {
    constructor() {}, // always parameterless .. !
    init(model) {
        if (typeof this.elem === 'string')
            this.elem = model.elementById(this.elem);
    },
    dependsOn(elem) {
        return this.elem === elem;
    },
    reset() {},
    asJSON() {
        return '{ "type":"'+this.type+'","id":"'+this.id+'","elem":"'+this.elem.id+'"'
                + (this.value ? ',"value":"'+this.value+'"' : '')
                + (this.name ? ',"name":"'+this.name+'"' : '')
                + ' }';
    },
    get hasInfo() {
        return this.elem.state === g2.OVER;  // exclude: OVER & DRAG
    },
    infoString() {
        if (this.value in this.elem) {
            const val = this.elem[this.value];
            const aly = mec.aly[this.value];
            const type = aly.type;
            const usrval = q => (q*aly.scl).toPrecision(3);

            return (this.name||aly.name||this.value) + ': '
                 + (type === 'vec' ? '{x:' + usrval(val.x)+',y:' + usrval(val.x)+'}'
                                   : usrval(val))
                 + ' ' + aly.unit;
        }
        return '?';
    }
}
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
 * @property {string} type - shape type ['fix'|'flt'|'slider'|'bar'|'beam'|'wheel'|'poly'|'img'].
 */
mec.shape = {
    extend(shape) {
        if (shape.type && mec.shape[shape.type]) {
            Object.setPrototypeOf(shape, mec.shape[shape.type]);
            shape.constructor();
        }
        return shape;
    }
}

/**
 * @param {object} - fixed node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0=0] - initial angle.
 */
mec.shape.fix = {
    /**
     * Check fixed node properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'shape',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'shape',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);
        return false;
    },
    /**
     * Initialize shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'"'
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ' }';
    },
    draw(g) {
        g.use({grp:'nodfix',x:()=>this.p.x,y:()=>this.p.y,w:this.w0 || 0});
    }
},
/**
 * @param {object} - floating node shape.
 * @property {string} p - referenced node id for position.
 * @property {number} [w0] - initial angle.
 */
mec.shape.flt = {
    /**
     * Check floating node properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'shape',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'shape',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);
        return false;
    },
    /**
     * Initialize shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
    },
    dependsOn(elem) {
        return this.p === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'"'
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ' }';
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
    /**
     * Check slider shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'slider',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'slider',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref && !this.model.constraintById(this.wref)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'slider',id:this.id,idx,reftype:'constraint',name:this.wref};
        else
            this.wref = this.model.constraintById(this.wref);

        return false;
    },
    /**
     * Initialize slider shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
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
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'"'
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + (this.wref ? ',"wref":"'+this.wref.id+'"' : '')
                + ' }';
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
    /**
     * Check bar shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p1 === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'bar',id:this.id,idx,reftype:'node',name:'p1'};
        if (!this.model.nodeById(this.p1)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'bar',id:this.id,idx,reftype:'node',name:this.p1};
        else
            this.p1 = this.model.nodeById(this.p1);

        if (this.p2 === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'bar',id:this.id,idx,reftype:'node',name:'p2'};
        if (!this.model.nodeById(this.p2)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'bar',id:this.id,idx,reftype:'node',name:this.p2};
        else
            this.p2 = this.model.nodeById(this.p2);

        return false;
    },
    /**
     * Initialize bar shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        this.model.notifyValid(this.validate(idx));
    },
    dependsOn(elem) {
        return this.p1 === elem || this.p2 === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p1":"'+this.p1.id+'","p2":"'+this.p2.id+'" }';
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
 * @property {number} [len=100] - beam length
 */
mec.shape.beam = {
    /**
     * Check beam shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'beam',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'beam',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'beam',id:this.id,idx,reftype:'constraint',name:'wref'};
        if (!this.model.constraintById(this.wref)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'beam',id:this.id,idx,reftype:'constraint',name:this.wref};
        else
            this.wref = this.model.constraintById(this.wref);

        return false;
    },
    /**
     * Initialize beam shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.len = this.len || 100;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'","wref":"'+this.wref.id+'","len":"'+this.len+'" }';
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
 * @property {number} [w0=0] - start / offset angle [rad].
 * @property {number} [r=20] - radius
 */
mec.shape.wheel = {
    /**
     * Check wheel shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'wheel',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'wheel',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'wheel',id:this.id,idx,reftype:'constraint',name:'wref'};
        if (!this.model.constraintById(this.wref)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'wheel',id:this.id,idx,reftype:'constraint',name:this.wref};
        else
            this.wref = this.model.constraintById(this.wref);

        return false;
    },
    /**
     * Initialize wheel shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
        this.r = this.r || 20;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","p":"'+this.p.id+'","r":'+this.r
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + (this.wref ? ',"wref":"'+this.wref.id+'"' : '')
                + ' }';
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
 * @param {object} - filled polygon shape.
 * @property {array} pts - array of points.
 * @property {string} p - referenced node id for reference point position.
 * @property {string} wref - referenced constraint id for orientation.
 * @property {string} [fill='#aaaaaa88'] - fill color.
 * @property {string} [stroke='transparent'] - stroke color.
 */
mec.shape.poly = {
    /**
     * Check polygon shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.pts === undefined) 
            return { mid:'E_POLY_PTS_MISSING',id:this.id,idx};
        if (this.pts.length < 2) 
            return { mid:'E_POLY_PTS_INVALID',id:this.id,idx};

        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'polygon',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'polygon',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'polygon',id:this.id,idx,reftype:'constraint',name:'wref'};
        if (!this.model.constraintById(this.wref)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'polygon',id:this.id,idx,reftype:'constraint',name:this.wref};
        else
            this.wref = this.model.constraintById(this.wref);

        return false;
    },
    /**
     * Initialize polygon shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.fill = this.fill || '#aaaaaa88';
        this.stroke = this.stroke || 'transparent';
    },
    get x0() { return  this.p.x0; },
    get y0() { return  this.p.y0; },
    get w0() { return  this.wref.w0; },
    get w() { return  this.wref.w - this.wref.w0; },
    get x() {
        const w = this.wref.w - this.wref.w0;
        return this.p.x - Math.cos(w)*this.p.x0 + Math.sin(w)*this.p.y0;
    },
    get y() {
        const w = this.wref.w - this.wref.w0;
        return this.p.y - Math.sin(w)*this.p.x0 - Math.cos(w)*this.p.y0;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","pts":'+JSON.stringify(this.pts)+',"p":"'+this.p.id+'"'
                + (this.wref ? ',"wref":"'+this.wref.id+'"' : '')
                + ((this.w0 && this.w0 > 0.0001 && !(this.wref.w0 === this.w0 )) ? ',"w0":'+this.w0 : '')
                + (this.stroke && !(this.stroke === 'transparent') ? ',"stroke":"'+this.stroke+'"' : '')
                + (this.fill && !(this.fill === '#aaaaaa88') ? ',"fill":"'+this.fill+'"' : '')
                + ' }';
    },
    draw(g) {
        g.ply({pts:this.pts,closed:true,x:()=>this.x,y:()=>this.y,w:()=>this.w,fs:this.fill,ls:this.stroke})
    }
}

/**
 * @param {object} - image shape.
 * @property {string} uri - image uri
 * @property {string} p - referenced node id for center point position.
 * @property {string} [wref] - referenced constraint id for orientation.
 * @property {number} [w0=0] - start / offset angle [rad].
 * @property {number} [xoff=0] - x offset value.
 * @property {number} [yoff=0] - y offset value.
 * @property {number} [scl=1] - scaling factor.
 */
mec.shape.img = {
    /**
     * Check image shape properties for validity.
     * @method
     * @param {number} idx - index in shape array.
     * @returns {boolean} false - if no error / warning was detected. 
     */
    validate(idx) {
        if (this.uri === undefined) 
            return { mid:'E_IMG_URI_MISSING',id:this.id,idx};

        if (this.p === undefined) 
            return { mid:'E_ELEM_REF_MISSING',elemtype:'image',id:this.id,idx,reftype:'node',name:'p'};
        if (!this.model.nodeById(this.p)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'image',id:this.id,idx,reftype:'node',name:this.p};
        else
            this.p = this.model.nodeById(this.p);

        if (this.wref && !this.model.constraintById(this.wref)) 
            return { mid:'E_ELEM_INVALID_REF',elemtype:'image',id:this.id,idx,reftype:'constraint',name:this.wref};
        else
            this.wref = this.model.constraintById(this.wref);

        return false;
    },
    /**
     * Initialize polygon shape. Multiple initialization allowed.
     * @method
     * @param {object} model - model parent.
     * @param {number} idx - index in shapes array.
     */
    init(model,idx) {
        this.model = model;
        if (!this.model.notifyValid(this.validate(idx))) return;

        this.w0 = this.w0 || 0;
        this.xoff = this.xoff || 0;
        this.yoff = this.yoff || 0;
        this.scl = this.scl || 1;
    },
    dependsOn(elem) {
        return this.p === elem || this.wref === elem;
    },
    asJSON() {
        return '{ "type":"'+this.type+'","uri":"'+this.uri+'","p":"'+this.p.id+'"'
                + (this.wref ? ',"wref":"'+this.wref.id+'"' : '')
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + ((this.xoff && Math.abs(this.xoff) > 0.0001) ? ',"xoff":'+this.xoff : '')
                + ((this.yoff && Math.abs(this.yoff) > 0.0001) ? ',"yoff":'+this.yoff : '')
                + ((this.scl && Math.abs(this.scl - 1) > 0.0001) ? ',"scl":'+this.scl : '')
                + ' }';
    },
    draw(g) {
        const w0 = this.w0 || 0, w = this.wref ? ()=>this.wref.w + w0 : w0;
        g.img({uri:this.uri,x:()=>this.p.x,y:()=>this.p.y,w,scl:this.scl,xoff:this.xoff,yoff:this.yoff})
    }
}/**
 * mec.model (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.drive.js
 * @requires mec.load.js
 * @requires mec.view.js
 * @requires mec.shape.js
 */
"use strict";

/**
 * Wrapper class for extending plain model objects, usually generated from a JSON object.
 * @method
 * @returns {object} model object.
 * @param {object} - plain javascript model object.
 * @property {string} id - model id.
 * @property {boolean|object} [gravity] - Vector `{x,y}` of gravity or `{x:0,y:-10}` in case of `true`.
 * @property {object} [labels] - user specification of labels to show `default={nodes:false,constraints:true,loads:true}`.
 * @property {array} nodes - Array of node objects.
 * @property {array} constraints - Array of constraint objects.
 * @property {array} shapes - Array of shape objects.
 */
mec.model = {
    extend(model, env = mec) {
        Object.setPrototypeOf(model, this.prototype);
        model.constructor(env);
        return model;
    },
    prototype: {
        constructor(env) {
            this.env = env; // reference environment of model
            if (env !== mec && !env.show) // it's possible that user defined a (complete!) custom show object
                this.env.show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy show object including getters

            this.state = {valid:true,itrpos:0,itrvel:0,preview:false};
            this.timer = {t:0,dt:1/60};
            // create empty containers for all elements
            if (!this.nodes) this.nodes = [];
            if (!this.constraints) this.constraints = [];
            if (!this.loads) this.loads = [];
            if (!this.views) this.views = [];
            if (!this.shapes) this.shapes = [];
            // extending elements by their prototypes
            for (const node of this.nodes)
                mec.node.extend(node);
            for (const constraint of this.constraints)
                mec.constraint.extend(constraint);
            for (const load of this.loads)
                mec.load.extend(load)
            for (const view of this.views)
                mec.view.extend(view)
            for (const shape of this.shapes)
                mec.shape.extend(shape)
        },
        /**
         * Init model
         * @method
         * @returns object} model.
         */
        init() {
            if (this.gravity === true)
                this.gravity = Object.assign({},mec.gravity,{active:true});
            else if (!this.gravity)
                this.gravity = Object.assign({},mec.gravity,{active:false});

            this.state.valid = true;  // clear previous logical error result ...
            for (let i=0; i < this.nodes.length && this.valid; i++)
                this.nodes[i].init(this,i);
            for (let i=0; i < this.constraints.length && this.valid; i++)
                this.constraints[i].init(this,i);
            for (let i=0; i < this.loads.length && this.valid; i++)
                this.loads[i].init(this,i);
            for (let i=0; i < this.views.length && this.valid; i++)
                this.views[i].init(this,i);
            for (let i=0; i < this.shapes.length && this.valid; i++)
                this.shapes[i].init(this,i);

            return this;
        },
        /**
         * Notification of validity by child. Error message aborts init procedure.
         * @method
         * @param {boolean | object} msg - message object or false in case of no error / warning.
         * @returns {boolean | object} message object in case of logical error / warning or `false`.
         */
        notifyValid(msg) {
            if (msg) {
                this.state.msg = msg;
                return (this.state.valid = msg.mid[0] !== 'E');
            }
            return true;
        },
        /**
         * Reset model
         * All nodes are set to their initial position.
         * Kinematic values are set to zero.
         * @method
         * @returns {object} model
         */
        reset() {
            this.timer.t = 0;
            Object.assign(this.state,{valid:true,itrpos:0,itrvel:0});
            for (const node of this.nodes)
                node.reset();
            for (const constraint of this.constraints)
                constraint.reset();
            for (const load of this.loads)
                load.reset();
            for (const view of this.views)
                view.reset();
            return this;
        },
        /**
         * Preview model
         * Some views need pre calculation for getting immediate results (i.e. traces)
         * After `preview` was called, model is in `reset` state.
         * @method
         * @returns {object} model
         */
        preview() {
            let previewMode = false, tmax = 0;
            for (const view of this.views) {
                if (view.mode === 'preview') {
                    tmax = view.t0 + view.Dt;
                    view.reset(previewMode = true);
                }
            }
            if (previewMode) {
                this.reset();
                this.state.preview = true;
                this.timer.dt = 1/30;

                for (this.timer.t = 0; this.timer.t <= tmax; this.timer.t += this.timer.dt) {
                    this.pre().itr().post();
                    for (const view of this.views)
                        if (view.preview)
                            view.preview();
                }

                this.timer.dt = 1/60;
                this.state.preview = false;
                this.reset();
            }
            return this;
        },
        /**
         * Assemble model (depricated ... use pose() instead)
         * @method
         * @returns {object} model
         */
        asm() {
            let valid = this.asmPos();
            valid = this.asmVel() && valid;
            return this;
        },
        /**
         * Bring mechanism to a valid pose.
         * No velocities or forces are calculated.
         * @method
         * @returns {object} model
         */
        pose() {
            return this.asmPos();
        },
        /**
         * Perform timer tick.
         * Model time is incremented by `dt`.
         * Model time is independent of system time.
         * Input elements may set simulation time and `dt` explicite.
         * `model.tick()` is then called with `dt = 0`.
         * @method
         * @param {number} [dt=0] - time increment.
         * @returns {object} model
         */
        tick(dt) {
            if (dt) { // sliders (dt == 0) are setting simulation time explicite .. !
                dt = 1/60;  // BUG ?? fix: dt as a constant for now (study variable time step theoretically !!)
                this.timer.t += (this.timer.dt = dt);
            }
            this.pre().itr().post();
            return this;
        },
        /**
         * Stop model motion.
         * Zero out velocities and accelerations.
         * @method
         * @returns {object} model
         */
        stop() {
            // post process nodes
            for (const node of this.nodes)
                node.xt = node.yt = node.xtt = node.ytt = 0;
            return this;
        },
        /**
         * Model degree of freedom (movability)
         */
        get dof() {
            let dof = 0;
            for (const node of this.nodes)
                dof += node.dof;
            for (const constraint of this.constraints)
                dof -= (2 - constraint.dof);
            return dof;
        },
        /**
         * Gravity (vector) value.
         * @type {boolean}
         */
        get hasGravity() { return this.gravity.active; },

        get dirty() { return this.state.dirty; },  // deprecated !!
        set dirty(q) { this.state.dirty = q; },
        get valid() { return this.state.valid; },
        set valid(q) { this.state.valid = q; },
        /**
         * Message object resulting from initialization process.
         * @type {object}
         */
        get msg() { return this.state.msg; },
        get info() {
            let str = '';
            for (const view of this.views)
                if (view.hasInfo)
                    str += view.infoString()+'<br>';
            return str.length === 0 ? false : str;
        },
        /**
         * Number of positional iterations.
         * @type {number}
         */
        get itrpos() { return this.state.itrpos; },
        set itrpos(q) { this.state.itrpos = q; },
        /**
         * Number of velocity iterations.
         * @type {number}
         */
        get itrvel() { return this.state.itrvel; },
        set itrvel(q) { this.state.itrvel = q; },

        /**
         * Test, if model is active.
         * Nodes are moving (nonzero velocities) or active drives.
         * @type {boolean}
         */
        get isActive() {
            return this.hasActiveDrives   // active drives
                || this.dof > 0           // or can move by itself
                && !this.isSleeping;      // and does exactly that
        },
        /**
         * Test, if nodes are significantly moving
         * @type {boolean}
         */
        get isSleeping() {
            let sleeping = true;
            for (const node of this.nodes)
                sleeping = sleeping && node.isSleeping;
            return sleeping;
        },
        /**
         * Test, if some drives are 'idle' or 'running'
         * @const
         * @type {boolean}
         */
        get hasActiveDrives() {
            let active = false;
            for (const constraint of this.constraints)
                active = active || constraint.hasActiveDrives(this.timer.t);
            return active;
        },
        /**
         * Check, if other elements are dependent on specified element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} true in case of existing dependents.
         */
        hasDependents(elem) {
            let dependency = false;
            for (const constraint of this.constraints)
                dependency = constraint.dependsOn(elem) || dependency;
            for (const load of this.loads)
                dependency = load.dependsOn(elem) || dependency;
            for (const view of this.views)
                dependency = view.dependsOn(elem) || dependency;
            for (const shape of this.shapes)
                dependency = shape.dependsOn(elem) || dependency;
            return dependency;
        },
        /**
         * Get direct dependents of a specified element.
         * As a result a dictionary object containing dependent elements is created:
         * `{constraints:[], loads:[], shapes:[], views:[]}`
         * @method
         * @param {object} elem - element.
         * @returns {object} dictionary object containing dependent elements.
         */
        dependentsOf(elem, deps) {
            deps = deps || {constraints:[],loads:[],views:[],shapes:[]};
            for (const constraint of this.constraints)
                if (constraint.dependsOn(elem)) {
                    this.dependentsOf(constraint,deps);
                    deps.constraints.push(constraint);
                }
            for (const load of this.loads)
                if (load.dependsOn(elem))
                    deps.loads.push(load);
            for (const view of this.views)
                if (view.dependsOn(elem))
                    deps.views.push(view);
            for (const shape of this.shapes)
                if (shape.dependsOn(elem))
                    deps.shapes.push(shape);
            return deps;
        },
        /**
         * Verify an element indirect (deep) depending on another element.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} dependency exists.
         */
        /*
        deepDependsOn(elem,target) {
            if (elem === target)
                return true;
            else {
                for (const node of this.nodes)
                    if (elem.dependsOn(node))
                        return true;
                for (const constraint of this.constraints)
                    if (elem.dependsOn(elem) || this.deepDependsOn(elem,constraint))
                        return true;
                for (const load of this.loads)
                    if (load.dependsOn(elem))
                        deps.loads.push(load);
            for (const view of this.views)
                if (view.dependsOn(elem))
                    deps.views.push(view);
            for (const shape of this.shapes)
                if (shape.dependsOn(elem))
                    deps.shapes.push(shape);
                for 
            }
        },
*/
        /**
         * Purge all elements in an element dictionary.
         * @method
         * @param {object} elems - element dictionary.
         */
        purgeElements(elems) {
            for (const constraint of elems.constraints)
                this.constraints.splice(this.constraints.indexOf(constraint),1);
            for (const load of elems.loads)
                this.loads.splice(this.loads.indexOf(load),1);
            for (const view of elems.views)
                this.views.splice(this.views.indexOf(view),1);
            for (const shape of elems.shapes)
                this.shapes.splice(this.shapes.indexOf(shape),1);
        },
        /**
         * Get element by id.
         * @method
         * @param {string} id - element id.
         */
        elementById(id) {
            return this.nodeById(id)
                || this.constraintById(id)
                || this.loadById(id)
                || this.viewById(id);
        },
        /**
         * Add node to model.
         * @method
         * @param {object} node - node to add.
         */
        addNode(node) {
            this.nodes.push(node);
        },
        /**
         * Get node by id.
         * @method
         * @param {object} node - node to find.
         */
        nodeById(id) {
            for (const node of this.nodes)
                if (node.id === id)
                    return node;
            return false;
        },
        /**
         * Remove node, if there are no dependencies to other objects.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        removeNode(node) {
            const dependency = this.hasDependents(node);
            if (!dependency)
                this.nodes.splice(this.nodes.indexOf(node),1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete node and all depending elements from model.
         * The calling app has to ensure, that `node` is in fact an entry of
         * the `model.nodes` array.
         * @method
         * @param {object} node - node to remove.
         */
        purgeNode(node) {
            this.purgeElements(this.dependentsOf(node));
            this.nodes.splice(this.nodes.indexOf(node),1);
        },
        /**
         * Add constraint to model.
         * @method
         * @param {object} constraint - constraint to add.
         */
        addConstraint(constraint) {
            this.constraints.push(constraint);
        },
        /**
         * Get constraint by id.
         * @method
         * @param {object} id - constraint id.
         * @returns {object} constraint to find.
         */
        constraintById(id) {
            for (const constraint of this.constraints)
                if (constraint.id === id)
                    return constraint;
            return false;
        },
        /**
         * Remove constraint, if there are no dependencies to other objects.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         * @returns {boolean} true, the constraint was removed, otherwise false in case of existing dependencies.
         */
        removeConstraint(constraint) {
            const dependency = this.hasDependents(constraint);
            if (!dependency)
                this.constraints.splice(this.constraints.indexOf(constraint),1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete constraint and all depending elements from model.
         * The calling app has to ensure, that `constraint` is in fact an entry of
         * the `model.constraints` array.
         * @method
         * @param {object} constraint - constraint to remove.
         */
        purgeConstraint(constraint) {
            this.purgeElements(this.dependentsOf(constraint));
            this.constraints.splice(this.constraints.indexOf(constraint),1);
        },
        /**
         * Add load to model.
         * @method
         * @param {object} load - load to add.
         */
        addLoad(load) {
            this.loads.push(load);
        },
        /**
         * Get load by id.
         * @method
         * @param {object} id - load id.
         * @returns {object} load to find.
         */
        loadById(id) {
            for (const load of this.loads)
                if (load.id === id)
                    return load;
            return false;
        },
        /**
         * Remove load, if there are no other objects depending on it.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} node - load to remove.
         * @returns {boolean} true, the node was removed, otherwise other objects depend on it.
         */
        removeLoad(load) {
            const dependency = this.hasDependents(load);
            if (!dependency)
                this.loads.splice(this.loads.indexOf(load),1);
            return !dependency;
        },
        /**
         * Delete load and all depending elements from model.
         * The calling app has to ensure, that `load` is in fact an entry of
         * the `model.loads` array.
         * @method
         * @param {object} load - load to delete.
         */
        purgeLoad(load) {
            this.purgeElements(this.dependentsOf(load));
            this.loads.splice(this.loads.indexOf(load),1);
        },
        /**
         * Add shape to model.
         * @method
         * @param {object} shape - shape to add.
         */
        addShape(shape) {
            this.shapes.push(shape);
        },
        /**
         * Remove shape, if there are no other objects depending on it.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to remove.
         */
        removeShape(shape) {
            const idx = this.shapes.indexOf(shape);
            if (idx >= 0)
                this.shapes.splice(idx,1);
        },
        /**
         * Delete shape and all dependent elements from model.
         * The calling app has to ensure, that `shape` is in fact an entry of
         * the `model.shapes` array.
         * @method
         * @param {object} shape - shape to delete.
         */
        purgeShape(shape) {
            this.purgeElements(this.dependentsOf(shape));
            this.shapes.splice(this.shapes.indexOf(shape),1);
        },
        /**
         * Add view to model.
         * @method
         * @param {object} view - view to add.
         */
        addView(view) {
            this.views.push(view);
        },
        /**
         * Get view by id.
         * @method
         * @param {object} id - view id.
         * @returns {object} view to find.
         */
        viewById(id) {
            for (const view of this.views)
                if (view.id === id)
                    return view;
            return false;
        },
        /**
         * Remove view, if there are no other objects depending on it.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to remove.
         */
        removeView(view) {
            const idx = this.views.indexOf(view);
            if (idx >= 0)
                this.views.splice(idx,1);
        },
        /**
         * Delete view and all dependent elements from model.
         * The calling app has to ensure, that `view` is in fact an entry of
         * the `model.views` array.
         * @method
         * @param {object} view - view to delete.
         */
        purgeView(view) {
            this.purgeElements(this.dependentsOf(view));
            this.views.splice(this.views.indexOf(view),1);
        },
        /**
         * Return a JSON-string of the model
         * @method
         * @returns {string} model as JSON-string.
         */
        asJSON() {
            // dynamically create a JSON output string ...
            const nodeCnt = this.nodes.length;
            const contraintCnt = this.constraints.length;
            const loadCnt = this.loads.length;
            const shapeCnt = this.shapes.length;
            const viewCnt = this.views.length;
            const comma = (i,n) => i < n-1 ? ',' : '';
            const str = '{'
                      + '\n  "id":"'+this.id+'"'
                      + (this.gravity.active ? ',\n  "gravity":true' : '')  // in case of true, should also look at vector components  .. !
                      + (nodeCnt ? ',\n  "nodes": [\n' : '\n')
                      + (nodeCnt ? this.nodes.map((n,i) => '    '+n.asJSON()+comma(i,nodeCnt)+'\n').join('') : '')
                      + (nodeCnt ? (contraintCnt || loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (contraintCnt ? '  "constraints": [\n' : '')
                      + (contraintCnt ? this.constraints.map((n,i) => '    '+n.asJSON()+comma(i,contraintCnt)+'\n').join('') : '')
                      + (contraintCnt ? (loadCnt || shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (loadCnt ? '  "loads": [\n' : '')
                      + (loadCnt ? this.loads.map((n,i) => '    '+n.asJSON()+comma(i,loadCnt)+'\n').join('') : '')
                      + (loadCnt ? (shapeCnt || viewCnt) ? '  ],\n' : '  ]\n' : '')
                      + (shapeCnt ? '  "shapes": [\n' : '')
                      + (shapeCnt ? this.shapes.map((n,i) => '    '+n.asJSON()+comma(i,shapeCnt)+'\n').join('') : '')
                      + (shapeCnt ? viewCnt ? '  ],\n' : '  ]\n' : '')
                      + (viewCnt ? '  "views": [\n' : '')
                      + (viewCnt ? this.views.map((n,i) => '    '+n.asJSON()+comma(i,viewCnt)+'\n').join('') : '')
                      + (viewCnt ? '  ]\n' : '')
                      + '}';

            return str;
        },
        /**
         * Apply loads to their nodes.
         * @internal
         * @method
         * @returns {object} model
         */
        applyLoads() {
            // Apply node weight in case of gravity.
            for (const node of this.nodes) {
                node.Qx = node.Qy = 0;
                if (!node.base && this.hasGravity) {
                    node.Qx = node.m*mec.from_N(this.gravity.x);
                    node.Qy = node.m*mec.from_N(this.gravity.y);
                }
            }
            // Apply external loads.
            for (const load of this.loads)
                load.apply();
            return this;
        },
        /**
         * Assemble positions of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmPos() {
            let valid = false;
            this.itrpos = 0;
            while (!valid && this.itrpos++ < mec.asmItrMax) {
                valid = this.posStep();
            }
            return this.valid = valid;
        },
        /**
         * Position iteration step over all constraints.
         * @internal
         * @method
         * @returns {object} model
         */
        posStep() {
            let valid = true;  // pre-assume valid constraints positions ...
            for (const constraint of this.constraints)
                valid = constraint.posStep() && valid;
            return valid;
        },
        /**
         * Assemble velocities of model.
         * @internal
         * @method
         * @returns {object} model
         */
        asmVel() {
            let valid = false;
            this.itrvel = 0;
            while (!valid && this.itrvel++ < mec.asmItrMax)
                valid = this.velStep();
            return valid;
        },
        /**
         * Velocity iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        velStep() {
            let valid = true;  // pre-assume valid constraints velocities ...
            for (const constraint of this.constraints) {
                valid = constraint.velStep(this.timer.dt) && valid;
            }
            return valid;
        },
        /**
         * Pre-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        pre() {
            this.applyLoads();
            // pre process nodes
            for (const node of this.nodes)
                node.pre(this.timer.dt);
            // pre process constraints
            for (const constraint of this.constraints)
                constraint.pre(this.timer.dt);
            // eliminate drift ...
            this.asmPos(this.timer.dt);
            // pre process views
            for (const view of this.views)
                if (view.pre)
                    view.pre(this.timer.dt);
            return this;
        },
        /**
         * Perform iteration steps until constraints are valid or max-iteration
         * steps for assembly are reached.
         * @internal
         * @method
         * @returns {object} model
         */
        itr() {
            this.asmVel();
            return this;
        },
        /**
         * Post-process model.
         * @internal
         * @method
         * @returns {object} model
         */
        post() {
            // post process constraints
            for (const constraint of this.constraints)
                constraint.post(this.timer.dt);
            // post process nodes
            for (const node of this.nodes)
                node.post(this.timer.dt);
            // post process views
            for (const view of this.views)
                if (view.post)
                    view.post(this.timer.dt);

//    console.log(this.state.itrpos)
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {  // todo: draw all components via 'x.draw(g)' call !
            for (const shape of this.shapes)
                shape.draw(g);
            for (const view of this.views)
                g.ins(view);
            for (const constraint of this.constraints)
                g.ins(constraint);
            for (const load of this.loads)
                g.ins(load);
            for (const node of this.nodes)
                g.ins(node);
            return this;
        }
    }
}/**
 * mec.msg.en (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec.msg.en namespace for English mec related messages.
 */
mec.msg.en = {
    // User interface related messages
    U_SEL_SECOND_NODE: () => `Select second node.`,

    // Logical warnings
    W_CSTR_NODES_COINCIDE: ({cstr,p1,p2}) => `Warning: Nodes '${p1}' and '${p2}' of constraint '${cstr}' coincide.`,

    // Logical errors / warnings
    E_ELEM_ID_MISSING: ({elemtype,idx}) => `${elemtype} with index ${idx} must have an id defined.`,
    E_ELEM_ID_AMBIGIOUS: ({elemtype,id}) => `${elemtype} id '${id}' is ambigious.`,
    W_ELEM_ID_MISSING: ({elemtype,idx}) => `${elemtype} with index ${idx} should have an id defined.`,
    E_ELEM_REF_MISSING: ({elemtype,id,idx,reftype,name}) => `${elemtype} ${id?("'"+id+"'"):("["+idx+"]")} must have a ${reftype} reference '${name}' defined.`,
    E_ELEM_INVALID_REF: ({elemtype,id,idx,reftype,name,}) => `${reftype} reference '${name}' of ${elemtype} ${id?("'"+id+"'"):("["+idx+"]")} is invalid.`,

    E_NODE_MASS_TOO_SMALL: ({id,m}) => `Node's (id='${id}') mass of ${m} is too small.`,

    E_CSTR_NODE_MISSING: ({id, loc, p}) => `${loc} node '${p}' of constraint (id='${id}') is missing.`,
    E_CSTR_NODE_NOT_EXISTS: ({id,loc,p,nodeId}) => `${loc} node '${p}':'${nodeId}' of constraint '${id}' does not exist.`,
    E_CSTR_REF_NOT_EXISTS: ({id,sub,ref}) => `Reference to '${ref}' in '${sub} of constraint '${id}' does not exist.`,
    E_CSTR_DRIVEN_REF_TO_FREE: ({id,sub,ref, reftype}) => `Driven ${sub} constraint of '${id}' must not reference free ${reftype} of constraint '${ref}'.`,
    W_CSTR_RATIO_IGNORED: ({id,sub,ref,reftype}) => `Ratio value of driven ${sub} constraint '${id}' with reference to '${reftype}' constraint '${ref}' ignored.`,

    E_FORCE_VALUE_INVALID: ({id,val}) => `Force value '${val}' of load '${id}' is not allowed.`,
    E_SPRING_RATE_INVALID: ({id,val}) => `Spring rate '${val}' of load '${id}' is not allowed.`,

    E_POLY_PTS_MISSING: ({id,idx}) => `Polygon shape ${id?("'"+id+"'"):("["+idx+"]")} must have a points array 'pts' defined.`,
    E_POLY_PTS_INVALID: ({id,idx}) => `Polygon shape ${id?("'"+id+"'"):("["+idx+"]")} must have a points array 'pts' with at least two points defined.`,

    E_IMG_URI_MISSING: ({id,idx}) => `Image shape ${id?("'"+id+"'"):("["+idx+"]")} must have an uniform resource locator 'uri' defined.`,

    E_ALY_REF_MISSING: ({id,idx}) => ({elemtype,id,idx,reftype,name}) => `${elemtype} ${id?("'"+id+"'"):("["+idx+"]")} must have with '${name}' an existing property name of a ${reftype} specified. One of ${keys} are supported.`,
    E_ALY_REF_INVALID: ({id,idx}) => ({elemtype,id,idx,reftype,name}) => `${elemtype} ${id?("'"+id+"'"):("["+idx+"]")} has with '${name}' an invalid property name of a ${reftype} specified. One of ${keys} are supported.`,
}

