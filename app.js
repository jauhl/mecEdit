/**
 * This is the main file of mecEdit. You can find this apps repository {@link https://github.com/jauhl/mecEdit @GitHub}.
 * @name mecEdit
 * @author Jan Uhlig
 * @copyright Jan Uhlig 2018
 * @license MIT
 * @requires examples.js
 * @requires templates.js
 * @requires appevents.js
 * @requires g2.editor.js
 * @requires mixin.js
 * @requires slider.js
 * @requires mec2.js
 * @requires g2.js
 */

'use strict';

      /**
      * Container for inputs.
      * @const
      * @type {HTMLElement}
      */
const tooltip = document.getElementById('info'),
      /**
      * Container for inputs.
      * @const
      * @type {HTMLElement}
      */
      actcontainer = document.getElementById('actuators-container'),
      /**
      * Container for charts.
      * @const
      * @type {HTMLElement}
      */
     chartcontainer = document.getElementById('sb-canvas-container'),
      /**
      * SVG path container for run button.
      * @const
      * @type {HTMLElement}
      */
      runSymbol = document.getElementById('run-symbol'),
      /**
      * Statusbar container for statusbar.
      * @const
      * @type {HTMLElement}
      */
      statusbar = document.getElementById('statbar'),
      /**
      * Statusbar Statusbar container for dragmode.
      * @const
      * @type {HTMLElement}
      */
      sbMode =  document.getElementById('sbMode'),
      /**
      * Statusbar container for coordinates.
      * @const
      * @type {HTMLElement}
      */
      sbCoords =  document.getElementById('sbCoords'),
      /**
      * Statusbar container for coordinate mode.
      * @const
      * @type {HTMLElement}
      */
      sbCartesian =  document.getElementById('sbCartesian'),
      /**
      * Statusbar container for mouseevent property btn.
      * @const
      * @type {HTMLElement}
      */
      sbBtn =  document.getElementById('sbBtn'),
      /**
      * Statusbar container for mouseevent property dbtn.
      * @const
      * @type {HTMLElement}
      */
      sbDbtn =  document.getElementById('sbDbtn'),
      /**
      * Statusbar container for frames per second.
      * @const
      * @type {HTMLElement}
      */
      sbFPS =  document.getElementById('sbFPS'),
      /**
      * Statusbar container for g2.editor state.
      * @const
      * @type {HTMLElement}
      */
      sbState =  document.getElementById('sbState'),
      /**
      * Statusbar container for g2.editor state `dragging`.
      * @const
      * @type {HTMLElement}
      */
      sbDragging =  document.getElementById('sbDragging'),
      /**
      * Statusbar container for `App.prototype.editing`.
      * @const
      * @type {HTMLElement}
      */
      sbDragmode =  document.getElementById('sbDragmode'),
      /**
      * Statusbar container for `model.dof`.
      * @const
      * @type {HTMLElement}
      */
      sbDOF =  document.getElementById('sbDOF'),
      /**
      * Statusbar container for `App.prototype.gravity`.
      * @const
      * @type {HTMLElement}
      */
      sbGravity =  document.getElementById('sbGravity'),
      /**
      * g2.editor instance.
      * @const
      * @type {object}
      */
      editor = g2.editor(),
      /**
      * Pi.
      * @const
      * @type {number}
      */
      pi = Math.PI,
      /**
      * SVG play symbol.
      * @const
      * @type {string}
      */
      svgplay = 'M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z',
      /**
      * SVG pause symbol.
      * @const
      * @type {string}
      */
      svgpause = 'M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z';

/**
* Returns a origin symbol as a g2-object.
* @method
* @returns {object}
*/
const origin = g2().beg({ lc: 'round', lj: 'round', ls:()=>app.show.darkmode?'silver':'slategray', fs: 'darkgray' })
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
                    .beg({ ls:()=>app.show.darkmode?'silver':'slategray', font: '14px roboto'})
                        .txt({str:'x', x: 38, y: 4})
                        .txt({str:'y', x: 6, y: 30})
                    .end();

// deprecated
// /**
// * Returns a gravity vector as a g2-object.
// * @method
// * @returns {object}
// */
// const gravvec = (cartesian = true) => {
//     const ytxt = cartesian ? -20 : -15;
//     return g2().beg({ w: -pi/2, lw: 2, ls:()=>app.show.darkmode?'silver':'slategray', fs: 'darkgray'})
//                .p()
//                    .m({ x: 0, y: 0 })
//                    .l({ x: 50, y: 0 })
//                .stroke()
//                .p()
//                    .m({ x: 50, y: 0 })
//                    .l({ x: 50 - 17.5, y: -3.5 })
//                    .a({ dw: pi/3, x: 50 - 17.5, y: 3.5 })
//                .z()
//                .drw()
//             .end()
//             .beg({ ls:()=>app.show.darkmode?'silver':'slategray', font: '14px roboto'})
//                 .txt({str:'g', x: -15, y: ytxt})
//             .end();
// };

/**
* Container for `create()` & `prototype()`.
* @typedef {object}
*/
const App = {
    /**
    * Instantiate the app from `App.prototype`.
    * @method
    * @returns {object} - Extended app object with mixins.
    */
    create() {
        const o = Object.create(this.prototype);
        o.constructor.apply(o, arguments);
        return o;
    },

    /**
    * Prototype object to instantiate the app from.
    * @const {object}
    */
    prototype: Object.assign({
        /**
        * Sets properties to parent object. Call with `apply()` and pass the parent.
        * @method
        */
        constructor() {
            /**
            * The model.
            * @const
            * @type {object}
            */
            this.model = {
                "id":"linkage"
            };

            /**
            * mecEdit version.
            * @const
            * @type {string}
            */
            this.VERSION = '0.7.0';

            /**
            * mixin requirement.
            * @const
            * @type {boolean}
            */
            this.evt = { dx: 0, dy: 0, dbtn: 0 };
            this.view = { x: 150, y: 150, scl: 1, cartesian: true };

            this.cnv = document.getElementById('canvas');
            this.ctx = this.cnv.getContext('2d');
            this.instruct = document.getElementById('instructions');
            this.ctxmenu = document.getElementById('contextMenu');
            this.ctxmenuheader = document.getElementById("contextMenuHeader");
            this.ctxmenubody = document.getElementById("contextMenuBody");

            this.mecDefaults = {
                // nodeScaling: false,
                // darkmode: false,
                // nodeLabels: false,
                // constraintLabels: true,
                // loadLabels: true,
                nodes: true,
                constraints: true
            };

            // states
            this.build = false;  // build state
            this.tempElm = false;  // contextmenu/view state

            this.charts = {}; // { canvasid:{ctx:... , g:,,, } , ... }

            this.devmode = false;
            this.importConfirmed = false; // skip confirmdialogue helper
            this.dragMove = true;
            this.alyValues = { // possible values for view-components
                model: {
                    tracePoint: ['cog']
                },
                nodes: {
                    info: ['m','vel','acc','force','velAbs','accAbs','forceAbs','energy'],
                    vector: ['vel','acc','force'],
                    tracePoint: ['pos']
                },
                constraints: {
                    info: ['w','wt','wtt','r','rt','rtt','forceAbs','moment'],
                    vector: [], // ['polAcc','polChgVel'] currently not really working
                    tracePoint: ['pole','velPole','accPole','inflPole']
                }
            };

            // deprecated
            // this.nodeInfoValues = ['m','vel','acc','force','velAbs','accAbs','forceAbs','energy'];
            // this.constraintInfoValues = ['w','wt','wtt','r','rt','rtt','forceAbs','moment'];
            // this.nodeVectorValues = ['acc','vel','force']; // objects only

            this.g = g2();

            this.registerEventsFor(this.ctx.canvas)
                .on(['pointer','buttondown', 'buttonup', 'click'], e => { this.g.exe( editor.on(this.pntToUsr(Object.assign({}, e))) ) })  // ... apply events to g2
                .on(['pointer', 'drag', 'pan', 'fps', 'buttondown', 'buttonup', 'click', 'pointerenter', 'pointerleave'], () => this.showStatus())
                .on('drag', e => {
                    // if (this.editing) { // dragEdit mode // now in in elm.drag()
                    //     editor.curElm.x0 = editor.curElm.x;
                    //     editor.curElm.y0 = editor.curElm.y;
                    // };
                    this.g.exe(editor.on(this.pntToUsr(Object.assign({}, e)))) // ... apply drag event to g2
                        //   .exe(this.ctx); // ... and render
                    this.showTooltip(e);
                })
                .on('pan', e => {
                    this.pan(e);
                    this.g.exe(this.ctx);
                })
                .on('pointer', e => this.showTooltip(e)) // show tooltip view info
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
                .on('render', () => {
                    this.g.exe(this.ctx);
                    if (Object.keys(this.charts).length) { // this.model.state.hasChart also true for charts on main canvas...
                        for (const chart in this.charts) { // this.charts doesn't have iterator
                            this.charts[chart].g.exe(this.charts[chart].ctx);
                        }
                    }
                })
                .on('tick', e => this.tick(e));

            this.state = 'created';
        }, // constructor

        /**
        * Get this.dragMove state.
        * @const
        * @type {boolean}
        */
        get editing() {
            return !this.dragMove;
        },

        /**
        * Set this.dragMove state.
        * @const
        * @type {boolean}
        */
        set editing(q) {
            this.dragMove = !q;
        },

        /**
        * Evaluates used coordinate system.
        * @const
        * @type {boolean}
        */
        get cartesian() { return this.view.cartesian; },

        /**
        * Height of the canvas.
        * @const
        * @type {number}
        */
        get height() { return this.ctx.canvas.height; },

        /**
        * State of g2.editor. `true` if element is being dragged.
        * @const
        * @type {booelan}
        */
        get dragging() { return !!(editor.curState & g2.DRAG) },

        /**
        * Updates the contents of the statusbar.
        * @method
        */
        showStatus() {
            let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
            sbCoords.innerHTML = `x=${x}, y=${y}`;
            sbDragmode.innerHTML = `dragmode=${this.editing?'edit':'move'}`;
            sbDOF.innerHTML = `dof=${this.model.dof}`;
            sbFPS.innerHTML = `fps=${this.fps}`;
            // if (!!this.model.nodes && this.model.nodes.length > 0 ) { // only useful when model has nodes
            //     sbDOF.innerHTML = `dof=${this.model.dof}`;
            //     if (this.devmode)
            //         sbGravity.innerHTML = `gravity=${this.model.hasGravity ? 'on' : 'off'}`;
            // } else {
            //     sbDOF.innerHTML = sbGravity.innerHTML = `dof`;
            // };
            if (this.devmode) {
                sbGravity.innerHTML = `gravity=${this.model.hasGravity ? 'on' : 'off'}`;
                sbMode.innerHTML = `mode=${this.evt.type}`;
                sbCartesian.innerHTML = `cartesian=${this.cartesian}`;
                sbBtn.innerHTML = `btn=${this.evt.btn}`;
                sbDbtn.innerHTML = `dbtn=${this.evt.dbtn}`;
                sbState.innerHTML = `state=${g2.editor.state[editor.curState]}`;
                sbDragging.innerHTML = `dragging=${this.dragging}`;
            };
        },

        /**
        * Shows the tooltip.
        * @method
        */
        showTooltip(e) {
            const info = this.model.info;
            // type of info
            if (editor.dragInfo && this.editing) {
                tooltip.innerHTML = editor.dragInfo;
                tooltip.style.display = 'inline';
            } else if (info && !this.editing) { // don't show info-views when editing
                tooltip.innerHTML = info;
                tooltip.style.display = 'inline';
            }
            else
                this.hideTooltip();

            // update position only when visible
            if (tooltip.style.display === 'inline') {
                tooltip.style.left = ((e.clientX) + 15) + 'px';
                tooltip.style.top = (e.clientY - 50) + 'px';
            }
        },

        /**
        * Hides the tooltip.
        * @method
        */
        hideTooltip() {
            tooltip.style.display = 'none';
        },

        /**
        * Reset the model, drive inputs and the app state.
        * @method
        * @param {object} e - Event or Object containing the timestep.
        * @param {object} e.dt - Timestep.
        */
        tick(e) {
            if (!!this.model) { // check if model is defined first
                if (this.dragging) {
                    this.editing ? this.updDependants(editor.curElm) : this.model.pose(); // null, if updating on dragend via editor
                }
                else if (this.state === 'active') {     // perform time step
                    this.model.tick(1/60);
                    // if (!this.model.valid) this.idle();
                    if (!this.model.isActive)
                        this.stop();        // this causes state intentionally being set to 'idle' for model without gravity even when run was clicked
                }
                else if (this.state === 'input') {     // perform time step, input state is only set from slider.js events!
                    this.model.tick(0);
                }
                // this.g.exe(this.ctx);
                this.notify('render');
            }
        },

        /**
        * Initializes the app.
        * @method
        */
        init() { // evaluate how many drives and add init add controlled properties to model instead of typing them there
            mec.model.extend(this.model,this);
            this.model.init();
            this.model.asmPos();
            this.updateg();

            while (actcontainer.lastChild) {  // empty actcontainer if not empty already
                actcontainer.removeChild(actcontainer.lastChild);
            };

            while (chartcontainer.lastChild) {  // empty chartcontainer if not empty already
                chartcontainer.removeChild(chartcontainer.lastChild);
            };

            this.charts = {};        // (re-)empty chart tracker
            this.model.inputs = [];  // track drives by id and dof for responsive range-input sizing

            this.checkForPreviews(); // check if model has preview-views and set model state accordingly
            this.checkForCharts();   // check if model has chart-views and set model state accordingly


            let drv, prv=false;
            while (drv = this.driveByInput(prv)) {
                let id = drv.constraint.id+'-'+drv.value;
                let max = (drv.value === 'ori') ? Math.round(drv.constraint.ori.Dw*180/pi) : Math.round(drv.constraint.len.Dr); // max value of range input (min always 0)
                actcontainer.appendChild(this.createInputSlider(id, (this.cnv.width - 150)/2, max));

                let elm = document.getElementById(id);
                mecESlider.RegisterElm(elm);
                elm.initEventHandling(this, id, this.model.constraintById(drv.constraint.id)[drv.value].inputCallbk);
                this.model.inputs.push(id);
                prv = drv;
            };

            if (typeof t === 'undefined' || t === null)    // dont start second timer if init() is called again
                this.startTimer();                         // start synchronized ticks

            this.toggleGravity(false, true);

            // this.state = (this.model.inputs.length > 0) ? 'input' : 'initialized';

            // visuals ...
            // set color of sidebar-toggle-button to show if model has charts
            document.querySelector('#sidebar-toggle').style.color = !!this.model.state.hasChart ? '#fff' : '#6c757d';
            // expand or retract sidebar for charts
            document.querySelector('#sb-r').style['padding-left'] = !!this.model.state.hasChart ? '0px' : '270px';
            runSymbol.setAttribute('d',svgplay); // for reinits
            Object.assign(this.show, { ...this.mecDefaults }); // reset to defaults (show nodes etc.)

            this.state = 'initialized';
        },

        /**
        * Sets the model to `active`.
        * @method
        */
        run() {
            this.state = (this.model.inputs.length > 0) ? 'input' : 'active';
            runSymbol.setAttribute('d',svgpause);
        },

        /**
        * Pauses the model and resets the app state.
        * @method
        */
        idle() {
            this.state = 'idle'; // when model has inputs and dof>0 it might still move
            runSymbol.setAttribute('d',svgplay);
        },

        /**
        * Stops the model and resets the app state.
        * @method
        */
        stop() {
            this.model.stop();
            this.idle();
        },

        /**
        * Reset the model, drive inputs and the app state.
        * @method
        */
        reset() {
            this.model.reset();

            // reset drive-inputs
            for (const drive in this.model.inputs) {
                let ident = this.model.inputs[drive].split('-'); // eg.: ident = ['a','len']
                this.model.constraintById(ident[0])[ident[1]].inputCallbk(0); // reset driven constraints
                document.getElementById(ident[0]+'-'+ident[1]).value = 0;
                this.notify(ident[0]+'-'+ident[1],0);
            };

            this.model.asmPos(); // necessary because model.reset() does not respect constraint r0 values
            this.notify('render');
            this.idle();
        },

        /**
        * Reinitializes all dependants of the passed element.
        * @method
        * @param {object} elm - Element whose dependants should be reinitialized.
        */
        // updDependants(elm) {
        //     let dependants = {ori:[],len:[]}; // declaring and filling array would be way more efficient in app scope since dependents don't change during drag
        //     // for (const el of this.model.constraints) {
        //     //     if (el.dependsOn(elm) && (  (el.ori.type === 'const' && el.ori.ref)
        //     //                              ||  el.ori.type === 'drive'
        //     //                              || (el.len.type === 'const' && el.len.ref)
        //     //                              ||  el.len.type === 'drive')) {
        //     //     // if (el.dependsOn(elm) && (el.ori.type === 'drive' || el.len.type === 'drive')) {
        //     //         dependants.push(el);
        //     //     }
        //     // };
        //     for (const el of this.model.constraints) {
        //         if (el.dependsOn(elm)) {
        //             if ( (el.ori.type === 'const' && el.ori.ref) || el.ori.type === 'drive' ) {
        //                 dependants.ori.push(el);
        //             }
        //             if ( (el.len.type === 'const' && el.len.ref) || el.len.type === 'drive' ) {
        //                 dependants.len.push(el);
        //             }
        //         }
        //         // if (el.dependsOn(elm) && (el.ori.type === 'drive' || el.len.type === 'drive')) {
        //     };
        //     console.log(dependants);
        //     // debugger
        //     // dependants.forEach(el => el.init(this.model)); // since only needed for drives, maybe implement user setting to choose between performance & simplicity
        //     // dependants.ori.forEach(el => {
        //     //     if (el.ori.type === 'drive')
        //     //         el.w0 = el.w
        //     //         // el.init_ori_drive(el.ori)
        //     //     if (el.len.type === 'drive')
        //     //         el.init_len_drive(el.len)
        //     //     // el.init(this.model);
        //     // });
        //     dependants.ori.forEach(el => el.w0 = el.w);
        //     dependants.len.forEach(el => el.r0 = el.r);

        //     if (this.model.state.hasChartPreview || this.model.state.hasTracePreview)
        //         this.model.preview();
        // },

        updDependants(elm) {
            let dependants = []; // declaring and filling array would be way more efficient in app scope since dependents don't change during drag
            for (const el of this.model.constraints) {
                // if (el.dependsOn(elm) && (  (el.ori.type === 'const' && el.ori.ref)
                //                          ||  el.ori.type === 'drive'
                //                          || (el.len.type === 'const' && el.len.ref)
                //                          ||  el.len.type === 'drive')) {
                if (el.dependsOn(elm) && (el.ori.type === 'drive' || el.len.type === 'drive')) {
                    dependants.push(el);
                }
            };
            // dependants.forEach(el => el.init(this.model)); // since only needed for drives, maybe implement user setting to choose between performance & simplicity
            dependants.forEach(el => {
                if (el.ori.type === 'drive')
                    el.w0 = el.w
                    // el.init_ori_drive(el.ori)
                if (el.len.type === 'drive')
                    el.r0 = el.r
                    // el.init_len_drive(el.len)
                // el.init(this.model);
            });
            if (this.model.state.hasChartPreview || this.model.state.hasTracePreview) {
                this.model.preview();
            } else { // mere eyecandy...
                this.model.reset();
                this.model.pose();
            };
        },

        /**
        * Toggle developer mode to show additional information in the statusbar.
        * @method
        */
        toggleDevmode() {
            this.devmode = !this.devmode;
            if (!this.devmode)
                sbGravity.innerHTML = sbMode.innerHTML = sbCartesian.innerHTML = sbBtn.innerHTML = sbDbtn.innerHTML = sbState.innerHTML = sbDragging.innerHTML = ``;
            this.showStatus();
        },

        /**
        * Switch between dark- and lightmode.
        * @method
        * @param {boolean} eventTarget - true when invoked by gui event, e.g. 'click'
        */
        toggleDarkmode(eventTarget = false) {
            this.show.darkmode = !this.show.darkmode;
            this.jsonEditor.setOption("theme",`${this.show.darkmode ? 'lucario' : 'mdn-like'}`);
            this.cnv.style.backgroundColor = this.show.darkmode ? '#344c6b' : '#eee7';

            // handle toggle switch in navbar when called programmatically or from element that isn't linked to the checkbox
            if (!eventTarget) {
                const toggle = document.querySelector('#darkmode');
                if (this.show.darkmode && !toggle.checked) {
                    toggle.checked = true;
                } else if (!this.show.darkmode && toggle.checked) {
                    toggle.checked = false;
                }
            }

            this.notify('render');
        },

        /**
        * Switch gravity in model on or off.
        * @method
        * @param {boolean} eventTarget - true when invoked by gui event, i.e. clicking
        * @param {boolean} syncModel - set true to sync toggle state to model state, e.g. at init()
        */
        toggleGravity(eventTarget = false, syncModel = false) {
            if (!syncModel)
                this.model.gravity.active = !this.model.gravity.active;

            // handle toggle switch in navbar when called programmatically or from element that isn't linked to the checkbox
            if (!eventTarget || syncModel) {
                const toggle = document.querySelector('#gravity');
                if (this.model.gravity.active && !toggle.checked) {
                    toggle.checked = true;
                } else if (!this.model.gravity.active && toggle.checked) {
                    toggle.checked = false;
                }
            }

            // app.updateg(); // to be removed
            this.notify('render');
        },

    //     /**
    //     *
    //     * @method
    //     */
    //    toggleHelper(flag = null, toogleId = null, invertFlag = false) {
    //     const flagVal = invertFlag ? !flag : flag;
    //     // handle toggle switch in navbar when called programmatically or from element that isn't linked to the checkbox
    //     if (toogleId) {
    //         const toggle = document.querySelector(`#${toogleId}`);
    //         if (flagVal && !toggle.checked ) {
    //             toggle.checked = true;
    //         } else if (!flagVal && toggle.checked) {
    //             toggle.checked = false;
    //         }
    //     }

    //     this.notify('render');
    //     },
        /**
        * Reset `this.view` to its initial state.
        * @method
        */
        resetView() {
            this.view.x = 150;
            this.view.y = 150;
            this.view.scl = 1;
            this.view.cartesian = true;
            this.notify('render');
        },

        /**
        * Create a new HTML-container for drive inputs.
        * @method
        * @param {string} actuated - Id of the new HTML-container (e.g. `a-ori`).
        * @param {number} width - maximal width of the new HTML-container.
        * @param {number} max - max value of the new HTML-range-input.
        * @returns {HTMLElement} newC - Constraint replacing.
        */
        createInputSlider(actuated, width, max) {
            let template = document.createElement('template');
            template.innerHTML = `<mecedit-slider id="${actuated}" class="mecedit-slider d-inline-flex nowrap ml-2 mr-1 mt-1" width="${width}" min="0" max="${max}" step="1" value="" valstr="${actuated}={value}${actuated.includes('ori')?'°':'u'}"></mecedit-slider>`
            return template.content.firstChild;
        },

        /**
        * Builds and updates the g2-command-queue according to the model.
        * @method
        */
        updateg() {
            let apphasmodel = !!(typeof this.model === 'object' && Object.keys(this.model).length);

            this.g = g2().clr()
                .view(this.view)
                .grid({ color: ()=>this.show.darkmode?'rgba(255, 255, 255, 0.1)':'rgba(0, 0, 0, 0.1)', size: 100 })
                .grid({ color: ()=>this.show.darkmode?'rgba(255, 255, 255, 0.1)':'rgba(0, 0, 0, 0.1)', size: 20 })
                .p() // mark origin
                    .m({ x: () => -this.view.x / this.view.scl, y: 0 })
                    .l({ x: () => (this.cnv.width - this.view.x) / this.view.scl, y: 0 })
                    .m({ x: 0, y: () => -this.view.y / this.view.scl })
                    .l({ x: 0, y: () => (this.cnv.height - this.view.y) / this.view.scl })
                .z()
                .stroke({ ls: ()=>this.show.darkmode?'rgba(255, 255, 255, 0.3)':'rgba(0, 0, 0, 0.2)', lw: 2 })
                .use({grp:origin,x: () => (10 - this.view.x)/this.view.scl, y: () => (10 - this.view.y)/this.view.scl, scl: () => this.view.scl});
                // if(apphasmodel && this.model.hasGravity) {
                //     if(this.cartesian) {
                //         this.g.use({grp:gravvec(true),x: () => (this.cnv.width - 30 - this.view.x)/this.view.scl, y: () => (this.cnv.height - 15 - this.view.y)/this.view.scl, scl: () => this.view.scl});
                //     } else {
                //         this.g.use({grp:gravvec(false),x: () => (this.cnv.width - 30 - this.view.x)/this.view.scl, y: () => (- this.view.y + 69 )/this.view.scl, scl: () => this.view.scl});
                //     };
                // };

            if (apphasmodel)
                this.model.draw(this.g);
            this.notify('render')
        },

        // /**
        // * Create a canvas for a chart, set options & append to container.
        // * @method
        // * @param {object} chart - chart-view for canvas.
        // */
        // createCanvas(chart) {
        //     let canvas = document.createElement('canvas');
        //     canvas.id = chart.canvas;
        //     canvas.width = 350;
        //     canvas.height = 200;
        //     chartcontainer.appendChild(canvas);
        // },

        /**
        * Builds a g2-command-queue for charts in secondary canvas-elements.
        * @method
        * @param {object} chart - chart-view for canvas.
        */
        createChart(chart) {
            // create canvas & set options
            let canvas = document.createElement('canvas');
            canvas.id = chart.canvas;
            canvas.width = 350;
            canvas.height = 200;
            chartcontainer.appendChild(canvas);

            // declare context as property
            this.charts[chart.canvas] = {
                ctx: document.querySelector(`#${chart.canvas}`).getContext('2d'),
                g: g2().clr().view({cartesian: true})
            };

            // overwrite positioning
            chart.x = chart.graph.x = chart.y = chart.graph.y = 40;

            // declare g2-object and append chart-graphics
            chart.draw(this.charts[chart.canvas].g);

            // render
            this.notify('render');
        },

        /**
        * Resets the app and its stateful variables.
        * @method
        */
        resetApp() {
            this.build = false; // reset build state
            this.tempElm = false; // reset build state
            this.instruct.innerHTML = ''; // reset instructions
            this.notify('render');
        },

        // replaceNode(oldN, newN) { // deprecated
        //     if (!(oldN.x === newN.x)) this.model.nodeById(oldN.id).x = newN.x;
        //     if (!(oldN.y === newN.y)) this.model.nodeById(oldN.id).y = newN.y;
        //     if (!(oldN.m === newN.m)) this.model.nodeById(oldN.id).m = newN.m;
        // },

        /**
        * Adds a new node to the model.
        * @method
        */
        addNode() {
            if (editor.curElm === undefined || !editor.curElm.hasOwnProperty('m')) { // no node at coords; objects with a mass are considered nodes
                let { x, y } = this.pntToUsr({ x: this.evt.x, y: this.evt.y });
                let node = {
                    id: this.getNewChar(),
                    x: x,
                    y: y
                };
                if (this.build.mode === 'addbasenode')
                    node.base = true;
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

        /**
        * Removes all inputs of a constraint.
        * @method
        * @param {string} id - Id of the constraint the input belongs to.
        */
        removeInput(id) {
            for (let dof of ['-len','-ori']) {
                if (this.model.inputs.includes(id+dof)) { // remove redundant ori inputs
                    actcontainer.removeChild(document.getElementById(id+dof));
                    this.model.inputs.splice(this.model.inputs.findIndex((el)=>el.id === id),1);
                };
            };
        },

        /**
        * Removes the passed component and all its dependants.
        * @method
        * @param {object} elem - Element to be purged from the model.
        */
        purgeElement(elem) {  // identify and remove passed element and all its dependants
            if (!!elem) { // check if an actual element was passed and not 'undefined'
                if(['node','ctrl'].includes(elem.type)) {
                    let dependants = this.model.dependentsOf(elem).constraints;
                    if (dependants.length > 0) { // maybe dependants with inputs
                        for (let dep of dependants) {
                            if (this.model.inputs.includes(dep.id+'-ori') || this.model.inputs.includes(dep.id+'-len'))
                                this.removeInput(dep.id);
                        };
                    };
                };

                if (elem.type === 'node') {
                    this.model.purgeNode(elem);
                } else if (['free','tran','rot','ctrl'].includes(elem.type)) {
                    if (this.model.inputs.includes(elem.id+'-ori') || this.model.inputs.includes(elem.id+'-len'))
                        this.removeInput(elem.id);
                    this.model.purgeConstraint(elem);
                } else if (['force','spring'].includes(elem.type)) {
                    this.model.purgeLoad(elem);
                // } else if (['vector','trace','info'].includes(elem.type)) { // views not detectable yet
                //     this.model.purgeView(elem);
                } else { // propably misclicked
                    return;
                };

                this.updateg(); // update graphics

                document.body.style.cursor = 'default';
                this.resetApp();
            };
        },

        /**
        * Replaces an old Constraint with a new one.
        * @method
        * @param {object} oldC - Constraint to be replaced.
        * @param {object} newC - Constraint replacing.
        */
        replaceConstraint(oldC, newC) {
            this.reset();

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

            if ( (lendrv && !this.model.inputs.includes(newC.id+'-len')) || (oridrv && !this.model.inputs.includes(newC.id+'-ori')) ) { // drive has no input yet
                let drv, prv=false;
                while (drv = this.driveByInput(prv)) {
                    let id = drv.constraint.id+'-'+drv.value;
                    let max = (drv.value === 'ori') ? Math.round(drv.constraint.ori.Dw*180/pi) : Math.round(drv.constraint.len.Dr); // max value of range input (min always 0)
                    actcontainer.appendChild(this.createInputSlider(id, (this.cnv.width - 150)/2, max));

                    let elm = document.getElementById(id);
                    mecESlider.RegisterElm(elm);
                    elm.initEventHandling(this, id, this.model.constraintById(drv.constraint.id)[drv.value].inputCallbk);
                    this.model.inputs.push(id);
                    prv = drv;
                };
                window.dispatchEvent(new Event('resize')); // lazy range-width fitting ...
            } else {
                if (!newC.ori.input && this.model.inputs.includes(newC.id+'-ori')) { // remove redundant ori inputs
                    actcontainer.removeChild(document.getElementById(newC.id+'-ori'));
                    this.model.inputs = this.model.inputs.filter( el => el !== newC.id+'-ori' );
                };
                if (!newC.len.input && this.model.inputs.includes(newC.id+'-len')) { // remove redundant len inputs
                    actcontainer.removeChild(document.getElementById(newC.id+'-len'));
                    this.model.inputs = this.model.inputs.filter( el => el !== newC.id+'-len' );
                };
            };

            // update range internals
            if (!!oldC.ori && !!oldC.ori.input && !!oldC.ori.Dw && !!newC.ori && !!newC.ori.input && !!newC.ori.Dw && !(oldC.ori.Dw === newC.ori.Dw)) {
                let mecslider = document.getElementById(newC.id+'-ori');
                mecslider.max = mecslider.children[1].max = `${Math.round(newC.ori.Dw*180/Math.PI)}`;
            };
            if (!!oldC.len && !!oldC.len.input && !!oldC.len.Dr && !!newC.len && !!newC.len.input && !!newC.len.Dr && !(oldC.len.Dr === newC.len.Dr)) {
                let mecslider = document.getElementById(newC.id+'-len');
                mecslider.max = mecslider.children[1].max = `${Math.round(newC.len.Dr)}`;
            };

            if (rebindorilistener)
                document.getElementById(oridrv.newC.id+'-ori').initEventHandling(this, oridrv.newC.id, this.model.constraintById(oridrv.newC.id)[oridrv.value].inputCallbk );
            if (rebindlenlistener)
                document.getElementById(lendrv.newC.id+'-len').initEventHandling(this, lendrv.newC.id, this.model.constraintById(lendrv.newC.id)[lendrv.value].inputCallbk );

            this.state = 'initialized';
        },

        /**
        * Searches for drives with inputs.
        * @method
        * @param {(object | boolean)} [prev = false] - Drive to start search from.
        * @returns {(object | boolean)} Drive that was found or false if none was found.
        */
        driveByInput(prev = false) {  // from microapp.js
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

        /**
        * Adds a new Constraint to `this.model`.
        * @method
        */
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
                        default: console.error('something went wrong while adding constraint...'); break;
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

        /**
        * Generates a unique id for nodes or constraints.
        * @method
        * @param {string} [x = node] - Type of component to generate id for `['node','constraint']`.
        * @returns {string} Generated id.
        */
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
                let potChar = charArr[charArr.length - 1] + 1;
                char = (potChar <= maxChar) ? String.fromCharCode(potChar) : `${name}${obj.length + 1}`;   // choose one higher than highest charCode or assign numbers when running out of characters
            } else {
                char = x === 'node' ? 'A' : 'a'; // 65 = A, 97 = a,
            };

            return char;
        },

        /**
        * Adds changes dofs of the passed constraint from type `free` to `drive`.
        * @method
        * @param {object} - Constraint to add drive to.
        */
        addDrive(elm) {
            if (!!elm && ['free', 'tran', 'rot'].includes(elm.type)) {
                if(elm.ori.type === 'free')
                    elm.ori.type = 'drive';
                if(elm.len.type === 'free')
                    elm.len.type = 'drive';

                elm.init(this.model);

                this.updateg(); // update graphics

                if (this.model.state.hasChartPreview || this.model.state.hasTracePreview) // preview stuff
                    this.model.preview();

                this.resetApp(); // reset state and instructions
            } else if (elm === undefined) {
                return;
            } else {
                this.instruct.innerHTML = "Can't add a drive to this element. Select a different one or press [ESC] to cancel.";
                setTimeout ( () => {this.instruct.innerHTML = 'Select a constraint to add a drive to; [ESC] to cancel'}, 2400 );
            }
        },

        /**
        * Adds a new shape of type `['fix'|'flt']`.
        * @method
        */
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

        /**
        * Adds a new load component of type `force`.
        * @method
        */
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

        /**
        * Adds a new load component of type `spring`.
        * @method
        */
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

        /**
        * Initializes and shows a modal to add view components.
        * @method
        */
       initViewModal() {
            if (this.model.nodes.length) { // model has components to add views to
                if (!this.tempElm)
                    this.tempElm = {new:{id:'',show:'pos'}}; // default
                this.viewModal.setContent(tmpl.viewModal());
                document.getElementById('view-fill-color-btn').style.backgroundColor = 'transparent';
                this.viewModal.show();
            } else {
                this.instruct.innerHTML = `<span class="blink" style="color:orange;">Model is empty.</span>`;
                setTimeout ( ()=>{this.instruct.innerHTML = ''}, 2400 );
            }
        },

        // closeViewModal() { // deprecated
        //     this.tempElm = false;
        // },

        /**
        * Adds a view component from the template this.tempElm.new and hides the view modal.
        * @method
        */
        addViewFromModal() {
            if (this.tempElm.new.id.length === 0) // no id defined, generate and set one...
                this.tempElm.new.id = `view${this.model.views.length + 1}`;

            this.model.addView(mec.view.extend(this.tempElm.new));
            this.tempElm.new.init(this.model);

            this.checkForPreviews(); // check if model has preview-views and set model state accordingly
            // show preview of trace when defined
            if (this.tempElm.new.as === 'trace' && this.tempElm.new.mode === 'preview')
                this.model.preview();
            // if view has graphics add them to g2-queue
            if (['trace','vector','point'].includes(this.tempElm.new.as))
                this.updateg();

            this.resetApp();
            this.viewModal.hide()
        },

        /**
        * Handles opening of contextmenu.
        * @param {object} elm - Element to show the contextmenu for.
        * @method
        */
        initCtxm(elm) {
            this.tempElm = {};  // save elm for eventlistener & state-check
            this.tempElm.replace = false; // nothing has changed yet, so no need for replacing
            this.tempElm.type = ['free', 'rot', 'tran', 'ctrl'].includes(elm.type) ? 'constraint' : elm.type; // check elm type
            this.tempElm.old = JSON.parse(elm.asJSON());
            this.tempElm.new = JSON.parse(elm.asJSON());
            if (!this.tempElm.new.ori)  // needs to exist because of minimal form of asJSON()
                this.tempElm.new.ori = {type:'free'};
            if (!this.tempElm.new.len)
                this.tempElm.new.len = {type:'free'};

            // save label-state for resetting to it when closing contextmenu
            this.tempElm.labelState = {nodes: this.show.nodeLabels, constraints: this.show.constraintLabels, loads: this.show.loadLabels};
            // show labels that are hidden
            if (!this.show.nodeLabels) this.show.nodeLabels = true;
            if (!this.show.constraintLabels) this.show.constraintLabels = true;
            if (!this.show.loadLabels) this.show.loadLabels = true;
            // render labels
            this.notify('render');

            this.updateCtxm(this.tempElm.old, this.tempElm.type);
            this.showCtxm();
        },

        /**
        * Shows the contextmenu at mouseposition.
        * @method
        */
        showCtxm() {
            this.ctxmenu.style.display = 'block'
            this.ctxmenu.style.left = `${this.evt.clientX}px`;
            this.ctxmenu.style.top = `${this.evt.clientY}px`;
        },

        /**
        * Handles closing of contextmenu.
        * @method
        */
        hideCtxm() {
            this.ctxmenu.style.display = 'none';

            if (!!this.tempElm.new && this.tempElm.replace && this.tempElm.type === 'constraint')// && this.tempElm.replace)
                this.replaceConstraint(this.tempElm.old, this.tempElm.new);

            // reset labels to saved user state
            if (this.tempElm.labelState.nodes !== this.show.nodeLabels) this.show.nodeLabels = this.tempElm.labelState.nodes;
            if (this.tempElm.labelState.constraints !== this.show.constraintLabels) this.show.constraintLabels = this.tempElm.labelState.constraints;
            if (this.tempElm.labelState.loads !== this.show.loadLabels) this.show.loadLabels = this.tempElm.labelState.loads;

            // empty body
            while (this.ctxmenubody.lastChild) {
                this.ctxmenubody.removeChild(this.ctxmenubody.lastChild);
            };

            // reset app edit-state
            this.tempElm = false;
        },

        /**
        * Handles opening of contextmenu.
        * @param {object} elm - Element to show the contextmenu for.
        * @param {string} type - Type of the element.
        * @param {boolean} [doftypechanged = false] - Flag in case the type of a dof changed from the last invocation.
        * @method
        */
        updateCtxm(elm, type, doftypechanged = false) {
            // clean elm up from unnessesary properties / rudiments if type of len/ori has changed
            if (doftypechanged) {
                for (let dof of doftypechanged) {
                    if (!!elm[dof]) {
                        if (elm[dof].hasOwnProperty('ref')) {
                            // see if elm has drive-only props
                            for (let prop of ['Dt','Dw','Dr','input','bounce','repeat','func','ratio','t0']) {
                                if (elm[dof].hasOwnProperty(prop)) delete elm[dof][prop];
                            };
                            elm[dof].ref = this.model.constraints[0].id;
                        };
                        if (elm[dof].type === 'free') elm[dof] = {type: 'free'};
                        if (elm[dof].type === 'const') elm[dof] = {type: 'const'};
                        if (elm[dof].type === 'drive') {
                            // see if elm has ref-only props
                            for (let prop of ['ref','reftype']) {
                                if (elm[dof].hasOwnProperty(prop)) delete elm[dof][prop];
                            };
                        };
                    };
                };
            };

            // delete old bodyelements of the contextmenu to append updated ones
            while (this.ctxmenubody.lastChild) {
                this.ctxmenubody.removeChild(this.ctxmenubody.lastChild);
            };

            // template ctxmenu

            //replace header
            this.ctxmenuheader.innerHTML = tmpl.header(elm, type);

            //append new body
            if (type === 'constraint') { // constraints
                this.ctxmenubody.innerHTML += tmpl.sectionTitle('ori',elm);
                this.ctxmenubody.innerHTML += tmpl.oriType(elm);

                if (!!elm.ori && elm.ori.type === 'const') {
                    this.ctxmenubody.innerHTML += tmpl.ref(elm, 'ori', elm.ori.ref);
                };

                if (!!elm.ori && elm.ori.type === 'drive') {
                    if (!elm.ori.hasOwnProperty('Dt')) // make sure the JSON represantation has the optional properties
                        this.tempElm.new.ori.Dt = 1;
                    this.ctxmenubody.innerHTML += tmpl.Dt(this.tempElm.new, 'ori');

                    if (!elm.ori.hasOwnProperty('Dw'))
                        this.tempElm.new.ori.Dw = 2*pi;
                    this.ctxmenubody.innerHTML += tmpl.Dw(this.tempElm.new, 'ori');
                };

                this.ctxmenubody.innerHTML += tmpl.sectionTitle('len',elm);
                this.ctxmenubody.innerHTML += tmpl.lenType(elm);

                if (!!elm.len && elm.len.type === 'const') {
                    this.ctxmenubody.innerHTML += tmpl.ref(elm, 'len', elm.len.ref);
                };

                if (!!elm.len && elm.len.type === 'drive') {

                    if (!this.tempElm.new.len.hasOwnProperty('Dt'))
                        this.tempElm.new.len.Dt = 1;
                    this.ctxmenubody.innerHTML += tmpl.Dt(this.tempElm.new, 'len');

                    if (!this.tempElm.new.len.hasOwnProperty('Dr'))
                        this.tempElm.new.len.Dr = 100;
                    this.ctxmenubody.innerHTML += tmpl.Dr(this.tempElm.new, 'len');
                };

                this.ctxmenubody.innerHTML += tmpl.sectionTitle('nodes');
                this.ctxmenubody.innerHTML += tmpl.nodes(elm);
                this.ctxmenubody.innerHTML += tmpl.removeConstraintButton();
            };
            if (type === 'node') { // nodes
                this.ctxmenubody.innerHTML += tmpl.nodeCoordinates(elm);
                this.ctxmenubody.innerHTML += tmpl.nodeBase(elm);
            };
            if (type === 'force') { // forces
                this.ctxmenubody.innerHTML += tmpl.forceValue(elm);
                this.ctxmenubody.innerHTML += tmpl.forceMode(elm);
                this.ctxmenubody.innerHTML += tmpl.forceNode(elm);
            };
            if (type === 'spring') { // springs
                this.ctxmenubody.innerHTML += tmpl.springNodes(elm);
                this.ctxmenubody.innerHTML += tmpl.springLen(elm);
                this.ctxmenubody.innerHTML += tmpl.springK(elm);
            };
        },

        /**
        * Imports a model from a `FileList`.
        * @param {FileList} files - `FileList` with the model as the first element.
        * @method
        */
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
            fr.readAsText(file); // fires load event
        },

        // /**
        // * Opens a dialogue to download thr current model as a JSON file.
        // * @method
        // */
        // saveToJSON() {
        //     let a = document.createElement('a'),
        //         file = new Blob([this.model.asJSON()], { type: 'application/json' });
        //     a.href = URL.createObjectURL(file);
        //     a.download = (!!this.model.id && this.model.id.length > 0) ? `${this.model.id}.json` : 'linkage.json';
        //     document.body.appendChild(a); // Firefox needs the element to be added to the DOM for this to work, Chrome & Edge ¯\_(ツ)_/¯
        //     a.click();
        //     document.body.removeChild(a);
        // },

        // /**
        // * Opens a dialogue to download the current model as a JSON file.
        // * @method
        // */
        // saveToHTML() {
        //     let modelHasId = (!!this.model.id && this.model.id.length) ? true : false;
        //     let a = document.createElement('a');
        //     let file = new Blob([tmpl.mec2Element(modelHasId)], { type: 'application/html' });
        //     a.href = URL.createObjectURL(file);
        //     a.download = modelHasId ? `${this.model.id}.html` : 'linkage.html';
        //     document.body.appendChild(a);
        //     a.click();
        //     document.body.removeChild(a);
        // },

        /**
        * Opens a dialogue to download the current model as a specified file (json or html).
        * @method
        */
        saveToFile(filetype = 'json') {
            let modelHasId = (!!this.model.id && this.model.id.length) ? true : false,
                a = document.createElement('a'),
                file = false;

            if (filetype === 'json') {
                file = new Blob([this.model.asJSON()], { type: 'application/json' });
            } else if (filetype === 'html') {
                file = new Blob([tmpl.mec2Element(modelHasId)], { type: 'application/html' });
            } else {
                console.log('File creation aborted.');
                return false;
            }

            a.href = URL.createObjectURL(file);
            a.download = modelHasId ? `${this.model.id}.${filetype}` : `linkage.${filetype}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    },

        /**
        * Defines a new model.
        * @param {object} [model = {}] - Passed model or empty model.
        * @method
        */
        newModel(model = {"id":"linkage"}) {
            if (typeof this.model === 'object' && !this.importConfirmed) {
                if (!confirm('All unsaved changes will be lost! Continue?'))
                    return;
            };

            // delete old range-inputs -> done in init()
            // while (actcontainer.lastChild) {
            //     actcontainer.removeChild(actcontainer.lastChild);
            // };

            delete this.model;  // not necessary but better safe than sorry
            this.model = model;
            this.init();
        },

        /**
        * Helper method to change properties in `tempELm`.
        * @param {string} key - Key of value to be changed.
        * @param {string} value - Value to be changed.
        * @method
        */
        updateTempElmNew(key, value) { // this seems to be a problem from appevents.js since tempElm is sometimes falsely undefined ...
            this.tempElm.new[key] = value;
        },

        /**
        * Removes properties from 'tempELm' when view-type 'as' changes.
        * @param {string} as - new 'as' value of view component.
        * @method
        */
        tidyTempElmNew(as) {
            let optional = {
                      point: ['by'],
                      vector: ['at'],
                      trace: ['t0','Dt','mode','ref','stroke','fill'],

                  };
            optional.info = [... new Set([
                ... optional.point,
                ... optional.vector,
                ... optional.trace
            ])];

            let temp = JSON.parse(JSON.stringify(this.tempElm.new)); // copy for immutability

            // build array of NOT selected types
            let toRemove = [];
            ['point','vector','trace','info'].forEach( (key) => {
                if (key !== as)
                    toRemove.push(key);
            });

            // clean up copy
            for (let element of toRemove) { // element is 'optional' key
                optional[element].forEach( (prop) => { // prop is string (array entry)
                    if ( temp.hasOwnProperty(prop) )
                        delete temp[prop];
                })

                // if ( temp.hasOwnProperty(element) )
                //     delete temp.element;
            };

            // assign copy
            app.tempElm.new = temp;
        },

        /**
        * Removes properties harsh from 'tempELm' when view changes.
        * @param {string} prop - new prop of view component.
        * @method
        */
        cleanTempElmNew(prop) {
            let temp = JSON.parse(JSON.stringify(this.tempElm.new)); // copy for immutability

            const order = ['id','show','of','as'];

            const endIndex = order.indexOf(prop) + 1; // first elm to be not kept
            const keep = [...order.slice(0,endIndex), 'as'];     // Array of keys to keep
            const tempKeys = Object.keys(temp);       // Array of keys in temp

            for (const key of tempKeys) {
                if (!keep.includes(key))
                    delete temp[key]
            }

            // assign copy
            app.tempElm.new = temp;
        },

        /**
        * Toggles the background of the fill label in the
        * view-modal and de-/activates to input.
        * @method
        */
        toggleViewFill() { // state of button [fill] in viewModal when setting type 'trace'
            let fill = document.getElementById('view-fill-color');
            let fillBtn = document.getElementById('view-fill-color-btn');

            fill.disabled = !fill.disabled;
            fillBtn.style.backgroundColor = fill.disabled ? 'transparent' : '#e9ecef';

            if (fill.disabled && this.tempElm.new.hasOwnProperty('fill')) {
                delete this.tempElm.new.fill;
            } else if (!fill.disabled && !this.tempElm.new.hasOwnProperty('fill')) {
                this.tempElm.new.fill = '#009900'
            };
        },

        /**
        * Checks if one or more previews (not in charts!) are in the model and sets model.state accordingly.
        * @method
        */
        checkForPreviews() {
            if (this.model.state.hasOwnProperty('hasChartPreview'))
                this.model.state.hasChartPreview = false;    // mecEdit only state, assume no preview
                if (this.model.state.hasOwnProperty('hasTracePreview'))
                this.model.state.hasTracePreview = false;    // mecEdit only state, assume no preview
            for (const view of this.model.views) {
                if (view.mode === 'preview' && view.as == 'chart') {
                    this.model.state.hasChartPreview = true;
                } else if (view.mode === 'preview' && view.as == 'trace') {
                    this.model.state.hasTracePreview = true;
                }
            }
        },

        /**
        * Checks if one or more charts are in the model and sets model.state accordingly.
        * Charts marked for a secondary canvas-elements are also handled.
        * @method
        */
        checkForCharts() {
            if (this.model.state.hasOwnProperty('hasChart'))
                this.model.state.hasChart = false;    // mecEdit only state, assume no preview
            for (const view of this.model.views) {
                if (view.as === 'chart') {
                    this.model.state.hasChart = true;
                    if (view.canvas) { // chart needs to be rendered to secondary-canvas
                        this.createChart(view);
                    }
                }
            }
        }
    }, mixin.observable,      // for handling (custom) events ..
       mixin.pointerEventHdl, // managing (delegated) pointer events
       mixin.tickTimer,       // synchronize pointer events and rendering
       mixin.zoomPan)
};

// scope for App instance
let app;

// const sleep = (ms) => (new Promise(resolve => setTimeout(resolve, ms)));  // e.g. await sleep(2000);

// promise/async might resolve laptop/pwa sizing bug
function load() {
    return new Promise(function(resolve) {
        window.onload = resolve; // promise resolves on load event
    });
};

// Initialize App
load()
.then(() => {
// window.onload = () => {
    // create App instance
    (app = App.create()).init();

    // arrays for view-modal, do this whenever...
    (async () => {
        //  Slower version of new Set method
        // copy-merge alyValue arrays for faster checking in view-modal (keep in mind that some (eg. acc, vel, forceAbs) are in multiple!)
        // app.alyValues.forNodes = await app.alyValues.nodes.info.concat(app.alyValues.nodes.vector, app.alyValues.nodes.tracePoint);
        // app.alyValues.forConstraints = await app.alyValues.constraints.info.concat(app.alyValues.constraints.vector, app.alyValues.constraints.tracePoint);

        //build filtered array (no duplicates) with all possible aly values for all components
        // copy node values to new array
        // app.alyValues.all = await app.alyValues.forNodes.concat();
        // app.alyValues.all = [];

        // await app.alyValues.forNodes.forEach(element => {
        //     if ( !app.alyValues.all.includes(element) )
        //         app.alyValues.all.push(element);
        // });
        // // add constraint values
        // await app.alyValues.forConstraints.forEach(element => {
        //     if ( !app.alyValues.all.includes(element) )
        //         app.alyValues.all.push(element);
        // });
        // // add model value(s) (currently a single element...)
        // await app.alyValues.model.tracePoint.forEach(element => {
        //     if ( !app.alyValues.all.includes(element) )
        //         app.alyValues.all.push(element);
        // });


        // copy-merge alyValue arrays for faster checking in view-modal (keep in mind that some (eg. acc, vel, forceAbs) are in multiple!)
        app.alyValues.forNodes = await [... new Set([
            ... app.alyValues.nodes.info,
            ... app.alyValues.nodes.vector,
            ... app.alyValues.nodes.tracePoint
        ])];

        app.alyValues.forConstraints = await [... new Set([
            ... app.alyValues.constraints.info,
            ... app.alyValues.constraints.vector,
            ... app.alyValues.constraints.tracePoint
        ])];

        // Sets contain only unique values, so duplicates are filtered out. Order is preserved. Also faster that concat & filtering with foreach..., Spread back to array when done.
        app.alyValues.all = await [... new Set([
            // ... app.alyValues.nodes.info,
            // ... app.alyValues.nodes.vector,
            // ... app.alyValues.nodes.tracePoint,
            ... app.alyValues.forNodes,
            // ... app.alyValues.constraints.info,
            // ... app.alyValues.constraints.vector,
            // ... app.alyValues.constraints.tracePoint,
            ... app.alyValues.forConstraints,
            ... app.alyValues.model.tracePoint
        ])];

    })();

    // initialize bootstrap modals
    app.modelModal = new Modal(document.getElementById('modelModal'), {
        backdrop: 'static',
        keyboard: true // dismiss with ESC key
    });

    app.viewModal = new Modal(document.getElementById('viewModal'), {
        backdrop: 'static'
    });

    // initialize CodeMirror editor
    app.jsonEditor = CodeMirror.fromTextArea(document.getElementById('modalTextarea'), {
        mode: 'javascript',
        theme: 'mdn-like',   // dark: dracula, lucario   light: default, mdn-like
        lineNumbers: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        lineWrapping: false
    });

    // make sure dropping editor is empty before drag-dropping files
    app.jsonEditor.on('drop', (e)=>{
        e.setValue('');
    });

    // make cxtm dragable (declare private, no need to access later)
    new Draggabilly(document.getElementById('contextMenu'), {
        containment: '.main-container',
        handle: '.card-header'
    });

    // no need to access later, can be private
    new Modal(document.getElementById('aboutModal'), {
        keyboard: true, // dismiss with ESC key
        content: `<div class="modal-header bg-dark text-white">
        <h5 class="modal-title">About <i>mecEdit</i></h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
        </div>
        <div class="modal-body text-center">
        <img src="./img/android/android-launchericon-96-96.png" class="mx-auto d-block" style="border-radius:.5rem!important;"></img>
        Version ${app.VERSION}<br>
        <a href="https://github.com/jauhl/mecEdit">mecEdit on Github<a/><br><br>
        &#169; 2018 Jan Uhlig
        </div>`
    });

    // keyboard shortcuts documentation, also private
    new Modal(document.getElementById('keysModal'), {
        keyboard: true, // dismiss with ESC key
    });

    // define non-editor events
    events.navbarClick('navbar');
    events.navbarChange('import');
    events.sidebarClick('sb-l');
    events.keyboardDown(); // binds to document
    events.ctxmClick('contextMenu');
    events.ctxmInput('contextMenu');
    events.ctxmChange('contextMenu');
    events.resize(); // binds to window
    events.modalShown('modelModal');
    events.modalAccept('modalAccept');
    events.copyModel('copyModel');
    events.copyChart('copyChart');
    events.viewModalChange('viewModal');
    events.viewModalClick('viewModal');
    events.viewModalHide('viewModal');
    events.canvasDragDrop('canvas');

    // set some visuals
    app.toggleDarkmode();
    app.show.nodeLabels = false;

})
.then(() => {
    // dispatch 'resize' event to fit app to viewport
    window.dispatchEvent(new Event('resize'));

})
.catch((error) => {
    console.error('Initialisation failed, error:', error);
});