/**
 * mec.msg.en (c) 2018 Stefan Goessner
 * @license MIT License
 */
"use strict";

/**
 * @namespace mec.msg.en namespace for English mec related messages.
 */
mec.msg.en = {
    // User interface related messages
    U_SEL_SECOND_NODE: () => `Select second node.`,

    // Logical warnings
    W_CSTR_NODES_COINCIDE: ({cstr,p1,p2}) => `Warning: Nodes '${p1}' and '${p2}' of constraint '${cstr}' coincide.`,

    // Logical errors / warnings
    E_ELEM_ID_MISSING: ({elemtype,idx}) => `${elemtype} with index ${idx} must have an id defined.`,
    E_ELEM_ID_AMBIGIOUS: ({elemtype,id}) => `${elemtype} id '${id}' is ambigious.`,
    W_ELEM_ID_MISSING: ({elemtype,idx}) => `${elemtype} with index ${idx} should have an id defined.`,
    E_ELEM_REF_MISSING: ({elemtype,id,idx,reftype,name}) => `${elemtype} '${id || idx}' must have a ${reftype} reference '${name}' defined.`,
    E_ELEM_INVALID_REF: ({elemtype,id,idx,reftype,name,}) => `${reftype} reference '${name}' of ${elemtype} '${id || idx}' is invalid.`,

    E_NODE_MASS_TOO_SMALL: ({id,m}) => `Node's (id='${id}') mass of ${m} is too small.`,

    E_CSTR_NODE_MISSING: ({id, loc, p}) => `${loc} node '${p}' of constraint (id='${id}') is missing.`,
    E_CSTR_NODE_NOT_EXISTS: ({id,loc,p,nodeId}) => `${loc} node '${p}':'${nodeId}' of constraint '${id}' does not exist.`,
    E_CSTR_REF_NOT_EXISTS: ({id,sub,ref}) => `Reference to '${ref}' in '${sub} of constraint '${id}' does not exist.`,
    E_CSTR_DRIVEN_REF_TO_FREE: ({id,sub,ref, reftype}) => `Driven ${sub} constraint of '${id}' must not reference free ${reftype} of constraint '${ref}'.`,
    W_CSTR_RATIO_IGNORED: ({id,sub,ref,reftype}) => `Ratio value of driven ${sub} constraint '${id}' with reference to '${reftype}' constraint '${ref}' ignored.`,

    E_FORCE_VALUE_INVALID: ({id,val}) => `Force value '${val}' of load '${id}' is not allowed.`,
    E_SPRING_RATE_INVALID: ({id,val}) => `Spring rate '${val}' of load '${id}' is not allowed.`,

    E_POLY_PTS_MISSING: ({id,idx}) => `Polygon shape '${id || idx}' must have a points array 'pts' defined.`,
    E_POLY_PTS_INVALID: ({id,idx}) => `Polygon shape '${id || idx}' must have a points array 'pts' with at least two points defined.`,

    E_IMG_URI_MISSING: ({id,idx}) => `Image shape '${id || idx}' must have an uniform resource locator 'uri' defined.`,

    E_ALY_REF_MISSING: ({id,idx}) => ({elemtype,id,idx,reftype,name}) => `${elemtype} '${id || idx}' must have with '${name}' an existing property name of a ${reftype} specified. One of ${keys} are supported.`,
    E_ALY_REF_INVALID: ({id,idx}) => ({elemtype,id,idx,reftype,name}) => `${elemtype} '${id || idx}' has with '${name}' an invalid property name of a ${reftype} specified. One of ${keys} are supported.`,
}

