ctxm = {
    header: (elm,type) => `<h6 class="mb-0">${type} <span style="font-family:roboto;font-weight:500;font-style:italic;">${elm.id}</span></h6>`, // stringified constraints have no type: ${elm.type}
    sectionTitle: (title) => `<div class="section-divider"></div><label class="input-group-text ctxm-section-title">${title} </label>`,
    // constraintType: (elm) => { // probably not needed
    //     return `<div class="input-group">
    //         <label class="input-group-text">constraint-type: </label>
    //         <select class="custom-select" id="select-type">
    //             <option value="tran" ${(elm.type === 'tran' ? 'selected' : '')}>tran</option>
    //             <option value="rot"  ${(elm.type === 'rot' ? 'selected' : '')}>rot</option>
    //             <option value="free" ${(elm.type === 'free' ? 'selected' : '')}>free</option>
    //             <option value="ctrl" ${(elm.type === 'ctrl' ? 'selected' : '')}>ctrl</option>
    //         </select>
    //     </div>`
    // },

    // constraint templates
    nodes: (elm) => {
        let select = `<div class="input-group">`,       // add head
            selectP1 = `<label class="ctxm-input-label">p1: </label>
                        <select class="custom-select" id="select-p1">`, 
            selectP2 = `<label class="ctxm-input-label">p2: </label>
                        <select class="custom-select" id="select-p2">`;
        
        app.model.nodes.forEach(node => { //  add options
            selectP1 += `<option value="${node.id}" ${(((elm.p1.id === node.id) || (elm.p1 === node.id)) ? 'selected' : '')}>${node.id}</option>`;
            selectP2 += `<option value="${node.id}" ${(((elm.p2.id === node.id) || (elm.p2 === node.id)) ? 'selected' : '')}>${node.id}</option>`;
        });

        selectP1 += `</select>`;
        selectP2 += `</select>`;

        select += selectP1 + selectP2 + `</div>`; // append and add tail

        return select;
    },
    oriType: (elm) => `<li class="input-group">
                            <label class="ctxm-input-label">type: </label>
                            <select class="custom-select" id="select-ori-type">
                                <option value="free" ${(elm.ori.type === 'free' ? 'selected' : '')}>free</option>
                                <option value="const"  ${(elm.ori.type === 'const' ? 'selected' : '')}>const</option>
                                <option value="ref"  ${(elm.ori.type === 'ref' ? 'selected' : '')}>ref</option>
                             <!-- <option value="drive" ${(elm.ori.type === 'drive' ? 'selected' : '')}>drive</option> -->
                            </select>
                        </li>`
    ,
    lenType: (elm) => `<li class="input-group">
                            <label class="ctxm-input-label">type: </label>
                            <select class="custom-select" id="select-len-type">
                                <option value="free" ${(elm.len.type === 'free' ? 'selected' : '')}>free</option>
                                <option value="const"  ${(elm.len.type === 'const' ? 'selected' : '')}>const</option>
                                <option value="ref"  ${(elm.len.type === 'ref' ? 'selected' : '')}>ref</option>
                             <!-- <option value="drive" ${(elm.len.type === 'drive' ? 'selected' : '')}>drive</option> -->
                            </select>
                        </li>`
    ,
    ref: (elm, type = 'ori', refId) => {
        let select = `<div class="input-group">
        <label class="ctxm-input-label">referenced: </label>
        <select class="custom-select" id="select-${type}-ref">`; // add head
        
        app.model.constraints.forEach(el => { //  add options
            if (!(el.id === elm.id))
                select += `<option value="${el.id}" ${(refId === el.id ? 'selected' : '')}>${el.id}</option>`
        });

        select += `</select></div>`; // add tail

        return select
    },
    removeConstraintButton: () => `<div class="section-divider"></div><li class="input-group" style="height:28px;"><div class="ctxm-right"><i id="constraint-trash" class="fas fa-trash-alt fa-lg"></i></div></li>`,

    //node templates
    nodeCoordinates: (elm) => `<li class="input-group">
                                    <label class="ctxm-input-label">X: </label>
                                    <input type="number" id="node-x" value="${Math.round(elm.x)}">
                                    <label class="ctxm-input-label">Y: </label>
                                    <input type="number" id="node-y" value="${Math.round(elm.y)}">
                               </li>`
    ,
    nodeMass: (elm) => `<li class="input-group">
                            <label class="ctxm-input-label">basenode: </label>
                            <input type="checkbox" id="node-mass" ${((elm.m === 'infinite' || elm.m === Number.POSITIVE_INFINITY) ? 'checked' : '')}>
                            <div class="ctxm-right"><i id="node-trash" class="fas fa-trash-alt fa-lg"></i></div> 
                        </li>`
};