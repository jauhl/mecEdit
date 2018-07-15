/**
 * g2ui (c) 2016-18 Stefan Goessner
 * @file range slider for kinematics.
 * @author Stefan Goessner
 * @license MIT License
 */
"use strict";

function mecSlider(elm) { return elm.constructor(); }

mecSlider.prototype = {
    constructor: function() {
        this.width = +this.getAttribute("width") || 100
        this.min  = +this.getAttribute("min")  || 0
        this.max  = +this.getAttribute("max")  || 100
        this.step = +this.getAttribute("step") || 1
        this.value = +this.getAttribute("value") || 0
        this.frac = Math.max(0,Math.ceil(-Math.log10(this.step)))
        this.anistep = this.step; // (max - min)/step > 240 ? ((max - min)/240) : step
        this.innerHTML = this.html
        this.setAttribute('style',(this.getAttribute('style') || "")+this.css) // style.width kills flex nowrap 
        this.slider = this.querySelector('input')
        this.output = this.querySelector('output')
        this.forward = this.querySelector('.forward')
        this.reverse = this.querySelector('.reverse')
    },
    fwdsym: '&#9655;',
    revsym: '&#9665;',
    stopsym: '&#9744;',
    get html() { return `<span id="${this.id+'_rev'}" class="reverse badge badge-primary" style="cursor:pointer;">${this.revsym}</span>
<input type="range" class="custom-range" style="width:${this.width}px;" min="${this.min}" max="${this.max}" value="${this.value}" step="${this.step}" />
<span id="${this.id+'_fwd'}" class="forward badge badge-primary" style="cursor:pointer;">${this.fwdsym}</span>
<output class="badge badge-light ml-1" style="cursor:default">${this.valstr(this.value)}</output>`
    },
//     get html() { return `<span id="${this.id+'_rev'}" class="reverse badge badge-primary" style="cursor:pointer;">${this.revsym}</span>
// <input type="range" class="custom-range" style="width:${this.width}px;" min="${this.min}" max="${this.max}" value="${this.value}" step="${this.step}" />
// <span id="${this.id+'_fwd'}" class="forward badge badge-primary" style="cursor:pointer;">${this.fwdsym}</span>
// <output class="badge badge-light" style="cursor:default">${this.valstr(this.value)}</output>`
//     },
    // get css() { return `display:inline-flex; width:${this.width}px; align-items:center;` },
    get css() { return /*`width:${this.width}px;`*/ }, // flex properties managed by bootstrap via classes (see main.js)
    valstr: function(q) { return this.getAttribute("valstr").replace('{value}', (q || this.value).toFixed(this.frac)); },
    setSlider: function(q) {
//        console.log('set slider:'+q)
        this.output.innerHTML = this.valstr(this.slider.value = q);
        return q;
    },
    // event handling ...
    initEventHandling: function(observer,key,getter,setter) {
        Object.defineProperty(this, 'value', { get:getter, set:setter, enumerable:true, configurable:true })
        this.observer = observer
        // install instance specific function pointers from prototype methods ...
        this.startForwardPtr=this.startForward.bind(this)
        this.startReversePtr=this.startReverse.bind(this)
        this.endForwardPtr=this.endForward.bind(this)
        this.endReversePtr=this.endReverse.bind(this)
        this.fwdStepPtr = this.fwdStep.bind(this)
        this.revStepPtr = this.revStep.bind(this)
        this.setSliderPtr = this.setSlider.bind(this)

        this.slider.addEventListener("input", (e) => this.value = +e.target.value, false)
        this.forward.addEventListener("click", this.startForwardPtr, false)
        this.reverse.addEventListener("click", this.startReversePtr, false)
        this.setSlider(this.value);   // set initial value .. !
        observer.on(key,this.setSliderPtr);
    },
    startForward: function() {
        if (this.value < this.max) {
            this.forward.removeEventListener("click", this.startForwardPtr, false);
            this.forward.innerHTML = this.stopsym;
            this.forward.addEventListener("click", this.endForwardPtr, false);
            // this.reverse.style.color = "gray"; // non bootrap
            this.reverse.classList.add("text-muted"); // bootstrap 4.1
            this.reverse.removeEventListener("click", this.startReversePtr, false);
            this.observer.on('step',this.fwdStepPtr)
            this.value += 0;  // starting mainLoop (initially setting potential dirty flag) ...
        }
    },
    endForward: function() {
        this.forward.removeEventListener("click", this.endForwardPtr, false);
        this.forward.innerHTML = this.fwdsym;
        this.forward.addEventListener("click", this.startForwardPtr, false);
        // this.reverse.style.color = "black"; // non bootrap
        this.reverse.classList.remove("text-muted"); // bootstrap 4.1
        this.reverse.addEventListener("click", this.startReversePtr, false);
        this.observer.remove('step',this.fwdStepPtr);
        this.value += 0;  // continuing mainLoop (setting potential dirty flag one more time) ...
    },
    fwdStep: function() {
        let delta = this.value + this.anistep < this.max ? this.anistep : Math.max(this.max - this.value,0);
        if (delta)  // proceed ...
            this.value += delta;
        else
            this.endForward();
    },
    startReverse: function() {
        if (this.value > this.min) {
            this.reverse.removeEventListener("click", this.startReversePtr, false);
            this.reverse.innerHTML = this.stopsym;
            this.reverse.addEventListener("click",  this.endReversePtr, false);
            // this.forward.style.color = "gray"; // non bootrap
            this.forward.classList.add("text-muted"); // bootstrap 4.1
            this.forward.removeEventListener("click", this.startForwardPtr, false);
            this.observer.on('step',this.revStepPtr)
            this.value += 0;  // starting mainLoop (initially setting potential dirty flag) ...
        }
    },
    endReverse: function() {
        this.reverse.removeEventListener("click", this.endReversePtr, false);
        this.reverse.innerHTML = this.revsym;
        this.reverse.addEventListener("click", this.startReversePtr, false);
        // this.forward.style.color = "black"; // non bootrap
        this.forward.classList.remove("text-muted"); // bootstrap 4.1
        this.forward.addEventListener("click", this.startForwardPtr, false);
        this.observer.remove('step',this.revStepPtr);
        this.value += 0;  // continuing mainLoop (setting potential dirty flag one more time) ...
    },
    revStep: function() {
        let delta = this.value - this.anistep > this.min ? -this.anistep : -Math.max(this.min - this.value,0);
        if (delta)  // proceed ...
            this.value += delta;
        else
            this.endReverse();
    }
}

mecSlider.RegisterElm = function(elm) {
    Object.setPrototypeOf(mecSlider.prototype, HTMLElement.prototype);
    mecSlider(Object.setPrototypeOf(elm,mecSlider.prototype));
}

mecSlider.initialize = function() {
    let register = () => {
        Object.setPrototypeOf(mecSlider.prototype, HTMLElement.prototype);
        for (let elms = document.getElementsByTagName('mec-slider'), i=0; i < elms.length; i++)
            mecSlider(Object.setPrototypeOf(elms[i],mecSlider.prototype));
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", register);
    else
        register();
}();