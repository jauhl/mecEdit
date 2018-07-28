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
            this.t = this.t0 = 0;
            this.direc = 1;
            this.constraintColor = mec.validConstraintColor;
        },
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

            if (typeof this.gravity === 'boolean')
                this.gravity = {x:0,y:-10};

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
        get hasGravity() { return this.gravity !== undefined; },
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
            node.model = this;  // check: needed?
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
            const dependency = this.nodes.includes(node) && this.hasDependencies(node);
            if (!dependency)
                this.nodes.splice(idx,1);  // finally remove node from array.

            return !dependency;
        },
        /**
         * Add constraint to model.
         * @method
         * @param {object} constraint - constraint to add.
         */
        addConstraint(constraint) {
            constraint.model = this;  // check: needed?
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
         * Assemble model.
         * @method
         * @returns {object} model
         */
        asm() {
            const valid = this.asmPos() && this.asmVel();
// console.log('asm-itr='+this.positr+'/'+this.velitr);
            return this;
        },
        /**
         * Assemble positions of model.
         * @method
         * @returns {object} model
         */
        asmPos() {
            let valid = false;
            this.positr = 0;
            while (!valid && this.positr++ < mec.asmItrMax) {
                valid = this.pos();
            }
            this.constraintColor = valid ? mec.model.validConstraintColor
                                         : mec.model.invalidConstraintColor;
            return valid;
        },
        /**
         * Assemble velocities of model.
         * @method
         * @returns {object} model
         */
        asmVel() {
            let valid = false;
            this.velitr = 0;
            while (!valid && this.velitr++ < mec.asmItrMax) {
                valid = this.vel();
            }
            return valid;
        },
        /**
         * Pre-process model.
         * @method
         * @returns {object} model
         */
        pre() {
            // pre process loads
            for (const load of this.loads)
                load.pre(this.dt);
            // pre process nodes
            for (const node of this.nodes)
                node.pre(this.dt);
            // pre process constraints
            for (const constraint of this.constraints)
                constraint.pre(this.dt);
            // eliminate drift ...
            let valid = false;
            this.positr = 0;
            while (!valid && this.positr++ < mec.asmItrMax) {
                valid = this.pos();
            }
            // visualize invalid mechanism ...
            this.constraintColor = valid ? mec.validConstraintColor
                                         : mec.invalidConstraintColor;
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
            for (const node of this.nodes)
                node.post(this.dt);
            // post process constraints
            for (const constraint of this.constraints)
                constraint.post(this.dt);
// console.log('itr='+this.positr+'/'+this.velitr);
//            this.dirty = true;
            return this;
        },
        /**
         * Position iteration step over all constraints.
         * @method
         * @returns {object} model
         */
        pos() {
            let valid = true;  // pre-assume valid constraints positions ...
            for (const constraint of this.constraints)
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
//            console.log('dt='+this.dt)
            for (const constraint of this.constraints)
                valid = constraint.vel(this.dt) && valid;
            return valid;
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
    },
    // unused or deprecated. Use 'mec.validConstraintColor' instead.
    maxid: 0,
    // redundant? also in mec.core.js and is used from there
    validConstraintColor: '#ffffff99', // default: #777 
    invalidConstraintColor: '#b11'
}
