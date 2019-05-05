'use-strict';
const tmpl = {
    header: (elm,type) => `<h6 class="mb-0">${type} <span style="font-family:roboto;font-weight:500;font-style:italic;">${elm.id}</span></h6>`, // stringified constraints have no type: ${elm.type}
    sectionTitle: (title,elm) => {
        let value = title === 'ori' ? 'w' : title === 'len' ? 'r' : false,
            template = `<div class="section-divider"></div>
                        <li class="input-group">
                            <label class="input-group-text ctxm-section-title"style="font-family:roboto;font-weight:500;">${title}</label>
                            ${value?`<div class="ctxm-right">${`${value}: ${(app.model.constraintById(elm.id)[`${value}`]*mec.aly[`${value}`].scl).toPrecision(3)} ${mec.aly[`${value}`].unit}`}</div>`:''}
                        </li>`;
        return template;
    },

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
        let str = `<li class="input-group">
                            <label class="ctxm-input-label">type: </label>
                            <select class="custom-select" id="select-ori-type">
                                <option value="free" ${((!elm.ori || elm.ori.type === 'free') ? 'selected' : '')}>free</option>
                                <option value="const"  ${((!!elm.ori && elm.ori.type === 'const') ? 'selected' : '')}>const</option>`;
        str += `<option value="drive" ${((!!elm.ori && elm.ori.type === 'drive') ? 'selected' : '')}>drive</option></select></li>`;
        return str;
    },
    lenType: (elm) => {
        let str = `<li class="input-group">
                        <label class="ctxm-input-label">type: </label>
                        <select class="custom-select" id="select-len-type">
                            <option value="free" ${((!elm.len || elm.len.type === 'free') ? 'selected' : '')}>free</option>
                            <option value="const"  ${((!!elm.len && elm.len.type === 'const') ? 'selected' : '')}>const</option>`;
        str += `<option value="drive" ${((!!elm.len && elm.len.type === 'drive') ? 'selected' : '')}>drive</option></select></li>`;
        return str;
    },
    ref: (elm, type = 'ori', refId = 'none') => {
        let select = `<div class="input-group">
        <label class="ctxm-input-label">referenced: </label>
        <select class="custom-select" id="select-${type}-ref">
        <option value="" ${(refId === 'none' ? 'selected' : '')}>none</option>`; // add head

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
                              <input type="number" class="custom-number-input" id="force-value" step="1" value="${mec.to_N(app.model.loadById(`${elm.id}`)._value)}">
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
                           <input type="number" class="custom-number-input" id="spring-k" step="any" value="${mec.to_N_m(app.model.loadById(`${elm.id}`)._k)}" style="margin-left:.1rem!important;">
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
                          ${tmpl.viewContent()}
                      </div>
                      <div class="modal-footer">
                          <button type="button" id="view-cancel" class="btn btn-default" data-dismiss="modal">Cancel</button>
                          <button type="button" id="view-accept" class="btn btn-primary" id="modalAccept">Accept</button>
                      </div>`
    ,
    viewContent: () => {

        /**************** ID property *****************/
        // template holds markup-string
        let template = `<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text view-inputtext">id: </span>
                            </div>
                            <input type="text" class="form-control" id="input-view-id" placeholder="view${app.model.views.length + 1}" value="${app.tempElm.new.id}" aria-label="view-id" onchange="app.tempElm.new.id = this.value">
                        </div>`;



        /**************** SHOW property *****************/

        // head of 'show'-select
        template += tmpl.selectHead('show', false, 'Value to analyse');

        // // body of 'show'-select
        // // add all possible options for analysis from mec.core.js' aly object, select app.tempElm.new.show = 'pos' by default as set in app.js
        // Object.keys(mec.aly).forEach(aly => {
        //     if (aly !== 't')
        //         template += `<option value="${aly}" ${app.tempElm.new.show === aly ? 'selected' : ''}>${aly}</option>`;
        // });
        // // center of gravity 'cog' is only possible for the full model
        // template += `<option value="cog" ${app.tempElm.new.show === 'cog' ? 'selected' : ''}>cog</option>`;

        // body of 'show'-select
        // add all options from app.alyValues.all, select app.tempElm.new.show = 'pos' by default as set in app.js
        app.alyValues.all.forEach(aly => {
            template += `<option value="${aly}" ${app.tempElm.new.show === aly ? 'selected' : ''}>${aly}</option>`;
        });

        // tail of 'show'-select
        template += tmpl.selectTail();



        /**************** OF property *****************/
        // evaluate possible types of elements for selected of-property
        let elmType =   (app.alyValues.forNodes.includes(app.tempElm.new.show) && app.tempElm.new.show !== 'forceAbs') ? 'node'
                      : (app.alyValues.forConstraints.includes(app.tempElm.new.show) && app.tempElm.new.show !== 'forceAbs') ? 'constraint'
                      : (app.tempElm.new.show === 'cog') ? 'model'
                      : 'node or constraint';

        // 'show'-value is for model only
        if (app.tempElm.new.show === 'cog') {
            app.tempElm.new.of = 'model';

            // add head and pass disabled = true, <select> is only used for consistent displaying
            template += tmpl.selectHead('show', true, 'Value to analyse');

            // add body
            template += '<option value="model" selected>model</option>';

            // add tail
            template += tmpl.selectTail();
        };

        // 'show'-value is for nodes only
        if (elmType === 'node') {

            // select first node as default on first invocation
            if (!app.tempElm.new.hasOwnProperty('of'))
                app.tempElm.new.of = app.model.nodes[0].id;

                // add head
                template += tmpl.selectHead('of', false, 'Element show-value belongs to');

                //  add options
                app.model.nodes.forEach(node => {
                    template += `<option value="${node.id}" ${((app.tempElm.new.of === node.id) ? 'selected' : '')}>${node.id}</option>`;
                });

                // add tail
                template += tmpl.selectTail();

        };

        // 'show'-value is for constraints only
        if (elmType === 'constraint') {

            // select first node as default on first invocation
            if (!app.tempElm.new.hasOwnProperty('of'))
                app.tempElm.new.of = app.model.constraints[0].id;

                // add head
                template += tmpl.selectHead('of', false, 'Element show-value belongs to');

                //  add options
                app.model.constraints.forEach(constraint => {
                    template += `<option value="${constraint.id}" ${((app.tempElm.new.of === constraint.id) ? 'selected' : '')}>${constraint.id}</option>`;
                });

                // add tail
                template += tmpl.selectTail();

        };

        // 'show'-value is for nodes OR constraints
        if (elmType === 'node or constraint') {

            // select first node as default on first invocation
            if (!app.tempElm.new.hasOwnProperty('of'))
                app.tempElm.new.of = app.model.constraints[0].id;

                // add head
                template += tmpl.selectHead('of', false, 'Element show-value belongs to');

                // add options

                // add nodes
                app.model.nodes.forEach(node => {
                    template += `<option value="${node.id}" ${((app.tempElm.new.of === node.id) ? 'selected' : '')}>${node.id}</option>`;
                });

                // add constraints
                app.model.constraints.forEach(constraint => {
                    template += `<option value="${constraint.id}" ${((app.tempElm.new.of === constraint.id) ? 'selected' : '')}>${constraint.id}</option>`;
                });

                // add tail
                template += tmpl.selectTail();

        };


        /**************** AS property *****************/

        // 'show'-value is for MODEL only
        if (app.tempElm.new.show === 'cog') {

            if (!app.tempElm.new.hasOwnProperty('as'))
                app.tempElm.new.as = 'point';

            // add head
            template += tmpl.selectHead('as', false, 'Type of analysis');

            ['point','trace'].forEach(opt => { //  add options
                template += `<option value="${opt}" ${((app.tempElm.new.as === opt) ? 'selected' : '')}>${opt}</option>`;
            });

            // add tail
            template += tmpl.selectTail();
        };

        // 'show' value is for nodes XOR constraints, noted in type
        let type = false;

        // evaluate what 'show' value is for
        if (app.model.elementById(app.tempElm.new.of).type === 'node' ) {
            type = 'nodes'
        } else if (['free','rot','tran','ctrl'].includes(app.model.elementById(app.tempElm.new.of))) {
            type = 'constraints'
        };

        if (type) { // false | 'nodes' | 'constraints'
            // add head
            template += tmpl.selectHead('as', false, 'Type of analysis');

            //  add options
            // 'show' type 'info'
            if ( app.alyValues[type].info.includes(app.tempElm.new.show) ) {
                // initial call
                if ( !app.tempElm.new.hasOwnProperty('as') )
                    app.tempElm.new.as = 'info';

                template += `<option value="info" ${((app.tempElm.new.as === 'info') ? 'selected' : '')}>info</option>`;
            };

            // 'show' type 'vector'
            if ( app.alyValues[type].vector.includes(app.tempElm.new.show) ) {
                // initial call
                if ( !app.tempElm.new.hasOwnProperty('as') )
                    app.tempElm.new.as = 'vector';

                template += `<option value="vector" ${((app.tempElm.new.as === 'vector') ? 'selected' : '')}>vector</option>`;
            };

            // 'show' type 'point' OR 'trace'
            if ( app.alyValues[type].tracePoint.includes(app.tempElm.new.show) ) {
                // initial call
                if ( !app.tempElm.new.hasOwnProperty('as') )
                    app.tempElm.new.as = 'trace';

                ['point','trace'].forEach(opt => {
                    template += `<option value="${opt}" ${((app.tempElm.new.as === opt) ? 'selected' : '')}>${opt}</option>`;
                });
            };

            // add tail
            template += tmpl.selectTail();
        };


        /**************** OPTIONAL PROPERTIES *****************/

        // 'as' is POINT
        // ['by']
        if (app.tempElm.new.as === 'point') {

            // all optional properties have been removed with app.tidyTempElmNew()
            if (!app.tempElm.new.hasOwnProperty('by'))
                app.tempElm.new.by = 'dot';

            // add head
            template += tmpl.selectHead('by', false, 'Symbol used for the point');

            ['dot','gnd','pol'].forEach(opt => { //  add options
                template += `<option value="${opt}" ${((app.tempElm.new.by === opt) ? 'selected' : '')}>${opt}</option>`;
            });

            // add tail
            template += tmpl.selectTail();
        };

        // 'as' is vector
        // ['at']
        if (app.tempElm.new.as === 'vector') {

            // all optional properties have been removed with app.tidyTempElmNew()
            if (!app.tempElm.new.hasOwnProperty('at')) {
                app.tempElm.new.at = app.tempElm.new.of; // copy default
            }

            // add head
            template += tmpl.selectHead('at', false, 'Origin of vector');

            app.model.nodes.forEach(node => { //  add options
                template += `<option value="${node.id}" ${((app.tempElm.new.at === node.id) ? 'selected' : '')}>${node.id}</option>`;
            });

            // add tail
            template += tmpl.selectTail();
        };

        // 'as' is trace
        if (app.tempElm.new.as === 'trace') {

            // ####### ['mode'] #######

            // all optional properties have been removed with app.tidyTempElmNew()
            if (!app.tempElm.new.hasOwnProperty('mode')) {
                app.tempElm.new.mode = 'dynamic'; // set default
            }

            // add head
            template += tmpl.selectHead('mode', false, 'Mode of trace-analysis');

            ['static','dynamic','preview'].forEach(opt => { //  add options
                template += `<option value="${opt}" ${((app.tempElm.new.mode === opt) ? 'selected' : '')}>${opt}</option>`;
            });

            // add tail
            template += tmpl.selectTail();


            // ####### ['stroke'] AND ['fill'] #######

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
                                 <button id="view-fill-color-btn" class="btn input-group-text view-inputtext">fill: </button>
                             </div>
                             <input type="color" id="view-fill-color" name="color" value="${app.tempElm.new.hasOwnProperty('fill') ? app.tempElm.new.fill : '#009900'}" ${fillcolorDisabled?'disabled':''}/>
                             </div>
                         </div>`
        };

        // ['t0'] -> set in JSON
        // ['Dt'] -> set in JSON

        return template;
    },
    selectHead: (prop, disabled = false, tooltip = false) => `<div class="input-group mb-3"><div class="input-group-prepend"><label ${tooltip ? `title="${tooltip}"` : ''} class="input-group-text view-inputtext" for="select-view-${prop}">${prop}: </label></div><select class="custom-select m-0" id="select-view-${prop}" ${disabled?'disabled':''}>`,
    selectTail: () => `</select></div>`,
    mec2Element: (modelHasId = false) => `<!doctype html>
<html>

<head>
    <title>${modelHasId?app.model.id:''}</title>
    <meta charset='utf-8'>
</head>

<body>
    <mec-2 width=${app.cnv.width} height=${app.cnv.height} grid ${app.view.cartesian?'cartesian':''} x0=${app.view.x} y0=${app.view.y}>
${app.model.asJSON()}
    </mec-2>

    <script src="https://gitcdn.xyz/repo/goessner/g2/master/src/g2.js"></script>
    <script src="https://gitcdn.xyz/repo/goessner/mec2/master/mec2.min.js"></script>
    <script src="https://gitcdn.xyz/repo/jauhl/mecEdit/master/scripts/mecelement/canvasInteractor.js"></script>
    <script src="https://gitcdn.xyz/repo/jauhl/mecEdit/master/scripts/mecelement/g2.selector.js"></script>
    <script src="https://gitcdn.xyz/repo/jauhl/mecEdit/master/scripts/mecelement/mec.htmlelement.js"></script>
</body>

</html>`
};