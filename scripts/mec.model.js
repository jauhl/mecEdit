/**
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
    extend(model) { 
        Object.setPrototypeOf(model, this.prototype); 
        model.constructor(); 
        return model; 
    },
    prototype: {
        constructor() { // always parameterless .. !
            this.state = {dirty:true,valid:true,direc:1,itrpos:0,itrvel:0};
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
         * @returns {object} model
         */
        init() {
            if (this.gravity === true)
                this.gravity = Object.assign({},mec.gravity,{active:true});
            else if (!this.gravity)
                this.gravity = Object.assign({},mec.gravity,{active:false});

            this.labels = Object.assign({},mec.labels,this.labels||null);

            for (const node of this.nodes)
                node.init(this);
            for (const constraint of this.constraints)
                if (!constraint.initialized)  // possibly already uinitialized by referencing .. !
                    constraint.init(this);
            for (const load of this.loads)
                load.init(this);
            for (const view of this.views)
                view.init(this);
            for (const shape of this.shapes)
                shape.init(this);


            return this;
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
            for (const node of this.nodes)
                node.reset();
            for (const constraint of this.constraints)
                constraint.reset();
            for (const load of this.loads)
                load.reset();
            for (const view of this.views)
                view.reset();
            Object.assign(this.state,{valid:true,direc:1,itrpos:0,itrvel:0});
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
            if (dt)  // sliders are setting simulation time explicite .. !
                this.timer.t += (this.timer.dt = dt);
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
        get info() {
            for (const view of this.views)
                if (view.hasInfo)
                    return view.infoString();
            return false; 
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
         * Direction flag.
         * Used implicite by slider input elements.
         * Avoids setting negative `dt` by going back in time.
         * @type {boolean}
         */
        get direc() { return this.state.direc; },
        set direc(q) { this.state.direc = q; },
        /**
         * Test, if model is active.
         * Nodes are moving (nonzero velocities) or active drives.
         * @type {boolean}
         */
        get isActive() {
            return this.hasActiveDrives   // active drives
                || this.dof > 0           // or can move by itself
                && !this.isSleeping;      // and does that
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
                active = active
                      || constraint.ori.type === 'drive'
                      && this.timer.t < constraint.ori.t0 + constraint.ori.Dt
                      || constraint.len.type === 'drive'
                      && this.timer.t < constraint.len.t0 + constraint.len.Dt;
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
         * Get dependents of a specified element.
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
                      + (nodeCnt ? ',\n  "nodes": [\n' : '')
                      + (nodeCnt ? this.nodes.map((n,i) => '    '+n.asJSON()+comma(i,nodeCnt)+'\n').join('') : '')
                      + (nodeCnt ? contraintCnt ? '  ],\n' : '  ]\n' : '')
                      + (contraintCnt ? '  "constraints": [\n' : '')
                      + (contraintCnt ? this.constraints.map((n,i) => '    '+n.asJSON()+comma(i,contraintCnt)+'\n').join('') : '')
                      + (contraintCnt ? loadCnt ? '  ],\n' : '  ]\n' : '')
                      + (loadCnt ? '  "loads": [\n' : '')
                      + (loadCnt ? this.loads.map((n,i) => '    '+n.asJSON()+comma(i,loadCnt)+'\n').join('') : '')
                      + (loadCnt ? shapeCnt ? '  ],\n' : '  ]\n' : '')
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
            // post process nodes
            for (const node of this.nodes)
                node.post(this.timer.dt);
            // post process constraints
            for (const constraint of this.constraints)
                constraint.post(this.timer.dt);
// console.log('itr='+this.itrCnt.pos+'/'+this.itrCnt.vel);
            // pre process views
            for (const view of this.views)
                if (view.post)
                    view.post(this.timer.dt);
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {                                 // todo: draw all components via 'x.draw(g)' call ! 
            for (const shape of this.shapes)
                shape.draw(g);
            for (const view of this.views)
                g.ins(view);
            for (const load of this.loads)
                g.ins(load);
            for (const constraint of this.constraints)
                g.ins(constraint);
            for (const node of this.nodes)
                g.ins(node);
            return this;
        }
    }
}