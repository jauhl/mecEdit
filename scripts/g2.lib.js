/**
 * g2.lib (c) 2013-17 Stefan Goessner
 * geometric constants and higher functions
 * @license MIT License
 * @link https://github.com/goessner/g2
 */
"use strict";

var g2 = g2 || {};  // for standalone usage ...

g2 = Object.assign(g2, {
    EPS: Number.EPSILON,
    PI: Math.PI,
    PI2: 2*Math.PI,
    SQRT2: Math.SQRT2,
    SQRT2_2: Math.SQRT2/2,
    /**
     * Map angle to the range [0 .. 2*pi].
     * @param {number} w Angle in radians.
     * @returns {number} Angle in radians in interval [0 .. 2*pi].
     */
    toPi2(w) { return (w % g2.PI2 + g2.PI2) % g2.PI2; },
    /**
     * Map angle to the range [-pi .. pi].
     * @param {number} w Angle in radians.
     * @returns {number} Angle in radians in interval [-pi .. pi].
     */
    toPi(w) { return (w = (w % g2.PI2 + g2.PI2) % g2.PI2) > g2.PI ? w - g2.PI2 : w; },
    /**
     * Map angle to arc sector [w0 .. w0+dw].
     * @param {number} w Angle in range [0 .. 2*pi].
     * @param {number} w0 Start angle in range [0 .. 2*pi].
     * @param {number} dw angular range in radians. Can be positive or negative.
     * @returns {number} Normalised angular parameter lambda.
     * '0' corresponds to w0 and '1' to w0+dw. To reconstruct an angle from 
     *   the return parameter lambda use: w = w0 + lambda*dw.
     */
    toArc: function(w,w0,dw) {
        if (dw > g2.EPS || dw < -g2.EPS) {
            if      (w0 > w && w0+dw > g2.PI2) w0 -= g2.PI2;
            else if (w0 < w && w0+dw < 0)      w0 += g2.PI2;
            return (w-w0)/dw;
        }
        return 0;
    },
    /**
     * Test, if point is located on line. 
     * @param {x,y} point to test.
     * @param {x1,y1} start point of line.
     * @param {x2,y2} end point of line.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnLin({x,y},p1,p2,eps=Number.EPSILON) {
        let dx = p2.x - p1.x, dy = p2.y - p1.y, dx2 = x - p1.x, dy2 = y - p1.y,
            dot = dx*dx2 + dy*dy2, perp = dx*dy2 - dy*dx2, len = Math.hypot(dx,dy), epslen = eps*len;
        return -epslen < perp && perp < epslen && -epslen < dot && dot < len*(len+eps);
    },
    /**
     * Test, if point is located on circle circumference. 
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnCir({x:xp,y:yp},{x,y,r},eps=Number.EPSILON) {
        let dx = xp - x, dy = yp - y,
            ddis = dx*dx + dy*dy - r*r, reps = eps*r;
        return -reps < ddis && ddis < reps;
    },
    /**
     * Test, if point is located on a circular arc.
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnArc({x:xp,y:yp},{x,y,r,w,dw},eps=Number.EPSILON) {
        var dx = xp - x, dy = yp - y, dist = Math.hypot(dx,dy),
            mu = g2.toArc(g2.toPi2(Math.atan2(dy,dx)),g2.toPi2(w),dw);
        return r*Math.abs(dw) > eps && Math.abs(dist-r) < eps && mu >= 0 && mu <= 1;
    },
    /**
     * Test, if point is located on a polygon line.
     * @param {x,y} point to test.
     * @param {pts,closed} polygon.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnPly({x,y},{pts,closed},eps=Number.EPSILON) {
        for (var i=0,n=pts.length; i<(closed ? n : n-1); i++)
            if (g2.isPntOnLin({x,y},pts[i],pts[(i+1)%n],eps))
                return true;
        return false;
    },
    /**
     * Test, if point is located on a box. A box in contrast to a rectangle 
     * is always aligned parallel to coordinate system axes, with its
     * local origin `{x,y}` located in the center. The dimensions `{b,h}` are
     * half size dimensions (so upper right corner is {x+b,y+h}).
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @param {number} eps.
     * @return {boolean} the test result.
     */
    isPntOnBox({x:xp,y:yp},{x,y,b,h},eps=Number.EPSILON) {
        var dx = x.p - x, dy = yp - y;
        return dx >=  b-eps && dx <=  b+eps && dy <=  h+eps && dy >= -h-eps
            || dx >= -b-eps && dx <=  b+eps && dy <=  h+eps && dy >=  h-eps
            || dx >= -b-eps && dx <= -b+eps && dy <=  h+eps && dy >= -h-eps
            || dx >= -b-eps && dx <=  b+eps && dy <= -h+eps && dy >= -h-eps;
    },
    /**
     * Test, if point is located inside of a circle.
     * @param {x,y} point to test.
     * @param {x,y,r} circle.
     * @return {boolean} the test result.
     */
    isPntInCir({x:xp,y:yp},{x,y,r}) {
        return (x - xp)**2 + (y - yp)**2 < r*r;
    },
    /**
     * Test, if point is located inside of a closed polygon.
     * (see http://paulbourke.net/geometry/polygonmesh/)
     * @param {x,y} point to test.
     * @param {pnts,closed} polygon.
     * @returns {boolean} point is on polygon lines.
     */
    isPntInPly({x,y},{pts,closed},eps=Number.EPSILON) {
        let match = 0;
        for (let n=pts.length,i=0,pi=pts[i],pj=pts[n-1]; i<n; pj=pi,pi=pts[++i])
           if (   (y >  pi.y || y >  pj.y)
               && (y <= pi.y || y <= pj.y)
               && (x <= pi.x || x <= pj.x)
               &&  pi.y !== pj.y 
               && (pi.x === pj.x || x <= pj.x + (y-pj.y)*(pi.x-pj.x)/(pi.y-pj.y)))
             match++;
        return match%2 != 0;  // even matches required for being outside ..
    },
    /**
     * Test, if point is located inside of a box. A box in contrast to a rectangle 
     * is always aligned parallel to coordinate system axes, with its
     * local origin `{x,y}` located in the center. The dimensions `{b,h}` are
     * half size dimensions (so upper right corner is {x+b,y+h}).
     * @param {x,y} - point to test.
     * @param {x,y,b.h} - bounding rectangle.
     * @return {boolean} - the test result.
     */
    isPntInBox({x:xp,y:yp},{x,y,b,h}) {
        var dx = xp - x, dy = yp - y;
        return dx >= -b && dx <= b && dy >= -h && dy <= h;
    },
    /**
     * Implement a centripetal Catmull-Rom spline (thus avoiding cusps and self-intersections).
     * Returns an array of g2 bezier 'c' path commands.
     * Using iterator function for getting points from array by index.
     * It must return current point object {x,y} or object {done:true}.
     * Default iterator expects sequence of x/y-coordinates as a flat array [x,y,...],
     * array of [[x,y],...] arrays or array of [{x,y},...] objects.  
     * @see https://pomax.github.io/bezierinfo
     * @see https://de.wikipedia.org/wiki/Kubisch_Hermitescher_Spline
     * @method
     * @return {array} cmds
     * @param {array} pts Array of points.
     * @param {bool} [closed = false] Closed spline.
     */
    catmulRom(pts, closed) {
        let p1, p2, p3, p4, d1, d2, d3, d1d2, d2d3, scl2, scl3, den2, den3,
            itr = g2.itrOf(pts), n = itr.len, cmds = [{c:'m',a:itr(0)}];

        for (let i=0; i < (closed ? n : n-1); i++) {
            if (i === 0) {
                p1 = closed ? itr(n-1) : {x:2*itr(0).x-itr(1).x, y:2*itr(0).y-itr(1).y};
                p2 = itr(0);
                p3 = itr(1);
                p4 = n === 2 ? (closed ? itr(0) : {x:2*itr(1).x-itr(0).x, y:2*itr(1).y-itr(0).y}) : itr(2);
                d1 = Math.max(Math.hypot(p2.x-p1.x,p2.y-p1.y),Number.EPSILON);  // don't allow ..
                d2 = Math.max(Math.hypot(p3.x-p2.x,p3.y-p2.y),Number.EPSILON);  // zero point distances ..
            }
            else {
                p1 = p2;
                p2 = p3;
                p3 = p4;
                p4 = (i === n-2) ? (closed ? itr(0) : {x:2*itr(n-1).x-itr(n-2).x, y:2*itr(n-1).y-itr(n-2).y})
                   : (i === n-1) ? itr(1)
                   : itr(i+2);
                d1 = d2;
                d2 = d3;
            }
            d3 = Math.max(Math.hypot(p4.x-p3.x,p4.y-p3.y),Number.EPSILON);
            d1d2 = Math.sqrt(d1*d2), d2d3 = Math.sqrt(d2*d3),
            scl2 = 2*d1 + 3*d1d2 + d2,
            scl3 = 2*d3 + 3*d2d3 + d2,
            den2 = 3*(d1 + d1d2),
            den3 = 3*(d3 + d2d3);
            cmds.push({c:'c',a:{ x1: (-d2*p1.x + scl2*p2.x + d1*p3.x)/den2,
                                 y1: (-d2*p1.y + scl2*p2.y + d1*p3.y)/den2,
                                 x2: (-d2*p4.x + scl3*p3.x + d3*p2.x)/den3,
                                 y2: (-d2*p4.y + scl3*p3.y + d3*p2.y)/den3,
                                 x: p3.x, y: p3.y }});
        }
        if (closed) cmds.push({c:'z'});
        return cmds;
    },
    // polygon clipping against window
    // s. https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
    lineClipCohenSutherland({x1,y1,x2,y2},{xmin,ymin,xmax,ymax}) {
        const IN = 0, LFT = 1, RGT = 2, BOT = 4, TOP = 8;
        function bitCode(x,y) {
            return (x < xmin ? LFT : x > xmax ? RGT : IN) | (y < ymin ? BOT : y > ymax ? TOP : IN);
        }
        let code1 = bitCode(x1,y1), code2 = bitCode(x2,y2), ok = false;

        while (true) {
            if (!(code1 | code2)) { // both points inside window; trivially accept and exit loop
                ok = true;
                break;
            }
            else if (code1 & code2) { // both points in a single outside zone
                break;
            }
            else {
                let codeout = code1 || code2, // at least one endpoint is outside
                    x, y;

                if (codeout & TOP) {
                    x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
				    y = ymax;
                }
                else if (codeout & BOT) {
                    x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
				    y = ymin;
                }
                else if (codeout & RGT) {
				    x = xmax;
                    y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
                }
                else if (codeout & LFT) {
				    x = xmin;
                    y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1);
                }
            }
        }

        return bitCode(x1,y1);
    },
    parseSvgPathData: function parseSvgPathData(data,ifc) {
        const rex = /([achlmqstvz])([^achlmqstvz]*)/ig;
        const seg = { A:{n:7,f:'A'}, C:{n:6,f:'C'}, H:{n:1,f:'H'},
                      L:{n:2,f:'L'}, M:{n:2,f:'L'}, Q:{n:4,f:'Q'},
                      S:{n:4,f:'S'}, T:{n:2,f:'T'}, V:{n:1,f:'V'},
                      Z:{n:0},
                      a:{n:7,f:'a'}, c:{n:6,f:'c'}, h:{n:1,f:'h'},
                      l:{n:2,f:'l'}, m:{n:2,f:'l'}, q:{n:4,f:'q'},
                      s:{n:4,f:'s'}, t:{n:2,f:'t'}, v:{n:1,f:'v'},
                      z:{n:0} };

        const segment = (ifc,type,args) => {
            if (type in seg) {
                if (args.length === seg[type].n) {
                    ifc[type](...args);
                }
                else if (args.length > seg[type].n) {
                    ifc[type](...args);
                    args.splice(0,seg[type].n);
                    segment(ifc,seg[type].f,args);
                }
                else
                    console.error(`invalid # of path segment '${type}' arguments: ${args.length} of ${seg[type].n}: '${args}'`)
            }
        };
        let match;
    
        if (!ifc) ifc = g2.svgPathIfc.create();
        // for each explicit named segment ...
        while (match = rex.exec(data)) {
            segment(ifc, match[1], match[2].replace(/^\s+|\s+$/g,'')  // trim whitespace at both ends (str.trim .. !)
                                           .replace(/(\d)\-/g,'$1 -') // insert blank between digit and '-'
                                           .split(/[, \t\n\r]+/g)     // as array
                                           .map(Number))
        }
        return ifc.ctx;
    },
    svgPathIfc: {
        create() { const o = Object.create(this.prototype); o.constructor.apply(o,arguments); return o; },
        prototype: {
            constructor() {
                Object.assign(this, {x0:0,y0:0, x:0,y:0, x1:0,y1:0, x2:0,y2:0});
                this.ctx = [];
            },
            // SVG path interface ...
            A(rx,ry,rot,fA,fS,x,y) {
                let x12 = x-this.x, y12 = y-this.y,
                    phi = rot ? rot/180*Math.PI : 0,
                    cp = phi ? Math.cos(phi) : 1, sp = phi ? Math.sin(phi) : 0,
                    k = ry/rx,
                    dw_sgn = fS ? 1 : -1,
                    Nx = dw_sgn*(-x12*cp - y12*sp), Ny = dw_sgn*(-x12*sp + y12*cp),
                    NN = Math.hypot(Nx, Ny/k),
                    R = 2*rx > NN ? rx : NN/2, // scale R to a valid value...
                    dw = 2*dw_sgn*Math.asin(NN/2/R);
    
                if (fA) 
                    dw = dw > 0 ? 2*Math.PI - dw : -2*Math.PI - dw;
    
                this.ctx.push({c:'a',a:{dw,k,phi,x,y}});
            },
            C(x1,y1,x2,y2,x,y) { 
                this.ctx.push({c:'c',a:{x1:(this.x1=x1),y1:(this.y1=y1),
                                         x2:(this.x2=x2),y2:(this.y2=y2),
                                         x:(this.x=x),y:(this.y=y)}});
            },
            M(x,y) { this.ctx.push({c:'m',a:{x:(this.x=this.x0=this.x1=this.x2=x),y:(this.y=this.y0=this.y1=this.y2=y)}}) },
            L(x,y) { this.ctx.push({c:'l',a:{x:(this.x=this.x1=this.x2=x),y:(this.y=this.y1=this.y2=y)}}) },
            // secondary absolute commands
            H(x) { this.L(x,this.y) },
            V(y) { this.L(this.x,y) },
            S(x2,y2,x,y) { this.C(2*this.x-this.x2,2*this.y-this.y2,x2,y2,x,y) },
            Q(x1,y1,x,y) { this.ctx.push({c:'q',a:{x1:(this.x1=this.x2=x1),y1:(this.y1=this.y2=y1),
                                                    x:(this.x=x),y:(this.y=y)}}) },
            T(x,y) { this.Q(2*this.x-this.x1,2*this.y-this.y1,x,y) },
            Z() { this.ctx.push({c:'z'}) },
            // relative commands
            a(rx,ry,rot,fA,fS,x,y) { this.A(rx,ry,rot,fA,fS,this.x+x,this.y+y) },
            m(x,y) { this.M(this.x+x,this.y+y) },
            l(x,y) { this.L(this.x+x,this.y+y) },
            h(x) { this.H(this.x+x) },
            v(y) { this.V(this.y+y) },
            c(x1,y1,x2,y2,x,y) { this.C(this.x+x1,this.y+y1,this.x+x2,this.y+y2,this.x+x,this.y+y) },
            s(x2,y2,x,y) { this.S(this.x+x2,this.y+y2,this.x+x,this.y+y) },
            q(x1,y1,x,y) { this.Q(this.x+x1,this.y+y1,this.x+x,this.y+y) },
            t(x,y) { this.T(this.x+x,this.y+y) },
            z() { this.Z() },
        }
    },
})

g2.color = {
    // convert to object {r,g,b,a}
    // s. https://web.njit.edu/~kevin/rgb.txt.html
    rgba(color,alpha) {
        let res;
        alpha = alpha !== undefined ? alpha : 1;
        // color name ?
        if (color === "transparent")
            return {r:0,g:0,b:0,a:0};
        if (color in g2.color.names)
            color = "#" + g2.color.names[color];
        // #rrggbb
        if (res = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) 
            return {r:parseInt(res[1], 16), g:parseInt(res[2], 16), b:parseInt(res[3], 16), a:alpha};
        // Look for #rgb
        if (res = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) 
            return {r:parseInt(res[1] + res[1], 16), g:parseInt(res[2] + res[2], 16), b:parseInt(res[3] + res[3], 16), a:alpha};
        // rgb(rrr,ggg,bbb)
        if (res = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) 
            return {r:parseInt(res[1]), g:parseInt(res[2]), b:parseInt(res[3]), a:alpha};
        // rgba(rrr,ggg,bbb,a)
        if (res = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(color)) 
            return {r:parseInt(res[1]), g:parseInt(res[2]), b:parseInt(res[3]),a:(alpha!==undefined?alpha:parseFloat(res[4]))};
        // rgb(rrr%,ggg%,bbb%)
        if (res = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color)) 
            return {r:parseFloat(res[1]) * 2.55, g:parseFloat(res[2]) * 2.55, b:parseFloat(result[3]) * 2.55, a:alpha};
    },
    rgbaStr(color,alpha) {
        const c = g2.color.rgba(color,alpha);
        return "rgba("+c.r+","+c.g+","+c.b+","+c.a+")";
    },
    names: {
        aliceblue: 'f0f8ff', antiquewhite: 'faebd7', aqua: '00ffff', aquamarine: '7fffd4', azure: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '000000',
        blanchedalmond: 'ffebcd', blue: '0000ff', blueviolet: '8a2be2', brown: 'a52a2a', burlywood: 'deb887', cadetblue: '5f9ea0', chartreuse: '7fff00',
        chocolate: 'd2691e', coral: 'ff7f50', cornflowerblue: '6495ed', cornsilk: 'fff8dc', crimson: 'dc143c', cyan: '00ffff', darkblue: '00008b', darkcyan: '008b8b',
        darkgoldenrod: 'b8860b', darkgray: 'a9a9a9', darkgreen: '006400', darkkhaki: 'bdb76b', darkmagenta: '8b008b', darkolivegreen: '556b2f', darkorange: 'ff8c00',
        darkorchid: '9932cc', darkred: '8b0000', darksalmon: 'e9967a', darkseagreen: '8fbc8f', darkslateblue: '483d8b', darkslategray: '2f4f4f', darkturquoise: '00ced1',
        darkviolet: '9400d3', deeppink: 'ff1493', deepskyblue: '00bfff', dimgray: '696969', dodgerblue: '1e90ff', feldspar: 'd19275', firebrick: 'b22222',
        floralwhite: 'fffaf0', forestgreen: '228b22', fuchsia: 'ff00ff', gainsboro: 'dcdcdc', ghostwhite: 'f8f8ff', gold: 'ffd700', goldenrod: 'daa520', gray: '808080',
        green: '008000', greenyellow: 'adff2f', honeydew: 'f0fff0', hotpink: 'ff69b4', indianred : 'cd5c5c', indigo : '4b0082', ivory: 'fffff0', khaki: 'f0e68c', 
        lavender: 'e6e6fa', lavenderblush: 'fff0f5', lawngreen: '7cfc00', lemonchiffon: 'fffacd', lightblue: 'add8e6', lightcoral: 'f08080', lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2', lightgrey: 'd3d3d3', lightgreen: '90ee90', lightpink: 'ffb6c1', lightsalmon: 'ffa07a', lightseagreen: '20b2aa', 
        lightskyblue: '87cefa', lightslateblue: '8470ff', lightslategray: '778899', lightsteelblue: 'b0c4de', lightyellow: 'ffffe0', lime: '00ff00', limegreen: '32cd32',
        linen: 'faf0e6', magenta: 'ff00ff', maroon: '800000', mediumaquamarine: '66cdaa', mediumblue: '0000cd', mediumorchid: 'ba55d3', mediumpurple: '9370d8',
        mediumseagreen: '3cb371', mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a', mediumturquoise: '48d1cc', mediumvioletred: 'c71585', midnightblue: '191970',     
        mintcream: 'f5fffa', mistyrose: 'ffe4e1', moccasin: 'ffe4b5', navajowhite: 'ffdead', navy: '000080', oldlace: 'fdf5e6', olive: '808000', olivedrab: '6b8e23',
        orange: 'ffa500', orangered: 'ff4500', orchid: 'da70d6', palegoldenrod: 'eee8aa', palegreen: '98fb98', paleturquoise: 'afeeee', palevioletred: 'd87093',
        papayawhip: 'ffefd5', peachpuff: 'ffdab9', peru: 'cd853f', pink: 'ffc0cb', plum: 'dda0dd', powderblue: 'b0e0e6', purple: '800080', rebeccapurple:'663399',
        red: 'ff0000', rosybrown: 'bc8f8f', royalblue: '4169e1', saddlebrown: '8b4513', salmon: 'fa8072', sandybrown: 'f4a460', seagreen: '2e8b57', seashell: 'fff5ee',
        sienna: 'a0522d', silver: 'c0c0c0', skyblue: '87ceeb', slateblue: '6a5acd', slategray: '708090', snow: 'fffafa', springgreen: '00ff7f', steelblue: '4682b4',
        tan: 'd2b48c', teal: '008080', thistle: 'd8bfd8', tomato: 'ff6347', turquoise: '40e0d0', violet: 'ee82ee', violetred: 'd02090', wheat: 'f5deb3', white: 'ffffff',
        whitesmoke: 'f5f5f5', yellow: 'ffff00', yellowgreen: '9acd32'
    }
}
