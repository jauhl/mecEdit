currently unlisted but available @[Github Pages](https://jauhl.github.io/mecEdit/mecEdit.html "mecEdit")

# Changelog

## v0.4.7.4 - partitioned mec2 libraries

### general:
+ this version merges the restructured mec2.js library which was has been split into additional, more specific sub-libraries
+ additionally, mec.shape.js, mec.drive.js and mec.load.js are now available
+ renamed app from MECedit to mecEdit

---

## v0.4.7.3 - modifying constraints & nodes

### general:
+ version numbers have now a leading 0 to better indicate the development status of the app

### app.js
+ implemented fully dynamic contextmenu (styling still unfinished) to modify selected nodes and constraints -> all changes are applied when the contextmenu is closed
+ updated the global changehandler of the contextmenu

### ctxm-templates.js:
+ added templates for referenced constraints
+ added templates for all node properties
+ various minor changes

### mec2.js, mec.constraint.js & g2.editor.js
+ various minor changes

---

## alpha v4.7.1 - modifying constraints

### general:
+ `main.js` is now called `app.js`

### app.js:
+ added new functions to handle the dynamic contextmenu

### ctxm-templates.js:
+ new library that contains functions which return html-templates to build a dynamic contextmenu

### mec.constraint.js:
+ partially implemented `constraint.prototype.toJSON()`, which reenables the export function

---

## alpha v4.7.1 - actuators, streamlining & bugfixing

### general:
+ clicking the contraint-type 'ctrl' lets the user add an actuator to an existing constraint. for now this only works with constraints of type 'rot' and only for a single actuator
+ streamlining & bugfixing
+ reorganized the file structure of the app
+ constraints are now shaded when hovering over them and are selectable
+ selected elements in the editor are now shaded yellow to indicate which element is responsible for the EDIT flag
+ added dependency [Draggabilly](https://github.com/desandro/draggabilly "Draggabilly Github") to make the contextmenu for element-modifications dragable and contained in the editor
+ added dependency [Ti-ta-toggle](http://kleinejan.github.io/titatoggle/) for a fancy-looking toggle switch (checkbox)

### main.js:
+ a tooltip with coordinates is now shown when dragging nodes; on the downside this produces stuttering. bug: fps stay constant
+ enabled a contextmenu which opens when a constraint is selected by left-clicking; in future versions the elements will be modifiable through this
+ started to implement a function to modify existing constraints `modConstraint(elm)`
+ started to implement a function to convert an existent non-actuated constraint to an actuated constraint `addActuator(elm)`

### mixin.js:
+ events now pass clientX & clientY to the editor namespace

### mec2.js, mec.constraint.js & g2.editor.js:
+ various changes


---

## alpha v4.7 - inverse kinematics mode & merged changes from @goessner libraries (20.07.18)

### general:
+ implemented mode-switching (for now via a checkbox) between inverse kinematics and constraint-editing when dragging a node

### main.js:
+ bug: actuator functionality is broken, mec-slider no longer working
+ probably implemented a whole lotta other bugs in the process of merging versions...

### mec2.js & mec.constraint.js:
+ to update a constraint you can now simlpy call `constraint.prototype.init()` again and pass the model 

---

## alpha v4.6 - nodes can now be deleted

### g2.editor.js: 
+ hovered element now belongs to editor namespace -> `editor.curElm`

### mec2.js:
+ actuators-controls now adopt to new angle when dragging node with actuated constraint

### main.js:
+ fully implemented `deleteNode()`
+ changed graphicsqueue approach -> adding & deleting elements from `app.model` now rebuilds the queue, thus maintainig the correct order/layer of graphicelements
+ added global escape event -> pressing &lt;Escape&gt; now leaves and resets `app.edit`-state at any time
+ model properties for actuator angle representation (e.g. `app.model.phi`) are now added dynamically and thus can be omitted in JSON-files
+ fixed bug: clicking in empty space when adding a constraint no longer freezes the app

---

## alpha v4.5.9 - node dragging is now permanent

### g2.editor.js: 
+ updates adjacent constraints to new node coordinates when dragging ends

### mec2.js:
+ nodes now inherit the methods `adjConstraintIds()` & `updAdjConstraints()` which look for and update values of all adjacent constraints
+ constraints now inherit the method `update()` which mirrors `init()` but works with initialized an model
+ partially implemented `constraints.prototype.toJSON()`, which fixed a bug with the export function

### main.js
+ partially implemented `deleteNode()`