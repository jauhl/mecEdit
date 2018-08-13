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
                                <option value="free" ${((!elm.ori || elm.ori.type === 'free') ? 'selected' : '')}>free</option>
                                <option value="const"  ${((!!elm.ori && elm.ori.type === 'const') ? 'selected' : '')}>const</option>
                                <option value="ref"  ${((!!elm.ori && elm.ori.type === 'ref') ? 'selected' : '')}>ref</option>
                             <!-- <option value="drive" ${((!!elm.ori && elm.ori.type === 'drive') ? 'selected' : '')}>drive</option> -->
                            </select>
                        </li>`
    ,
    lenType: (elm) => `<li class="input-group">
                            <label class="ctxm-input-label">type: </label>
                            <select class="custom-select" id="select-len-type">
                                <option value="free" ${((!elm.len || elm.len.type === 'free') ? 'selected' : '')}>free</option>
                                <option value="const"  ${((!!elm.len && elm.len.type === 'const') ? 'selected' : '')}>const</option>
                                <option value="ref"  ${((!!elm.len && elm.len.type === 'ref') ? 'selected' : '')}>ref</option>
                             <!-- <option value="drive" ${((!!elm.len && elm.len.type === 'drive') ? 'selected' : '')}>drive</option> -->
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
    removeConstraintButton: () => `<div class="section-divider"></div><li class="input-group" style="height:28px;"><div id="constraint-trash" class="ctxm-right"><i class="fas fa-trash-alt fa-lg"></i></div></li>`,

    //node templates
    nodeCoordinates: (elm) => `<li class="input-group" style="padding:.1rem;">
                                    <label class="ctxm-input-label">X: </label>
                                    <input type="number" class="custom-number-input" id="node-x" step="1" value="${Math.round(elm.x)}">
                                    <label class="ctxm-input-label">Y: </label>
                                    <input type="number" class="custom-number-input" id="node-y" step="1" value="${Math.round(elm.y)}">
                               </li>`
    ,
    nodeBase: (elm,traced = false) => `<div class="section-divider"></div>
                        <li class="input-group">
                            <div class="d-flex">
                                <label class="ctxm-input-label">base: </label>
                                <input type="checkbox" id="node-base" class="cbx d-none" ${(elm.base ? 'checked' : '')}>
                                <label class="lbl" for="node-base"></label>
                            </div>
                            <div class="d-flex">
                                <label class="ctxm-input-label">trace: </label>
                                <input type="checkbox" id="node-trace" class="cbx d-none" ${(traced ? 'checked' : '')}>
                                <label class="lbl" for="node-trace"></label>
                            </div>
                            <div id="node-trash" class="ctxm-right"><i class="fas fa-trash-alt fa-lg"></i></div> 
                        </li>`
    ,
    // force templates
    forceNode: (elm) => {
            let select = `<div class="section-divider" style="margin:.1rem!important"></div><div class="input-group">`,       // add head
                selectP = `<label class="ctxm-input-label">p: </label>
                            <select class="custom-select" id="select-force-node" style="max-width:4rem!important;">`;
            
            app.model.nodes.forEach(node => { //  add options
                selectP += `<option value="${node.id}" ${(((elm.p.id === node.id) || (elm.p === node.id)) ? 'selected' : '')}>${node.id}</option>`;
            });
    
            select += selectP + `</select><div id="force-trash" class="ctxm-right"><i class="fas fa-trash-alt fa-lg"></i></div></div>`; // append and add tail
    
            return select;
    },
    forceMode: (elm) => `<div class="section-divider" style="margin:.1rem!important"></div><div class="input-group" style="padding:.1rem">
                           <label class="ctxm-input-label">mode: </label>
                           <select class="custom-select" id="select-force-mode">
                             <option value="push" ${((!!elm.mode && (elm.mode === 'push')) ? 'selected' : '')}>push</option>
                             <option value="pull" ${(!(!!elm.mode && (elm.mode === 'push')) ? 'selected' : '')}>pull</option>
                           </select>
                         </div>`
    ,
    forceValue: (elm) => `<li class="input-group" style="padding:.1rem;">
                              <label class="ctxm-input-label">value: </label>
                              <input type="number" class="custom-number-input" id="force-value" step="1" value="${app.model.loadById(`${elm.id}`).value}">
                          </li>`
    ,
    springNodes: (elm) => {
        let select = `<div class="section-divider"></div><div class="input-group" style="padding-top:.3rem;">`,       // add head
            selectP1 = `<label class="ctxm-input-label">p1: </label>
                        <select class="custom-select" id="select-spring-p1" style="max-width:4rem!important;">`, 
            selectP2 = `<label class="ctxm-input-label">p2: </label>
                        <select class="custom-select" id="select-spring-p2" style="max-width:4rem!important;">`;
        
        app.model.nodes.forEach(node => { //  add options
            selectP1 += `<option value="${node.id}" ${(((elm.p1.id === node.id) || (elm.p1 === node.id)) ? 'selected' : '')}>${node.id}</option>`;
            selectP2 += `<option value="${node.id}" ${(((elm.p2.id === node.id) || (elm.p2 === node.id)) ? 'selected' : '')}>${node.id}</option>`;
        });

        selectP1 += `</select>`;
        selectP2 += `</select>`;

        select += selectP1 + selectP2 + `</div>`; // append and add tail

        return select;
    },
    // springProps: (elm) => `<li class="input-group" style="padding-top:.3rem;">
    //                        <label class="ctxm-input-label">k: </label>
    //                        <input type="number" class="custom-number-input" id="spring-k" step="1" value="${app.model.loadById(`${elm.id}`).k}">
    //                        <label class="ctxm-input-label">len0: </label>
    //                        <input type="number" class="custom-number-input" id="spring-len0" step="1" value="${app.model.loadById(`${elm.id}`).len0.toFixed(2)}" style="width:4.5rem !important;">
    //                    </li>`
    // ,
    springK: (elm) => `<div class="section-divider"></div>
                       <li class="input-group" style="padding-top:.3rem;">
                           <label class="ctxm-input-label">k: </label>
                           <input type="number" class="custom-number-input" id="spring-k" step="1" value="${app.model.loadById(`${elm.id}`).k}" style="margin-left:1.35rem!important;">
                           <div id="spring-trash" class="ctxm-right" style="padding-top:.25rem!important;"><i class="fas fa-trash-alt fa-lg"></i></div> 
                       </li>`
    ,
    springLen: (elm) => `<div class="section-divider"></div>
                         <li class="input-group" style="padding-top:.3rem;">
                           <label class="ctxm-input-label">len0: </label>
                           <input type="number" class="custom-number-input" id="spring-len0" step="1" value="${app.model.loadById(`${elm.id}`).len0.toFixed(4)}" style="min-width:6rem!important;">
                         </li>`
    ,
    removeSpringButton: () => `<div class="section-divider"></div><li class="input-group" style="height:28px;"><div id="spring-trash" class="ctxm-right"><i class="fas fa-trash-alt fa-lg"></i></div></li>`
    // ,
    // springL0: (elm) => `<li class="input-group" style="padding:.1rem;">
    //                         <label class="ctxm-input-label">len0: </label>
    //                         <input type="number" class="custom-number-input" id="spring-l0" step="1" value="${app.model.loadById(`${elm.id}`).len0.toFixed(2)}">
    //                     </li>`
};