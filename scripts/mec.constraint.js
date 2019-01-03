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
            // apply angular impulse
            this.ori_impulse_vel(this.lambda_w * dt);
            // apply axial impulse
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
                        ori_C:  () => this.r*(this.angle(Math.atan2(this.ay,this.ax)) - this.w0) - ratio*this.r*(ref.angle(Math.atan2(ref.ay,ref.ax)) - ref.w0),
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
                ori.t = () => ori.local_t;
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
                        ori_Ct: () => this.ayt*this.cw - this.axt*this.sw - this.r/ref.r*(ref.ayt*ref.cw - ref.axt*ref.sw) - this.r*ori.drive.ft(),
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
                           : this.model.env.show.colors.invalidConstraintColor;
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
}