const tooltip = document.getElementById('info'),
    statusbar = document.getElementById('statbar'),
    editor = g2.editor(),
    pi = Math.PI;

const origin = g2().beg({ lc: 'round', lj: 'round', ls:'silver', fs: 'darkgray' })
                        .p()
                            .m({ x: 21, y: 0 })
                            .l({ x: 0, y: 0 })
                            .l({ x: 0, y: 21 })
                        .stroke()
                        .p()
                            .m({ x: 35, y: 0 })
                            .l({ x: 21, y: -2.6 })
                            .a({ dw: pi/3, x: 21, y: 2.6 })
                        .z()
                            .m({ x: 0, y: 35 })
                            .l({ x: 2.6, y: 21 })
                            .a({ dw: pi/3, x: -2.6, y: 21 })
                        .z()
                        .drw()
                        .cir({ x: 0, y: 0, r: 2.5, fs: '#ccc' })
                    .end()
                    .beg({ ls:'silver', font: '14px roboto'})
                        .txt({str:'x', x: 38, y: 4})
                        .txt({str:'y', x: 6, y: 30})
                    .end();
                    
const gravvec = (cartesian = true) => {
    const sgn = cartesian ? - 1 : 1;
    return g2().beg({ w: sgn*pi/2, lw: 2, ls:'silver', fs: 'darkgray'})
               .p()
                   .m({ x: 0, y: 0 })
                   .l({ x: 50, y: 0 })
               .stroke()
               .p()
                   .m({ x: 50, y: 0 })
                   .l({ x: 50 - 17.5, y: -3.5 })
                   .a({ dw: pi/3, x: 50 - 17.5, y: 3.5 })
               .z()
               .drw()
            .end()
            .beg({ ls:'silver', font: '14px roboto'})
                .txt({str:'g', x: -15, y: sgn*20})
            .end();
}

const App = {
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o, arguments);
        return o;
    },
    prototype: Object.assign({
        constructor() {
            this.model = {
                id: 'crank',
                dt: 2 / 360,
                dirty: true,
                gravity: true,
                // phi: pi / 2,
                // psi: pi / 2,
                // theta: pi / 2,
                nodes: [
                    { id: 'A0', x: 100, y: 100, base: true },
                    { id: 'A', x: 100, y: 150, m: 1 },
                    { id: 'B', x: 350, y: 220, m: 1 },
                    { id: 'B0', x: 300, y: 100, base: true },
                    // { id: 'C', x: 450, y: 200, m: 1 },
                    // { id: 'C0', x: 450, y: 100, m: 1 },
                ],
                constraints: [
                    { id: 'a', p1: 'A0', p2: 'A', len: { type: 'const' } },
                    { id: 'b', p1: 'A', p2: 'B', len: { type: 'const' } },
                    { id: 'c', p1: 'B0', p2: 'B', len: { type: 'const' } },
                    // { id: 'd', p1: 'B', p2: 'C', len: { type: 'const' } },
                    // { id: 'e', p1: 'C0', p2: 'C', len: { type: 'const' } },
                    // { id: 'd', p1: 'B', p2: 'C', len: { type: 'const' }, ori: { type: 'ref', ref: 'b'} },
                    // { id: 'e', p1: 'B0', p2: 'C', len: { type: 'const' }, ori: { type: 'ref', ref: 'd'} },
                ]
            };

            this.VERSION = 'v0.4.8',

            // mixin requiries ...
            this.evt = { dx: 0, dy: 0, dbtn: 0 };
            this.view = { x: 50, y: 50, scl: 1, cartesian: true };

            this.cnv = document.getElementById('c');
            this.ctx = this.cnv.getContext('2d');
            this.build = false;
            this.tempElm = false;
            this.instruct = document.getElementById('instructions');
            this.ctxmenu = document.getElementById('contextMenu');
            this.ctxmenuheader = document.getElementById("contextMenuHeader");
            this.ctxmenubody = document.getElementById("contextMenuBody");
            this.imported = {}; // here goes the imported JSON model
            this.inversekinematics = true;

            this.g = g2().clr()
                // .view(this.view)
                // .grid({ color: 'rgba(255, 255, 255, 0.1)', size: 100 })
                // .grid({ color: 'rgba(255, 255, 255, 0.1)', size: 20 })
                // .p() // mark origin
                // .m({ x: () => -this.view.x / this.view.scl, y: 0 })
                // .l({ x: () => (this.cnv.width - this.view.x) / this.view.scl, y: 0 })
                // .m({ x: 0, y: () => -this.view.y / this.view.scl })
                // .l({ x: 0, y: () => (this.cnv.height - this.view.y) / this.view.scl })
                // .z()
                // .stroke({ ls: 'rgba(255, 255, 255, 0.3)', lw: 2 })
            //     // if (()=>this.view.cartesian) / can always be shown
            //     .use({grp:origin,x: () => (10 - this.view.x)/this.view.scl, y: () => (10 - this.view.y)/this.view.scl, scl: () => this.view.scl})
            //     if(()=>this.model.hasGravity) {
            //         if(this.cartesian) {
            //             this.g.use({grp:gravvec(true),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (this.cnv.height - 15 - this.view.y)/this.view.scl, scl: () => this.view.scl})
            //         } else {
            //             this.g.use({grp:gravvec(false),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (- this.view.y + 65 )/this.view.scl, scl: () => this.view.scl})
            //         }
            //     }

            this.registerEventsFor(this.ctx.canvas)
                .on(['pointer', 'drag', 'buttondown', 'buttonup', 'click'], (e) => { this.g.exe(editor.on(this.pntToUsr(Object.assign({}, e)))).exe(this.ctx); })  // apply events to g2 ...
                .on(['pointer', 'drag', 'pan', 'fps', 'buttondown', 'buttonup', 'click', 'pointerenter', 'pointerleave'], () => this.showStatus())
                .on('drag', (e) => {       // update tooltip info // kills performance (bug: lag but fps stiil max) and is basically redundant due to statbar. maybe disable tooltip
                    tooltip.style.left = ((e.clientX) + 15) + 'px';
                    tooltip.style.top = (e.clientY - 50) + 'px';
                    tooltip.innerHTML = editor.dragInfo;
                    // this.model.asmPos();
                })
                .on('pan', (e) => {
                    this.pan(e);
                    this.g.exe(this.ctx);
                })
                .on('buttondown', (e) => {                     // show tooltip info
                    console.log(editor.dragInfo && !this.inversekinematics);
                    if (editor.dragInfo && !this.inversekinematics) {
                        tooltip.style.left = ((e.clientX) + 15) + 'px';
                        tooltip.style.top = (e.clientY - 50) + 'px';
                        tooltip.innerHTML = editor.dragInfo;
                        tooltip.style.display = 'inline';
                    }
                })
                .on(['buttonup', 'click'], (e) => {             // hide tooltip info
                    tooltip.style.display = 'none';
                })
                .on('click', () => {
                    if (this.build) {
                        // console.log(editor)
                        if (['addnode', 'addbasenode'].includes(this.build.mode)) this.addNode();
                        if (this.build.mode === 'purgenode') this.deleteNode(editor.curElm);
                        if (['free', 'tran', 'rot'].includes(this.build.mode)) this.addConstraint();
                        if (this.build.mode === 'drive') this.addActuator(editor.curElm);
                    }
                })
                .on('render', () => this.g.exe(this.ctx))      // redraw
                // .on('step', () => this.model.pre().itr().post())
                .on('tick', (e) => this.step(e))
                // .startTimer() // startTimer ...             // start synchronized ticks // now in init()
                // .notify('render')   // send 'render' event
        }, // constructor

        get cartesian() { return this.view.cartesian; },
        get height() { return this.ctx.canvas.height; },
        get dragging() { return !!(editor.curState & g2.DRAG) },

        showStatus() {  // poor man's status bar
            let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
            statusbar.innerHTML = `mode=${this.evt.type}, x=${x}, y=${y}, cartesian=${this.cartesian}, btn=${this.evt.btn}, dbtn=${this.evt.dbtn}, fps=${this.fps}, state=${g2.editor.state[editor.curState]}, dragging=${this.dragging}, dragmode=${this.inversekinematics?'move':'edit'}, dof=${this.model.dof}, gravity=${this.model.hasGravity ? 'on' : 'off'}`
        },

        step(e) {
            if (!!this.model && (this.dragging || this.model.isRunning)) { // check if model is defined first
                this.model.timer.dt = e.dt;
                this.dragging ? this.inversekinematics ? this.model.asmPos() : editor.curElm.updAdjConstraints() 
                              : this.model.pre().itr().post();
                this.g.exe(this.ctx);
            }
        },

        init() { // evaluate how many actuators and add init add controlled properties to model instead of typing them there
            mec.model.extend(this.model);
            this.model.dirty = true;
            this.model.init().asmPos();
            this.model.draw(this.g);

            this.model.actcount = 0; // add counter to model
            let actcontainer = document.getElementById('actuators-container');
            for (let constraint in this.model.constraints) { // get amount of actuators in model
                if (this.model.constraints[constraint].type === 'ctrl') this.model.actcount++
            }
            // calculate range-input witdth
            let rangewidth = (this.model.actcount > 1) ? actcontainer.clientWidth / 2 - 150 : actcontainer.clientWidth - 150; // subtract space for controls & output

            // for (let constraint in this.model.constraints) {
            //     if (this.model.constraints[constraint].type === 'ctrl') {
            //         let actuated = this.model.constraints[constraint].for // string matching actuated variable
            //         this.model[actuated] = pi / 2; // add matching angle property to model and initialize to pi/2 for now
            //         // console.log(this.model[`${actuated}`])
            //         actcontainer.appendChild(this.createActuatorElm(actuated, rangewidth));
            //         let elm = document.getElementById(`${actuated}`);
            //         mecSlider.RegisterElm(elm);
            //         elm.initEventHandling(this, `${actuated}`, () => { return this.model[`${actuated}`] / pi * 180 }, (q) => { this.model[`${actuated}`] = q / 180 * pi; this.notify(`${actuated}`, q); this.dirty = true; });
            //     }
            // }
            
            // (this.mainLoop.ptr || (this.mainLoop.ptr = this.mainLoop.bind(this)))(this.mainLoop.t0 = performance.now());
            this.startTimer() // startTimer ...             // start synchronized ticks 
                .notify('render');                          // send 'render' event
        },

        createActuatorElm(actuated, width) {
            let template = document.createElement('template')
            template.innerHTML = `<mec-slider id="${actuated}" class="mec-slider d-inline-flex nowrap ml-2 mr-1 mt-1" width="${width}" min="0" max="360" step="1" value="" valstr="${actuated}={value}°"></mec-slider>`
            return template.content.firstChild;
        },

        createActuatorElm2(actuated, width) {
            let template = document.createElement('template')
            // template.innerHTML = `<mec-slider id="${actuated}" class="mec-slider d-inline-flex nowrap ml-2 mr-1 mt-1" width="${width}" min="0" max="360" step="1" value="" valstr="${actuated}={value}°"></mec-slider>`
            template.innerHTML = `<actuator><input id="${actuated}" type="range" style="min-width:${width}px;margin:0;" min="0" max="2" value="0" step="0.0055555"/><output id="${actuated}_out" style="width:4em; text-align:right;"></output></actuator>`
            console.log(template.content.firstChild);
            return template.content.firstChild;
        },

        // mainLoop(t) {
        //     if (this.model.dirty) { // model.dirty for inverse
        //         this.model.dirty = false;
        //         this.notify('step');
        //         this.notify('render');
        //     }
        //     requestAnimationFrame(this.mainLoop.ptr);
        // },

        updateg() {
            this.g = g2().clr()
                .view(this.view)
                .grid({ color: 'rgba(255, 255, 255, 0.1)', size: 100 })
                .grid({ color: 'rgba(255, 255, 255, 0.1)', size: 20 })
                .p() // mark origin
                .m({ x: () => -this.view.x / this.view.scl, y: 0 })
                .l({ x: () => (this.cnv.width - this.view.x) / this.view.scl, y: 0 })
                .m({ x: 0, y: () => -this.view.y / this.view.scl })
                .l({ x: 0, y: () => (this.cnv.height - this.view.y) / this.view.scl })
                .z()
                .stroke({ ls: 'rgba(255, 255, 255, 0.3)', lw: 2 })
                // if (()=>this.view.cartesian) / can always be shown
                .use({grp:origin,x: () => (10 - this.view.x)/this.view.scl, y: () => (10 - this.view.y)/this.view.scl, scl: () => this.view.scl})
                if(this.model.hasGravity) {
                    if(this.cartesian) {
                        this.g.use({grp:gravvec(true),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (this.cnv.height - 15 - this.view.y)/this.view.scl, scl: () => this.view.scl})
                    } else {
                        this.g.use({grp:gravvec(false),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (- this.view.y + 14 )/this.view.scl, scl: () => this.view.scl})
                    }
                }

            this.model.draw(this.g);
        },

        resetApp() {
            app.build = false; // reset appstate
            this.instruct.innerHTML = ''; // reset instructions
            this.notify('render');
        },

        replaceNode(oldN, newN) { // todo: bug: this function does not set the new mass in p1/p2 of adjacent constraints!!
            // this.model.nodes.splice(this.model.nodes.indexOf(oldN), 1); // remove old node from model
            // this.model.addNode(mec.node.extend(newN));
            // newN.init(this.model);
            // this.model.nodeById(newN.id).updAdjConstraints();
            // this.updateg(); // update graphics

            if (!(oldN.x === newN.x)) this.model.nodeById(oldN.id).x = newN.x;
            if (!(oldN.y === newN.y)) this.model.nodeById(oldN.id).y = newN.y;
            if (!(oldN.m === newN.m)) this.model.nodeById(oldN.id).m = newN.m;
            this.model.dirty = true;
        },

        addNode() {
            if (editor.curElm === undefined || !editor.curElm.hasOwnProperty('m')) { // objects with a mass are considered nodes
                // if (editor.curElm === undefined || !editor.curElm.isSolid) { // also works but throws type-error over empty space
                let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
                let node = {
                    id: this.getNewChar(),
                    x: x,
                    y: y,
                    m: this.build.mode == 'addbasenode' ? Number.POSITIVE_INFINITY : 1
                };
                this.model.addNode(mec.node.extend(node)); // inherit prototype methods (extend) and add to model via model.addnode
                this.model.nodeById(node.id).init(this.model);
                this.updateg(); // update graphics
            } else {
                console.log('node already exists at this coordinates ...');
                editor.curElm.drag = false;
            }
            document.body.style.cursor = 'default';
            this.resetApp();
        },

        deleteNode(node) {
            if (!!node && node.hasOwnProperty('m')) { // check if a node was clicked
                 // remove adjacent constraints from model // todo: also remove other dependencies
                const adjConstraints = node.adjConstraintIds(); // fetch ids of adjacent constraints
                let modelidx = [];
                adjConstraints.forEach(el => {  // fetch index of all adj. constraints in their array model.constraints
                    modelidx.push(this.model.constraints.indexOf(this.model.constraintById(el)));
                    // if (this.model.constraintById(el).hasOwnProperty('for')) { delete this.model[this.model.constraintById(el).for] }; // remove actuator angle from model if constraint is actuated // "for" does not exist anymore
                });
                for (let i = modelidx.length - 1; i >= 0; i--) { // delete adj. constraints; splice from back so modelidx values stay valid
                    this.model.constraints.splice(modelidx[i], 1);
                };
                this.model.nodes.splice(this.model.nodes.indexOf(node), 1); // remove node from model
                this.updateg(); // update graphics

                document.body.style.cursor = 'default';
                this.resetApp();
            };           
        },

        replaceConstraint(oldC, newC) {
            this.model.constraints.splice(app.model.constraints.indexOf(app.model.constraintById(oldC.id)), 1); // remove old
            this.model.addConstraint(mec.constraint.extend(newC)); // add new
            newC.init(this.model);
            this.updateg(); // update graphics
        },

        addConstraint() {
            if (!this.build.firstnode) { // first invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked
                    this.build.firstnode = editor.curElm;
                    this.instruct.innerHTML = 'select second node; &lt;ESC&gt; to cancel'
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
            } else { // second invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked

                    // build template
                    let tmplen = false;
                    let tmpori = false;
                    switch (this.build.mode) {
                        case 'free': break; // no need to set smth
                        case 'tran': tmpori = { type: 'const' }; break;
                        case 'rot': tmplen = { type: 'const' }; break;
                        // case 'drive': tmpori = {type:'drive'}; tmplen = {type:'drive'}; break; // todo: somehow flag for forced editing or make add drive function to add drives to constraints
                        default: console.log('something went wrong while adding constraint...'); break;
                    }

                    let constraint = {
                        id: this.getNewChar('constraint'),
                        p1: this.build.firstnode.id,
                        p2: editor.curElm.id,
                    };

                    if (tmplen) constraint.len = tmplen;
                    if (tmpori) constraint.ori = tmpori;

                    this.model.addConstraint(mec.constraint.extend(constraint));

                    // console.log(typeof (constraint.type))
                    // switch (constraint.type) {
                    //     case 'free': this.model.addConstraint(mec.constraint.free.extend(constraint)); break;
                    //     case 'tran': this.model.addConstraint(mec.constraint.tran.extend(constraint)); break;
                    //     case 'rot': this.model.addConstraint(mec.constraint.rot.extend(constraint)); break;
                    //     case 'ctrl': this.model.addConstraint(mec.constraint.ctrl.extend(constraint)); break;
                    //     default: console.log('something went wrong while adding constraint...'); break;
                    // }
                    // this.model.addConstraint(type.extend(constraint));
                    constraint.init(this.model);
                    this.updateg(); // update graphics
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
                this.resetApp();
            };
        },

        getNewChar(x = 'node') { // returns @type {string} todo: bug: adding a constraint with no constraints in model returns id "constraint" and not "a", which it should
            let charArr = [];
            let name;
            let obj;
            let maxChar;
            x === 'node' ? (obj = this.model.nodes, name = 'node', maxChar = 90) : (obj = this.model.constraints, name = 'constraint', maxChar = 122); // 90 = Z, 122 = z
            for (let i = 0; i < obj.length; i++) {
                charArr.push(obj[i].id.charCodeAt(0)) // push charcodes from first letter of node ids
            }
            charArr.sort(function (a, b) { // sort array containing charcodes
                return a - b;
            });
            let potChar = charArr[charArr.length - 1] + 1
            return (potChar <= maxChar) ? String.fromCharCode(potChar) : `${name}${obj.length + 1}`;   // choose one higher than highest charCode or assign numbers when running out of characters
        },

        // build() { // rename if needed again
        //     this.model = mec.model.extend(this.model);
        //     this.model.init().draw(this.g);
        //     this.notify('render');
        // },

        addActuator(elm) { // todo: can check type of passed object.. if it's a node, let choose second node and add a driven rot (most common) constraint 
            console.log(elm);
            if (elm.type === 'ctrl') {
                this.instruct.innerHTML = 'this constraint is already actuated. select a different one or press &lt;ESC&gt to cancel'
            }
            let actuator = {
                id: elm.id,
                p1: elm.p1.id,
                p2: elm.p2.id,
            };
            switch (elm.type) { // todo: generalize in- and outputs
                case 'rot':
                    actuator.ori = { type: 'drive', Dt: 2, Dw: 2 * pi, input: 'slider', output: 'slider_out' };
                    actuator.len = { type: 'const' };
                    break;
                case 'tran':
                    console.log('coming soon ...');
                    // actuator.ori = {type:'const'};
                    // actuator.len = {type:'drive',Dt:2,Dw:2*pi,input:'slider',output:'slider_out'};
                    break;
                case 'free':
                    console.log('coming soon ...');
                // actuator.ori = {type:'drive',Dt:2,Dw:2*pi,input:'slider1',output:'slider_out1'};
                // actuator.len = {type:'drive',Dt:2,Dw:2*pi,input:'slider2',output:'slider_out2'};
            }

            // replace old with new constraint in model and flag for rebuild
            this.model.constraints.splice(this.model.constraints.indexOf(this.model.constraintById(elm.id)), 1) // get index of passed constraint and delete it from the model 
            // this.model.constraints.push(actuator); // add new contraint to model
            // this.model.dirty = true;

            this.model.addConstraint(mec.constraint.extend(actuator));
            actuator.init(this.model);

            this.updateg(); // update graphics

            this.resetApp(); // reset state and instructions
        },

        changeConstraintType(elm, newtype) { // todo: check if still needed, guess is not...
            console.log(newtype);
            let newConstraint = {
                id: elm.id,
                p1: elm.p1.id,
                p2: elm.p2.id,
                state: elm.state // preserve state (otherwise contextmenu won't close and possibly other inconsistencies)
            };

            switch (newtype) { // todo: generalize in- and outputs
                case 'rot':
                    newConstraint.len = { type: 'const' };
                    break;
                case 'tran':
                    newConstraint.ori = { type: 'const' };
                    break;
                case 'ctrl': // assume ori 'ref', not 'drive'. drive has to be added elsewhere, // maybe dont set stuff here but open second menu or form/modal to distinguish ori/len ref
                    newConstraint.len = { type: 'const' };
                    newConstraint.ori = {
                        type: 'ref',
                        ref: elm.p1.adjConstraintIds()[0] // reference the first found constraint of p1 for now ...
                    }; // todo: make select ref
            }

            // replace old with new constraint in model and flag for rebuild
            this.model.constraints.splice(this.model.constraints.indexOf(this.model.constraintById(elm.id)), 1) // get index of passed constraint and delete it from the model 

            this.model.addConstraint(mec.constraint.extend(newConstraint));
            newConstraint.init(this.model);

            this.tempElm = { new: this.model.constraintById(elm.id).toJSON() };


            this.updateg(); // update graphics
        },

        initCtxm(elm) { // todo: remember to add option for drive func
            console.log(elm.type);

            this.tempElm = {};  // save elm for eventlistener & state-check
            this.tempElm.type = (!!elm.type && ['free', 'rot', 'tran', 'ctrl'].includes(elm.type)) ? 'constraint' : 'node'; // check elm type
            this.tempElm.old = elm.toJSON();

            // save label-state for resetting to it when closing ctxm
            this.tempElm.labelState = {nodes: mec.showNodeLabels, constraints: mec.showConstraintLabels, loads: mec.showLoadLabels};
            // show labels that are hidden
            if (!mec.showNodeLabels) mec.showNodeLabels = true;
            if (!mec.showConstraintLabels) mec.showConstraintLabels = true;
            if (!mec.showLoadLabels) mec.showLoadLabels = true;
            // render labels
            app.notify('render');

            // app.tempElm.old = JSON.parse(JSON.stringify(elm));
            this.updateCtxm(this.tempElm.old, this.tempElm.type);
            this.showCtxm();
        },

        showCtxm() {
            this.ctxmenu.style.display = 'block'
            this.ctxmenu.style.left = `${this.evt.clientX}px`;
            this.ctxmenu.style.top = `${this.evt.clientY}px`;
        },

        hideCtxm(skip = false) {
            this.ctxmenu.style.display = 'none'
            if (!!this.tempElm.new && !skip)
                this.tempElm.type === 'constraint' ? this.replaceConstraint(this.tempElm.old, this.tempElm.new) : this.replaceNode(this.tempElm.old, this.tempElm.new);

            // this.tempElm.labelState = {nodes: mec.showNodeLabels, constraints: mec.showConstraintLabels, loads: mec.showLoadLabels};
            // show labels that are hidden
            if (this.tempElm.labelState.nodes !== mec.showNodeLabels) mec.showNodeLabels = this.tempElm.labelState.nodes;
            if (this.tempElm.labelState.constraints !== mec.showConstraintLabels) mec.showConstraintLabels = this.tempElm.labelState.constraints;
            if (this.tempElm.labelState.loads !== mec.showLoadLabels) mec.showLoadLabels = this.tempElm.labelState.loads;

            // reset app edit-state
            this.tempElm = false;
        },

        updateCtxm(elm, type) {
            console.log(elm);

            // delete old bodyelements of the ctxm to append updated ones
            while (this.ctxmenubody.hasChildNodes()) {
                this.ctxmenubody.removeChild(this.ctxmenubody.lastChild);
            };

            // template ctxmenu

            //replace header
            this.ctxmenuheader.innerHTML = ctxm.header(elm, type);

            //append new body
            if (type === 'constraint') { // constraint
                this.ctxmenubody.innerHTML += ctxm.sectionTitle('orientation');
                this.ctxmenubody.innerHTML += ctxm.oriType(elm);
                if (elm.ori.type === 'ref') {
                    const oriRefId = !!elm.ori.ref ? elm.ori.ref : app.model.constraints[0].id;
                    this.ctxmenubody.innerHTML += ctxm.ref(elm, 'ori', oriRefId);
                };
                this.ctxmenubody.innerHTML += ctxm.sectionTitle('lenght');
                this.ctxmenubody.innerHTML += ctxm.lenType(elm);
                if (elm.len.type === 'ref') {
                    const lenRefId = !!elm.len.ref ? elm.len.ref : app.model.constraints[0].id
                    this.ctxmenubody.innerHTML += ctxm.ref(elm, 'len', lenRefId);
                };
                this.ctxmenubody.innerHTML += ctxm.sectionTitle('nodes');
                this.ctxmenubody.innerHTML += ctxm.nodes(elm);
                this.ctxmenubody.innerHTML += ctxm.removeConstraintButton();
            } else { // node
                this.ctxmenubody.innerHTML += ctxm.nodeCoordinates(elm);
                this.ctxmenubody.innerHTML += ctxm.nodeMass(elm);
            };
        },

        loadFromJSON(files) {
            let file = files[0]
            let fr = new FileReader();

            fr.onload = (() => {
                return (e) => {
                    this.imported = JSON.parse(e.target.result);
                    // console.log(this == app)
                }
            })(file);
            fr.readAsText(file);
        },

        saveToJSON() {
            let a = document.createElement('a');
            let file = new Blob([JSON.stringify(this.model)], { type: 'application/json' }); // model now has toJSON (constraints not fully implemented) which gets automazically invoked by stringify
            a.href = URL.createObjectURL(file);
            a.download = 'linkage.json';
            document.body.appendChild(a); // Firefox needs the element to be added to the DOM for this to work, Chrome & Edge ¯\_(ツ)_/¯
            a.click();
            document.body.removeChild(a);
        }
    }, mixin.observable,      // for handling (custom) events ..
        mixin.pointerEventHdl, // managing (delegated) pointer events
        mixin.tickTimer,       // synchronize pointer events and rendering
        mixin.zoomPan)
};

let app;

window.onload = () => {
    let c = document.getElementById('c'),
        main = document.getElementById('main');   

    // create App instance
    (app = App.create()).init(); 
    // fill graphics queue
    app.updateg();

    // fit canvas
    c.width = main.clientWidth;
    c.height = main.clientHeight - 30;

    // render graphics
    app.notify('render');

    // define non-editor events
    events.navbarClick('navcollapse');
    events.navbarChange('import');
    events.sidebarClick('sb-l');
    events.keyboardDown(); // binds to document
    events.ctxmClick('contextMenu');
    events.ctxmInput('contextMenu');
    events.ctxmChange('contextMenu');
    events.resize(); // binds to window

    // make cxtm dragable
    const _draggableCtxMenu = new Draggabilly(document.getElementById('contextMenu'), {
        containment: '.main-container',
        handle: '.card-header'
    });
};