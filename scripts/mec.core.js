/**
 * mec (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec namespace for the mec library.
 * It includes mainly constants and some general purpose functions.
 */
const mec = {
/**
 * minimal float difference to 1.0
 * @const
 * @type {number}
 */
EPS: 1.19209e-07,
/**
 * Linear tolerance for position correction.
 * @const
 * @type {number}
 */
linTol: 0.001,
/**
 * Angular tolerance for orientation correction.
 * @const
 * @type {number}
 */
angTol: 2 / 180 * Math.PI,
/**
 * Velocity tolerance.
 * @const
 * @type {number}
 */
velTol: 0.01,
/**
 * Force tolerance.
 * @const
 * @type {number}
 */
forceTol: 0.1,
/**
 * Moment tolerance.
 * @const
 * @type {number}
 */
momentTol: 0.01,
/**
 * Maximal value for position correction.
 * @const
 * @type {number}
 */
maxLinCorrect: 20,
/**
 * fixed limit of assembly iteration steps.
 */
asmItrMax: 512,
/**
 * itrMax: fixed limit of simulation iteration steps.
 */
itrMax: 256,
/**
 * corrMax: fixed number of position correction steps.
 */
corrMax: 64,
/* graphics related */
/**
 * flags for showing labels.
 * @const
 * @type {object}
 */
labels: {
    nodes: false,
    constraints: true,
    loads: true,
},
/**
 * flags for showing linkage.
 * @const
 * @type {object}
 */
linkage: {
    nodes: true,
    constraints: true,
},
/**
 * place and show labels with elements (depricated !!) 
 */
showNodeLabels: false,
showConstraintLabels: true,
showLoadLabels: true,
/*
 * color conventions
 */
/**
 * flag for darkmode.
 * @const
 * @type {boolean}
 */
darkmode: false,
/**
 * color for drawing valid constraints.
 * @return {string}
 */
get validConstraintColor() { return this.darkmode ? '#ffffff99' : '#777' },
/**
 * color for drawing invalid constraints.
 * @const
 * @type {string}
 */
invalidConstraintColor: '#b11',
/**
 * color for drawing forces.
 * @return {string}
 */
get forceColor() { return this.darkmode ? 'crimson' : 'orange' },
/**
 * color for drawing springs.
 * @return {string}
 */
get springColor() { return this.darkmode ? 'lightslategray' : '@linkcolor' },
/**
 * color for vectortypes of constraints.
 * @return {string}
 */
get constraintVectorColor() { return this.darkmode ? 'orange' : 'green' },
/**
 * hovered element shading color.
 * @return {string}
 */
get hoveredElmColor() { return this.darkmode ? 'white' : 'gray' },
/**
 * selected element shading color.
 * @return {string}
 */
get selectedElmColor() { return this.darkmode ? 'yellow': 'blue' },
/**
 * color for g2.txt (ls).
 * @return {string}
 */
get txtColor() { return this.darkmode ? 'white' : 'black' },
/*
 * colors for analyses
 */
color: {
    /**
     * color for velocity arrow (ls).
     * @const
     * @type {string}
     */
    get vel() { return mec.darkmode ? 'lightsteelblue' : 'steelblue' },
    /**
     * color for acceleration arrow (ls).
     * @const
     * @type {string}
     */
    get acc() { return mec.darkmode ? 'lightsalmon' : 'firebrick' },
    /**
     * color for acceleration arrow (ls).
     * @const
     * @type {string}
     */
    get force() { return mec.darkmode ? 'wheat' : 'saddlebrown' },
},

/**
 * default gravity.
 * @const
 * @type {object}
 */
gravity: {x:0,y:-10,active:false},
/*
 * analysing values
 */
aly: {
    mass: { get scl() { return 1}, type:'num', name:'m', unit:'kg' },
    vel: { get scl() {return mec.m_u}, type:'vec', name:'v', unit:'m/s', get drwscl() {return 40*mec.m_u} },
    acc: { get scl() {return mec.m_u}, type:'vec', name:'a', unit:'m/s^2', get drwscl() {return 10*mec.m_u} },
    w: { get scl() { return 180/Math.PI}, type:'num', name:'φ', unit:'°' },
    wt: { get scl() { return 1}, type:'num', name:'ω', unit:'rad/s' },
    wtt: { get scl() { return 1}, type:'num', name:'α', unit:'rad/s^2' },
    r: { get scl() { return mec.m_u}, type:'num', name:'r', unit:'m' },
    rt: { get scl() { return mec.m_u}, type:'num', name:'rt', unit:'m/s' },
    rtt: { get scl() { return mec.m_u}, type:'num', name:'rtt', unit:'m/s^2' },
    force: { get scl() {return mec.m_u}, type:'vec', name:'F', unit:'N', get drwscl() {return 5*mec.m_u} },
    velAbs: { get scl() {return mec.m_u}, type:'num', name:'v', unit:'m/s' },
    accAbs: { get scl() {return mec.m_u}, type:'num', name:'a', unit:'m/s' },
    forceAbs: { get scl() {return mec.m_u}, type:'num', name:'F', unit:'N' },
    moment: { get scl() {return mec.m_u**2}, type:'num', name:'M', unit:'Nm' },
},
/**
 * unit specifiers and relations
 */
/**
 * default length scale factor (meter per unit) [m/u].
 * @const
 * @type {number}
 */
m_u: 0.01,
/**
 * convert [u] => [m]
 * @return {number} Value in [m]
 */
to_m(x) { return x*mec.m_u; },
/**
 * convert [m] = [u]
 * @return {number} Value in [u]
 */
from_m(x) { return x/mec.m_u; },
/**
 * convert [kgu/m^2] => [kgm/s^2] = [N]
 * @return {number} Value in [N]
 */
to_N(x) { return x*mec.m_u; },
/**
 * convert [N] = [kgm/s^2] => [kgu/s^2]
 * @return {number} Value in [kgu/s^2]
 */
from_N(x) { return x/mec.m_u; },
/**
 * convert [kgu^2/m^2] => [kgm^2/s^2] = [Nm]
 * @return {number} Value in [Nm]
 */
to_Nm(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [Nm] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_Nm(x) { return x/mec.m_u/mec.m_u; },
/**
 * convert [N/m] => [kg/s^2] = [N/m] (spring rate)
 * @return {number} Value in [N/m]
 */
to_N_m(x) { return x; },
/**
 * convert [N/m] = [kg/s^2] => [k/s^2]
 * @return {number} Value in [kg/s^2]
 */
from_N_m(x) { return x; },
/**
 * convert [kgu/m^2] => [kgm^2/s^2] = [J]
 * @return {number} Value in [N]
 */
to_J(x) { return mec.to_Nm(x) },
/**
 * convert [J] = [kgm^2/s^2] => [kgu^2/s^2]
 * @return {number} Value in [kgu^2/s^2]
 */
from_J(x)  { return mec.from_Nm(x) },
/**
 * convert [kgu^2] => [kgm^2]
 * @return {number} Value in [kgm^2]
 */
to_kgm2(x) { return x*mec.m_u*mec.m_u; },
/**
 * convert [kgm^2] => [kgu^2]
 * @return {number} Value in [kgu^2]
 */
from_kgm2(x) { return x/mec.m_u/mec.m_u; },
/**
 * Helper functions
 */
/**
 * Test, if the absolute value of a number `a` is smaller than eps.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {boolean} test result.
 */
isEps(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS); 
 },
 /**
 * If the absolute value of a number `a` is smaller than eps, it is set to zero.
 * @param {number} a Value to test.
 * @param {number} [eps=mec.EPS]  used epsilon.
 * @returns {number} original value or zero.
 */
toZero(a,eps) {
    return a < (eps || mec.EPS) && a > -(eps || mec.EPS) ? 0 : a;
},
/**
 * Clamps a numerical value linearly within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
clamp(val,lo,hi) { return Math.min(Math.max(val, lo), hi); },
/**
 * Clamps a numerical value asymptotically within the provided bounds.
 * @param {number} val Value to clamp.
 * @param {number} lo Lower bound.
 * @param {number} hi Upper bound.
 * @returns {number} Value within the bounds.
 */
asympClamp(val,lo,hi) {
    const dq = hi - lo;
    return dq ? lo + 0.5*dq + Math.tanh(((Math.min(Math.max(val, lo), hi) - lo)/dq - 0.5)*5)*0.5*dq : lo;
},
/**
 * Convert angle from degrees to radians.
 * @param {number} deg Angle in degrees.
 * @returns {number} Angle in radians.
 */
toRad(deg) { return deg*Math.PI/180; },
/**
 * Convert angle from radians to degrees.
 * @param {number} rad Angle in radians.
 * @returns {number} Angle in degrees.
 */
toDeg(rad) { return rad/Math.PI*180; },
/**
 * Mixin a set of prototypes into a primary object.
 * @param {object} obj Primary object.
 * @param {objects} ...protos Set of prototype objects.
 */
mixin(obj, ...protos) {
    protos.forEach(proto => {
        obj = Object.defineProperties(obj, Object.getOwnPropertyDescriptors(proto))
    })
    return obj;
}
}