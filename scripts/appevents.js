// define non-editor events
const events = { 
    sidebarClick: (id) => {
        /*********************************  sidebar click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => { // bind to parent
            console.log(e);
            // if (e.target && e.target.className == 'vec_btn') { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'select first node; &lt;ESC&gt; to cancel'; }; // check for children
            if (e.target && ['free', 'tran', 'rot','spring'].includes(e.target.id)) { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'select first node; &lt;ESC&gt; to cancel'; }; // check for children
            if (e.target && e.target.id === 'drive') { app.build = { mode: e.target.id }; app.instruct.innerHTML = 'select a constraint to add an actuator to; &lt;ESC&gt; to cancel'; };
            if (e.target && (e.target.id === 'addnode' || e.target.id == 'addbasenode')) {
                app.build = { mode: e.target.id };
                app.instruct.innerHTML = 'left-click on the canvas to place a new node; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && e.target.id === 'purgenode') {
                app.build = { mode: e.target.id };
                app.instruct.innerHTML = 'left-click on a node to delete it and all its dependants; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && e.target.id === 'force') {
                app.build = { mode: e.target.id };
                app.instruct.innerHTML = 'left-click on a node to add a force; &lt;ESC&gt; to cancel';
                document.body.style.cursor = 'crosshair';
            };
            // if (e.target && e.target.id === 'resetview') { app.view.x = 50; app.view.y = 50; app.view.scl = 1; app.notify('render'); };
        })
    },
    navbarClick: (id) => {
        /*********************************  navbar click handler  ****************************************/ 
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target && e.target.id === 'newModel') { app.newModel(); };
            if (e.target && e.target.id === 'export') { app.saveToJSON(); };
            if (e.target && e.target.id === 'dragmode') { app.dragMove = !app.dragMove; };
            if (e.target && e.target.id === 'model-edit') { modelModal.show(); };
            if (e.target && e.target.id === 'darkmode') { app.toggleDarkmode(); };
            if (e.target && e.target.id === 'resetview') { app.view.x = 50; app.view.y = 50; app.view.scl = 1; app.notify('render'); };
            if (e.target && e.target.id === 'toggleNodeLabels') { 
                mec.showNodeLabels = !mec.showNodeLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.nodes = mec.showNodeLabels;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleConstraintLabels') {
                mec.showConstraintLabels = !mec.showConstraintLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.constraints = mec.showConstraintLabels;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleLoadLabels') {
                mec.showLoadLabels = !mec.showLoadLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.loads = mec.showLoadLabels;
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
        document.getElementById(id).addEventListener('change', (e) => app.loadFromJSON(e.target.files));
    },
    keyboardDown: () => {
        /*********************************  global keyboard handler  ****************************************/ 
        document.addEventListener('keydown', (e) => {
            console.log(`Key pressed: ${e.key}`);
            if (document.getElementById('modelModal').attributes['aria-hidden'].value === 'true') { // modal is hidden
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
                if (e.key === 'i')    
                    app.dragMove = !app.dragMove; // toggle drag-mode
                if (e.key === 'p') {
                    app.build = { mode: 'purgenode' };
                    app.instruct.innerHTML = 'left-click on a node to delete it and all its adjacent constraints; &lt;ESC&gt; to cancel';
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
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">node has dependencies</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'constraint-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeConstraint(app.model.constraintById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">constraint has dependencies</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'force-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">node has dependencies</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'spring-trash') {
                // app.tempElm.new = false; 
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm('skipreplace');
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">node has dependencies</span>`;
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
            if (e.target && e.target.id === 'node-trace') { 
                e.target.checked ? app.addTrace() : app.removeTrace() ;
                app.notify('render');
            };

            // forces
            if (e.target && e.target.id === 'force-value') { 
                app.model.loadById(app.tempElm.old.id).value = e.target.value;
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
            jsonEditor.setValue(JSON.stringify(app.model,null,4));
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
        
            let actcontainer = document.getElementById('actuators-container');
        
            if (actcontainer.clientWidth > 1000) {
                let mecsliders = document.querySelectorAll('.mec-slider');
                let rangesliders = document.querySelectorAll('.custom-range');
                let rangewidth = (app.model.actcount > 1) ? actcontainer.clientWidth / 2 - 150 : actcontainer.clientWidth - 150; // subtract space for controls & output
        
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
        
                mecsliders.forEach(slider => { slider.width = `${rangewidth}`; })
                rangesliders.forEach(slider => { slider.style.width = `${rangewidth}px` })
            }
        
            // app.model.dirty = true;
            app.notify('render');
        }
    }
}