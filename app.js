/**
 * This is the main file of mecEdit. You can find this app on {@link https://github.com/jauhl/mecEdit GitHub}.
 * @name mecEdit
 * @author Jan Uhlig
 * @copyright Jan Uhlig 2018
 * @license MIT
 * @requires examples.js
 * @requires ctxm-templates.js
 * @requires appevents.js
 * @requires g2.editor.js
 * @requires mixin.js
 * @requires slider.js
 * @requires mec2.js
 * @requires g2.js
 */

'use strict';

const tooltip = document.getElementById('info'),
      actcontainer = document.getElementById('actuators-container'),
      runbutton = document.getElementById('run'),
      // statusbar
      statusbar = document.getElementById('statbar'),
      sbMode =  document.getElementById('sbMode'),
      sbCoords =  document.getElementById('sbCoords'),
      sbCartesian =  document.getElementById('sbCartesian'),
      sbBtn =  document.getElementById('sbBtn'),
      sbDbtn =  document.getElementById('sbDbtn'),
      sbFPS =  document.getElementById('sbFPS'),
      sbState =  document.getElementById('sbState'),
      sbDragging =  document.getElementById('sbDragging'),
      sbDragmode =  document.getElementById('sbDragmode'),
      sbDOF =  document.getElementById('sbDOF'),
      sbGravity =  document.getElementById('sbGravity'),
  
      editor = g2.editor(),
      pi = Math.PI;

const origin = g2().beg({ lc: 'round', lj: 'round', ls:()=>mec.darkmode?'silver':'slategray', fs: 'darkgray' })
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
                    .beg({ ls:()=>mec.darkmode?'silver':'slategray', font: '14px roboto'})
                        .txt({str:'x', x: 38, y: 4})
                        .txt({str:'y', x: 6, y: 30})
                    .end();
                    
const gravvec = (cartesian = true) => {
    const ytxt = cartesian ? - 20 : -15;
    return g2().beg({ w: -pi/2, lw: 2, ls:()=>mec.darkmode?'silver':'slategray', fs: 'darkgray'})
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
            .beg({ ls:()=>mec.darkmode?'silver':'slategray', font: '14px roboto'})
                .txt({str:'g', x: -15, y: ytxt})
            .end();
};

const App = {
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o, arguments);
        return o;
    },
    prototype: Object.assign({
        constructor() {
            this.model = {
                id:"linkage"
            };

            this.VERSION = '0.5.1.0';

            // mixin requiries ...
            this.evt = { dx: 0, dy: 0, dbtn: 0 };
            this.view = { x: 150, y: 150, scl: 1, cartesian: true };

            this.cnv = document.getElementById('canvas');
            this.ctx = this.cnv.getContext('2d');
            this.instruct = document.getElementById('instructions');
            this.ctxmenu = document.getElementById('contextMenu');
            this.ctxmenuheader = document.getElementById("contextMenuHeader");
            this.ctxmenubody = document.getElementById("contextMenuBody");

            // states
            this.build = false;  // build state
            this.tempElm = false;  // ctxm state

            this.devmode = false;
            this.importConfirmed = false; // skip conformdialogue helper
            this.dragMove = true;
            this.nodeInfoValues = ['acc','accAbs','vel','velAbs','force','forceAbs'];
            this.constraintInfoValues = ['w','wt','wtt','r','rt','rtt','forceAbs','moment'];
            this.nodeVectorValues = ['acc','vel','force']; // objects only

            this.g = g2();

            this.registerEventsFor(this.ctx.canvas)
                .on(['pointer', 'drag', 'buttondown', 'buttonup', 'click'], (e) => { this.g.exe(editor.on(this.pntToUsr(Object.assign({}, e)))).exe(this.ctx); })  // apply events to g2 ...
                .on(['pointer', 'drag', 'pan', 'fps', 'buttondown', 'buttonup', 'click', 'pointerenter', 'pointerleave'], () => this.showStatus())
                .on('drag', (e) => {
                    if (!this.dragMove) { // dragEdit mode
                        editor.curElm.x0 = editor.curElm.x;
                        editor.curElm.y0 = editor.curElm.y;
                    };
                    this.showTooltip(e);
                })
                .on('pan', (e) => {
                    this.pan(e);
                    this.g.exe(this.ctx);
                })
                .on('pointer',(e)=>this.showTooltip(e)) // show tooltip view info
                .on(['buttonup', 'click'], () => this.hideTooltip()) // hide tooltip info
                .on('buttondown', () => {
                    if (this.build) {
                        if (['addnode', 'addbasenode'].includes(this.build.mode)) this.addNode();
                        if (this.build.mode === 'purgeelement') this.purgeElement(editor.curElm);
                        if (['free', 'tran', 'rot'].includes(this.build.mode)) this.addConstraint();
                        if (this.build.mode === 'drive') this.addDrive(editor.curElm);
                        if (this.build.mode === 'force') this.addForce();
                        if (this.build.mode === 'spring') this.addSpring();
                        if (['fix', 'flt'].includes(this.build.mode)) this.addSupportShape();
                    }
                })
                .on('render', () => this.g.exe(this.ctx))
                .on('tick', (e) => this.tick(e));
            
            this.state = 'created';
        }, // constructor

        get cartesian() { return this.view.cartesian; },
        get height() { return this.ctx.canvas.height; },
        get dragging() { return !!(editor.curState & g2.DRAG) },

        showStatus() {
            let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
            sbCoords.innerHTML = `x=${x}, y=${y}`;
            sbDragmode.innerHTML = `dragmode=${this.dragMove?'move':'edit'}`;
            sbFPS.innerHTML = `fps=${this.fps}`;
            if (!!this.model.nodes && this.model.nodes.length > 0 ) { // only useful when model has nodes
                sbDOF.innerHTML = `dof=${this.model.dof}`;
                if (this.devmode)
                    sbGravity.innerHTML = `gravity=${this.model.hasGravity ? 'on' : 'off'}`;
            } else {
                sbDOF.innerHTML = sbGravity.innerHTML = ``;
            };
            if (this.devmode) {
                sbMode.innerHTML = `mode=${this.evt.type}`;
                sbCartesian.innerHTML = `cartesian=${this.cartesian}`;
                sbBtn.innerHTML = `btn=${this.evt.btn}`;
                sbDbtn.innerHTML = `dbtn=${this.evt.dbtn}`;
                sbState.innerHTML = `state=${g2.editor.state[editor.curState]}`;
                sbDragging.innerHTML = `dragging=${this.dragging}`;
            };            
        },

        showTooltip(e) {
            const info = this.model.info;
            tooltip.style.left = ((e.clientX) + 15) + 'px';
            tooltip.style.top = (e.clientY - 50) + 'px';
            // type of info
            if (editor.dragInfo && !this.dragMove) {
                tooltip.innerHTML = editor.dragInfo;
                tooltip.style.display = 'inline';
            } else if (info && this.dragMove) { // don't show views in dragEdit mode
                tooltip.innerHTML = info;
                tooltip.style.display = 'inline';
            }
            else
                this.hideTooltip();
        },

        hideTooltip() {
            tooltip.style.display = 'none';
        },

        tick(e) {
            if (!!this.model) { // check if model is defined first
                if (this.dragging) {
                    this.dragMove ? this.model.pose() : this.updDependants(editor.curElm); // null, if updating on dragend via editor
                    this.g.exe(this.ctx);
                }
                else if (this.state === 'active') {     // perform time step
                    this.model.tick(e.dt);
                    if (!this.model.isActive)
                        this.stop();        // this causes state intentionally being set to 'idle' for model without gravity even when run was clicked
                    this.g.exe(this.ctx);
                }
                else if (this.state === 'input') {     // perform time step
                    this.model.tick(0);
                    this.g.exe(this.ctx);
                }
            }
        },

        init() { // evaluate how many drives and add init add controlled properties to model instead of typing them there
            mec.model.extend(this.model);
            this.model.init().asmPos();
            this.model.draw(this.g);

            this.model.drivecount = 0;  // add drive counter to model
            this.model.inputs = [];     // track drives by id and dof for responsive range-input sizing

            let drv, prv=false;
            while (drv = this.driveByInput(prv)) {
                let id = drv.constraint.id+'-'+drv.value;
                let max = (drv.value === 'ori') ? Math.round(drv.constraint.ori.Dw*180/pi) : Math.round(drv.constraint.len.Dr); // max value of range input (min always 0)
                actcontainer.appendChild(this.createInputSlider(id, (this.cnv.width - 150)/2, max));

                let elm = document.getElementById(id);
                mecESlider.RegisterElm(elm);
                elm.initEventHandling(this, id, this.model.constraintById(drv.constraint.id)[drv.value].inputCallbk);
                this.model.drivecount++;
                this.model.inputs.push(id);
                prv = drv;
            };

            if (typeof t === 'undefined' || t === null) {  // dont start second timer if init() is called again
                this.startTimer() // startTimer ...             // start synchronized ticks 
                    .notify('render');                          // send 'render' event
            };

            this.state = (this.model.inputs.length > 0) ? 'input' : 'initialized';
        },

        run() { 
            this.state = 'active'; 
            runbutton.innerHTML = '<i class="fas fa-pause"></i>'; 
        },
        idle() { 
            this.state = (this.model.inputs.length > 0) ? 'input' : 'idle';
            runbutton.innerHTML = '<i class="fas fa-play"></i>';
        },
        stop() {
            this.model.stop();
            this.state = (this.model.inputs.length > 0) ? 'input' : 'idle';
            runbutton.innerHTML = '<i class="fas fa-play"></i>';
        },
        reset() { 
            this.model.reset();
            this.model.pose(); // necessary because model.reset() does not respect constraint r0 values

            // reset drive-inputs
            for (const drive in this.model.inputs) {
                let ident = this.model.inputs[drive].split('-'); // eg.: ident = ['a','len']
                this.model.constraintById(ident[0])[ident[1]].inputCallbk({target:{value:0}}); // reset driven constraints
                document.getElementById(ident[0]+'-'+ident[1]).value = 0;
                this.notify(ident[0]+'-'+ident[1],0);
            };

            this.notify('render');
            this.state = (this.model.drivecount > 0) ? 'input' : 'reset';
            runbutton.innerHTML = '<i class="fas fa-play"></i>';
        },

        updDependants(elm) {
            let dependants = [];
            for (const constraint of this.model.constraints) {
                if (constraint.dependsOn(elm))
                    dependants.push(constraint);
            };
            dependants.forEach(el => {
                el.init(this.model);
                if (el.type === 'ctrl' && ( el.ori.type === 'drive' || el.len.type === 'drive' )) { // each init of constraint-drives multiplies 'Dt' with 'repeat', so this value either has to be saved and restored or simply canceled out by dividing ... 
                    if (!!el.ori.repeat)
                        el.ori.Dt /= el.ori.repeat;
                    if (!!el.len.repeat)
                        el.len.Dt /= el.len.repeat;
                };       
            });
        },

        toggleDarkmode() {
            mec.darkmode = !mec.darkmode;
            jsonEditor.setOption("theme",`${mec.darkmode ? 'lucario' : 'mdn-like'}`);
            this.cnv.style.backgroundColor = mec.darkmode ? '#344c6b' : 'rgb(250, 246, 209)';
            this.notify('render');
        },

        resetView() {
            this.view.x = 150; 
            this.view.y = 150;
            this.view.scl = 1;
            this.view.cartesian = true;
            this.notify('render');
        },

        createInputSlider(actuated, width, max) {
            let template = document.createElement('template');
            template.innerHTML = `<mecedit-slider id="${actuated}" class="mecedit-slider d-inline-flex nowrap ml-2 mr-1 mt-1" width="${width}" min="0" max="${max}" step="1" value="" valstr="${actuated}={value}${actuated.includes('ori')?'°':'u'}"></mecedit-slider>`
            return template.content.firstChild;
        },

        updateg() {
            let apphasmodel = typeof this.model === 'object' && Object.keys(this.model).length ? true : false;

            this.g = g2().clr()
                .view(this.view)
                .grid({ color: ()=>mec.darkmode?'rgba(255, 255, 255, 0.1)':'rgba(0, 0, 0, 0.1)', size: 100 })
                .grid({ color: ()=>mec.darkmode?'rgba(255, 255, 255, 0.1)':'rgba(0, 0, 0, 0.1)', size: 20 })
                .p() // mark origin
                    .m({ x: () => -this.view.x / this.view.scl, y: 0 })
                    .l({ x: () => (this.cnv.width - this.view.x) / this.view.scl, y: 0 })
                    .m({ x: 0, y: () => -this.view.y / this.view.scl })
                    .l({ x: 0, y: () => (this.cnv.height - this.view.y) / this.view.scl })
                .z()
                .stroke({ ls: ()=>mec.darkmode?'rgba(255, 255, 255, 0.3)':'rgba(0, 0, 0, 0.2)', lw: 2 })
                .use({grp:origin,x: () => (10 - this.view.x)/this.view.scl, y: () => (10 - this.view.y)/this.view.scl, scl: () => this.view.scl});
                if(apphasmodel && this.model.hasGravity) {
                    if(this.cartesian) {
                        this.g.use({grp:gravvec(true),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (this.cnv.height - 15 - this.view.y)/this.view.scl, scl: () => this.view.scl});
                    } else {
                        this.g.use({grp:gravvec(false),x: () => (this.cnv.width - 15 - this.view.x)/this.view.scl, y: () => (- this.view.y + 69 )/this.view.scl, scl: () => this.view.scl});
                    };
                };

            if (apphasmodel)
                this.model.draw(this.g);
            this.notify('render')
        },

        resetApp() {
            this.build = false; // reset build state
            this.tempElm = false; // reset build state
            this.instruct.innerHTML = ''; // reset instructions
            this.notify('render');
        },

        replaceNode(oldN, newN) {
            if (!(oldN.x === newN.x)) this.model.nodeById(oldN.id).x = newN.x;
            if (!(oldN.y === newN.y)) this.model.nodeById(oldN.id).y = newN.y;
            if (!(oldN.m === newN.m)) this.model.nodeById(oldN.id).m = newN.m;
        },

        addNode() {
            if (editor.curElm === undefined || !editor.curElm.hasOwnProperty('m')) { // no node at coords; objects with a mass are considered nodes
                let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
                let node = {
                    id: this.getNewChar(),
                    x: x,
                    y: y,
                    m: this.build.mode == 'addbasenode' ? Number.POSITIVE_INFINITY : 1
                };
                this.model.addNode(mec.node.extend(node)); // inherit prototype methods (extend) and add to model via model.addnode
                node.init(this.model);
                this.updateg(); // update graphics
            } else { // existing node at coords
                return;
            };
            
            if (!this.build.continue) {
                document.body.style.cursor = 'default';
                this.resetApp();
            };
        },

        removeInput(id) {
            for (let dof of ['-len','-ori']) {
                if (this.model.inputs.includes(id+dof)) { // remove redundant ori inputs
                    actcontainer.removeChild(document.getElementById(id+dof));
                    this.model.inputs.splice(this.model.inputs.findIndex((el)=>el.id === id),1);
                    this.model.drivecount--;
                }
            }
        },

        purgeElement(elem) {  // identify and remove passed element and all its dependants
            if (!!elem) { // check if an actual element was passed and not 'undefined'
                if(['node','ctrl'].includes(elem.type)) {
                    let dependants = this.model.dependentsOf(elem).constraints;
                    if (dependants.length > 0) { // maybe dependants with inputs
                        for (let dep of dependants) {
                            if (this.model.inputs.includes(dep.id+'-ori') || this.model.inputs.includes(dep.id+'-len'))
                                this.removeInput(dep.id);
                        }
                    }
                }

                if (elem.type === 'node') {
                    this.model.purgeNode(elem);
                } else if (['free','tran','rot','ctrl'].includes(elem.type)) {
                    if (this.model.inputs.includes(elem.id+'-ori') || this.model.inputs.includes(elem.id+'-len'))
                        this.removeInput(elem.id);
                    this.model.purgeConstraint(elem);
                } else if (['force','spring'].includes(elem.type)) {
                    this.model.purgeLoad(elem);
                } else if (['vector','trace','info'].includes(elem.type)) { // not detectable yet
                    this.model.purgeView(elem);
                } else { // propably misclicked
                    return;
                };
            
                this.updateg(); // update graphics

                document.body.style.cursor = 'default';
                this.resetApp(); 
            };         
        },

        replaceConstraint(oldC, newC) {
            this.reset();
            // console.log(this.state);

            let rebindorilistener = false;
            let rebindlenlistener = false;
            let oridrv = false;
            let lendrv = false;

            if (newC.ori.type === 'drive')
                oridrv = {newC, value:'ori'};
            if (newC.len.type === 'drive')
                lendrv = {newC, value:'len'};

            // ori
            if (!!oldC.ori && !!oldC.ori.input && !!document.getElementById(oldC.id+'-ori')) { // remove old eventlistener for updated drives
                document.getElementById(oldC.id+'-ori').removeEventListener('input',this.model.constraintById(oldC.id).ori.inputCallbk,false);
                if (!!newC.ori.input) // newC needs new eventlistener
                    rebindorilistener = true;
            };

            // len
            if (!!oldC.len && !!oldC.len.input && !!document.getElementById(oldC.id+'-len')) { // remove old eventlistener for updated drives
                document.getElementById(oldC.id+'-len').removeEventListener('input',this.model.constraintById(oldC.id).len.inputCallbk,false);
                if (!!newC.len.input) // newC needs new eventlistener
                    rebindlenlistener = true;
            };

            this.model.constraints.splice(this.model.constraints.indexOf(this.model.constraintById(oldC.id)), 1); // remove old constraint
            this.model.addConstraint(mec.constraint.extend(newC)); // add new constraint
            newC.init(this.model); // init new constraint
            this.updateg(); // update graphics
            this.model.pose();
            // console.log(newC);

            if ( (lendrv && !this.model.inputs.includes(newC.id+'-len')) || (oridrv && !this.model.inputs.includes(newC.id+'-ori')) ) { // drive has no input yet
                let drv, prv=false;
                while (drv = this.driveByInput(prv)) {
                    let id = drv.constraint.id+'-'+drv.value;
                    let max = (drv.value === 'ori') ? Math.round(drv.constraint.ori.Dw*180/pi) : Math.round(drv.constraint.len.Dr); // max value of range input (min always 0)
                    actcontainer.appendChild(this.createInputSlider(id, (this.cnv.width - 150)/2, max));

                    let elm = document.getElementById(id);
                    mecESlider.RegisterElm(elm);
                    elm.initEventHandling(this, id, this.model.constraintById(drv.constraint.id)[drv.value].inputCallbk);
                    this.model.drivecount++;
                    this.model.inputs.push(id);
                    prv = drv;
                };
                window.dispatchEvent(new Event('resize')); // lazy range-width fitting ...
            } else if (!newC.ori.input && this.model.inputs.includes(newC.id+'-ori')) { // remove redundant ori inputs
                actcontainer.removeChild(document.getElementById(newC.id+'-ori'));
                this.model.inputs.splice(this.model.inputs.findIndex((el)=>el.id === newC.id),1);
                this.model.drivecount--;
            } else if (!newC.len.input && this.model.inputs.includes(newC.id+'-len')) { // remove redundant len inputs
                actcontainer.removeChild(document.getElementById(newC.id+'-len'));
                this.model.inputs.splice(this.model.inputs.findIndex((el)=>el.id === newC.id),1);
                this.model.drivecount--;
            };
            
            if (rebindorilistener) 
                document.getElementById(oridrv.newC.id+'-ori').initEventHandling(this, oridrv.newC.id, this.model.constraintById(oridrv.newC.id)[oridrv.value].inputCallbk );
            if (rebindlenlistener) 
                document.getElementById(lendrv.newC.id+'-len').initEventHandling(this, lendrv.newC.id, this.model.constraintById(lendrv.newC.id)[lendrv.value].inputCallbk );

            this.state = (this.model.inputs.length > 0) ? 'input' : 'initialized';
        },

        driveByInput(prev = false) {  // from microthis.js
            let found = false, start = !prev;
            for (const constraint of this.model.constraints) {
                if (constraint.ori && constraint.ori.type === 'drive' && constraint.ori.input) {
                    if (!start) start = constraint.ori === prev.constraint.ori;
                    else if (!this.model.inputs.includes(constraint.id+'-ori')) found = {constraint, value:'ori'};
                }
                if (constraint.len && constraint.len.type === 'drive' && constraint.len.input && !found) { // skip this if already found something
                    if (!start) start = constraint.len === prev.constraint.len;
                    else if (!this.model.inputs.includes(constraint.id+'-len')) found = {constraint, value:'len'};
                }
                if (found) return found;
            }
            return false;
        },

        addConstraint() {
            if (!this.build.firstnode) { // first invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked
                    this.build.firstnode = editor.curElm;
                    this.instruct.innerHTML = 'Select second node; [ESC] to cancel'
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
            } else { // second invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked

                    if (editor.curElm.id === this.build.firstnode.id) {  // handle invalid selection of identical node as start and end of constraint
                        this.instruct.classList.add('blink');
                        setTimeout(() => { this.instruct.classList.remove('blink'); }, 1400);
                        return;
                    };

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

                    constraint.init(this.model);
                    this.updateg(); // update graphics
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };

                if (!this.build.continue) {
                    this.resetApp();
                } else {
                    delete this.build.firstnode;
                    this.instruct.innerHTML = 'Select first node; [ESC] to cancel';
                };
            };
        },

        getNewChar(x = 'node') { // returns @type {string} todo: bug: adding a constraint with no constraints in model returns id "constraint" and not "a", which it should
            let charArr = [];
            let name, obj, maxChar, char;

            if ((x === 'node' && this.model.nodes.length > 0) || (x === 'constraint' && this.model.constraints.length > 0)) {
                x === 'node' ? (obj = this.model.nodes, name = 'node', maxChar = 90) : (obj = this.model.constraints, name = 'constraint', maxChar = 122); // 90 = Z, 122 = z
                for (let i = 0; i < obj.length; i++) {
                    charArr.push(obj[i].id.charCodeAt(0)) // push charcodes from first letter of node ids
                }
                charArr.sort(function (a, b) { // sort array containing charcodes
                    return a - b;
                });
                let potChar = charArr[charArr.length - 1] + 1
                char = (potChar <= maxChar) ? String.fromCharCode(potChar) : `${name}${obj.length + 1}`;   // choose one higher than highest charCode or assign numbers when running out of characters
            } else {
                char = x === 'node' ? 'A' : 'a'; // 65 = A, 97 = a,
            };

            return char;
        },

        addDrive(elm) {
            if (!!elm && ['free', 'tran', 'rot'].includes(elm.type)) {
                if(elm.ori.type === 'free')
                    elm.ori.type = 'drive';
                if(elm.len.type === 'free')
                    elm.len.type = 'drive';
            
                elm.init(this.model);

                this.updateg(); // update graphics
                this.resetApp(); // reset state and instructions
            } else if (elm === undefined) {
                return;
            } else {
                this.instruct.innerHTML = "Can't add a drive to this element. Select a different one or press [ESC&gt to cancel.";
                setTimeout ( () => {this.instruct.innerHTML = 'Select a constraint to add a drive to; [ESC] to cancel'}, 2400 );
            }
        },

        addSupportShape() {
            if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked

                let shape = {
                    type: this.build.mode,
                    p: editor.curElm.id
                };

                this.model.addShape(mec.shape.extend(shape));
                shape.init(this.model);

                this.updateg(); // update graphics
            } else {
                return;
            }
            document.body.style.cursor = 'default';
            this.resetApp();
        },

        addForce() {
            if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked
                let i = 0;
                    this.model.loads.forEach(load => {
                        if (load.type === 'force')
                            i++
                    });
                    i+=1; // number of forces found +1

                let force = {
                    type: this.build.mode,
                    id: `F${i}`,
                    p: editor.curElm.id
                };

                this.model.addLoad(mec.load.extend(force));
                force.init(this.model);

                this.updateg(); // update graphics
            } else {
                return;
            }
            document.body.style.cursor = 'default';
            this.resetApp();
        },

        addSpring() {
            if (!this.build.firstnode) { // first invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked
                    this.build.firstnode = editor.curElm;
                    this.instruct.innerHTML = 'Select second node; [ESC] to cancel'
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
            } else { // second invocation
                if (!!editor.curElm && editor.curElm.hasOwnProperty('m')) { // node clicked
                    let i = 0;
                    this.model.loads.forEach(load => {
                        if (load.type === 'spring')
                            i++
                    });
                    i+=1; // number of springs found +1

                    let spring = {
                        type: this.build.mode,
                        id: `S${i}`,
                        p1: this.build.firstnode.id,
                        p2: editor.curElm.id,
                    };

                    this.model.addLoad(mec.load.extend(spring));

                    spring.init(this.model);
                    this.updateg(); // update graphics
                } else { // no node clicked
                    return; // next clickevent invokes function again
                };
                this.resetApp();
            };
        },

        initViewModal() {
            if (!this.tempElm)
                this.tempElm = {new:{id:'',type:'trace'}}; // default
            viewModal.setContent(ctxm.viewModal());
            document.getElementById('view-fill-color-btn').style.backgroundColor = 'transparent';
            viewModal.show();
        },

        closeViewModal() {
            this.tempElm = false;
        },

        addViewFromModal() {
            if (this.tempElm.new.id.length === 0) // no id defined
                this.tempElm.new.id = `view${this.model.views.length + 1}`;
            this.model.addView(mec.view.extend(this.tempElm.new));
            this.tempElm.new.init(this.model);
            if (['trace','vector'].includes(this.tempElm.new.type))
                this.updateg();
            this.resetApp();
            viewModal.hide()
        },

        initCtxm(elm) {
            console.log(elm.type)

            this.tempElm = {};  // save elm for eventlistener & state-check
            this.tempElm.replace = false; // nothing has changed yet, so no need for replacing
            this.tempElm.type = ['free', 'rot', 'tran', 'ctrl'].includes(elm.type) ? 'constraint' : elm.type; // check elm type
            this.tempElm.old = JSON.parse(elm.asJSON());
            this.tempElm.new = JSON.parse(elm.asJSON());
            if (!this.tempElm.new.ori)  // needs to exist because of minimal form of asJSON()
                this.tempElm.new.ori = {type:'free'};
            if (!this.tempElm.new.len) 
                this.tempElm.new.len = {type:'free'};
            
            // save label-state for resetting to it when closing ctxm
            this.tempElm.labelState = {nodes: this.model.graphics.labels.nodes, constraints: this.model.graphics.labels.constraints, loads: this.model.graphics.labels.loads};
            // show labels that are hidden
            if (!this.model.graphics.labels.nodes) this.model.graphics.labels.nodes = true;
            if (!this.model.graphics.labels.constraints) this.model.graphics.labels.constraints = true;
            if (!this.model.graphics.labels.loads) this.model.graphics.labels.loads = true;
            // render labels
            this.notify('render');

            this.updateCtxm(this.tempElm.old, this.tempElm.type);
            this.showCtxm();
        },

        showCtxm() {
            this.ctxmenu.style.display = 'block'
            this.ctxmenu.style.left = `${this.evt.clientX}px`;
            this.ctxmenu.style.top = `${this.evt.clientY}px`;
        },

        hideCtxm() {
            this.ctxmenu.style.display = 'none';

            if (!!this.tempElm.new && this.tempElm.type === 'constraint')// && this.tempElm.replace)
                this.replaceConstraint(this.tempElm.old, this.tempElm.new);

            // show labels that are hidden
            if (this.tempElm.labelState.nodes !== this.model.graphics.labels.nodes) this.model.graphics.labels.nodes = this.tempElm.labelState.nodes;
            if (this.tempElm.labelState.constraints !== this.model.graphics.labels.constraints) this.model.graphics.labels.constraints = this.tempElm.labelState.constraints;
            if (this.tempElm.labelState.loads !== this.model.graphics.labels.loads) this.model.graphics.labels.loads = this.tempElm.labelState.loads;

            // reset app edit-state
            this.tempElm = false;
        },

        updateCtxm(elm, type, doftypechanged = false) {
            console.log(elm);
            console.log(`doftypechanged: ${doftypechanged}`);

            // clean elm up from unnessesary properties / rudiments if type of len/ori has changed
            if (doftypechanged) {
                for (let dof of doftypechanged) {
                    if (!!elm[dof]) {
                        if (elm[dof].type === 'free') elm[dof] = {type: 'free'};
                        if (elm[dof].type === 'const') elm[dof] = {type: 'const'};
                        if (elm[dof].type === 'ref') {
                            // see if elm has drive-only props
                            for (let prop of ['Dt','Dw','Dr','input','bounce','repeat','func','ratio','t0']) {
                                if (elm[dof].hasOwnProperty(prop)) delete elm[dof][prop];
                            };
                            elm[dof].ref = this.model.constraints[0].id;
                        };
                        if (elm[dof].type === 'drive') {
                            // see if elm has ref-only props
                            for (let prop of ['ref','refval']) {
                                if (elm[dof].hasOwnProperty(prop)) delete elm[dof][prop];
                            };
                        };
                    };
                };
            };

            // delete old bodyelements of the ctxm to append updated ones
            while (this.ctxmenubody.hasChildNodes()) {
                this.ctxmenubody.removeChild(this.ctxmenubody.lastChild);
            };

            // template ctxmenu

            //replace header
            this.ctxmenuheader.innerHTML = ctxm.header(elm, type);

            //append new body
            if (type === 'constraint') { // constraints
                this.ctxmenubody.innerHTML += ctxm.sectionTitle('orientation');
                this.ctxmenubody.innerHTML += ctxm.oriType(elm);

                if (!!elm.ori && elm.ori.type === 'drive') {

                    if (!this.tempElm.new.ori.hasOwnProperty('Dt')) // make sure the JSON represantation has the optional properties
                        this.tempElm.new.ori.Dt = 1;
                    this.ctxmenubody.innerHTML += ctxm.Dt(elm, 'ori');

                    if (!this.tempElm.new.ori.hasOwnProperty('Dw'))
                        this.tempElm.new.ori.Dw = 2*pi;
                    this.ctxmenubody.innerHTML += ctxm.Dw(elm, 'ori');
                };

                if (!!elm.ori && elm.ori.type === 'ref') {
                    this.ctxmenubody.innerHTML += ctxm.ref(elm, 'ori', elm.ori.ref);
                };

                this.ctxmenubody.innerHTML += ctxm.sectionTitle('lenght');
                this.ctxmenubody.innerHTML += ctxm.lenType(elm);

                if (!!elm.len && elm.len.type === 'drive') {

                    if (!this.tempElm.new.len.hasOwnProperty('Dt'))
                        this.tempElm.new.len.Dt = 1;
                    this.ctxmenubody.innerHTML += ctxm.Dt(elm, 'len');

                    if (!this.tempElm.new.len.hasOwnProperty('Dr'))
                        this.tempElm.new.len.Dr = 100;
                    this.ctxmenubody.innerHTML += ctxm.Dr(elm, 'len');
                };

                if (!!elm.len && elm.len.type === 'ref') {
                    this.ctxmenubody.innerHTML += ctxm.ref(elm, 'len', elm.len.ref);
                };

                this.ctxmenubody.innerHTML += ctxm.sectionTitle('nodes');
                this.ctxmenubody.innerHTML += ctxm.nodes(elm);
                this.ctxmenubody.innerHTML += ctxm.removeConstraintButton();
            };
            if (type === 'node') { // nodes
                this.ctxmenubody.innerHTML += ctxm.nodeCoordinates(elm);
                this.ctxmenubody.innerHTML += ctxm.nodeBase(elm);
            };
            if (type === 'force') { // forces
                this.ctxmenubody.innerHTML += ctxm.forceValue(elm);
                this.ctxmenubody.innerHTML += ctxm.forceMode(elm);
                this.ctxmenubody.innerHTML += ctxm.forceNode(elm);
            };
            if (type === 'spring') { // springs
                this.ctxmenubody.innerHTML += ctxm.springNodes(elm);
                this.ctxmenubody.innerHTML += ctxm.springLen(elm);
                this.ctxmenubody.innerHTML += ctxm.springK(elm);
            };
        },

        loadFromJSON(files) {
            let file = files[0]
            let fr = new FileReader();
            let model;

            fr.onload = (() => { // async
                return (e) => {
                    model = JSON.parse(e.target.result);
                    this.newModel(model);
                    this.importConfirmed = false; // reset
                }
            })(file);
            fr.readAsText(file);
        },

        saveToJSON() {
            let a = document.createElement('a');
            let file = new Blob([this.model.asJSON()], { type: 'application/json' });
            a.href = URL.createObjectURL(file);
            a.download = (!!this.model.id && this.model.id.length > 0) ? `${this.model.id}.json` : 'linkage.json';
            document.body.appendChild(a); // Firefox needs the element to be added to the DOM for this to work, Chrome & Edge ¯\_(ツ)_/¯
            a.click();
            document.body.removeChild(a);
        },

        newModel(model = {}) {
            if (typeof this.model === 'object' && !this.importConfirmed) {
                if (!confirm('All unsaved changes will be lost! Continue?'))
                    return;
            };

            // delete old range-inputs
            while (actcontainer.hasChildNodes()) {
                actcontainer.removeChild(actcontainer.lastChild);
            };

            delete this.model;  // not necessary but better safe than sorry
            this.model = model;

            this.init();
            this.updateg();
        },

        updateTempElmNew(key, value) { // this seems to be a problem from appevents.js since tempElm is sometimes falsely undefined ...
            this.tempElm.new[key] = value;
        },

        toggleViewfill() { // state of button [fill] in viewModal when setting type 'trace'
            let fill = document.getElementById('view-fill-color');
            let fillBtn = document.getElementById('view-fill-color-btn');

            fill.disabled = !fill.disabled;
            fillBtn.style.backgroundColor = fill.disabled ? 'transparent' : '#e9ecef';

            if (fill.disabled && this.tempElm.new.hasOwnProperty('fill')) {
                delete this.tempElm.new.fill;
            } else if (!fill.disabled && !this.tempElm.new.hasOwnProperty('fill')) {
                this.tempElm.new.fill = '#009900'
            };
        }
    }, mixin.observable,      // for handling (custom) events ..
       mixin.pointerEventHdl, // managing (delegated) pointer events
       mixin.tickTimer,       // synchronize pointer events and rendering
       mixin.zoomPan)
};

let app;

// initialize bootstrap modals
let modelModal = new Modal(document.getElementById('modelModal'), {
    backdrop: 'static',
    keyboard: true // dismiss with ESC key
});

let viewModal = new Modal(document.getElementById('viewModal'), {
    backdrop: 'static'
});

let jsonEditor = CodeMirror.fromTextArea(document.getElementById('modalTextarea'), {
    mode: 'javascript',
    theme: 'lucario',   // dark: dracula, lucario   light: default, mdn-like
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    viewportMargin: Infinity,
    lineWrapping: true
  });

window.onload = () => {
    let c = document.getElementById('canvas'),
        main = document.getElementById('main'); 

    // create App instance
    (app = App.create()).init();
    app.toggleDarkmode(); // switch on, off by default
    // fill graphics queue
    app.updateg();

    // fit canvas
    c.width = main.clientWidth;
    c.height = main.clientHeight - 30;

    // fit inputs
    let rangewidth = (c.width - 350)/2;
    for (const drive in app.model.inputs) {
        document.getElementById(app.model.inputs[drive]).slider.style.width = `${rangewidth}px`;
    };

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
    events.modalShown('modelModal');
    events.modalAccept('modalAccept');
    events.viewModalChange('viewModal');
    events.viewModalClick('viewModal');
    events.viewModalHide('viewModal');

    // make cxtm dragable (decalre private, no need to access later)
    new Draggabilly(document.getElementById('contextMenu'), {
        containment: '.main-container',
        handle: '.card-header'
    });

    // no need to access later, can be static
    new Modal(document.getElementById('aboutModal'), {
        keyboard: true, // dismiss with ESC key
        content: `<div class="modal-header bg-dark text-white">
        <h5 class="modal-title">About <i>mecEdit</i></h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
        </div>
        <div class="modal-body text-center">
        Version ${app.VERSION}<br>
        <a href="https://github.com/jauhl/mecEdit">mecEdit on Github<a/><br><br>
        &#169; 2018 Jan Uhlig
        </div>`
    });

    new Modal(document.getElementById('keysModal'), {
        keyboard: true, // dismiss with ESC key
    });

    // dispatch 'resize' event to fix the initial sizing bug on laptops
    window.dispatchEvent(new Event('resize'));
    // window.resizeBy(0,0);
};