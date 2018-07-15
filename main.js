g2.prototype.v2 = function ({ p1, p2, ls, ls2, lw, type, id, idloc }) { return this.addCommand({ c: 'v2', a: arguments[0] }); }
g2.prototype.v2.prototype = {
    g2: function () {
        let { p1, p2, ls, ls2, lw, type, id, idloc } = this,
            lam = idloc || 0.5, xid = p1.x + lam * (p2.x - p1.x), yid = p1.y + lam * (p2.y - p1.y),
            arrow = (type === 1) ? 'M0,0 8,0M10,-4 10,4M15,-4 15,4M18,0 37,0M48,0 39,-3 40,0 39,3 Z'
                : (type === 2) ? 'M12,0 10,6 12,0 10,-6Z M0,0 9,0M15,0 37,0M48,0 39,-3 40,0 39,3 Z'
                    : (type === 4) ? 'M0,0 27,0 M38,0 29,-3 30,0 29,3 Z M48,0 39,-3 40,0 39,3 Z'
                        : (type === 5) ? 'M12,0 10,6 12,0 10,-6Z M0,0 9,0M15,0 37,0M38,0 29,-3 30,0 29,3 Z M48,0 39,-3 40,0 39,3 Z'
                            : (type === 6) ? 'M0,0 8,0M11,-4 11,4M15,-4 15,4M18,0 37,0M38,0 29,-3 30,0 29,3 Z M48,0 39,-3 40,0 39,3 Z'
                                : 'M0,0 37,0M48,0 39,-3 40,0 39,3 Z';

        return g2().beg({ x: p1.x, y: p1.y, w: Math.atan2(p2.y - p1.y, p2.x - p1.x), scl: 1, lw, ls: ls2, fs: '@ls', lc: 'round' })
            .stroke({ d: `M50,0 ${Math.hypot(p2.x - p1.x, p2.y - p1.y)},0`, ls, lw: lw + 1 })     // not supported by ...
            .drw({ d: arrow })                                                          // ... ms edge yet.
            .end()
            .cir({ x: xid, y: yid, r: 8, ls: "#666", fs: "snow" })
            .txt({ str: id || '?', x: xid, y: yid, thal: 'center', tval: 'middle' })
    }
}

const tooltip = document.getElementById('info'),
    statusbar = document.getElementById('statbar'),
    nodestyle = {
        r: 5, ls: '#333', fs: '#eee',
        _info() { return `x:${this.x}<br>y:${this.y}` }  // tooltip info ...
    }
//      nod1 = {x:40,y:30,...nodestyle}, nod2 = {x:240,y:50,...nodestyle},  // ms Edge can't handle this yet ...
// nod1 = Object.assign({ x: 40, y: 30 }, nodestyle), nod2 = Object.assign({ x: 240, y: 50 }, nodestyle),  // ... but that.
editor = g2.editor(),
    //      edgeTyp = {BAS:0,ROT:1,TRN:2},
    edgeType = ['bas', 'trn', 'rot', 'trn+rot'];

const pi = Math.PI;

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
                phi: pi / 2,
                psi: pi / 2,
                theta: pi / 2,
                // get phideg() { return this.phi / pi * 180 },
                // set phideg(q) { this.phi = q / 180 * pi; app.notify('phi', q); app.dirty = true; },
                // get psideg() { return this.psi / pi * 180 },
                // set psideg(q) { this.psi = q / 180 * pi; app.notify('psi', q); app.dirty = true; },

                // get [this.constraints[constraint].for]() { return this[this.constraints[constraint].for] / pi * 180 },
                // set [this.constraints[constraint].for](q) { this[this.constraints[constraint].for] = q / 180 * pi; app.notify(this[this.constraints[constraint].for], q); app.dirty = true; },

                // get [x](x) {  return this[x] / pi * 180 }, // call x as string

                // set [this.deg](q) { this[x] = q / 180 * pi; app.notify(x, q); app.dirty = true; },

                nodes: [
                    { id: 'A0', x: 100, y: 100, m: 'infinite' },
                    { id: 'A', x: 100, y: 150, m: 1 },
                    { id: 'B', x: 300, y: 200, m: 1 },
                    { id: 'B0', x: 300, y: 100, m: 'infinite' }
                    // { id: 'B', x: 300, y: 150, m: 1 },
                    // { id: 'B0', x: 300, y: 100, m: 'infinite' },
                    // { id: 'B', x: 300, y: 150, m: 1 },
                    // { id: 'C0', x: 200, y: 200, m: 'infinite' },
                    // { id: 'C', x: 200, y: 350, m: 1 }
                ],
                constraints: [
                    { id: 'a', type: 'ctrl', p1: 'A0', p2: 'A', r: 50, get w() { return app.model.phi }, for: 'phi' }, // controlled var must be readable (hence 'for') to dynamically add inputs to DOM
                    // { id: 'b', type: 'rot', p1: 'A', p2: 'B'},
                    // { id: 'c', type: 'rot', p1: 'B0', p2: 'B'}
                    { id: 'b', type: 'ctrl', p1: 'B0', p2: 'B', r: 100, get w() { return app.model.psi }, for: 'psi' },
                    // { id: 'c', type: 'free', p1: 'A', p2: 'B' },
                    // { id: 'd', type: 'ctrl', p1: 'C0', p2: 'C', r: 150, get w() { return app.model.theta }, for: 'theta' }
                ],
            }

            this.dirty = true
            // mixin requiries ...
            this.evt = { dx: 0, dy: 0, dbtn: 0 };
            this.curElm = undefined; // current element from editor.hit(elm)
            this.view = { x: 50, y: 50, scl: 1, cartesian: true };
            this.cnv = document.getElementById('c');
            this.ctx = this.cnv.getContext('2d');
            this.edit = false;
            this.instruct = document.getElementById(`instructions`);
            this.imported = {};

            // this.updateModel = false;
            this.g = g2().clr()
                .view(this.view)
                .grid({ color: "rgba(255, 255, 255, 0.1)", size: 100 })
                .grid({ color: "rgba(255, 255, 255, 0.1)", size: 20 })
                .p() // mark origin
                .m({ x: () => -this.view.x / this.view.scl, y: 0 })
                .l({ x: () => (this.cnv.width - this.view.x) / this.view.scl, y: 0 })
                .m({ x: 0, y: () => -this.view.y / this.view.scl })
                .l({ x: 0, y: () => (this.cnv.height - this.view.y) / this.view.scl })
                .z()
                .stroke({ ls: "rgba(255, 255, 255, 0.3)", lw: 2 })

            this.registerEventsFor(this.ctx.canvas)
                .on(['pointer', 'drag', 'buttondown', 'buttonup', 'click'], (e) => { this.g.exe(editor.on(this.pntToUsr(Object.assign({}, e)))) })  // apply events to g2 ...
                .on(['pointer', 'drag', 'pan', 'fps', 'buttondown', 'buttonup', 'click', 'pointerenter', 'pointerleave'], () => this.showStatus())
                .on('drag', (e) => {       // update tooltip info
                    tooltip.style.left = (e.x + 5) + 'px';
                    tooltip.style.top = (this.cartesian ? this.height - (e.y + 30) : e.y - 30) + 'px';
                    tooltip.innerHTML = editor.dragInfo;
                })
                .on('pan', (e) => {
                    this.pan(e);
                })
                .on('buttondown', (e) => {                     // show tooltip info
                    if (editor.dragInfo) {
                        tooltip.style.left = (e.x + 5) + 'px';
                        tooltip.style.top = (this.cartesian ? this.height - (e.y + 30) : e.y - 30) + 'px';
                        tooltip.innerHTML = editor.dragInfo;
                        tooltip.style.display = 'inline';
                    }
                })
                .on(['buttonup', 'click'], (e) => {             // hide tooltip info
                    tooltip.style.display = 'none';
                })

                .on('click', () => {
                    if (this.edit) {
                        // console.log(editor)
                        if (this.edit.mode == "addnode" || this.edit.mode == "addframenode") this.addNode();
                        if (this.edit.mode == "free" || this.edit.mode == "tran" || this.edit.mode == "rot" || this.edit.mode == "ctrl") this.addConstraint();
                    }
                })

                .on('render', () => this.g.exe(editor).exe(this.ctx))      // redraw
                .on('step', () => this.model.asm())
                .startTimer() // startTimer ...             // start synchronized ticks
                .notify('render')   // send 'render' event
        }, // constructor

        get cartesian() { return this.view.cartesian; },
        get height() { return this.ctx.canvas.height; },
        get dragging() { return !!(editor.curState & g2.DRAG) },

        showStatus() {  // poor man's status bar
            let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
            statusbar.innerHTML = `mode=${this.evt.type}, x=${x}, y=${y}, cartesian=${this.cartesian}, btn=${this.evt.btn}, dbtn=${this.evt.dbtn}, fps=${this.fps}, state=${g2.editor.state[editor.curState]}, dragging=${this.dragging}`
        },

        init() { // evaluate how many actuators and add init add controlled properties to model instead of typing them there
            mec.model.extend(this.model);
            this.model.init()
                .draw(this.g);

            this.model.actcount = 0; // add counter to model
            let actcontainer = document.getElementById(`actuators-container`);
            for (let constraint in this.model.constraints) { // get amount of actuators in model
                if (this.model.constraints[constraint].type === 'ctrl') this.model.actcount++
            }
            // calculate range-input witdth
            let rangewidth = (this.model.actcount > 1) ? actcontainer.clientWidth / 2 - 150 : actcontainer.clientWidth - 150; // subtract space for controls & output

            for (let constraint in this.model.constraints) {
                if (this.model.constraints[constraint].type === 'ctrl') {
                    // actindx.push(constraint);
                    let actuated = this.model.constraints[constraint].for // string matching actuated variable
                    // console.log(this.model[`${actuated}`])
                    actcontainer.appendChild(this.createActuatorElm(actuated, rangewidth));
                    let elm = document.getElementById(`${actuated}`);
                    // document.getElementById(`${actuated}_Slider`).initEventHandling(this, `${actuated}_Slider`, () => this.model.deg(`${actuated}`), (q) => { this.model.actuated = q; });
                    mecSlider.RegisterElm(elm);
                    elm.initEventHandling(this, `${actuated}`, () => { return this.model[`${actuated}`] / pi * 180 }, (q) => { this.model[`${actuated}`] = q / 180 * pi; this.notify(`${actuated}`, q); this.dirty = true; });
                }
            }
            // document.getElementById('phi_Slider').initEventHandling(this, 'phi_Slider', () => { return this.model.phi / pi * 180 }, (q) => { this.model.phi = q / 180 * pi; this.notify('phi', q); this.dirty = true; }); // needs to be generalized
            // document.getElementById('psi').initEventHandling(this, 'psi', () => this.model.psideg, (q) => { this.model.psideg = q; });
            (this.mainLoop.ptr || (this.mainLoop.ptr = this.mainLoop.bind(this)))(this.mainLoop.t0 = performance.now());
            this.startTimer() // startTimer ...             // start synchronized ticks 
                .notify('render');                          // send 'render' event
        },

        mainLoop(t) {
            if (this.dirty) {
                this.dirty = false
                this.notify('step');
                this.notify('render');
            }
            requestAnimationFrame(this.mainLoop.ptr);
        },

        createActuatorElm(actuated, width) {
            let template = document.createElement('template')
            template.innerHTML = `<mec-slider id="${actuated}" class="mec-slider d-inline-flex nowrap ml-2 mr-1 mt-1" width="${width}" min="0" max="360" step="1" value="" valstr="${actuated}={value}°"></mec-slider>`
            return template.content.firstChild;
        },

        addNode() {
            // if (!editor.draggable) { // not intended for this, better way to check ?
            if (this.curElm === undefined || !this.curElm.hasOwnProperty("m")) { // objects with a mass are considered nodes // bug: triggers dragging of existing node
                // if (this.curElm === undefined || !this.curElm.isSolid) { // also works but throws type-error over empty space
                let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
                let node = {
                    id: this.getNewChar(),
                    x: x,
                    y: y,
                    m: this.edit.mode == 'addframenode' ? Number.POSITIVE_INFINITY : 1
                };
                console.log(node);
                // this.model.nodes.push(mec.node.extend(node));
                // node.draw(this.g)
                this.model.addNode(mec.node.extend(node)); // inherit prototype methods (extend) and add to model via model.addnode
                this.g.ins(node); // add node to graphics queue
            } else {
                console.log(`node already exists at this coordinates ...`);
                this.curElm.drag = false;
            }
            app.edit = false; // reset state
            this.instruct.innerHTML = ``;
        },

        addConstraint() {
            if(!this.edit.firstnode) {
                //first invocation
                console.log(`first call`)
                if (this.curElm.hasOwnProperty("m")) { // node clicked
                    this.edit.firstnode = this.curElm;
                    this.instruct.innerHTML = `select second node`
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };                    
            } else {
                //second invocation
                console.log(`second call`)
                if (this.curElm.hasOwnProperty("m")) { // node clicked
                    let secondnode = this.curElm;
                    let constraint = {
                        id: this.getNewChar(`constraint`),
                        type: this.edit.mode,
                        p1: this.edit.firstnode.id,
                        p2: secondnode.id
                        // r:
                        // for:
                        // get [](): 
                    };
                    let type;
                    console.log(typeof(constraint.type))
                    switch (constraint.type) {
                        case `free`: this.model.addConstraint(mec.constraint.free.extend(constraint)); break;
                        case `tran`: this.model.addConstraint(mec.constraint.tran.extend(constraint)); break;
                        case `rot`:  this.model.addConstraint(mec.constraint.rot.extend(constraint)); break;
                        case `ctrl`: this.model.addConstraint(mec.constraint.ctrl.extend(constraint)); break;
                        default: console.log(`something went wrong while adding constraint...`); break;
                    }
                    // this.model.addConstraint(type.extend(constraint));
                    constraint.init();
                    this.g.ins(constraint);
                    
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
                this.edit = false;
                this.instruct.innerHTML = ``
            };
        },

        getNewChar(x = `node`) { // returns @type {string}
            let charArr = [];
            let name;
            let obj;
            let maxChar; 
            x === `node` ? (obj = this.model.nodes, name = `node`, maxChar = 90) : (obj = this.model.constraints, name = `constraint`, maxChar = 122); // 90 = Z, 122 = z
            for (let i = 0; i < obj.length; i++) {
                charArr.push(obj[i].id.charCodeAt(0)) // push charcodes from first letter of node ids
            }
            charArr.sort(function (a, b) { // sort array containing charcodes
                return a - b;
            });
            let potChar = charArr[charArr.length - 1] + 1
            return (potChar <= maxChar) ? String.fromCharCode(potChar) : `${name}${obj.length + 1}`;   // choose one higher than highest charCode or assign numbers when running out of characters
        },

        build() {
            this.model = mec.model.extend(this.model);
            this.model.init().draw(this.g);
            this.notify("render");
        },

        fromJSON(files) {
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

        toJSON() {
            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(app.model)], { type: "application/json" });
            a.href = URL.createObjectURL(file);
            a.download = "linkage.json";
            document.body.appendChild(a); // Firefox needs the element to be added to the DOM for this to work, Chrome & Edge ¯\_(ツ)_/¯
            a.click();
            document.body.removeChild(a);
        }
    }, mixin.observable,      // for handling (custom) events ..
        mixin.pointerEventHdl, // managing (delegated) pointer events
        mixin.tickTimer,       // synchronize pointer events and rendering
        mixin.zoomPan)
}

let app;

window.onload = () => {
    let c = document.getElementById(`c`),
        main = document.getElementById(`main`);

    c.width = main.clientWidth;
    c.height = main.clientHeight - 30;

    // app = App.create(); // create instance
    // app.build();        // assemble mechanism

    (app = App.create()).init();

    // sidebar handler
    document.getElementById(`sb-l`).addEventListener(`click`, (e) => { // bind to parent
        if (e.target && e.target.className == `vec_btn`) app.edit = { mode: e.target.id }; app.instruct.innerHTML = `select first node`; // check for children
        if (e.target && e.target.id == `addnode` || e.target.id == `addframenode`) { app.edit = { mode: e.target.id }; app.instruct.innerHTML = `left-click on the canvas to place a new node`; };
        if (e.target && e.target.id == `viewreset`) { app.view.x = 50; app.view.y = 50; app.view.scl = 1; app.notify(`render`); };
    })
    // document.getElementById(`sb-l`).addEventListener(`input`, (e) => { // bind to parent
    //     if (e.target && e.target.id == `phi_Slider`) { // check for children
    //         app.model.phi = (+e.target.value) / 180 * Math.PI;
    //         app.model.asm();
    //         app.notify('render');
    //     };
    // })
    document.getElementById(`import`).addEventListener(`change`, (e) => app.fromJSON(e.target.files))
    document.getElementById(`export`).addEventListener(`click`, () => app.toJSON())

}

window.onresize = () => {
    let c = document.getElementById(`c`),
        main = document.getElementById(`main`);

    c.width = main.clientWidth;
    c.height = main.clientHeight - 30;

    let actcontainer = document.getElementById(`actuators-container`);

    if (actcontainer.clientWidth > 1000) {
        console.log(true)
    let mecsliders = document.querySelectorAll(`.mec-slider`);
    let rangesliders = document.querySelectorAll(`.custom-range`);
    let rangewidth = (app.model.actcount > 1) ? actcontainer.clientWidth / 2 - 150 : actcontainer.clientWidth - 150; // subtract space for controls & output

    // lagging
    // let rangewidth;
    // if (app.model.actcount > 1) {
    //     if (actcontainer.clientWidth < 600) {
    //         rangewidth = 200;
    //     } else {
    //         rangewidth = Math.trunc(actcontainer.clientWidth / 2 - 50);
    //     }
    // } else {
    //     rangewidth = Math.trunc(actcontainer.clientWidth - 50);
    // }

    mecsliders.forEach(slider => { slider.width = `${rangewidth}`; })
    rangesliders.forEach(slider => { slider.style.width = `${rangewidth}px` })
    }

    app.dirty = true;
}