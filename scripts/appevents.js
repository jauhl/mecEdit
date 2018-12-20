'use strict';
// define non-editor events
const events = {
    preventDefaultCTXM: () => document.addEventListener('contextmenu', (e) => e.preventDefault()),
    sidebarClick: (id) => {
        /*********************************  sidebar click handler  ****************************************/
        document.getElementById(id).addEventListener('click', (e) => { // bind to parent
            // Cancel chain-building, never move to the end of this handler!
            if (app.build) { app.resetApp(); document.body.style.cursor = 'default'; };

            if (e.target && ['free', 'tran', 'rot'].includes(e.target.id)) { app.build = { mode: e.target.id, continue: e.shiftKey }; app.instruct.innerHTML = 'Select first node; [ESC] to cancel'; }; // check for children // ,'spring'
            if (e.target && e.target.id === 'drive') { app.build = { mode: e.target.id }; app.reset(); app.instruct.innerHTML = 'Select a constraint to add a drive to; [ESC] to cancel'; };
            if (e.target && (e.target.id === 'addnode' || e.target.id === 'addbasenode')) {
                app.build = { mode: e.target.id, continue: e.shiftKey };
                app.instruct.innerHTML = 'Left-click on the canvas to place a new node; [ESC] to cancel';
                document.body.style.cursor = 'crosshair';
            };
        })
    },
    navbarClick: (id) => {
        /*********************************  navbar click handler  ****************************************/
        document.getElementById(id).addEventListener('click', (e) => {
            // Cancel chain-building, never move to the end of this handler!
            if (app.build) { app.resetApp(); document.body.style.cursor = 'default'; }

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
            if (e.target && e.target.id === 'model-edit') { app.modelModal.show(); };
            if (e.target && e.target.id === 'nav-purgeelement') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on an element to delete it and all its dependants; [ESC] to cancel';
            };

            // Components
            if (e.target && (e.target.id === 'nav-addnode' || e.target.id == 'nav-addbasenode')) {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on the canvas to place a new node; [ESC] to cancel';
                document.body.style.cursor = 'crosshair';
            };
            if (e.target && ['nav-free', 'nav-tran', 'nav-rot','nav-spring'].includes(e.target.id)) {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'select first node; [ESC] to cancel';
            };
            if (e.target && e.target.id === 'nav-drive') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Select a constraint to add a drive to; [ESC] to cancel';
            };
            if (e.target && e.target.id === 'nav-force') {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = 'Left-click on a node to add a force; [ESC] to cancel';
            };
            if (e.target && (e.target.id === 'nav-fix' || e.target.id === 'nav-flt')) {
                app.build = { mode: e.target.id.replace('nav-','') };
                app.instruct.innerHTML = `Left-click on a node to add a ${app.build.mode}-shape; [ESC] to cancel`;
            };
            if (e.target && e.target.id === 'nav-addview') { app.initViewModal(); };

            // View
            if (e.target && e.target.id === 'darkmode') { app.toggleDarkmode(); };
            if (e.target && e.target.id === 'resetview') { app.resetView(); };
            if (e.target && e.target.id === 'toggleNodes') {
                app.show.nodes = !app.show.nodes;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleConstraints') {
                app.show.constraints = !app.show.linkage.constraints;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleNodeLabels') {
                app.show.nodeLabels = !app.show.nodeLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.nodes = app.show.nodeLabels;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleConstraintLabels') {
                app.show.constraintLabels = !app.show.constraintLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.constraints = app.show.constraintLabels;
                app.notify('render');
            };
            if (e.target && e.target.id === 'toggleLoadLabels') {
                app.show.loadLabels = !app.show.loadLabels;
                if (!!app.tempElm.labelState) app.tempElm.labelState.loads = app.show.loadLabels;
                app.notify('render');
            };

            if (e.target && e.target.id === 'run') {
                if (app.state === 'active') {
                    app.idle();
                } else {
                    app.run();
                };
            };
            if (e.target && e.target.id === 'stop') { app.stop(); };
            if (e.target && e.target.id === 'reset') { app.reset(); };
            if (e.target && e.target.id === 'toggle-g') { app.model.gravity.active = !app.model.gravity.active; app.updateg(); };
        })
    },
    navbarChange: (id) => {
        /*********************************  navbar change handler  ****************************************/
        document.getElementById(id).addEventListener('change', e => app.loadFromJSON(e.target.files) );
    },
    keyboardDown: () => {
        /*********************************  global keyboard handler  ****************************************/
        document.addEventListener('keydown', (e) => {
            // console.log(`Key pressed: ${e.key}`);
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
                // console.log(e);
                if (e.key === 'e')
                    app.modelModal.show(); // open model editor
                if (e.key === 'r')
                    app.resetView();
                if (e.key === 'g') {
                    app.model.gravity.active = !app.model.gravity.active;
                    app.updateg();
                };
                if (e.key === 'v')
                    app.initViewModal(); // open view modal
                if (e.key === 'i') {
                    app.dragMove = !app.dragMove; // toggle drag-mode
                    if (!app.dragMove)
                        app.reset();
                };
                if (e.key === 'p') {
                    app.build = { mode: 'purgeelement' };
                    app.instruct.innerHTML = 'Left-click on an element to delete it and all its dependants; [ESC] to cancel';
                }
            }
        });
    },
    ctxmClick: (id) => {
        /*********************************  contextmenu click handler  ****************************************/
        document.getElementById(id).addEventListener('click', (e) => {
            // console.log('ctxmClick fired');
            let ctxmdirty = false;  // this flag is necessary even if every case in this listener flags true because this listener can fire in the wave of other events due to delegation

            if (e.target && e.target.id === 'node-trash') {
                // app.tempElm.new = false;
                if (app.model.removeNode(app.model.nodeById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm();
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'constraint-trash') {
                if (app.model.removeConstraint(app.model.constraintById(app.tempElm.old.id))) {
                    app.removeInput(app.tempElm.old.id); // try removing inputs
                    app.updateg();
                    app.hideCtxm();
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Constraint has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                };
            };
            if (e.target && e.target.id === 'force-trash') {
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm();
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'spring-trash') {
                if (app.model.removeLoad(app.model.loadById(app.tempElm.old.id))) {
                    app.updateg();
                    app.hideCtxm();
                } else {
                    app.instruct.innerHTML = `<span class="blink" style="color:orange;">Node has dependencies.</span>`;
                    setTimeout ( ()=>{app.instruct.innerHTML = ''}, 2400 );
                }
            };
            if (e.target && e.target.id === 'ori-input') {
                if (e.target.checked && !app.tempElm.new.ori.input) {
                    app.tempElm.new.ori.input = true;
                } else if (!e.target.checked && app.tempElm.new.ori.input) {
                    delete app.tempElm.new.ori.input;
                };
                app.tempElm.replace = true;
            };
            if (e.target && e.target.id === 'len-input') {
                if (e.target.checked && !app.tempElm.new.len.input) {
                    app.tempElm.new.len.input = true;
                } else if (!e.target.checked && app.tempElm.new.len.input) {
                    delete app.tempElm.new.len.input;
                };
                app.tempElm.replace = true;
            };

            if (ctxmdirty)
                app.updateCtxm(app.tempElm.new, app.tempElm.type);
        });
    },
    ctxmInput: (id) => {
        /*********************************  contextmenu change handler  ****************************************/
        document.getElementById(id).addEventListener('input', (e) => {
            // console.log('ctxmInput fired');
            // constraints
            if (e.target && e.target.id === 'ori-drive-Dt') {
                app.tempElm.new.ori.Dt = e.target.valueAsNumber;
                app.tempElm.replace = true;
            };
            if (e.target && e.target.id === 'len-drive-Dt') {
                app.tempElm.new.len.Dt = e.target.valueAsNumber;
                app.tempElm.replace = true;
            };
            if (e.target && e.target.id === 'ori-drive-Dw') {
                app.tempElm.new.ori.Dw = e.target.valueAsNumber;
                app.tempElm.replace = true;
            };
            if (e.target && e.target.id === 'len-drive-Dr') {
                app.tempElm.new.len.Dr = e.target.valueAsNumber;
                app.tempElm.replace = true;
            };

            // nodes
            if (e.target && e.target.id === 'node-x') {
                let node = app.model.nodeById(app.tempElm.old.id);
                node.x0 = node.x = e.target.valueAsNumber;
                app.updDependants(node);
                app.notify('render');
            };
            if (e.target && e.target.id === 'node-y') {
                let node = app.model.nodeById(app.tempElm.old.id);
                node.y0 = node.y = e.target.valueAsNumber;
                app.updDependants(node);
                app.notify('render');
            };
            if (e.target && e.target.id === 'node-base') {
                app.model.nodeById(app.tempElm.old.id).base = e.target.checked ? true : false;
                app.notify('render');
            };

            // forces
            if (e.target && e.target.id === 'force-value') {
                app.model.loadById(app.tempElm.old.id).value = mec.from_N(e.target.valueAsNumber);
                app.notify('render');
            };

            // springs
            if (e.target && e.target.id === 'spring-len0') {
                // console.log(app.model.loadById(app.tempElm.old.id).len0);
                // console.log(e.target.value);
                app.model.loadById(app.tempElm.old.id).len0 = e.target.valueAsNumber;
                app.notify('render');
            };

            if (e.target && e.target.id === 'spring-k') {
                app.model.loadById(app.tempElm.old.id).k = mec.from_N_m(e.target.valueAsNumber);
                app.notify('render');
            };
        });
    },
    ctxmChange: (id) => {
        /*********************************  contextmenu change handler  ****************************************/
        document.getElementById(id).addEventListener('change', (e) => {
            // console.log('ctxmChange fired');
            if(app.tempElm) {
                let ctxmdirty = false; // this flag is necessary even if every case in this listener flags true because this listener can fire in the wave of other events due to delegation
                let doftypechanged = false;

                // constraints
                if (e.target && e.target.id === 'select-p1') { app.tempElm.new.p1 = e.target.value; ctxmdirty = true; app.tempElm.replace = true; }; // todo: prevent applying same p1 & p2 when updating model
                if (e.target && e.target.id === 'select-p2') { app.tempElm.new.p2 = e.target.value; ctxmdirty = true; app.tempElm.replace = true; };
                if (e.target && e.target.id === 'select-ori-type') {
                    app.tempElm.new.ori.type = e.target.value;
                    ctxmdirty = true;
                    app.tempElm.replace = true;
                    if (!doftypechanged)
                        doftypechanged = [];
                    doftypechanged.push('ori');
                };
                if (e.target && e.target.id === 'select-len-type') {
                    app.tempElm.new.len.type = e.target.value;
                    ctxmdirty = true;
                    app.tempElm.replace = true;
                    if (!doftypechanged)
                        doftypechanged = [];
                    doftypechanged.push('len');
                };
                if (e.target && e.target.id === 'select-ori-ref') {
                    if (!!app.tempElm.new.ori.ref && e.target.value === '') {
                        delete app.tempElm.new.ori.ref
                    } else {
                        app.tempElm.new.ori.ref = e.target.value;
                    };
                    ctxmdirty = true;
                    app.tempElm.replace = true;
                };
                if (e.target && e.target.id === 'select-len-ref') { app.tempElm.new.len.ref = e.target.value; ctxmdirty = true; app.tempElm.replace = true; };

                //forces
                if (e.target && e.target.id === 'select-force-node') {
                    // console.log(e.target);
                    app.model.loadById(app.tempElm.old.id).p = app.model.nodeById(e.target.value);
                    app.notify('render');
                    ctxmdirty = true;
                };
                if (e.target && e.target.id === 'select-force-mode') {
                    app.model.loadById(app.tempElm.old.id).mode = e.target.value;
                    app.notify('render');
                    ctxmdirty = true;
                };

                if (ctxmdirty)
                    app.updateCtxm(app.tempElm.new, app.tempElm.type, doftypechanged);
            }
        });
    },
    modalShown: (id) => {
        document.getElementById(id).addEventListener('shown.bs.modal', (e) => { // show.bs.modal fires earlier but the Editor value is not updated without scrolling; shown.bs.modal works though
            app.jsonEditor.setValue(app.model.asJSON());
        });
    },
    modalAccept: (id) => {
        document.getElementById(id).addEventListener('click', (e) => {
            let newmodel;
            try {
                newmodel = JSON.parse(app.jsonEditor.getValue());
            } catch (error) {
                alert(`Your JSON code is not valid! \n\n${error}`)
            }

            if (!!newmodel) {
                app.model = newmodel;  // todo: strip unnecessary properties before parsing || model.toJSON
                app.init();
                // app.updateg(); // moved to app.init()
            };
        })
    },
    resize: () => {
        window.onresize = (e) => {
            let c = document.getElementById('canvas'),
                main = document.getElementById('main');

            c.width = main.clientWidth;
            c.height = main.clientHeight - 30;

            let rangewidth = (c.width - 350)/2;
            for (const drive in app.model.inputs) {
                document.getElementById(app.model.inputs[drive]).slider.style.width = `${rangewidth}px`;

            };

            app.notify('render');
        }
    },
    viewModalChange: (id) => {
        /*********************************  viewmodal change handler  ****************************************/
        document.getElementById(id).addEventListener('change', (e) => {
            let skipUpdate = true;

            if (e.target && e.target.id === 'input-view-id') {
                app.updateTempElmNew('id',e.target.value);
            }
            if (e.target && e.target.id === 'select-view-type') {
                app.updateTempElmNew('type',e.target.value);
                skipUpdate = false;
            };
            if (e.target && e.target.id === 'select-view-p') {
                app.updateTempElmNew('p',e.target.value);
            };
            if (e.target && e.target.id === 'select-view-elem') {
                app.updateTempElmNew('elem',e.target.value);
                skipUpdate = false; // valid values can change between elems
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
                app.viewModal.setContent(tmpl.viewModal());
                if (!!document.getElementById('view-fill-color-btn'))
                    document.getElementById('view-fill-color-btn').style.backgroundColor = document.getElementById('view-fill-color').disabled ? 'transparent' : '#e9ecef';
                app.viewModal.update();
            }
        });
    },
    viewModalClick: (id) => {
        /*********************************  viewmodal click handler  ****************************************/
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target && e.target.id === 'view-accept')
                app.addViewFromModal();
            if (e.target && e.target.id === 'view-fill-color-btn')
                app.toggleViewFill();
        });
    },
    viewModalHide: (id) => {
        document.getElementById(id).addEventListener('hide.bs.modal', (e) => {
            app.resetApp();
        });
    }
}