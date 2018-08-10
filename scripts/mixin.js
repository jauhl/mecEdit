/**
 * @fileoverview Ticker
 * @author Stefan Goessner (c) 2014-18
 **/
// getter/setters are not allowed with mixins .. !
const mixin = {
    observable: {
        notify(key,val) {
            if (this.signals && this.signals[key]) 
                for (let hdl of this.signals[key]) 
                    hdl(val);
            return this;
        },
        on(key,handler) {   // support array of keys as first argument.
            if (Array.isArray(key))
                for (let k of key) 
                   this.on(k,handler);
            else
                ((this.signals || (this.signals = {})) && this.signals[key] || (this.signals[key]=[])).push(handler);
            
            return this;
        },
        remove(key,handler) {
            let idx = (this.signals && this.signals[key]) ? this.signals[key].indexOf(handler) : -1;
            if (idx >= 0)
               this.signals[key].splice(idx,1);
        }
    },
    // requires this.evt && this.cartesian && this.height && this.dragging
    pointerEventHdl: {
        registerEventsFor(elm) {
            elm.addEventListener("mousemove", this, false);
            elm.addEventListener("mousedown", this, false);
            elm.addEventListener("mouseup", this, false);
            elm.addEventListener("mouseenter", this, false);
            elm.addEventListener("mouseleave", this, false);
            elm.addEventListener("wheel", this, false);
            elm.addEventListener("touchmove", this, false);
            elm.addEventListener("touchstart", this, false);
            elm.addEventListener("touchend", this, false);
            return this;
        },
        handleEvent(e) {
            if (e.type in this) {  // can I handle events of type e.type .. ?
                let evt = this.getEventData(e);
                if (this.isDefaultPreventer(e.type))
                    e.preventDefault();
                this[e.type](evt);  // handle it .. ?
                if (!this.tick) {   // not controlled by timer ... !
                    this.save(evt);
                    this.notify(evt.type,this);
                }
                else {              // controlled by timer ... !
                    this.cumulate(evt);
                }
            }
        },
        getEventData(e) {
            let bbox = e.target.getBoundingClientRect && e.target.getBoundingClientRect() || {left:0, top:0},
                touch = e.changedTouches && e.changedTouches[0],
                x = (touch && touch.clientX || e.clientX) - Math.floor(bbox.left),
                y = (touch && touch.clientY || e.clientY) - Math.floor(bbox.top);

            return {
                type: e.type,
                basetype: e.type,
                x,
                y: this.cartesian ? this.height - y : y,
                dx: 0, dy: 0,
                clientX: e.clientX, clientY: e.clientY,
                btn: e.buttons !== undefined ? e.buttons : e.button || e.which,
                ctrlKey: e.ctrlKey,
                delta: Math.max(-1,Math.min(1,e.deltaY||e.wheelDelta)) || 0
            }
        },
        mousemove(e) {
            e.dx = e.x - this.evt.xi;
            e.dy = e.y - this.evt.yi;
            // e.type = e.btn !== 0 ? (this.dragging ? 'drag' : 'pan') : 'pointer';

            switch (e.btn) {
                case 1:     e.type = e.ctrlKey ? 'pan' : this.dragging ?  'drag' : 'pointer'; break;  // left mousebutton
                // case 2 && this.dragging:    e.type = 'drag';    break;  // right mousebutton
                case 4:                     e.type = 'pan';     break;  // middle mousebutton
                default:                    e.type = 'pointer'; 
            }
        },
        mousedown(e) { e.type='buttondown' },
        mouseup(e) { e.type = this.evt.dx===0 && this.evt.dy===0 ? 'click' : 'buttonup' },
        mouseenter(e) { e.type='pointerenter' },
        mouseleave(e) { e.type='pointerleave' },
        wheel(e) { e.type='wheel' },
        touchmove(e) {
            e.dx = e.x - this.evt.xi;
            e.dy = e.y - this.evt.yi;
            e.type = 'pan';
        },
        touchstart(e) { e.type='buttondown' },
        touchend(e) { e.type = this.evt.dx===0 && this.evt.dy===0 ? 'click' : 'buttonup' },
        save(e) {
            this.evt.type = e.type;
            this.evt.basetype = e.basetype;
            this.evt.dx = e.dx; 
            this.evt.dy = e.dy;
            this.evt.clientX = e.clientX; 
            this.evt.clientY = e.clientY;
            this.evt.x = this.evt.xi = e.x; 
            this.evt.y = this.evt.yi = e.y;
            this.evt.dbtn = e.btn - this.evt.btn;  // watch for inconsistencies .. !
            this.evt.btn = e.btn;
            this.evt.delta = e.delta || 0;
        },
        cumulate(e) {
            if (this.evt.unused && ['pointer','drag','wheel'].includes(e.type)) { // controlled by timer ...
                this.evt.dx += e.dx; this.evt.dy += e.dy;  // ... only cumulate some deltas during a single tick interval
                this.evt.xi = e.x; this.evt.yi = e.y;      // ... interim pointer coordinates
                this.evt.delta += e.delta || 0;
            }
            else {
                this.save(e);
                this.evt.unused = true;
            }
        },
        isDefaultPreventer(type) {
            return ['touchstart','touchend','touchmove'].includes(type);
        }
    },
    tickTimer: {
        startTimer() {
            this.timerTick.ptr = this.timerTick.bind(this);
            this.fps = '?';
            this.frames = 0;
            this.notify('timerStart',this);
            this.timerTick(this.time0 = this.fpsOrigin = performance.now());
            return this;
        },
        endTimer() {
            cancelAnimationFrame(this.rafid);
            this.notify('timerEnd',this.t/1000);
            return this;
        },
        timerTick(time) {
            this.fpsCount(time);
            if (this.evt.type) {
                this.evt.t = time;
                this.evt.dt = (time-this.t)/1000;
                this.notify(this.evt.type,{x,y,t,dt,btn,type}=this.evt); // notify last event type ... !
                this.evt.unused = this.evt.type = false;                 // mark as consumed/used ... !
            }
            this.notify('tick',{t:time,dt:(time-this.t)/1000})
            this.t = time;
            this.rafid = requestAnimationFrame(this.timerTick.ptr);   // request next animation frame ...
            return this;
        },
        fpsCount(time) {
            if (time - this.fpsOrigin > 1000) {  // one second interval reached ...
                let fps = ~~(this.frames*1000/(time - this.fpsOrigin) + 0.5); // ~~ as Math.floor()
                if (fps !== this.fps)
                    this.notify('fps',this.fps=fps);
                this.fpsOrigin = time;
                this.frames = 0;
            }
            this.frames++;
        }
    },
    zoomPan: {
        // viewport handling ... requires 'this.view'
        pan: function({dx,dy}) { this.view.x+=dx; this.view.y+=dy; this.notify('view', Object.assign({type:'view'},this._view)); },
        zoom: function({x,y,scl}) {
            this.view.x = x + scl*(this.view.x - x);
            this.view.y = y + scl*(this.view.y - y);
            this.view.scl *= scl;
            this.notify('view', this.view); 
        },
        pntToUsr: function(p) { let vw = this.view; p.x = (p.x - vw.x)/vw.scl; p.y = (p.y - vw.y)/vw.scl; return p; },

    }
}
