'use strict';

function mecESlider(elm) { return elm.constructor(); }

mecESlider.prototype = {
    constructor: function() {
        this.width = +this.getAttribute('width') || 100
        this.min  = +this.getAttribute('min')    || 0
        this.max  = +this.getAttribute('max')    || 100
        this.step = +this.getAttribute('step')   || 1
        this.value = +this.getAttribute('value') || 0 // namespace uses deg, while callback needs rad!
        this.frac = Math.max(0,Math.ceil(-Math.log10(this.step)))
        this.anistep = this.step;
        this.innerHTML = this.html
        this.setAttribute('style',(this.getAttribute('style') || ''))
        this.slider = this.querySelector('input')
        this.output = this.querySelector('output')
        this.forward = this.querySelector('.forward')
        this.reverse = this.querySelector('.reverse')
    },
    fwdsym: '&#9655;', // ▷⯈ '&#11208; filled triangles look different/weird on android
    revsym: '&#9665;', // ◁⯇ &#11207;
    stopsym: '&#9632;', // ■
    get html() { return `<div id="${this.id+'_rev'}" class="reverse badge badge-primary" style="cursor:pointer;  width:20.8px">${this.revsym}</div>
<input type="range" class="custom-range" style="width:${this.width}px;" min="${this.min}" max="${this.max}" value="${this.value}" step="${this.step}" />
<div id="${this.id+'_fwd'}" class="forward badge badge-primary" style="cursor:pointer; width:20.8px">${this.fwdsym}</div>
<output class="badge badge-light ml-1" style="cursor:default;min-width:4.${this.id.includes('ori')?'4':'7'}rem;text-align:left;">${this.valstr(this.value)}</output>`
    },
    valstr: function(q) { return this.getAttribute('valstr').replace('{value}', (q || this.value).toFixed(this.frac)); },
    setSlider: function(q) {
        this.output.innerHTML = this.valstr(this.slider.value = q);
        if (!(this.observer.state === 'input'))
            this.observer.state = 'input';
        return q;
    },
    // event handling ...
    initEventHandling: function(observer,key,inputCallBack) {
        this.iCbk = inputCallBack;
        this.observer = observer;
        // install instance specific function pointers from prototype methods ...
        this.startForwardPtr=this.startForward.bind(this);
        this.startReversePtr=this.startReverse.bind(this);
        this.endForwardPtr=this.endForward.bind(this);
        this.endReversePtr=this.endReverse.bind(this);
        this.fwdStepPtr = this.fwdStep.bind(this);
        this.revStepPtr = this.revStep.bind(this);
        this.setSliderPtr = this.setSlider.bind(this);

        this.slider.addEventListener('input', (e) => {this.iCbk(this.value = +e.target.value); this.observer.notify(this.id,+e.target.value) }, false);
        this.forward.addEventListener('click', this.startForwardPtr, false);
        this.reverse.addEventListener('click', this.startReversePtr, false);
        this.observer.on(key,this.setSliderPtr);
    },
startForward: function() {
    if (this.value < this.max) {
        this.forward.removeEventListener('click', this.startForwardPtr, false);
        this.forward.innerHTML = this.stopsym;
        this.forward.addEventListener('click', this.endForwardPtr, false);
        this.reverse.classList.add('text-muted'); // bootstrap 4.1
        this.reverse.removeEventListener('click', this.startReversePtr, false);
        this.observer.on('tick',this.fwdStepPtr)
        this.value += 0,  // starting mainLoop (initially setting potential dirty flag) ...
        this.timelog = performance.now();
    }
},
    endForward: function() {
        this.forward.removeEventListener('click', this.endForwardPtr, false);
        this.forward.innerHTML = this.fwdsym;
        this.forward.addEventListener('click', this.startForwardPtr, false);
        this.reverse.classList.remove('text-muted'); // bootstrap 4.1
        this.reverse.addEventListener('click', this.startReversePtr, false);
        this.observer.remove('tick',this.fwdStepPtr);
        this.value += 0;  // continuing mainLoop (setting potential dirty flag one more time) ...
    },
    fwdStep: function() {
        let delta = this.value + this.anistep < this.max ? this.anistep : Math.max(this.max - this.value,0);
        if (delta) {  // proceed ...
            this.value += delta;
            this.iCbk(this.value);     // move drive
            this.observer.notify(this.id,this.value);   // move slider // this.id eg.: a-len
        } else {
            this.endForward();
        }
    },
    startReverse: function() {
        if (this.value > this.min) {
            this.reverse.removeEventListener('click', this.startReversePtr, false);
            this.reverse.innerHTML = this.stopsym;
            this.reverse.addEventListener('click',  this.endReversePtr, false);
            this.forward.classList.add('text-muted'); // bootstrap 4.1
            this.forward.removeEventListener('click', this.startForwardPtr, false);
            this.observer.on('tick',this.revStepPtr)
            this.value += 0;  // starting mainLoop (initially setting potential dirty flag) ...
        }
    },
    endReverse: function() {
        this.reverse.removeEventListener('click', this.endReversePtr, false);
        this.reverse.innerHTML = this.revsym;
        this.reverse.addEventListener('click', this.startReversePtr, false);
        this.forward.classList.remove('text-muted'); // bootstrap 4.1
        this.forward.addEventListener('click', this.startForwardPtr, false);
        this.observer.remove('tick',this.revStepPtr);
        this.value += 0;  // continuing mainLoop (setting potential dirty flag one more time) ...
    },
    revStep: function() {
        let delta = this.value - this.anistep >= this.min ? -this.anistep : -Math.max(this.min - this.value,0);  // >= for last step
        if (delta) {  // proceed ...
            this.value += delta;
            this.iCbk(this.value);     // move drive
            this.observer.notify(this.id,this.value);   // move slider
        } else {
            this.endReverse();
        }
    }
}

mecESlider.RegisterElm = function(elm) {
    mecESlider(Object.setPrototypeOf(elm,mecESlider.prototype));
}

mecESlider.initialize = function() {
    let register = () => Object.setPrototypeOf(mecESlider.prototype, HTMLElement.prototype);
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', register);
    else
        register();
}();