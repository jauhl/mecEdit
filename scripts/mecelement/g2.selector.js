/**
 * g2.selector.js (c) 2018 Stefan Goessner
 * @file selector for `g2` elements.
 * @author Stefan Goessner
 * @license MIT License
 */
/* jshint -W014 */

/**
 * Extensions.
 * (Requires cartesian coordinate system)
 * @namespace
 */
var g2 = g2 || { prototype:{} };  // for jsdoc only ...

// extend prototypes for argument objects
g2.selector = function(evt) {
    if (this instanceof g2.selector) {
        this.selection = false;
        this.evt = evt;
        return this;
    }
    return g2.selector.apply(Object.create(g2.selector.prototype), arguments);
};
g2.handler.factory.push((ctx) => ctx instanceof g2.selector ? ctx : false);

g2.selector.state = ['NONE','OVER','DRAG','OVER+DRAG','EDIT','OVER+EDIT'];

g2.selector.prototype = {
    init(grp) { return true; },
    exe(commands) {
        for (let elm=false, i=commands.length; i && !elm; i--)  // stop after first hit .. starting from list end !
            elm = this.hit(commands[i-1].a)
    },
    hit(elm) {
        if (!this.evt.inside || !elm || this.selection && this.selection !== elm)  // command without arguments object .. !
            return false;

        if (!elm.state && this.elementHit(elm)) {                     // no mode
            elm.state = g2.OVER;                                      // enter OVER mode ..
            this.evt.hit = true;
            this.selection = elm;
        }
        else if (elm.state & g2.DRAG) {                               // in DRAG mode
            if (!this.evt.btn)                                        // leave DRAG mode ..
                this.elementDragEnd(elm);
        }
        else if (elm.state & g2.OVER) {                               // in OVER mode
            if (!this.elementHit(elm)) {                              // leave OVER mode ..
                elm.state ^= g2.OVER;
                this.evt.hit = false;
                this.selection = false;
            }
            else if (this.evt.btn)                                    // enter DRAG mode
                this.elementDragBeg(elm);
        }
        return elm.state && elm;
    },
    elementDragBeg(elm) {
        elm.state |= g2.DRAG;
        if (elm.dragBeg) elm.dragBeg(e);
    },
    elementDragEnd(elm) {
        elm.state ^= (g2.OVER | g2.DRAG);
        this.selection = false;
        if (elm.dragEnd) elm.dragEnd(e);
    },
    elementHit(elm) {
        const hitpoint = {x:this.evt.xusr,y:this.evt.yusr,eps:this.evt.eps}
        return elm.isSolid ? elm.hitInner   && elm.hitInner(hitpoint)
                           : elm.hitContour && elm.hitContour(hitpoint);
    }
};
