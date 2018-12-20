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

        if (typeof this.value === number && mec.isEps(this.value))
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
                + ((this.w0 && this.w0 > 0.0001) ? ',"w0":'+this.w0 : '')
                + (this.wref ? ',"wref":'+this.wref.id+'"' : '')
                + (this.value ? ',"value":'+this.value : '')
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

        if (typeof this.k === number && mec.isEps(this.k))
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
                + (this.k ? ',"k":'+this.k : '')
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
}