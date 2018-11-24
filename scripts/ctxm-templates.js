'use-strict';
ctxm = {
    header: (elm,type) => `<h6 class="mb-0">${type} <span style="font-family:roboto;font-weight:500;font-style:italic;">${elm.id}</span></h6>`, // stringified constraints have no type: ${elm.type}
    sectionTitle: (title) => `<div class="section-divider"></div><label class="input-group-text ctxm-section-title">${title} </label>`,

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
    oriType: (elm) => {
        console.log(app.model.constraints.length);
        let str = `<li class="input-group">
                            <label class="ctxm-input-label">type: </label>
                            <select class="custom-select" id="select-ori-type">
                                <option value="free" ${((!elm.ori || elm.ori.type === 'free') ? 'selected' : '')}>free</option>
                                <option value="const"  ${((!!elm.ori && elm.ori.type === 'const') ? 'selected' : '')}>const</option>`;
        if (app.model.constraints.length > 1) // min 2 contraints for ref
            str += `<option value="ref"  ${((!!elm.ori && elm.ori.type === 'ref') ? 'selected' : '')}>ref</option>`;
        str += `<option value="drive" ${((!!elm.ori && elm.ori.type === 'drive') ? 'selected' : '')}>drive</option></select></li>`;
        return str;
    },
    lenType: (elm) => {
        let str = `<li class="input-group">
                        <label class="ctxm-input-label">type: </label>
                        <select class="custom-select" id="select-len-type">
                            <option value="free" ${((!elm.len || elm.len.type === 'free') ? 'selected' : '')}>free</option>
                            <option value="const"  ${((!!elm.len && elm.len.type === 'const') ? 'selected' : '')}>const</option>`;
        if (app.model.constraints.length > 1) // min 2 contraints for ref
            str += `<option value="ref"  ${((!!elm.len && elm.len.type === 'ref') ? 'selected' : '')}>ref</option>`;
        str += `<option value="drive" ${((!!elm.len && elm.len.type === 'drive') ? 'selected' : '')}>drive</option></select></li>`;
        return str;
    },
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
    Dt: (elm, type = 'ori') => {
        let template = `<li class="input-group" style="padding:.1rem;">
                      <label class="ctxm-input-label" style="width:2.5rem;">Dt: </label>`;
        template += (type === 'ori') ?              
              `<input type="number" class="custom-number-input ctxm-number" id="ori-drive-Dt" step="any" value="${elm.ori.Dt.toFixed(3)}">`
            : `<input type="number" class="custom-number-input ctxm-number" id="len-drive-Dt" step="any" value="${elm.len.Dt.toFixed(3)}">`;
        template +=`<a style="margin-left:.6rem;margin-top:auto;">input?</a></li>`;

        return template;
    },
    Dw: (elm) => `<li class="input-group" style="padding:.1rem;">
                      <label class="ctxm-input-label" style="width:2.5rem;">Dw: </label>            
                      <input type="number" class="custom-number-input ctxm-number" id="ori-drive-Dw" step="any" value="${elm.ori.Dw.toFixed(3)}">
                      <input type="checkbox" id="ori-input" class="cbx d-none" ${(elm.ori.hasOwnProperty('input') && elm.ori.input ? 'checked' : '')}>
                      <label class="lbl" for="ori-input" style="margin-left:.8rem"></label>
                  </li>`
    ,
    Dr: (elm) => `<li class="input-group" style="padding:.1rem;">
                      <label class="ctxm-input-label" style="width:2.5rem;">Dr: </label>            
                      <input type="number" class="custom-number-input ctxm-number" id="len-drive-Dr" step="any" value="${elm.len.Dr.toFixed(3)}">
                      <input type="checkbox" id="len-input" class="cbx d-none" ${(elm.len.hasOwnProperty('input') && elm.len.input ? 'checked' : '')}>
                      <label class="lbl" for="len-input" style="margin-left:.8rem"></label>
                  </li>`
    ,
    removeConstraintButton: () => `<div class="section-divider"></div><li class="input-group" style="height:28px;"><div id="constraint-trash" class="ctxm-right"><svg class="svg-icon" width="22px" height="22px" viewBox="0 0 448 512">                             <path d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"                             fill="currentColor"/>                         </svg></div></li>`,

    //node templates
    nodeCoordinates: (elm) => `<li class="input-group" style="padding:.1rem;">
                                    <label class="ctxm-input-label">X: </label>
                                    <input type="number" class="custom-number-input" id="node-x" step="1" value="${Math.round(elm.x)}">
                                    <label class="ctxm-input-label">Y: </label>
                                    <input type="number" class="custom-number-input" id="node-y" step="1" value="${Math.round(elm.y)}">
                               </li>`
    ,
    nodeBase: (elm) => `<div class="section-divider"></div>
                        <li class="input-group">
                            <div class="d-flex">
                                <label class="ctxm-input-label">base: </label>
                                <input type="checkbox" id="node-base" class="cbx d-none" ${(elm.base ? 'checked' : '')}>
                                <label class="lbl" for="node-base"></label>
                            </div>
                            <div id="node-trash" class="ctxm-right"><svg class="svg-icon" width="22px" height="22px" viewBox="0 0 448 512">
                            <path d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"
                            fill="currentColor"/>
                        </svg></div> 
                        </li>`
    ,
    // force templates
    forceNode: (elm) => {
            let select = `<div class="section-divider" style="margin:.1rem!important"></div><div class="input-group" style="padding:.1rem">`,       // add head
                selectP = `<label class="ctxm-input-label">p: </label>
                            <select class="custom-select" id="select-force-node" style="max-width:4rem!important;">`;
            
            app.model.nodes.forEach(node => { //  add options
                selectP += `<option value="${node.id}" ${(((elm.p.id === node.id) || (elm.p === node.id)) ? 'selected' : '')}>${node.id}</option>`;
            });
    
            select += selectP + `</select><div id="force-trash" class="ctxm-right"><svg class="svg-icon" width="22px" height="22px" viewBox="0 0 448 512">                             <path d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"                             fill="currentColor"/>                         </svg></div></div>`; // append and add tail
    
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
                              <label class="ctxm-input-label">value [N]: </label>
                              <input type="number" class="custom-number-input" id="force-value" step="1" value="${mec.to_N(app.model.loadById(`${elm.id}`).value)}">
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
    springK: (elm) => `<div class="section-divider"></div>
                       <li class="input-group" style="padding-top:.3rem;">
                           <label class="ctxm-input-label">k [N/m]: </label>
                           <input type="number" class="custom-number-input" id="spring-k" step="any" value="${mec.to_N_m(app.model.loadById(`${elm.id}`).k)}" style="margin-left:.1rem!important;">
                           <div id="spring-trash" class="ctxm-right" style="padding-top:.25rem!important;"><svg class="svg-icon" width="22px" height="22px" viewBox="0 0 448 512">                             <path d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"                             fill="currentColor"/>                         </svg></div> 
                       </li>`
    ,
    springLen: (elm) => `<div class="section-divider"></div>
                         <li class="input-group" style="padding-top:.3rem;">
                           <label class="ctxm-input-label">len0 [u]: </label>
                           <input type="number" class="custom-number-input" id="spring-len0" step="any" value="${app.model.loadById(`${elm.id}`).len0.toFixed(4)}" style="min-width:6rem!important;margin-left:.15rem!important;">
                         </li>`
    ,
    removeSpringButton: () => `<div class="section-divider"></div><li class="input-group" style="height:28px;"><div id="spring-trash" class="ctxm-right"><svg class="svg-icon" width="22px" height="22px" viewBox="0 0 448 512">                             <path d="M192 188v216c0 6.627-5.373 12-12 12h-24c-6.627 0-12-5.373-12-12V188c0-6.627 5.373-12 12-12h24c6.627 0 12 5.373 12 12zm100-12h-24c-6.627 0-12 5.373-12 12v216c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12V188c0-6.627-5.373-12-12-12zm132-96c13.255 0 24 10.745 24 24v12c0 6.627-5.373 12-12 12h-20v336c0 26.51-21.49 48-48 48H80c-26.51 0-48-21.49-48-48V128H12c-6.627 0-12-5.373-12-12v-12c0-13.255 10.745-24 24-24h74.411l34.018-56.696A48 48 0 0 1 173.589 0h100.823a48 48 0 0 1 41.16 23.304L349.589 80H424zm-269.611 0h139.223L276.16 50.913A6 6 0 0 0 271.015 48h-94.028a6 6 0 0 0-5.145 2.913L154.389 80zM368 128H80v330a6 6 0 0 0 6 6h276a6 6 0 0 0 6-6V128z"                             fill="currentColor"/>                         </svg></div></li>`,
    viewModal: () => `<div class="modal-header bg-dark text-white">
                          <h5 class="modal-title">add view component</h5>
                          <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                      </div>
                      <div id="view-body" class="modal-body">
                          ${ctxm.viewContent()}
                      </div>
                      <div class="modal-footer">
                          <button type="button" id="view-cancel" class="btn btn-default" data-dismiss="modal">Cancel</button>
                          <button type="button" id="view-accept" class="btn btn-primary" id="modalAccept">Accept</button>
                      </div>`,
    viewContent: () => {
        let template;
        template = `<div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text view-inputtext">id: </span>
                        </div>
                        <input type="text" class="form-control" id="input-view-id" placeholder="enter id" value="${app.tempElm.new.id}" aria-label="view-id" onchange="app.tempElm.new.id = this.value">
                    </div>`
        
        template += `<div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <label class="input-group-text view-inputtext" for="select-view-type">type: </label>
                        </div>
                        <select class="custom-select" id="select-view-type">
                            <option value="trace" ${app.tempElm.new.type === 'trace' ? 'selected' : ''}>trace</option>
                            <option value="vector" ${app.tempElm.new.type === 'vector' ? 'selected' : ''}>vector</option>
                            <option value="info" ${app.tempElm.new.type === 'info' ? 'selected' : ''}>info</option>
                        </select>
                    </div>`
        
        if (['vector','trace'].includes(app.tempElm.new.type)) {
            // p
            if (app.tempElm.new.hasOwnProperty('elem'))
                delete app.tempElm.new.elem;
            if (!app.tempElm.new.hasOwnProperty('p'))
                app.tempElm.new.p = app.model.nodes[0].id;

            template += `<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <label class="input-group-text view-inputtext" for="select-view-p">p: </label>
                            </div>
                            <select class="custom-select" id="select-view-p">`; // add head
            
            app.model.nodes.forEach(node => { //  add options
                template += `<option value="${node.id}" ${((app.tempElm.new.p === node.id) ? 'selected' : '')}>${node.id}</option>`;
            });

            template += `</select></div>`; // add tail
        };

        if (app.tempElm.new.type === 'trace') {
            let fillcolorDisabled =  false;
            let fillcolorBtn = document.getElementById('view-fill-color-btn');

            if (!app.tempElm.new.hasOwnProperty('stroke'))    
                app.tempElm.new.stroke = '#ff0000';
            if (!fillcolorBtn || !app.tempElm.new.hasOwnProperty('fill')) 
                fillcolorDisabled = true;

            template += `<div class="input-group mb-3 justify-content-between">
                             <div class="d-inline-flex">
                             <div class="input-group-prepend">
                                 <span class="input-group-text view-inputtext">stroke: </span>
                             </div>
                             <input type="color" id="view-stroke-color" name="color" value="${app.tempElm.new.stroke}"/>
                             </div>
                             <div class="d-inline-flex">
                             <div class="input-group-prepend">
                                 <button id="view-fill-color-btn" class="btn input-group-text view-inputtext">fill: </buttton>
                             </div>
                             <input type="color" id="view-fill-color" name="color" value="${app.tempElm.new.hasOwnProperty('fill') ? app.tempElm.new.fill : '#009900'}" ${fillcolorDisabled?'disabled':''}/>
                             </div>
                         </div>`
        };

        if (app.tempElm.new.type === 'info') {
            // p
            if (app.tempElm.new.hasOwnProperty('p'))
                delete app.tempElm.new.p;
            if (!app.tempElm.new.hasOwnProperty('elem'))    
                app.tempElm.new.elem = app.model.nodes[0].id;

            template += `<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <label class="input-group-text view-inputtext" for="select-view-elem">elem: </label>
                            </div>
                            <select class="custom-select" id="select-view-elem">`; // add head
            
            app.model.nodes.forEach(node => { //  add options
                template += `<option value="${node.id}" ${((app.tempElm.new.elem === node.id) ? 'selected' : '')}>${node.id}</option>`;
            });
            app.model.constraints.forEach(constraint => { //  add options
                template += `<option value="${constraint.id}" ${((app.tempElm.new.elem === constraint.id) ? 'selected' : '')}>${constraint.id}</option>`;
            });

            template += `</select></div>`; // add tail
        };

        if (['vector','info'].includes(app.tempElm.new.type)) {
            // value
            if (!app.tempElm.new.hasOwnProperty('value'))
                app.tempElm.new.value = 'acc'; // first in array for vec & node infos

            template += `<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <label class="input-group-text view-inputtext" for="select-view-value">value: </label>
                            </div>
                            <select class="custom-select" id="select-view-value">`; // add head

            //  add options
            console.log(app.model.elementById(app.tempElm.new.elem).type);
            if (app.tempElm.new.type === 'info' && app.model.elementById(app.tempElm.new.elem).type === 'node') {
                app.nodeInfoValues.forEach(value => {
                    app.tempElm.new.value = 'acc'; // force select first option
                    template += `<option value="${value}" ${((app.tempElm.new.value === value) ? 'selected' : '')}>${value}</option>`;
                });
            } else if (app.tempElm.new.type === 'vector' && app.model.elementById(app.tempElm.new.p).type === 'node') {
                app.tempElm.new.value = 'acc'; // force select first option
                app.nodeVectorValues.forEach(value => {
                    template += `<option value="${value}" ${((app.tempElm.new.value === value) ? 'selected' : '')}>${value}</option>`;
                });
            } else if (app.tempElm.new.type === 'info' && ['free','tran','rot','ctrl'].includes(app.model.elementById(app.tempElm.new.elem).type)) {
                app.tempElm.new.value = 'w'; // force select first option
                app.constraintInfoValues.forEach(value => {
                    template += `<option value="${value}" ${((app.tempElm.new.value === value) ? 'selected' : '')}>${value}</option>`;
                });
            };

            template += `</select></div>`; // add tail
        }

        return template;
    }
};