currently unlisted but available @[Github Pages](https://jauhl.github.io/MECedit/MECedit.html "MECedit")

# ChangeLog

## v4.5.9 - node dragging is now permanent

### g2.editor,js: 
+ updates adjacent constraints to new node coordinates when dragging ends

### mec2.js:
+ nodes now inherit the methods getAdjConstrIDs() & updAdjConstr() which look for and update values of all adjacent constraints
+ constraints now inherit the method update() which mirrors init() but works with initialized an model
+ partially implemented constraints.protptype.toJSON(), which fixed a bug with the export function

### main.js
+ partially implemented deleteNode()