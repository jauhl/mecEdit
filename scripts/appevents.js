'use strict';
// define non-editor events
const events = {
    preventDefaultCTXM: () => document.addEventListener('contextmenu', (e) => e.preventDefault()),
    sidebarClick: (id) => {
        /*********************************  sidebar click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => { // bind to parent
            console.log(e);
            // if (e.target && e.target.className == 'vec_btn') { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'select first node; &lt;ESC&gt; to cancel'; }; // check for children
            if (e.target && ['free', 'tran', 'rot'].includes(e.target.id)) { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'Select first node; &lt;ESC&gt; to cancel'; }; // check for children // ,'spring'
            if (e.target && e.target.id === 'drive') { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'Select a constraint to add a drive to; &lt;ESC&gt; to cancel'; };
            if (e.target && (e.target.id === 'addnode' || e.target.id == 'addbasenode')) {
                app.build = { mode: e.target.id };
                app.instruct.innerHTML = 'Left-click on the canvas to place a new node; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            // if (e.target && e.target.id === 'purgenode') {
            //     app.build = { mode: e.target.id };
            //     app.instruct.innerHTML = 'left-click on a node to delete it and all its dependants; &lt;ESC&gt; to cancel';
            //     document.body.style.cursor = 'crosshair';
            // };
            // if (e.target && e.target.id === 'force') {
            //     app.build = { mode: e.target.id };
            //     app.instruct.innerHTML = 'left-click on a node to add a force; &lt;ESC&gt; to cancel';
            //     document.body.style.cursor = 'crosshair';
            // };
            // if (e.target && e.target.id === 'resetview') { app.view.x = 50; app.view.y = 50; app.view.scl = 1; app.notify('render'); };
        })
    },
    navbarClick: (id) => {
        /*********************************  navbar click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => {
            // File
            if (e.target && e.target.id === 'newModel') { app.newModel(); };
            if (e.target && e.target.id.includes('nav-example-')) { app.newModel(JSON.parse(JSON.stringify(examples[e.target.id.replace('nav-example-','')]))); }; // use copy so source wont be changed
            if (e.target && e.target.id === 'export') { app.saveToJSON(); };
            if (e.target && e.target.id === 'import') { app.importConfirmed = confirm('All unsaved changes will be lost! Continue?') ? true : (e.preventDefault(),false)}; // false -> dont open file window (and return undefined) and return false

            // Edit
            if (e.target && e.target.id === 'dragmode') { 
                app.dragMove = !app.dragMove; 
                if (!app.dragMove)
                    app.reset();
            };
            if (e.target && e.target.id === 'model-edit') { modelModal.show(); };
            if (e.target && e.target.id === 'nav-purgenode') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on a node to delete it and all its dependants; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };

            // Components
            if (e.target && (e.target.id === 'nav-addnode' || e.target.id == 'nav-addbasenode')) {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on the canvas to place a new node; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && ['nav-free', 'nav-tran', 'nav-rot','nav-spring'].includes(e.target.id)) { 
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'select first node; &lt;ESC&gt; to cancel'; 
            };
            if (e.target && e.target.id === 'nav-drive') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Select a constraint to add a drive to; &lt;ESC&gt; to cancel';
            };            
            if (e.target && e.target.id === 'nav-force') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on a node to add a force; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && (e.target.id === 'nav-fix' || e.target.id === 'nav-flt')) {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = `Left-click on a node to add a ${app.build.mode}-shape; &lt;ESC&gt; to cancel`;
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && e.target.id === 'nav-addview') { app.initViewModal(); };

            // View
            if (e.target && e.target.id === 'darkmode') { app.toggleDarkmode(); };
            if (e.target && e.target.id === 'resetview') { app.view.x = 50; app.view.y = 50; app.view.scl = 1; app.notify('render'); };
            if (e.target && e.target.id === 'toggleNodeLabels') { 
                app.model.graphics.labels.nodes = !app.model.graphics.labels.nodes;
                if (!!app.tempElm.labelState) app.tempElm.labelState.nodes = app.model.graphics.labels.nodes;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleConstraintLabels') {
                app.model.graphics.labels.constraints = !app.model.graphics.labels.constraints;
                if (!!app.tempElm.labelState) app.tempElm.labelState.constraints = app.model.graphics.labels.constraints;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleLoadLabels') {
                app.model.graphics.labels.loads = !app.model.graphics.labels.loads;
                if (!!app.tempElm.labelState) app.tempElm.labelState.loads = app.model.graphics.labels.loads;
                app.notify('render');
            };

            if (e.target && e.target.id === 'run') { app.run(); };
            if (e.target && e.target.id === 'idle') { app.idle(); };
            if (e.target && e.target.id === 'stop') { app.stop(); };
            if (e.target && e.target.id === 'reset') { app.reset(); };
            if (e.target && e.target.id === 'toggle-g') { app.model.gravity.active = !app.model.gravity.active; app.updateg(); };
        })
    },
    navbarChange: (id) => {
        /*********************************  navbar change handler  ****************************************/ 
        document.getElementById(id).addEventListener('change', e => app.loadFromJSON(e.target.files, true) );
    },
    keyboardDown: () => {
        /*********************************  global keyboard handler  ****************************************/ 
        document.addEventListener('keydown', (e) => {
            console.log(`Key pressed: ${e.key}`);
            if (document.getElementById('modelModal').attributes['aria-hidden'].value === 'true' && document.getElementById('viewModal').attributes['aria-hidden'].value === 'true') { // modals are hidden
                if (e.key === 'Escape') {
                    if (app.build) {
                        // reset app.build-state on escapekey
                        app.resetApp();
                        document.body.style.cursor = 'default';
                    }
                    // todo: make editor & element state resetable
                };
                // some shortcuts
                if (e.key === 'e')    
                    modelModal.show(); // open model editor
                if (e.key === 'v') 
                    app.initViewModal(); // open view modal
                if (e.key === 'i') {
                    app.dragMove = !app.dragMove; // toggle drag-mode
                    if (!app.dragMove)
                        app.reset();
                };    
                if (e.key === 'p') {
                    app.build = { mode: 'purgenode' };
                    app.instruct.innerHTML = 'Left-click on a node to delete it and all its adjacent constraints; &lt;ESC&gt; to cancel';
                    document.body.style.cursor = 'crosshair';
                }
            }
        });
    },
    ctxmClick: (id) => {
        /*********************************  contextmenu click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => {
            console.log('ctxmClick fired');
            let ctxmdirty = false;
            // console.log(app.tempElm.new);
            // if (app.tempELm && !app.tempELm.hasOwnProperty('new')) // declare new temporary constraint template if not done already
            //     app.tempElm.new = JSON.parse(JSON.stringify(app.tempElm.old)); // deep copy object (shallow-copy (i.e. Object.assign()) would only reference sub level (nested) objects)
            // console.log(app.tempElm.new);
            // if (!app.tempELm.new.hasOwnProperty('ori')) 
            //     app.tempELm.new.ori = {};
            // if (!app.tempELm.new.hasOwnProperty('len')) 
            //     app.tempELm.new.len = {}; 

            if (e.target && e.target.id === 'node-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeNode(app.model.nodeById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'constraint-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeConstraint(app.model.constraintById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Constraint has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'force-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'spring-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            

            if (ctxmdirty)
                // todo: check for consistency issues and maybe mark with red border
                app.updateCtxm(app.tempElm.new, app.tempElm.type);
        });
    },
    ctxmInput: (id) => {
        /*********************************  contextmenu change handler  ****************************************/ 
        document.getElementById(id).addEventListener('input', (e) => {
            console.log('ctxmInput fired');
            // let ctxmdirty = false;
            // if (!app.tempElm.new) // declare new temporary constraint template if not done already
            //     app.tempElm.new = JSON.parse(JSON.stringify(app.tempElm.old)); // deep copy object (shallow-copy (i.e. Object.assign()) would only reference sub level (nested) objects)

            // constraints
            if (e.target && e.target.id === 'ori-drive-Dt') { 
                app.tempElm.new.ori.Dt = e.target.valueAsNumber;
            };
            if (e.target && e.target.id === 'len-drive-Dt') { 
                app.tempElm.new.len.Dt = e.target.valueAsNumber;
            };
            if (e.target && e.target.id === 'ori-drive-Dw') { 
                app.tempElm.new.ori.Dw = e.target.valueAsNumber;
            };
            if (e.target && e.target.id === 'len-drive-Dr') { 
                app.tempElm.new.len.Dr = e.target.valueAsNumber;
            };

            // nodes
            if (e.target && e.target.id === 'node-x') { 
                // app.tempElm.new.x = e.target.valueAsNumber;
                app.model.nodeById(app.tempElm.old.id).x = e.target.valueAsNumber;
                app.model.nodeById(app.tempElm.old.id).updAdjConstraints();
                app.notify('render');
                // ctxmdirty = true; 
            };
            if (e.target && e.target.id === 'node-y') {
                // app.tempElm.new.y = e.target.valueAsNumber;
                app.model.nodeById(app.tempElm.old.id).y = e.target.valueAsNumber;
                app.model.nodeById(app.tempElm.old.id).updAdjConstraints();
                app.notify('render');
                // ctxmdirty = true;
            };
            if (e.target && e.target.id === 'node-base') { 
                // e.target.checked ? app.model.nodeById(app.tempElm.old.id).m = app.tempElm.new.m = Number.POSITIVE_INFINITY : app.model.nodeById(app.tempElm.old.id).m = app.tempElm.new.m = 1; // todo: maybe later remove tempElm.new
                // app.model.nodeById(app.tempElm.old.id).init(app.model);
                app.model.nodeById(app.tempElm.old.id).base = e.target.checked ? true : false;
                app.notify('render');
                // ctxmdirty = true; 
            };
            // if (e.target && e.target.id === 'node-trace') { 
            //     e.target.checked ? app.addTrace() : app.removeTrace() ;
            //     app.notify('render');
            // };

            // forces
            if (e.target && e.target.id === 'force-value') { 
                app.model.loadById(app.tempElm.old.id).value = mec.from_N(+e.target.value);
                app.notify('render');
            };

            // springs
            if (e.target && e.target.id === 'spring-len0') {
                console.log(app.model.loadById(app.tempElm.old.id).len0);
                console.log(e.target.value);
                app.model.loadById(app.tempElm.old.id).len0 = +e.target.value;
                app.notify('render');
            };

            if (e.target && e.target.id === 'spring-k') { 
                app.model.loadById(app.tempElm.old.id).k = mec.from_N_m(+e.target.value);
                app.notify('render');
            };

            // if (ctxmdirty)
            //     // todo: check for consistency issues and maybe mark with red border
            //     app.updateCtxm(app.tempElm.new, app.tempElm.type);
        });
    },
    ctxmChange: (id) => {
        /*********************************  contextmenu change handler  ****************************************/ 
        document.getElementById(id).addEventListener('change', (e) => {
            console.log('ctxmChange fired');
            if(app.tempElm) {
                let ctxmdirty = false;
                // if (!app.tempElm.new)  // declare new temporary constraint template if not done already
                //     app.tempElm.new = JSON.parse(JSON.stringify(app.tempElm.old)); // deep copy object (shallow-copy (i.e. Object.assign()) would only reference sub level (nested) objects)
                // if (!app.tempELm.new.ori) 
                //     app.tempElm.new.ori = {};
                // if (!app.tempELm.new.len) 
                //     app.tempELm.new.len = {}; 
                
                // constraints
                if (e.target && e.target.id === 'select-p1') { app.tempElm.new.p1 = e.target.value; ctxmdirty = true; }; // todo: prevent applying same p1 & p2 when updating model
                if (e.target && e.target.id === 'select-p2') { app.tempElm.new.p2 = e.target.value; ctxmdirty = true; };
                if (e.target && e.target.id === 'select-ori-type') { app.tempElm.new.ori.type = e.target.value; ctxmdirty = true; };
                if (e.target && e.target.id === 'select-len-type') { app.tempElm.new.len.type = e.target.value; ctxmdirty = true; };
                if (e.target && e.target.id === 'select-ori-ref') { app.tempElm.new.ori.ref = e.target.value; ctxmdirty = true; };
                if (e.target && e.target.id === 'select-len-ref') { app.tempElm.new.len.ref = e.target.value; ctxmdirty = true; };

                //forces
                if (e.target && e.target.id === 'select-force-node') {
                    console.log(e.target);
                    app.model.loadById(app.tempElm.old.id).p = app.model.nodeById(e.target.value);
                    app.notify('render');
                    ctxmdirty = true;
                };
                if (e.target && e.target.id === 'select-force-mode') {
                    app.model.loadById(app.tempElm.old.id).mode = e.target.value;
                    app.notify('render');
                    ctxmdirty = true; 
                };
                
                
                // if (e.target && e.target.id === 'node-x') { app.tempElm.new.x = e.target.valueAsNumber; ctxmdirty = true; };
                // if (e.target && e.target.id === 'node-y') { app.tempElm.new.y = e.target.valueAsNumber; ctxmdirty = true; };
                // if (e.target && e.target.id === 'node-mass') { e.target.checked ? app.tempElm.new.m = Number.POSITIVE_INFINITY : app.tempElm.new.m = 1; ctxmdirty = true; };
                
                if (ctxmdirty)
                    // todo: check for consistency issues and maybe mark with red border
                    app.updateCtxm(app.tempElm.new, app.tempElm.type);
            }
        });
    },
    modalShown: (id) => {
        document.getElementById(id).addEventListener('shown.bs.modal', (e) => { // show.bs.modal fires earlier but the Editor value is not updated without scrolling; shown.bs.modal works though
            // document.getElementById('modalTextarea').innerHTML = app.syntaxHighlight(JSON.stringify(app.model,undefined,4));  // only if element is <pre>
            // let code = JSON.stringify(app.model,undefined,4);
            // app.tempElm = JSON.stringify(app.model,undefined,4);
            // jsonEditor.setValue(JSON.stringify(app.model,null,4));
            jsonEditor.setValue(app.model.asJSON());
        });
    },
    modalAccept: (id) => {
        document.getElementById(id).addEventListener('click', (e) => {
            app.model = JSON.parse(jsonEditor.getValue());  // todo: strip unnecessary properties before parsing || model.toJSON
            app.init();
            app.updateg();
        })
    },
    resize: () => {
        window.onresize = () => {
            let c = document.getElementById('c'),
                main = document.getElementById('main');
        
            c.width = main.clientWidth;
            c.height = main.clientHeight - 30;
        
            // let actcontainer = document.getElementById('actuators-container');
        
            // if (actcontainer.clientWidth > 1000) {
            //     let mecsliders = document.querySelectorAll('.mec-slider');
            //     let rangesliders = document.querySelectorAll('.custom-range');
            //     let rangewidth = (app.model.actcount > 1) ? actcontainer.clientWidth / 2 - 150 : actcontainer.clientWidth - 150; // subtract space for controls & output
        
                // lagging
                // let rangewidth;
                // if (app.model.actcount > 1) {
                //     if (actcontainer.clientWidth < 600) {
                //         rangewidth = 200;
                //     } else {
                //         rangewidth = Math.trunc(actcontainer.clientWidth / 2 - 50);
                //     }
                // } else {
                //     rangewidth = Math.trunc(actcontainer.clientWidth - 50);
                // }
        
            //     mecsliders.forEach(slider => { slider.width = `${rangewidth}`; })
            //     rangesliders.forEach(slider => { slider.style.width = `${rangewidth}px` })
            // }
        
            // app.model.dirty = true;
            app.notify('render');
        }
    },
    viewModalChange: (id) => {
        /*********************************  viewmodal change handler  ****************************************/ 
        document.getElementById(id).addEventListener('change', (e) => {
            let skipUpdate = false;

            if (e.target && e.target.id === 'input-view-id') {
                app.updateTempElmNew('id',e.target.value);
                skipUpdate = true;
            }
            if (e.target && e.target.id === 'select-view-type') {
                app.updateTempElmNew('type',e.target.value);
            };
            if (e.target && e.target.id === 'select-view-p') {
                app.updateTempElmNew('p',e.target.value);
            };
            if (e.target && e.target.id === 'select-view-elem') {
                app.updateTempElmNew('elem',e.target.value);
            };
            if (e.target && e.target.id === 'select-view-value') {
                app.updateTempElmNew('value',e.target.value);
            };
            if (e.target && e.target.id === 'view-stroke-color') {
                app.updateTempElmNew('stroke',e.target.value);
            };
            if (e.target && e.target.id === 'view-fill-color') {
                app.updateTempElmNew('fill',e.target.value);
            };

            if (!skipUpdate) { 
                viewModal.setContent(ctxm.viewModal());
                document.getElementById('view-fill-color-btn').style.backgroundColor = document.getElementById('view-fill-color').disabled ? 'transparent' : '#e9ecef';
                viewModal.update();
            }
        });
    },
    viewModalClick: (id) => {
        /*********************************  viewmodal click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target && e.target.id === 'view-accept')
                app.addViewFromModal();
            if (e.target && e.target.id === 'view-fill-color-btn')
                app.toggleViewfill();
            // if (e.target && e.target.id === 'view-cancel') {
            //     app.resetApp();
            // };
        });
    },
    viewModalHide: (id) => {
        document.getElementById(id).addEventListener('hide.bs.modal', (e) => {
            app.resetApp();
        });
    }
}