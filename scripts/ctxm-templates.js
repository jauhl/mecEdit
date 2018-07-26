ctxm = {
    header: (elm,type) => {
        return `<h6 class="mb-0">${type} id: ${elm.id}</h6>` // stringified constraints have no type: ${elm.type}
    },
    sectionTitle(title) {
        return `<div class="section-divider"></div><label class="input-group-text ctxm-section-title">${title} </label>`
    },
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
    nodes(elm) {
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
    oriType: (elm) => {
        return `<li class="input-group">
            <label class="ctxm-input-label">type: </label>
            <select class="custom-select" id="select-ori-type">
                <option value="free" ${(elm.ori.type === 'free' ? 'selected' : '')}>free</option>
                <option value="const"  ${(elm.ori.type === 'const' ? 'selected' : '')}>const</option>
                <option value="ref"  ${(elm.ori.type === 'ref' ? 'selected' : '')}>ref</option>
             <!-- <option value="drive" ${(elm.ori.type === 'drive' ? 'selected' : '')}>drive</option> -->
            </select>
        </li>`
    },
    lenType: (elm) => {
        return `<li class="input-group">
            <label class="ctxm-input-label">type: </label>
            <select class="custom-select" id="select-len-type">
                <option value="free" ${(elm.len.type === 'free' ? 'selected' : '')}>free</option>
                <option value="const"  ${(elm.len.type === 'const' ? 'selected' : '')}>const</option>
                <option value="ref"  ${(elm.len.type === 'ref' ? 'selected' : '')}>ref</option>
             <!-- <option value="drive" ${(elm.len.type === 'drive' ? 'selected' : '')}>drive</option> -->
            </select>
        </li>`
    },
    ref: (elm, type = 'ori', refId) => {
        // let curRefId;
        // if (type === 'ori') {
        //     curRefId = !!elm.ori.ref ? elm.ori.ref : app.model.constraints[0].id
        // } else {
        //     curRefId = !!elm.len.ref ? elm.len.ref : app.model.constraints[0].id
        // };
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
    nodeCoordinates(elm) {
        return `<li class="input-group">
                    <label class="ctxm-input-label">X: </label>
                    <input type="number" id="node-x" value="${elm.x}">
                    <label class="ctxm-input-label">Y: </label>
                    <input type="number" id="node-y" value="${elm.y}">
                </li>`
    },
    nodeMass(elm) {
        return `<li class="input-group">
                    <label class="ctxm-input-label">basenode: </label>
                    <input type="checkbox" id="node-mass" ${(elm.m === 'infinite' ? 'checked' : '')}>
                </li>`
    }
};