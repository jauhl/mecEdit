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
 * @property {string} [ori.func] - drive function name ['linear'|'quadratic', ...].
 * @property {number} [ori.t0] - drive parameter start value.
 * @property {number} [ori.Dt] - drive parameter value range.
 * @property {number} [ori.Dw] - drive angular range [rad].
 * @property {object} [len] - length object.
 * @property {string} [len.type] - type of length constraint ['free'|'const'|'ref'|'drive'].
 * @property {number} [len.r0] - initial length.
 * @property {string} [len.ref] - referenced constraint id.
 * @property {string} [len.refval] - referencing other orientation or length value ['ori'|'len'].
 * @property {string} [len.func] - drive function name ['linear'|'quadratic', ...].
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

            this.type = ori.type === 'free' && len.type === 'free' ? 'free'
                      : ori.type === 'free' && len.type !== 'free' ? 'rot'
                      : ori.type !== 'free' && len.type === 'free' ? 'tran'
                      : ori.type !== 'free' && len.type !== 'free' ? 'ctrl'
                      : 'invalid';

            this.pos = this.type === 'free' ? () => true
                     : this.type === 'rot'  ? () => this.len_pos()
                     : this.type === 'tran' ? () => this.ori_pos()
                     : this.type === 'ctrl' ? () => { let res = this.ori_pos(); return this.len_pos() && res }
                     : false;

            this.vel = this.type === 'free' ? (dt) => true
                     : this.type === 'rot'  ? (dt) => this.len_vel(dt)
                     : this.type === 'tran' ? (dt) => this.ori_vel(dt)
                     : this.type === 'ctrl' ? (dt) => { let res = this.ori_vel(dt); return this.len_vel(dt) && res }
                     : false;

            // pre-calculate both constraint mass components
            // const mc = 1/(this.p1.im + this.p2.im);
            // this.mc1 = this.p1.im * mc;
            // this.mc2 = this.p2.im * mc;
            // lagrange identifiers
            this.lambda_r = this.dlambda_r = 0;
            this.lambda_w = this.dlambda_w = 0;
        },
        get mc1() { return this.p1.im / (this.p1.im + this.p2.im) },
        get mc2() { return this.p2.im / (this.p1.im + this.p2.im) },
        get initialized() { return typeof this.p1 === 'object' },
        get dof() {
            return (this.ori.type === 'free' ? 1 : 0) + (this.len.type === 'free' ? 1 : 0);
        },
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

        init_ori_free(ori) {
            this.w0 = Math.atan2(this.ay,this.ax);
            this.assignGetters({
                w:  () => Math.atan2(this.ay,this.ax),
                wt: () => (this.ax*this.ayt - this.ay*this.axt)/this.r**2,
                wtt:() => (this.ax*this.aytt - this.ay*this.axtt)/this.r**2
            })
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
            if (document.getElementById(ori.input) === null) { // check is actuator element already exists
                this.w0 = ori.hasOwnProperty('w0') ? ori.w0 : Math.atan2(this.ay,this.ax);

                ori.drive = mec.drive[ori.func || 'linear'];
                ori.Dw = ori.Dw || 2*pi;
                ori.t0 = ori.t0 || 0;
                ori.Dt = ori.Dt || 1;
                ori.t  = ori.t0;
                this.assignGetters({
                    w:  () => this.w0 + ori.drive.f((ori.t - ori.t0)/ori.Dt)*ori.Dw,
                    wt: () => ori.drive.fd((ori.t - ori.t0)/ori.Dt)*ori.Dw/ori.Dt,
                    wtt:() => ori.drive.fdd((ori.t - ori.t0)/ori.Dt)*ori.Dw/(ori.Dt**2)
                })

                if (typeof ori.input === 'string') {  // referencing input element
                    const inputCallbk = (e) => {
                        ori.tprev = ori.t;
                        ori.t = (+e.target.value);
                        this.model.dirty = true;
                        this.model.direc = Math.sign(ori.t - ori.tprev);
                        // console.log('direc='+this.model.direc)
                    }

                    ori.tprev = ori.t0;

                    let rangewidth = 300; // todo: calculate
                    // document.getElementById(`actuators-container`).appendChild(app.createActuatorElm(ori.input, rangewidth));
                    document.getElementById(`actuators-container`).appendChild(app.createActuatorElm2(ori.input, rangewidth));
                    // let elm = document.getElementById(`${ori.input}`);
                    // mecSlider.RegisterElm(elm);
                    // elm.initEventHandling(this, ori.input, () => { return this.model[`${ori.input}`] / pi * 180 }, (q) => { this.model[`${ori.input}`] = q / 180 * pi; this.notify(`${ori.input}`, q); this.dirty = true; });
                    document.getElementById(ori.input).addEventListener("input", inputCallbk, false);
                    if (typeof ori.output === 'string') {
                        document.getElementById(ori.input).addEventListener("input", (e) => { document.getElementById(ori.output).value = Math.round(this.w / pi * 180) + '°'; }, false);
                    }
                    document.getElementById(ori.input).addEventListener("input", (e) => { app.model.phi = (+e.target.value) / 180 * Math.PI; app.model.dirty = true; }, false);
                }
            }
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
        },
        pre(dt) {
            this.dlambda_r = this.dlambda_w = 0;
        },
        post(dt) {
            this.lambda_r += this.dlambda_r;
            this.lambda_w += this.dlambda_w;
        },
        ori_pos() {
            const w = this.w,
                  C_x = this.ax - this.r*Math.cos(w),
                  C_y = this.ay - this.r*Math.sin(w);
    
            this.p1.x +=  this.mc1 * C_x;
            this.p1.y +=  this.mc1 * C_y;
            this.p2.x += -this.mc2 * C_x;
            this.p2.y += -this.mc2 * C_y;

            return C_x**2 + C_y**2 < mec.linTol; // position constraint satisfied .. !
        },
        ori_vel(dt) {
            const r = this.r, w = this.w, wt = this.ori.type === 'ref' || this.ori.type === 'drive' ? this.wt : 0,
                  C_xt = wt ? this.axt + wt*this.r*Math.sin(this.w) : this.axt,
                  C_yt = wt ? this.ayt - wt*this.r*Math.cos(this.w) : this.ayt;
    
            this.p1.dxt +=  this.mc1 * C_xt;
            this.p1.dyt +=  this.mc1 * C_yt;
            this.p2.dxt += -this.mc2 * C_xt;
            this.p2.dyt += -this.mc2 * C_yt;

            this.dlambda_w += (this.mc2 * C_yt * Math.cos(this.w) -
            this.mc2 * C_xt * Math.sin(this.w))*this.r/dt;

            return C_xt**2 + C_yt**2 < this.r0*mec.linTol;       // velocity constraint satisfied .. !
        },
        len_pos() {
            let aa = this.ax**2 + this.ay**2, rr = this.r**2,
                C = -0.5*(aa - rr)/aa;

            this.p1.x += -this.ax * this.mc1 * C;
            this.p1.y += -this.ay * this.mc1 * C;
            this.p2.x +=  this.ax * this.mc2 * C;
            this.p2.y +=  this.ay * this.mc2 * C;

            return Math.abs(aa - rr) < 2*this.r0*mec.linTol; // position constraint satisfied .. !
        },
        len_vel(dt) {
            let Ct = -(this.ax*this.axt + this.ay*this.ayt)/(this.ax**2 + this.ay**2)

            this.p1.dxt += -this.ax * this.mc1 * Ct;
            this.p1.dyt += -this.ay * this.mc1 * Ct;
            this.p2.dxt +=  this.ax * this.mc2 * Ct;
            this.p2.dyt +=  this.ay * this.mc2 * Ct;

            this.dlambda_r += (this.ax * this.mc2 * Ct * Math.cos(this.w) +
                               this.ay * this.mc2 * Ct * Math.sin(this.w))/ dt;

//            return Math.abs(Ct) < mec.linTol; // velocity constraint satisfied .. !
            return this.p2.dxt < mec.linTol && this.p2.dyt < mec.linTol;
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
                           .stroke({d:`M50,0 ${r},0`,ls:this.model.constraintColor,
                                    lw:lw+1,lsh:true})
                           .drw({d:mec.constraint.arrow[type],lsh:true})
                          .end();
            if (mec.showConstraintLabels) 
                g.txt({str:id||'?',x:xid,y:yid,thal:'center',tval:'middle', ls:'white'})
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
