currently unlisted but available @[Github Pages](https://jauhl.github.io/MECedit/MECedit.html "MECedit")

# Changelog

## v4.6 - nodes can now be deleted

### g2.editor,js: 
+ hovered element now belongs to editor namespace -> `editor.curElm`

### mec2.js:
+ actuator-controls now adopt to new angle when dragging node with actuated constraint

### main.js
+ fully implemented `deleteNode()`
+ changed graphicsqueue approach -> adding & deleting elements from `app.model` now rebuilds the queue, thus maintainig the correct order/layer of graphicelements
+ added global escape event -> pressing &lt;Escape&gt; now leaves and resets `app.edit`-state at any time
+ model properties for actuator angle representation (e.g. `app.model.phi`) are now added dynamically and thus can be omitted in JSON-files
+ fixed bug: clicking in empty space when adding a constraint no longer freezes the app

---

## v4.5.9 - node dragging is now permanent

### g2.editor,js: 
+ updates adjacent constraints to new node coordinates when dragging ends

### mec2.js:
+ nodes now inherit the methods `getAdjConstrIDs()` & `updAdjConstr()` which look for and update values of all adjacent constraints
+ constraints now inherit the method `update()` which mirrors `init()` but works with initialized an model
+ partially implemented `constraints.protptype.toJSON()`, which fixed a bug with the export function

### main.js
+ partially implemented `deleteNode()`