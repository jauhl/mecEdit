## Members

<dl>
<dt><a href="#mecEdit">mecEdit</a></dt>
<dd><p>This is the main file of mecEdit. You can find this app on <a href="https://github.com/jauhl/mecEdit">GitHub</a>.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#tooltip">tooltip</a> : <code>HTMLElement</code></dt>
<dd><p>Container for inputs.</p>
</dd>
<dt><a href="#actcontainer">actcontainer</a> : <code>HTMLElement</code></dt>
<dd><p>Container for inputs.</p>
</dd>
<dt><a href="#runSymbol">runSymbol</a> : <code>HTMLElement</code></dt>
<dd><p>SVG path container for run button.</p>
</dd>
<dt><a href="#statusbar">statusbar</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for statusbar.</p>
</dd>
<dt><a href="#sbMode">sbMode</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar Statusbar container for dragmode.</p>
</dd>
<dt><a href="#sbCoords">sbCoords</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for coordinates.</p>
</dd>
<dt><a href="#sbCartesian">sbCartesian</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for coordinate mode.</p>
</dd>
<dt><a href="#sbBtn">sbBtn</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for mouseevent property btn.</p>
</dd>
<dt><a href="#sbDbtn">sbDbtn</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for mouseevent property dbtn.</p>
</dd>
<dt><a href="#sbFPS">sbFPS</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for frames per second.</p>
</dd>
<dt><a href="#sbState">sbState</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for g2.editor state.</p>
</dd>
<dt><a href="#sbDragging">sbDragging</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for g2.editor state <code>dragging</code>.</p>
</dd>
<dt><a href="#sbDragmode">sbDragmode</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for <code>App.prototype.dragMove</code>.</p>
</dd>
<dt><a href="#sbDOF">sbDOF</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for <code>model.dof</code>.</p>
</dd>
<dt><a href="#sbGravity">sbGravity</a> : <code>HTMLElement</code></dt>
<dd><p>Statusbar container for <code>App.prototype.gravity</code>.</p>
</dd>
<dt><a href="#editor">editor</a> : <code>object</code></dt>
<dd><p>g2.editor instance.</p>
</dd>
<dt><a href="#pi">pi</a> : <code>number</code></dt>
<dd><p>Pi.</p>
</dd>
<dt><a href="#svgplay">svgplay</a> : <code>string</code></dt>
<dd><p>SVG play symbol.</p>
</dd>
<dt><a href="#svgpause">svgpause</a> : <code>string</code></dt>
<dd><p>SVG pause symbol.</p>
</dd>
<dt><a href="#model">model</a> : <code>object</code></dt>
<dd><p>The model.</p>
</dd>
<dt><a href="#VERSION">VERSION</a> : <code>string</code></dt>
<dd><p>mecEdit version.</p>
</dd>
<dt><a href="#evt">evt</a> : <code>boolean</code></dt>
<dd><p>mixin requirement.</p>
</dd>
<dt><a href="#cartesian">cartesian</a> : <code>boolean</code></dt>
<dd><p>Evaluates used coordinate system.</p>
</dd>
<dt><a href="#height">height</a> : <code>number</code></dt>
<dd><p>Height of the canvas.</p>
</dd>
<dt><a href="#dragging">dragging</a> : <code>booelan</code></dt>
<dd><p>State of g2.editor. <code>true</code> if element is being dragged.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#origin">origin()</a> ⇒ <code>object</code></dt>
<dd><p>Returns a origin symbol as a g2-object.</p>
</dd>
<dt><a href="#gravvec">gravvec()</a> ⇒ <code>object</code></dt>
<dd><p>Returns a gravity vector as a g2-object.</p>
</dd>
<dt><a href="#constructor">constructor()</a></dt>
<dd><p>Sets properties to parent object. Call with <code>apply()</code> and pass the parent.</p>
</dd>
<dt><a href="#showStatus">showStatus()</a></dt>
<dd><p>Updates the contents of the statusbar.</p>
</dd>
<dt><a href="#showTooltip">showTooltip()</a></dt>
<dd><p>Shows the tooltip.</p>
</dd>
<dt><a href="#hideTooltip">hideTooltip()</a></dt>
<dd><p>Hides the tooltip.</p>
</dd>
<dt><a href="#tick">tick(e)</a></dt>
<dd><p>Reset the model, drive inputs and the app state.</p>
</dd>
<dt><a href="#init">init()</a></dt>
<dd><p>Initializes the app.</p>
</dd>
<dt><a href="#run">run()</a></dt>
<dd><p>Sets the model to <code>active</code>.</p>
</dd>
<dt><a href="#idle">idle()</a></dt>
<dd><p>Pauses the model and resets the app state.</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>Stops the model and resets the app state.</p>
</dd>
<dt><a href="#reset">reset()</a></dt>
<dd><p>Reset the model, drive inputs and the app state.</p>
</dd>
<dt><a href="#updDependants">updDependants(elm)</a></dt>
<dd><p>Reinitializes all dependants of the passed element.</p>
</dd>
<dt><a href="#toggleDevmode">toggleDevmode()</a></dt>
<dd><p>Toggle developer mode to show additional information in the statusbar.</p>
</dd>
<dt><a href="#toggleDarkmode">toggleDarkmode()</a></dt>
<dd><p>Switch between dark- and lightmode.</p>
</dd>
<dt><a href="#resetView">resetView()</a></dt>
<dd><p>Reset <code>this.view</code> to its initial state.</p>
</dd>
<dt><a href="#createInputSlider">createInputSlider(actuated, width, max)</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>Create a new HTML-container for drive inputs.</p>
</dd>
<dt><a href="#updateg">updateg()</a></dt>
<dd><p>Builds and updates the g2-command-queue according to the model.</p>
</dd>
<dt><a href="#resetApp">resetApp()</a></dt>
<dd><p>Resets the app and its stateful variables.</p>
</dd>
<dt><a href="#addNode">addNode()</a></dt>
<dd><p>Adds a new node to the model.</p>
</dd>
<dt><a href="#removeInput">removeInput(id)</a></dt>
<dd><p>Removes all inputs of a constraint.</p>
</dd>
<dt><a href="#purgeElement">purgeElement(elem)</a></dt>
<dd><p>Removes the passed component and all its dependants.</p>
</dd>
<dt><a href="#replaceConstraint">replaceConstraint(oldC, newC)</a></dt>
<dd><p>Replaces an old Constraint with a new one.</p>
</dd>
<dt><a href="#driveByInput">driveByInput([prev])</a> ⇒ <code>object</code> | <code>boolean</code></dt>
<dd><p>Searches for drives with inputs.</p>
</dd>
<dt><a href="#addConstraint">addConstraint()</a></dt>
<dd><p>Adds a new Constraint to <code>this.model</code>.</p>
</dd>
<dt><a href="#getNewChar">getNewChar([x])</a> ⇒ <code>string</code></dt>
<dd><p>Generates a unique id for nodes or constraints.</p>
</dd>
<dt><a href="#addDrive">addDrive()</a></dt>
<dd><p>Adds changes dofs of the passed constraint from type <code>free</code> to <code>drive</code>.</p>
</dd>
<dt><a href="#addSupportShape">addSupportShape()</a></dt>
<dd><p>Adds a new shape of type <code>[&#39;fix&#39;|&#39;flt&#39;]</code>.</p>
</dd>
<dt><a href="#addForce">addForce()</a></dt>
<dd><p>Adds a new load component of type <code>force</code>.</p>
</dd>
<dt><a href="#addSpring">addSpring()</a></dt>
<dd><p>Adds a new load component of type <code>spring</code>.</p>
</dd>
<dt><a href="#initViewModal">initViewModal()</a></dt>
<dd><p>Initializes and shows a modal to add view components.</p>
</dd>
<dt><a href="#addViewFromModal">addViewFromModal()</a></dt>
<dd><p>Adds a view component from the template this.tempElm.new and hides the view modal.</p>
</dd>
<dt><a href="#initCtxm">initCtxm(elm)</a></dt>
<dd><p>Handles opening of contextmenu.</p>
</dd>
<dt><a href="#showCtxm">showCtxm()</a></dt>
<dd><p>Shows the contextmenu at mouseposition.</p>
</dd>
<dt><a href="#hideCtxm">hideCtxm()</a></dt>
<dd><p>Handles closing of contextmenu.</p>
</dd>
<dt><a href="#updateCtxm">updateCtxm(elm, type, [doftypechanged])</a></dt>
<dd><p>Handles opening of contextmenu.</p>
</dd>
<dt><a href="#loadFromJSON">loadFromJSON(files)</a></dt>
<dd><p>Imports a model from a <code>FileList</code>.</p>
</dd>
<dt><a href="#saveToJSON">saveToJSON()</a></dt>
<dd><p>Opens a dialogue to download teh cuurent model as a JSON file.</p>
</dd>
<dt><a href="#newModel">newModel([model])</a></dt>
<dd><p>Defines a new model.</p>
</dd>
<dt><a href="#updateTempElmNew">updateTempElmNew(key, value)</a></dt>
<dd><p>Helper method to change properties in <code>tempELm</code>.</p>
</dd>
<dt><a href="#toggleViewFill">toggleViewFill()</a></dt>
<dd><p>Toggles the background of the fill label in the
view-modal and de-/activates to input.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#App">App</a> : <code>object</code></dt>
<dd><p>Container for <code>create()</code> &amp; <code>prototype()</code>.</p>
</dd>
</dl>

<a name="mecEdit"></a>

## mecEdit
This is the main file of mecEdit. You can find this app on [GitHub](https://github.com/jauhl/mecEdit).

**Kind**: global variable  
**Requires**: <code>module:examples.js</code>, <code>module:templates.js</code>, <code>module:appevents.js</code>, <code>module:g2.editor.js</code>, <code>module:mixin.js</code>, <code>module:slider.js</code>, <code>module:mec2.js</code>, <code>module:g2.js</code>  
**Author**: Jan Uhlig  
**License**: MIT  
**Copyright**: Jan Uhlig 2018  
<a name="tooltip"></a>

## tooltip : <code>HTMLElement</code>
Container for inputs.

**Kind**: global constant  
<a name="actcontainer"></a>

## actcontainer : <code>HTMLElement</code>
Container for inputs.

**Kind**: global constant  
<a name="runSymbol"></a>

## runSymbol : <code>HTMLElement</code>
SVG path container for run button.

**Kind**: global constant  
<a name="statusbar"></a>

## statusbar : <code>HTMLElement</code>
Statusbar container for statusbar.

**Kind**: global constant  
<a name="sbMode"></a>

## sbMode : <code>HTMLElement</code>
Statusbar Statusbar container for dragmode.

**Kind**: global constant  
<a name="sbCoords"></a>

## sbCoords : <code>HTMLElement</code>
Statusbar container for coordinates.

**Kind**: global constant  
<a name="sbCartesian"></a>

## sbCartesian : <code>HTMLElement</code>
Statusbar container for coordinate mode.

**Kind**: global constant  
<a name="sbBtn"></a>

## sbBtn : <code>HTMLElement</code>
Statusbar container for mouseevent property btn.

**Kind**: global constant  
<a name="sbDbtn"></a>

## sbDbtn : <code>HTMLElement</code>
Statusbar container for mouseevent property dbtn.

**Kind**: global constant  
<a name="sbFPS"></a>

## sbFPS : <code>HTMLElement</code>
Statusbar container for frames per second.

**Kind**: global constant  
<a name="sbState"></a>

## sbState : <code>HTMLElement</code>
Statusbar container for g2.editor state.

**Kind**: global constant  
<a name="sbDragging"></a>

## sbDragging : <code>HTMLElement</code>
Statusbar container for g2.editor state `dragging`.

**Kind**: global constant  
<a name="sbDragmode"></a>

## sbDragmode : <code>HTMLElement</code>
Statusbar container for `App.prototype.dragMove`.

**Kind**: global constant  
<a name="sbDOF"></a>

## sbDOF : <code>HTMLElement</code>
Statusbar container for `model.dof`.

**Kind**: global constant  
<a name="sbGravity"></a>

## sbGravity : <code>HTMLElement</code>
Statusbar container for `App.prototype.gravity`.

**Kind**: global constant  
<a name="editor"></a>

## editor : <code>object</code>
g2.editor instance.

**Kind**: global constant  
<a name="pi"></a>

## pi : <code>number</code>
Pi.

**Kind**: global constant  
<a name="svgplay"></a>

## svgplay : <code>string</code>
SVG play symbol.

**Kind**: global constant  
<a name="svgpause"></a>

## svgpause : <code>string</code>
SVG pause symbol.

**Kind**: global constant  
<a name="model"></a>

## model : <code>object</code>
The model.

**Kind**: global constant  
<a name="VERSION"></a>

## VERSION : <code>string</code>
mecEdit version.

**Kind**: global constant  
<a name="evt"></a>

## evt : <code>boolean</code>
mixin requirement.

**Kind**: global constant  
<a name="cartesian"></a>

## cartesian : <code>boolean</code>
Evaluates used coordinate system.

**Kind**: global constant  
<a name="height"></a>

## height : <code>number</code>
Height of the canvas.

**Kind**: global constant  
<a name="dragging"></a>

## dragging : <code>booelan</code>
State of g2.editor. `true` if element is being dragged.

**Kind**: global constant  
<a name="origin"></a>

## origin() ⇒ <code>object</code>
Returns a origin symbol as a g2-object.

**Kind**: global function  
<a name="gravvec"></a>

## gravvec() ⇒ <code>object</code>
Returns a gravity vector as a g2-object.

**Kind**: global function  
<a name="constructor"></a>

## constructor()
Sets properties to parent object. Call with `apply()` and pass the parent.

**Kind**: global function  
<a name="showStatus"></a>

## showStatus()
Updates the contents of the statusbar.

**Kind**: global function  
<a name="showTooltip"></a>

## showTooltip()
Shows the tooltip.

**Kind**: global function  
<a name="hideTooltip"></a>

## hideTooltip()
Hides the tooltip.

**Kind**: global function  
<a name="tick"></a>

## tick(e)
Reset the model, drive inputs and the app state.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>object</code> | Event or Object containing the timestep. |
| e.dt | <code>object</code> | Timestep. |

<a name="init"></a>

## init()
Initializes the app.

**Kind**: global function  
<a name="run"></a>

## run()
Sets the model to `active`.

**Kind**: global function  
<a name="idle"></a>

## idle()
Pauses the model and resets the app state.

**Kind**: global function  
<a name="stop"></a>

## stop()
Stops the model and resets the app state.

**Kind**: global function  
<a name="reset"></a>

## reset()
Reset the model, drive inputs and the app state.

**Kind**: global function  
<a name="updDependants"></a>

## updDependants(elm)
Reinitializes all dependants of the passed element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elm | <code>object</code> | Element whose dependants should be reinitialized. |

<a name="toggleDevmode"></a>

## toggleDevmode()
Toggle developer mode to show additional information in the statusbar.

**Kind**: global function  
<a name="toggleDarkmode"></a>

## toggleDarkmode()
Switch between dark- and lightmode.

**Kind**: global function  
<a name="resetView"></a>

## resetView()
Reset `this.view` to its initial state.

**Kind**: global function  
<a name="createInputSlider"></a>

## createInputSlider(actuated, width, max) ⇒ <code>HTMLElement</code>
Create a new HTML-container for drive inputs.

**Kind**: global function  
**Returns**: <code>HTMLElement</code> - newC - Constraint replacing.  

| Param | Type | Description |
| --- | --- | --- |
| actuated | <code>string</code> | Id of the new HTML-container (e.g. `a-ori`). |
| width | <code>number</code> | maximal width of the new HTML-container. |
| max | <code>number</code> | max value of the new HTML-range-input. |

<a name="updateg"></a>

## updateg()
Builds and updates the g2-command-queue according to the model.

**Kind**: global function  
<a name="resetApp"></a>

## resetApp()
Resets the app and its stateful variables.

**Kind**: global function  
<a name="addNode"></a>

## addNode()
Adds a new node to the model.

**Kind**: global function  
<a name="removeInput"></a>

## removeInput(id)
Removes all inputs of a constraint.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of the constraint the input belongs to. |

<a name="purgeElement"></a>

## purgeElement(elem)
Removes the passed component and all its dependants.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>object</code> | Element to be purged from the model. |

<a name="replaceConstraint"></a>

## replaceConstraint(oldC, newC)
Replaces an old Constraint with a new one.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oldC | <code>object</code> | Constraint to be replaced. |
| newC | <code>object</code> | Constraint replacing. |

<a name="driveByInput"></a>

## driveByInput([prev]) ⇒ <code>object</code> \| <code>boolean</code>
Searches for drives with inputs.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>boolean</code> - Drive that was found or false if none was found.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [prev] | <code>object</code> \| <code>boolean</code> | <code>false</code> | Drive to start search from. |

<a name="addConstraint"></a>

## addConstraint()
Adds a new Constraint to `this.model`.

**Kind**: global function  
<a name="getNewChar"></a>

## getNewChar([x]) ⇒ <code>string</code>
Generates a unique id for nodes or constraints.

**Kind**: global function  
**Returns**: <code>string</code> - Generated id.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [x] | <code>string</code> | <code>&quot;node&quot;</code> | Type of component to generate id for `['node','constraint']`. |

<a name="addDrive"></a>

## addDrive()
Adds changes dofs of the passed constraint from type `free` to `drive`.

**Kind**: global function  

| Type | Description |
| --- | --- |
| <code>object</code> | Constraint to add drive to. |

<a name="addSupportShape"></a>

## addSupportShape()
Adds a new shape of type `['fix'|'flt']`.

**Kind**: global function  
<a name="addForce"></a>

## addForce()
Adds a new load component of type `force`.

**Kind**: global function  
<a name="addSpring"></a>

## addSpring()
Adds a new load component of type `spring`.

**Kind**: global function  
<a name="initViewModal"></a>

## initViewModal()
Initializes and shows a modal to add view components.

**Kind**: global function  
<a name="addViewFromModal"></a>

## addViewFromModal()
Adds a view component from the template this.tempElm.new and hides the view modal.

**Kind**: global function  
<a name="initCtxm"></a>

## initCtxm(elm)
Handles opening of contextmenu.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elm | <code>object</code> | Element to show the contextmenu for. |

<a name="showCtxm"></a>

## showCtxm()
Shows the contextmenu at mouseposition.

**Kind**: global function  
<a name="hideCtxm"></a>

## hideCtxm()
Handles closing of contextmenu.

**Kind**: global function  
<a name="updateCtxm"></a>

## updateCtxm(elm, type, [doftypechanged])
Handles opening of contextmenu.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| elm | <code>object</code> |  | Element to show the contextmenu for. |
| type | <code>string</code> |  | Type of the element. |
| [doftypechanged] | <code>boolean</code> | <code>false</code> | Flag in case the type of a dof changed from the last invocation. |

<a name="loadFromJSON"></a>

## loadFromJSON(files)
Imports a model from a `FileList`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>FileList</code> | `FileList` with the model as the first element. |

<a name="saveToJSON"></a>

## saveToJSON()
Opens a dialogue to download teh cuurent model as a JSON file.

**Kind**: global function  
<a name="newModel"></a>

## newModel([model])
Defines a new model.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [model] | <code>object</code> | <code>{}</code> | Passed model or empty model. |

<a name="updateTempElmNew"></a>

## updateTempElmNew(key, value)
Helper method to change properties in `tempELm`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key of value to be changed. |
| value | <code>string</code> | Value to be changed. |

<a name="toggleViewFill"></a>

## toggleViewFill()
Toggles the background of the fill label in theview-modal and de-/activates to input.

**Kind**: global function  
<a name="App"></a>

## App : <code>object</code>
Container for `create()` & `prototype()`.

**Kind**: global typedef  

* [App](#App) : <code>object</code>
    * [.prototype](#App.prototype) : <code>object</code>
    * [.create()](#App.create) ⇒ <code>object</code>

<a name="App.prototype"></a>

### App.prototype : <code>object</code>
Prototype object to instantiate the app from.

**Kind**: static constant of [<code>App</code>](#App)  
<a name="App.create"></a>

### App.create() ⇒ <code>object</code>
Instantiate the app from `App.prototype`.

**Kind**: static method of [<code>App</code>](#App)  
**Returns**: <code>object</code> - - Extended app object with mixins.  
