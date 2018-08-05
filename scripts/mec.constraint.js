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

//  { id:<string>,p1:<string>,p2:<string>,ori:<object>,len:<object> },
/**
 * Wrapper class for extending plain constraint objects, usually coming from JSON objects.
 * @method
 * @returns {object} constraint object.
 * @param {object} - plain javascript constraint object.
 * @property {string} id - constraint id.
 * @property {string} p1 - first point id.
 * @property {string} p2 - second point id.
 * @property {object} [ori] - orientation object.
 * @property {string} [ori.type] - type of orientation constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [ori.w0] - initial angle [rad].
 * @property {string} [ori.ref] - referenced constraint id.
 * @property {string} [ori.refval] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [ori.func] - drive function name from `mec.drive` object ['linear'|'quadratic', ...].
 *                                 If the name points to a function in `mec.drive` (not an object as usual) 
 *                                 it will be called with `ori.arg` as an argument.
 * @property {string} [ori.arg] - drive function argument.
 * @property {number} [ori.t0] - drive parameter start value.
 * @property {number} [ori.Dt] - drive parameter value range.
 * @property {number} [ori.Dw] - drive angular range [rad].
 * @property {object} [len] - length object.
 * @property {string} [len.type] - type of length constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [len.r0] - initial length.
 * @property {string} [len.ref] - referenced constraint id.
 * @property {string} [len.refval] - referencing other orientation or length value ['ori'|'len'].
 * @property {number} [ori.ratio] - ratio to referencing value.
 * @property {string} [len.func] - drive function name ['linear'|'quadratic', ...].
 * @property {string} [len.arg] - drive function argument.
 * @property {number} [len.t0] - drive parameter start value.
 * @property {number} [len.Dt] - drive parameter value range.
 * @property {number} [len.Dr] - drive linear range [rad].
 */
mec.constraint = {
    extend(c) { Object.setPrototypeOf(c, this.prototype); c.constructor(); return c; },
    prototype: {
        constructor() {}, // always parameterless .. !
        init(model) {
            this.model = model;
            if (typeof this.p1 === 'string')
                this.p1 = this.model.nodeById(this.p1);
            if (typeof this.p2 === 'string')
                this.p2 = this.model.nodeById(this.p2);
            if (!this.hasOwnProperty('ori'))
                this.ori = { type:'free' };
            if (!this.hasOwnProperty('len'))
                this.len = { type:'free' };

            const ori = this.ori, len = this.len;

            if      (ori.type === 'free')  this.init_ori_free(ori);
            else if (ori.type === 'const') this.init_ori_const(ori);
            else if (ori.type === 'ref')   this.init_ori_ref(ori);
            else if (ori.type === 'drive') this.init_ori_drive(ori);

            if      (len.type === 'free')  this.init_len_free(len);
            else if (len.type === 'const') this.init_len_const(len);
            else if (len.type === 'ref')   this.init_len_ref(len);
            else if (len.type === 'drive') this.init_len_drive(len);

            // this.type = ori.type === 'free' && len.type === 'free' ? 'free'
            //           : ori.type === 'free' && len.type !== 'free' ? 'rot'
            //           : ori.type !== 'free' && len.type === 'free' ? 'tran'
            //           : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
            //           : 'invalid';

            // this.pos = this.type === 'free' ? () => true
            //          : this.type === 'rot'  ? () => this.len_pos()
            //          : this.type === 'tran' ? () => this.ori_pos()
            //          : this.type === 'ctrl' ? () => { let res = this.ori_pos(); return this.len_pos() && res }
            //          : false;

            // this.vel = this.type === 'free' ? (dt) => true
            //          : this.type === 'rot'  ? (dt) => this.len_vel(dt)
            //          : this.type === 'tran' ? (dt) => this.ori_vel(dt)
            //          : this.type === 'ctrl' ? (dt) => { let res = this.ori_vel(dt); return this.len_vel(dt) && res }
            //          : false;

            // pre-calculate both constraint mass components
            // const mc = 1/(this.p1.im + this.p2.im);
            // this.mc1 = this.p1.im * mc;
            // this.mc2 = this.p2.im * mc;
            // lagrange identifiers
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        /**
         * Reset constraint
         */
        reset() {
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
        get initialized() { return typeof this.p1 === 'object' },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) + 
                   (this.len.type === 'free' ? 1 : 0);
        },
        /**
         * Force value in [N]
         */
        get force() { 
            return mec.to_N(-this.lambda_r);
        },
        /**
         * Moment value in [Nm]
         */
        get moment() { return mec.to_Nm(-this.lambda_w * this.r); },
        /**
         * Check constraint for dependencies on another element.
         * @method
         * @param {object} elem - element to test dependency for.
         * @returns {boolean} true, dependency exists.
         */
        dependsOn(elem) {
            return this.p1 === elem
                || this.p2 === elem 
                || this.ori && this.ori.ref === elem
                || this.len && this.len.ref === elem;
        },
        // privates
        get ax() { return this.p2.x - this.p1.x },
        get ay() { return this.p2.y - this.p1.y },
        get axt() { return this.p2.xtcur - this.p1.xtcur },
        get ayt() { return this.p2.ytcur - this.p1.ytcur },
        get axtt() { return this.p2.xtt - this.p1.xtt },
        get aytt() { return this.p2.ytt - this.p1.ytt },
        get mc1() { return this.p1.im / (this.p1.im + this.p2.im) },
        get mc2() { return this.p2.im / (this.p1.im + this.p2.im) },
        get color() { return this.model.valid 
                           ? mec.validConstraintColor 
                           : mec.invalidConstraintColor; 
        },
        init_ori_free(ori) {
            this.w0 = Math.atan2(this.ay,this.ax);
            this.assignGetters({
                w:  () => Math.atan2(this.ay,this.ax),
                wt: () => (this.ax*this.ayt - this.ay*this.axt)/this.r**2,
                wtt:() => (this.ax*this.aytt - this.ay*this.axtt)/this.r**2
            });
        },
        init_ori_const(ori) {
            this.w = this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : Math.atan2(this.ay,this.ax);
            this.wt = this.wtt = 0;
        },
        init_ori_ref(ori) {
            this.w0 = Math.atan2(this.ay,this.ax);
            ori.ratio = ori.ratio || 1;
            if (typeof ori.ref === 'string')
                ori.ref = this.model.constraintById(ori.ref);
            if (!ori.ref.initialized) 
                ori.ref.init(this.model);
            if (ori.refValue === 'len')
                this.assignGetters({
                    w:  () => this.w0 + ori.ratio*(ori.ref.r - ori.ref.r0),
                    wt: () => ori.ratio*ori.ref.rt,
                    wtt:() => ori.ratio*ori.ref.rtt
                })
            else
                this.assignGetters({
                    w:  () => this.w0 + ori.ratio*(ori.ref.w - ori.ref.w0),
                    wt: () => ori.ratio*ori.ref.wt,
                    wtt:() => ori.ratio*ori.ref.wtt
                })
        },
        init_ori_drive(ori) {
            this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : Math.atan2(this.ay,this.ax);

            ori.drive = mec.drive[ori.func || 'linear'];
            ori.Dw = ori.Dw || 2*Math.PI;
            ori.t0 = ori.t0 || 0;
            ori.Dt = ori.Dt || 1;
            if (ori.bounce) {
                ori.drive = mec.drive.bounce(ori.drive);
                ori.Dt *= 2;  // preserve duration per repetition
            }
            if (ori.repeat) {
                ori.drive = mec.drive.repeat(ori.drive,ori.repeat);
                ori.Dt *= ori.repeat;  // preserve duration per repetition
            }
/* needed for parametric drive functions (ramp) .. some time in future
            ori.drive = typeof mec.drive[ori.func] === 'function' 
                      ? mec.drive[ori.func].apply(null,ori.args)
                      : mec.drive[ori.func];
*/
            if (ori.input) {    // requesting for input element .. for handing over 'inputCallbk'
                ori.input_t = 0;
                ori.inputCallbk = (e) => {    // assuming user friendly angles in [deg] are coming in.
                    const t =  (+e.target.value)*Math.PI/180*ori.Dt/ori.Dw;
                    ori.prev_t = ori.input_t;
                    ori.input_t = t;
                    this.model.timer.dt = Math.PI/180*ori.Dt/ori.Dw;  // dt depends on slider tick size ..
                    this.model.direc = Math.sign(ori.input_t - ori.prev_t) || 1;  // no zero value allowed ..
                }
            }
            // Access drive time via input element (slider) or as model time ...
            Object.defineProperty(ori, 't', { get: () => ori.input ? ori.input_t : this.model.timer.t, 
                                              enumerable:true, 
                                              configurable:true }
            );

            this.assignGetters({
                w:  () => this.w0 + ori.drive.f(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw,
                wt: () => this.model.timer.t < ori.t0 || this.model.timer.t > ori.t0 + ori.Dt
                        ? 0
                        : ori.drive.fd(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw/ori.Dt,
                wtt:() => this.model.timer.t < ori.t0 || this.model.timer.t > ori.t0 + ori.Dt
                        ? 0
                        : ori.drive.fdd(Math.max(0,Math.min((ori.t - ori.t0)/ori.Dt,1)))*ori.Dw/(ori.Dt**2)
            })
        },
        init_len_free(len) {
            this.r0 = Math.hypot(this.ay,this.ax);
            this.assignGetters({
                r:  () => Math.hypot(this.ay,this.ax),
                rt: () => (this.ax*this.axt + this.ay*this.ayt)/Math.hypot(this.ay,this.ax),
                rtt:() => (this.ax*this.axtt + this.ay*this.aytt + this.axt**2 + this.ayt**2 - this.rt**2)/Math.hypot(this.ay,this.ax)
            })
        },
        init_len_const(len) {
            this.r = this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);
            this.rt = this.rtt = 0;
        },
        init_len_ref(len) {
            this.r0 = Math.hypot(this.ay,this.ax);
            len.ratio = len.ratio || 1;
            if (typeof len.ref === 'string')
                len.ref = this.model.constraintById(len.ref);
            if (!len.ref.initialized) 
                len.ref.init(this.model);
            if (len.refValue === 'ori')
                this.assignGetters({
                    r:  () => this.r0 + len.ratio*(len.ref.w - len.ref.w0),
                    rt: () => len.ratio*len.ref.wt,
                    rtt:() => len.ratio*len.ref.wtt
                })
            else
                this.assignGetters({
                    r:  () => this.r0 + len.ratio*(len.ref.r - len.ref.r0),
                    rt: () => len.ratio*len.ref.rt,
                    rtt:() => len.ratio*len.ref.rtt
                })
        },
        init_len_drive(len) {
            this.r0 = len.hasOwnProperty('r0') ? len.r0 : Math.hypot(this.ay,this.ax);

            len.drive = mec.drive[len.func || 'linear'];
            len.Dr = len.Dr || 100;
            len.t0 = len.t0 || 0;
            len.Dt = len.Dt || 1;
            if (len.bounce) {
                len.drive = mec.drive.bounce(len.drive);
                len.Dt *= 2;  // preserve duration per repetition
            }
            if (len.repeat) {
                len.drive = mec.drive.repeat(len.drive,len.repeat);
                len.Dt *= len.repeat;  // preserve duration per repetition
            }
/* needed for parametric drive functions (ramp) .. some time in future
            len.drive = typeof mec.drive[len.func] === 'function' 
                      ? mec.drive[len.func].apply(null,len.args)
                      : mec.drive[len.func];
*/
            if (len.input) {    // requesting for input element .. for handing over 'inputCallbk'
                len.input_t = 0;
                len.inputCallbk = (e) => {    // assuming user friendly length values [u] coming in.
                    const dt = len.Dt/len.Dr,
                          t =  (+e.target.value)*dt;
                    len.prev_t = len.input_t;
                    len.input_t = t;
                    this.model.timer.dt = dt;  // dt depends on slider tick size ..
                    this.model.direc = Math.sign(len.input_t - len.prev_t) || 1;  // no zero value allowed ..
                }
            }
            // Access drive time via input element (slider) or as model time ...
            Object.defineProperty(len, 't', { get: () => len.input ? len.input_t : this.model.timer.t, 
                                              enumerable:true, 
                                              configurable:true }
            );

            this.assignGetters({
                r:  () => this.r0 + len.drive.f(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dr,
                rt: () => this.model.timer.t < len.t0 || this.model.timer.t > len.t0 + len.Dt
                        ? 0
                        : len.drive.fd(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dr/len.Dt,
                rtt:() => this.model.timer.t < len.t0 || this.model.timer.t > len.t0 + len.Dt
                        ? 0
                        : len.drive.fdd(Math.max(0,Math.min((len.t - len.t0)/len.Dt,1)))*len.Dw/(len.Dt**2)
            })
        },
        posStep() {
            let res;
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_pos()
                 : this.type === 'tran' ? this.ori_pos()
                 : this.type === 'ctrl' ? (res = this.ori_pos(), (this.len_pos() && res))                    
                 : false;
        },
        velStep(dt) {
//            console.log(dt)
            return this.type === 'free' ? true
                 : this.type === 'rot'  ? this.len_vel(dt)
                 : this.type === 'tran' ? this.ori_vel(dt)
                 : this.type === 'ctrl' ? !!((+this.ori_vel(dt))*(+this.len_vel(dt)))
//                 : this.type === 'ctrl' ? (res = this.ori_vel(dt), (this.len_vel(dt) && res))
                 : false;
        },
        pre(dt) {
            const impulse_r = this.lambda_r * dt,
                  impulse_w = this.lambda_w * dt,
                  w = this.w, cw = Math.cos(w), sw = Math.sin(w);
            // apply radial impulse
            this.p1.dxt += -cw * this.p1.im * impulse_r;
            this.p1.dyt += -sw * this.p1.im * impulse_r;
            this.p2.dxt +=  cw * this.p2.im * impulse_r;
            this.p2.dyt +=  sw * this.p2.im * impulse_r;
            // apply angular impulse
            this.p1.dxt +=  sw * this.p1.im * impulse_w;
            this.p1.dyt += -cw * this.p1.im * impulse_w;
            this.p2.dxt += -sw * this.p2.im * impulse_w;
            this.p2.dyt +=  cw * this.p2.im * impulse_w;

            this.dlambda_r = this.dlambda_w = 0; // important !!
        },
        post(dt) {
            this.lambda_r += this.dlambda_r;
            this.lambda_w += this.dlambda_w;
            if (this.ori.type === 'ref') { // surprise .. that way it works ..
                this.ori.ref.lambda_w -= this.ori.ratio*this.dlambda_w;
            }
        },
        get ori_C() { 
            const w = this.w, r = this.r;
            return { x: this.ax - r*Math.cos(w),
                     y: this.ay - r*Math.sin(w) };
        },
        get ori_Ct() {
            const w = this.w, wt = this.wt, cw = Math.cos(w), sw = Math.sin(w), 
                  r = this.r, rt = this.rt;
            return { x: this.axt - rt*cw + r*wt*sw,
                     y: this.ayt - rt*sw - r*wt*cw };
        }, 
        get ori_mc() { return 1/(this.p1.im + this.p2.im); },
        ori_pos() {
            const C = this.ori_C,
                  factor = Math.max(Math.abs(C.x)/mec.maxLinCorrect,
                                    Math.abs(C.y)/mec.maxLinCorrect,1),
                  mc = this.ori_mc,
                  impulse = { x: -mc * (C.x /= factor), 
                              y: -mc * (C.y /= factor) };
//console.log(C)
            this.p1.x += -this.p1.im * impulse.x;
            this.p1.y += -this.p1.im * impulse.y;
            this.p2.x +=  this.p2.im * impulse.x;
            this.p2.y +=  this.p2.im * impulse.y;

            return mec.isEps(C.x, mec.linTol) 
                && mec.isEps(C.y, mec.linTol); // position constraint satisfied .. !
        },
        ori_vel(dt) {
            const Ct = this.ori_Ct, mc = this.ori_mc,
                  impulse = { x: -mc * Ct.x, y: -mc * Ct.y };

            this.p1.dxt += -this.p1.im * impulse.x;
            this.p1.dyt += -this.p1.im * impulse.y;
            this.p2.dxt +=  this.p2.im * impulse.x;
            this.p2.dyt +=  this.p2.im * impulse.y;

            this.dlambda_r += ( impulse.x * this.ax + impulse.y * this.ay)/this.r/dt;
            this.dlambda_w += (-impulse.x * this.ay + impulse.y * this.ax)/this.r/dt;

            return mec.isEps(Ct.x*dt, mec.linTol)
                && mec.isEps(Ct.y*dt, mec.linTol);   // velocity constraint satisfied .. !
        },
        get len_C() { return (this.ax**2 + this.ay**2 - this.r**2)/(2*this.r0); },
        get len_Ct() { return (this.ax*this.axt + this.ay*this.ayt - this.r*this.rt)/this.r0; },
        get len_mc() { return this.r0**2/((this.p1.im + this.p2.im)*(this.ax**2 + this.ay**2)); },
        len_pos() {
            const C = mec.clamp(this.len_C,-mec.maxLinCorrect,mec.maxLinCorrect), 
                  impulse = -this.len_mc * C;

            this.p1.x += -this.ax/this.r0 * this.p1.im * impulse;
            this.p1.y += -this.ay/this.r0 * this.p1.im * impulse;
            this.p2.x +=  this.ax/this.r0 * this.p2.im * impulse;
            this.p2.y +=  this.ay/this.r0 * this.p2.im * impulse;

            return mec.isEps(C, mec.linTol); // position constraint satisfied .. !
        },
        len_vel(dt) {
            const Ct = this.len_Ct, impulse = -this.len_mc * Ct;

            this.p1.dxt += -this.ax/this.r0 * this.p1.im * impulse;
            this.p1.dyt += -this.ay/this.r0 * this.p1.im * impulse;
            this.p2.dxt +=  this.ax/this.r0 * this.p2.im * impulse;
            this.p2.dyt +=  this.ay/this.r0 * this.p2.im * impulse;

            this.dlambda_r += impulse / dt;

            return mec.isEps(Ct*dt, mec.linTol); // velocity constraint satisfied .. !
        },
        assignGetters(getters) {
            for (const key in getters) 
                Object.defineProperty(this, key, { get: getters[key], enumerable:true, configurable:true });
        },
        toJSON() { // todo: finish
            const obj = {
                id: this.id,
                p1: this.p1.id,
                p2: this.p2.id
            };
            if (this.len)
                obj.len = {type:this.len.type};
            if (this.len.type === 'ref')
                obj.len.ref = this.len.ref.id;
            if (this.ori)
                obj.ori = {type:this.ori.type};
            if (this.ori.type === 'ref')
                obj.ori.ref = this.ori.ref.id;

            return obj;
        },
        // interaction
        get isSolid() { return false },
        // get sh() { return this.state & g2.OVER ? [0,0,4,"gray"] : false },
        get sh() { return this.state & g2.OVER ? [0, 0, 10, 'white'] : this.state & g2.EDIT ? [0, 0, 10, 'yellow'] : false; },
        hitContour({x,y,eps}) {
            const p1 = this.p1, p2 = this.p2,
                  dx = this.p2.x - this.p1.x, dy = this.p2.y - this.p1.y,
                  off = 2*mec.node.radius/Math.hypot(dy,dx);
            return g2.isPntOnLin({x,y},{x:p1.x+off*dx,y:p1.y+off*dy},
                                       {x:p2.x-off*dx,y:p2.y-off*dy},eps);
        },
        // drawing
        g2() {
            const {p1,p2,w,r,type,ls,ls2,lw,id,idloc} = this,
                  xid = p1.x + 20*Math.cos(w) - 10*Math.sin(w), 
                  yid = p1.y + 20*Math.sin(w) + 10*Math.cos(w),
                  g = g2().beg({x:p1.x,y:p1.y,w,scl:1,lw:2,
                                ls:'orange',fs:'@ls',lc:'round',sh:()=>this.sh})
                            .stroke({d:`M50,0 ${r},0`,ls:()=>this.color,
                                    lw:lw+1,lsh:true})
                            .drw({d:mec.constraint.arrow[type],lsh:true})
                          .end();

            if (mec.showConstraintLabels) {
                let idstr = id || '?', cw = Math.cos(w), sw = Math.sin(w),
                      xid = p1.x + 20*cw - 10*sw, 
                      yid = p1.y + 20*sw + 10*cw;
                if (this.ori.type === 'ref') {
                    idstr += '('+ this.ori.ref.id+')';
                    xid -= 3*sw;
                    yid += 3*cw;
                }  
                g.txt({str:idstr,x:xid,y:yid,thal:'center',tval:'middle', ls:'white'})
            }
            
            return g;
        }
    },
    arrow: {
        'ctrl': 'M0,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'rot': 'M12,0 8,6 12,0 8,-6Z M0,0 8,0M15,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'tran': 'M0,0 12,0M16,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z',
        'free': 'M12,0 8,6 12,0 8,-6ZM0,0 8,0M15,0 18,0M22,0 24,0 M28,0 35,0M45,0 36,-3 37,0 36,3 Z'
    }
}
