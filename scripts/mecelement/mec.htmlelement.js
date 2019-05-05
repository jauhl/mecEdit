class Mec2Element extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height','cartesian','grid', 'x0', 'y0', 
                'darkmode', 'shownodelabels', 'showconstraintlabels'];
    }

    constructor() {
        super();
        this._root = this.attachShadow({ mode:'open' });
        this._state = { edit:false, pause:true };
        this._inputs = [];
    }

    get width() { return +this.getAttribute('width') || 301; }
    set width(q) { if (q) this.setAttribute('width',q); }
    get height() { return +this.getAttribute('height') || 201; }
    set height(q) { if (q) this.setAttribute('height',q); }
    get x0() { return (+this.getAttribute('x0')) || 0; }
    set x0(q) { if (q) this.setAttribute('x0',q); }
    get y0() { return (+this.getAttribute('y0')) || 0; }
    set y0(q) { if (q) this.setAttribute('y0',q); }
    get cartesian() { return this.hasAttribute('cartesian'); }
    set cartesian(q) { q ? this.setAttribute('cartesian','') : this.removeAttribute('cartesian'); }
    get grid() { return this.hasAttribute('grid') || false; }
    set grid(q) { q ? this.setAttribute('grid','') : this.removeAttribute('grid'); }

    get show() { return this._show; }

    get hasInputs() { return !!this._inputs.length; }
    get inputDriveCount() { return this._inputs.length; }

    get gravity() { return this._model.gravity.active; }
    set gravity(q) {
        this._gravbtn.innerHTML = q ? 'no g' : 'g';
        this._model.gravity.active = q;
    }

    get pausing() { return this._state.pause; }
    set pausing(q) { 
        if (this._state.pause && !q) {  // start / continue running
            if (!this._model.isActive)
                this._model.reset();
            this._state.pause = false;
            this._model.sleepMinDelta = 1;
            if (this.editing)  // do not run in edit mode ... so toggle !
                this.editing = false;
            this._runbtn.innerHTML = '&#10074;&#10074;';
        }
        else if (!this._state.pause && q) {
            this._state.pause = true;
            this._runbtn.innerHTML = '&#9654;';
        }
    //  else  ... nothing to do
    }

    get editing() { return this._state.edit; }
    set editing(q) { 
        if (!this._state.edit && q) {  // edit in initial pose only
            if (this.hasInputs)
                for (const input of this._inputs) {
                    const val0 = input.sub === 'ori' ? input.w0 : input.r0;
                    this._root.getElementById(input.id).value = val0;
//                    input.constraint[input.sub].inputCallbk(val0);  // necessary ?
                }
            this._model.reset();
            this._editbtn.innerHTML = 'drag';
            this._state.edit = true;
        }
        else if (this._state.edit && !q) {
            this._editbtn.innerHTML = 'edit';
            this._state.edit = false;
        }
    //  else  ... nothing to do
//        this.log(`editing=${this._state.edit}`)
    }

    init() {
        // create model
        if (!this.parseModel(this.innerHTML)) return;
        // install 'show' environment ...
        this._show = Object.create(Object.getPrototypeOf(mec.show), Object.getOwnPropertyDescriptors(mec.show)); // copy defaults
        this._show.darkmode = this.getAttribute('darkmode') === "" ? true : false;  // boolean
        this._show.nodeLabels = this.getAttribute('shownodelabels') === "" ? true : false;  // boolean
        this._show.constraintLabels = this.getAttribute('showconstraintlabels') === "" ? true : false;  // boolean
        // create model instance
        this._model = mec.model.extend(this._model, this);
        this._model.init();
        // find input-drives
        this._inputs = this._model.inputControlledDrives;
        // add shadow dom
        this._root.innerHTML = Mec2Element.template({width:this.width,height:this.height,dof:this._model.dof,gravity:this._model.gravity.active,inputs:this._inputs,darkmode:this._show.darkmode});
        // cache elements of shadow dom
        this._ctx      = this._root.getElementById('cnv').getContext('2d');
        this._runbtn   = this._root.getElementById('runbtn');
        this._resetbtn = this._root.getElementById('resetbtn');
        this._editbtn  = this._root.getElementById('editbtn');
        this._gravbtn  = this._root.getElementById('gravbtn');
        this._corview  = this._root.getElementById('corview');
        this._dofview  = this._root.getElementById('dofview');
        this._egyview  = this._root.getElementById('egyview');
        this._fpsview  = this._root.getElementById('fpsview');
        this._itrview  = this._root.getElementById('itrview');
        this._info     = this._root.getElementById('info');
        this._logview  = this._root.getElementById('logview');
        // add event listeners
        this._runbtnHdl   = e => this.pausing = !this.pausing; this._runbtn  .addEventListener("click", this._runbtnHdl, false);
        this._resetbtnHdl = e => this.reset();                 this._resetbtn.addEventListener("click", this._resetbtnHdl, false);
        this._resetbtnHdl = e => this.editing = !this.editing; this._editbtn .addEventListener("click", this._resetbtnHdl, false);
        this._gravbtnHdl  = e => this.gravity = !this.gravity; this._gravbtn .addEventListener("click", this._gravbtnHdl, false);
        // some more members
        this._interactor = canvasInteractor.create(this._ctx,{x:this.x0,y:this.y0,cartesian:this.cartesian});
        this._g = g2().clr().view(this._interactor.view);
        if (this.grid) this._g.grid({color:this._show.darkmode?'#999':'#ccc'});
        this._selector = g2.selector(this._interactor.evt);
        // treat valid initial model
        if (this._model.valid) {
            // add input event listeners
            for (const input of this._inputs) {
                const z0 = input.sub === 'ori' ? input.w0 : input.r0;
                input.hdl = e => { 
                    if (this.editing) this.editing = false; 
                    input.constraint[input.sub].inputCallbk((+e.target.value-z0),false);
                    this.pausing = false;
                };
                this._root.getElementById(input.id).addEventListener("input", input.hdl, false);
            }
            this._model.preview();
            this._model.draw(this._g);
            this._g.exe(this._ctx);
            this._interactor.on('drag', e => this.ondrag(e))
                            .on('tick', e => this.ontick(e))
                            .on('pointer', e => this.showInfo(e))
                            .on('buttondown', e => this.hideInfo(e))
                            .startTimer();
        }
        else if (this._model.msg) {
            this._g.exe(this._ctx);
            this.log(mec.messageString(this._model.msg));
        }
        this.pausing = true;  // initially ...
    }
    deinit() {
        delete this._g;
        delete this._model;    // we may need a model.deinit method perhaps
        delete this._selector;
        delete this._interactor.deinit();
        // find input-drives
        for (const input of this._inputs)
            this._root.getElementById(input.id).removeEventListener("input", input.hdl, false);
        delete this._inputs;
        // remove event listeners
        this._runbtn  .removeEventListener("click", this._runbtnHdl, false);
        this._resetbtn.removeEventListener("click", this._resetbtnHdl, false);
        this._editbtn .removeEventListener("click", this._resetbtnHdl, false);
        this._gravbtn .removeEventListener("click", this._gravbtnHdl, false);
        // delete cached data
        delete this._ctx;
        delete this._runbtn;
        delete this._resetbtn;
        delete this._editbtn;
        delete this._gravbtn;
        delete this._corview;
        delete this._dofview;
        delete this._egyview;
        delete this._fpsview;
        delete this._itrview;
        delete this._info;
        delete this._logview;
    }

    parseModel() {
        try { this._model = JSON.parse(this.innerHTML); return true; }
        catch(e) { this._root.innerHTML = e.message; }
        return false; 
    }

    reset() {
        this._model.reset();
        this._g.exe(this._ctx);
        this.pausing = true;  // initially ...
    }
    showInfo(e) {
        const info = this._model.info;
        if (info) {
            this._info.style.left = (e.x + 5)+'px'; 
            this._info.style.top = this.cartesian 
                                 ? (this._ctx.canvas.height - e.y - 15)+'px'
                                 : (e.y - 20)+'px';
            this._info.innerHTML = info;
            this._info.style.display = 'inline';
        }
        else
            this._info.style.display = 'none';
    }
    hideInfo(e) {
        if (this._info.style.display === 'inline')
            this._info.style.display = 'none';
    }

    log(str) { 
        this._logview.innerHTML = str; 
    }

    ondrag(e) {
        if (this._selector.selection && this._selector.selection.drag) {

            this._selector.selection.drag({x:e.xusr,y:e.yusr,dx:e.dxusr,dy:e.dyusr,mode:this.editing?'edit':'drag'});
            this._model.preview();
            this._model.pose();
            this._g.exe(this._ctx);
            // this._state.edit ? this._model.reset() : this._model.pose();
        }
    }
    ontick(e) {
        if (!this.pausing && this._model.isActive) {
            if (this._selector.selection && !this.hasInputs)
                this.pausing = true;
            else
                this._model.tick(1/60);
        }
        if (this._model.isActive || this.editing || e.dirty) { // simulation is running ... or pointer is moving ...
            this._g.exe(this._selector);
            this._g.exe(this._ctx);
        }
        // avoid unnecessary model.tick's with mechanims fully controlled by inputs .. !  
        if (this.pausing === false &&
            this._model.activeDriveCount - this.inputDriveCount === 0 &&
            (this._model.dof === 0 || this._model.isSleeping))
            this.pausing = true;
//        this.log(`activeDrives=${this._model.activeDriveCount}, inputDrives=${this.inputDriveCount}, isSleeping=${this._model.isSleeping}, pausing=${this.pausing}, t=${this._model.timer.t}`)
        this._corview.innerHTML = this._interactor.evt.xusr.toFixed(0)+', '+this._interactor.evt.yusr.toFixed(0);
        this._fpsview.innerHTML = 'fps: '+canvasInteractor.fps;
        this._egyview.innerHTML = 'E: '+(this._model.valid ? mec.to_J(this._model.energy).toFixed(2) : '-');
        this._itrview.innerHTML = 'itr: '+this._model.state.itrpos+'/'+this._model.state.itrvel;
    }

    // standard lifecycle callbacks
    // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
    connectedCallback() {
        this.init();
    }
    disconnectedCallback() {
        this.deinit();
    }
    attributeChangedCallback(name, oldval, val) {
        if (this._root.innerHTML) {
            if (name === 'width') {  // todo: preserve minimum width
                this._root.getElementById('cnv').setAttribute('width',val);
                this._root.querySelector('.status').style.width = val+'px';
            }
            if (name === 'height')   // todo: preserve minimum height
                this._root.getElementById('cnv').setAttribute('height',val);
        }
    }

    static template({width,height,darkmode,dof,gravity,inputs}) {
return `
<style>
    .status {
        width: ${width}px;
        display: grid;
        grid-gap: 1px;
        grid-template-columns: minmax(90px, 1fr) 75px 47px 67px 50px 80px;
        background-color: #fff;
        color: #444;
    }
    .box {
        background-color: #444;
        color: #fff;
        border-radius: 2px;
        padding: 2px;
    }
</style>
<canvas id="cnv" width="${width}" height="${height}" style="border:solid 1px black; background-color:${darkmode?'#777':'#eee'};"></canvas><br>
<div class="status">
    <div class="box a">
        <button id="runbtn" title="run/pause"${inputs.length ? ' disabled' : ''}>&#9654;</button>
        <button id="resetbtn" title="reset">&#8617;</button>
        <button id="editbtn" title="drag/edit">edit</button>
        <button id="gravbtn" title="gravity on/off">${gravity?'no g':'g'}</button>
    </div>
    <div id="corview" class="box b" title="pointer ccordinates"></div>
    <div id="dofview" class="box c" title="degrees of freedom">dof: ${dof}</div>
    <div id="egyview" class="box d" title="kin.+pot.energy [J]"></div>
    <div id="fpsview" class="box e" title="frames per second"></div>
    <div id="itrview" class="box f" title="pos/vel iterations"></div>
</div>
<span id="info" style="position:absolute;display:none;background-color:#ffb;border:1px solid black;font:0.9em monospace;padding:0.1em;">tooltip</span><br>
${inputs.length ? inputs.map((input,i) => Mec2Element.slider({input,i,width})).join('') : ''}
<pre id="logview"></pre>
`
    }
    static slider({input,i,width}) {
        const sub = input.sub, cstr = input.constraint;
        if (sub === 'ori') {
            const w0 = mec.toDeg(cstr.w0), w1 = w0 + mec.toDeg(cstr.ori.Dw || 2*Math.PI);
            input.id = 'slider_'+i;
            input.w0 = w0;
            return `<input id="${input.id}" type="range" style="min-width:${width}px;margin:0;" min="${w0}" max="${w1}" value="${w0}" step="1"><br>`;
        }
        else { // if (sub === 'len')
            const r0 = cstr.r0, r1 = r0 + cstr.len.Dr;
            console.log({r0,r1})
            input.id = 'slider_'+i;
            input.r0 = r0;
            return `<input id="${input.id}" type="range" style="min-width:${width}px;margin:0;" min="${r0}" max="${r1}" value="${r0}" step="1"><br>`;
        }
    }
}
customElements.define('mec-2', Mec2Element);
