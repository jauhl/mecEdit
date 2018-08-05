/**
 * mec.model (c) 2018 Stefan Goessner
 * @license MIT License
 * @requires mec.core.js
 * @requires mec.node.js
 * @requires mec.constraint.js
 * @requires mec.drive.js
 * @requires mec.load.js
 * @requires mec.shape.js
 */
"use strict";

/**
 * Wrapper class for extending plain model objects, usually generated from a JSON object.
 * @method
 * @returns {object} model object.
 * @param {object} - plain javascript model object.
 * @property {string} id - model id.
 * @property {boolean|object} gravity - Vector `{x,y}` of gravity or `{x:0,y:-10}` in case of `true`.
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
        },
        /**
         * Init model
         * @method
         * @returns {object} model
         */
        init() {
            if (!this.nodes) this.nodes = [];
            for (const node of this.nodes)  // do for all nodes ...
                mec.node.extend(node).init(this);
            if (!this.constraints) this.constraints = [];
            for (const constraint of this.constraints)  // do for all constraints ...
                if (!constraint.initialized)
                    mec.constraint.extend(constraint).init(this);
            if (!this.loads) this.loads = [];
            for (const load of this.loads)  // do for all shapes ...
                mec.load.extend(load).init(this);
            if (!this.shapes) this.shapes = [];
            for (const shape of this.shapes)  // do for all shapes ...
                mec.shape.extend(shape).init(this);

            if (this.gravity === true)
                this.gravity = {x:0,y:-10};

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
            for (const load of this.loads)  // do for all shapes ...
                load.reset();
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
         * Model time is incremented bei `dt`.
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
         * @type {boolean | object}
         */
        get hasGravity() { 
            return this.gravity === true
                || this.gravity
                && this.gravity.x === 0
                && this.gravity.y === 0;
        },

        get dirty() { return this.state.dirty; },  // deprecated !!
        set dirty(q) { this.state.dirty = q; },
        get valid() { return this.state.valid; },
        set valid(q) { this.state.valid = q; },
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
         * Nodes are not moving anymore (zero velocities) and no drives active.
         * @type {boolean}
         */
        get isActive() {
            return !this.hasActiveDrives // node velocities are not necessarily zero with drives
                &&  this.isSleeping;
        },
        /**
         * Test, if nodes are significantly moving 
         * @type {boolean}
         */
        get isSleeping() {
            let sleeping = true;
            for (const node of this.nodes)
                if (sleeping && !node.isSleeping)
                    sleeping = false;
            return sleeping;
        },
        /**
         * Test, if some drives are 'idle' or 'running' 
         * @const
         * @type {boolean}
         */
        get hasActiveDrives() {
            let idle = false;
            for (const constraint of this.constraints) 
                idle =  constraint.ori.type === 'drive'
                     && this.timer.t < constraint.ori.t0 + constraint.ori.Dt
                     || constraint.len.type === 'drive'
                     && this.timer.t < constraint.len.t0 + constraint.len.Dt;
            return idle;
        },
        /**
         * Check for dependencies on specified element. Nodes do not have dependencies.
         * @method
         * @param {object} elem - element.
         * @returns {boolean} true in case of existing dependencies.
         */
        hasDependencies(elem) {
            let dependency = false;
            for (const constraint of this.constraints) 
                dependency = constraint.dependsOn(elem) || dependency;
            for (const load of this.loads)
                dependency = load.dependsOn(elem) || dependency;
            for (const shape of this.shapes)
                dependency = shape.dependsOn(elem) || dependency;
            return dependency;
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
         * @method
         * @param {object} node - node to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        removeNode(node) {
            const idx = this.nodes.indexOf(node),
                  dependency = this.nodes.includes(node) && this.hasDependencies(node);
            if (!dependency)
                this.nodes.splice(idx,1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete node and all depending elements from model.
         * @method
         * @param {object} node - node to remove.
         */
        purgeNode(node) {
            for (const constraint of this.constraints) 
                if (constraint.dependsOn(node))
                    this.purgeConstraint(constraint);
            for (const load of this.loads)
                if (load.dependsOn(node))
                    this.purgeLoad(load);
            for (const shape of this.shapes)
                if (shape.dependsOn(node))
                    this.purgeShape(shape);
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
         * @param {object} constraint - constraint to find.
         */
        constraintById(id) {
            for (const constraint of this.constraints)
                if (constraint.id === id)
                    return constraint;
            return false;
        },
        /**
         * Remove constraint, if there are no dependencies to other objects.
         * @method
         * @param {object} constraint - constraint to remove.
         * @returns {boolean} true, the constraint was removed, otherwise false in case of existing dependencies.
         */
        removeConstraint(constraint) {
            const idx = this.constraints.indexOf(constraint), 
                  dependency = idx >= 0 && this.hasDependencies(constraint);
            if (!dependency)
                this.constraints.splice(idx,1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete constraint and all depending elements from model.
         * @method
         * @param {object} constraint - constraint to remove.
         */
        purgeConstraint(constraint) {
            for (const load of this.loads)
                if (load.dependsOn(constraint))
                    this.purgeLoad(load);
            for (const shape of this.shapes)
                if (shape.dependsOn(constraint))
                    this.purgeShape(shape);
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
         * @param {object} load - load to find.
         */
        loadById(id) {
            for (const load of this.nodes)
                if (load.id === id)
                    return load;
            return false;
        },
        /**
         * Remove load, if there are no dependencies to other objects.
         * @method
         * @param {object} node - load to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        removeLoad(load) {
            const idx = this.loads.indexOf(load), 
                  dependency = idx >= 0 && this.hasDependencies(load);
            if (!dependency)
                this.loads.splice(idx,1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Delete load from model.
         * No elements depend on loads at current.
         * @method
         * @param {object} load - load to delete.
         */
        purgeLoad(load) {
            this.loads.splice(this.loads.indexOf(load),1);  // finally remove node from array.
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
         * Remove shape. Shapes have no other elements depending on it.
         * @method
         * @param {object} load - load to remove.
         * @returns {boolean} true, the node was removed, otherwise false in case of existing dependencies.
         */
        removeShape(shape) {
            const idx = this.shapes.indexOf(shape);
            if (idx >= 0)
                this.shapes.splice(idx,1);  // finally remove node from array.
            return true;
        },
        /**
         * Delete shape from model.
         * No elements depend on shapesat current.
         * @method
         * @param {object} shape - shape to delete.
         */
        purgeShape(shape) {
            this.loads.splice(this.shapes.indexOf(shape),1);
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
                if (!node.base) {
                    node.Qx = node.Qy = 0;
                    if (this.hasGravity) {
                        node.Qx = node.m*mec.from_N(this.gravity.x);
                        node.Qy = node.m*mec.from_N(this.gravity.y);
                    }
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
//            console.log('dt='+this.dt)
            for (const constraint of this.constraints) {
//                console.log(constraint.vel(this.timer.dt)+ '&&'+ valid)
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
            return this;
        },
        /**
         * Draw model.
         * @method
         * @param {object} g - g2 object.
         * @returns {object} model
         */
        draw(g) {
            for (const shape of this.shapes)
                shape.draw(g);
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
