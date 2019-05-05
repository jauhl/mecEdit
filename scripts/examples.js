'use strict';

const examples = {
    'crankrocker': {
        id: 'crank-rocker',
        gravity: true,
        nodes: [
            { id: 'A0', x: 100, y: 100, base: true },
            { id: 'A', x: 100, y: 150 },
            { id: 'B', x: 350, y: 220 },
            { id: 'B0', x: 300, y: 100, base: true },
            { id: 'C', x: 250, y: 320, m: 1 }
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A', len: { type: 'const' }, ori:{ "type":"drive","Dt":3,"Dw":6.283185307179586 } },
            { id: 'b', p1: 'A', p2: 'B', len: { type: 'const' } },
            { id: 'c', p1: 'B0', p2: 'B', len: { type: 'const' } },
            { id: 'd', p1: 'B', p2: 'C', ori: { type:'const', ref:'b'}, len: { type: 'const' } }
        ],
        views: [
            { "id":"view1","show":"pos","of":'C',"as":'trace',"stroke":"rgba(255,0,0,1)", "fill":"rgba(255,235,13,.5)" },
            { "id":"ia",   "show":"w",  "of":"a","as":'info' },
            { "as":"chart","x":0,"b":200,"h":150,"t0":0.25,"Dt":3,"mode":"preview","canvas":"chart1",
                "yaxis":{"show":"w","of":"c"},
                "xaxis":{"show":"w","of":"a"}
            },
        ]
    },
    'slidercrank': {
        id: 'slider-crank',
        gravity: false,
        nodes: [
            { id: 'A0', x: 100, y: 100, base: true },
            { id: 'A', x: 100, y: 170 },
            { id: 'B', x: 350, y: 80 },
            { id: 'B0', x: 500, y: 80, base: true }
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A', len: { type: 'const' }, ori: { type: 'drive', Dw: 2*Math.PI, input: true } },
            { id: 'b', p1: 'A', p2: 'B', len: { type: 'const' } },
            { id: 'c', p1: 'B0', p2: 'B', ori: { type: 'const' } }
        ]
    },
    '7r': {
        id: 'Stephenson-II',
        gravity: false,
        nodes: [
            {id:'A0',x:100,y:100,base:true},
            {id:'A', x:100,y:200},
            {id:'B1',x:350,y:200},
            {id:'B2',x:450,y:200},
            {id:'C1',x:350,y:150},
            {id:'C2',x:450,y:150},
            {id:'C0',x:400,y:100,base:true},
        ],
        constraints: [
            { id:'a',p1:'A0',p2:'A', len:{type:'const'} },
            { id:'a1',p1:'A', p2:'B1',len:{type:'const'} },
            { id:'a2',p1:'B1',p2:'B2',len:{type:'const'},ori:{type:'const',ref:'a1'} },
            { id:'b1',p1:'B1', p2:'C2',len:{type:'const'} },
            { id:'b2',p1:'B2', p2:'C1',len:{type:'const'} },
            { id:'c1',p1:'C0', p2:'C1',len:{type:'const'} },
            { id:'c2',p1:'C0', p2:'C2',len:{type:'const'} },
            { id:'c3',p1:'C1', p2:'C2',len:{type:'const'} },
        ]
    },
    '9r': {
        id: '9r',
        gravity: false,
        nodes: [
            { id: 'A0', x: 100, y: 100, base:true },
            { id: 'A', x: 100, y:175 },
            { id: 'B', x: 400, y: 175 },
            { id: 'B0', x: 400, y: 100, base:true },
            { id: 'C', x: 175, y: 350 },
            { id: 'C0', x: 250, y: 400, base:true },
            { id: 'D', x: 200, y: 200 },
            { id: 'E', x: 300, y: 200 },
            { id: 'F', x: 250, y: 300 }
        ],
        constraints: [
            { id:'a',p1:'A0',p2:'A',len:{type:'const'} },
            { id:'b',p1:'B0',p2:'B',len:{type:'const'} },
            { id:'c',p1:'C0',p2:'C',len:{type:'const'} },
            { id:'d',p1:'A',p2:'D',len:{type:'const'} },
            { id:'e',p1:'B',p2:'E',len:{type:'const'} },
            { id:'f',p1:'C',p2:'F',len:{type:'const'} },
            { id:'g',p1:'D',p2:'E',len:{type:'const'} },
            { id:'h',p1:'E',p2:'F',len:{type:'const'} },
            { id:'i',p1:'F',p2:'D',len:{type:'const'} }
        ]
    },
    'pumpjack': {
        "id":"pumpjack",
        "nodes": [
            { "id":"origin", "x":0,        "y":0,        "base":true },
            { "id":"A0",     "x":712*0.4,  "y":558*0.4,  "base":true },
            { "id":"A",      "x":807*0.4,  "y":724*0.4               },
            { "id":"B",      "x":765*0.4,  "y":1325*0.4              },
            { "id":"B0",     "x":1148*0.4, "y":1193*0.4, "base":true },
        ],
        "constraints": [
            { "id":"a", "p1":"A0", "p2":"A", "len": { "type":"const" }, "ori":{ "type":"drive", "func":"linear", "Dt":5, "Dw":2*Math.PI, "repeat":10000 } },
            { "id":"b", "p1":"A",  "p2":"B", "len": { "type":"const" } },
            { "id":"c", "p1":"B0", "p2":"B", "len": { "type":"const" } }
        ],
        "shapes": [
            { "type":"img", "uri":"./img/pumpjack/pumpjack2.png",  "p":"origin", "b":2085, "h":1680, "scl": .4 },
            { "type":"poly", "pts":[{"x":0,"y":0},{"x":2085*.4,"y":0},{"x":2085*.4,"y":1680*.4},{"x":0,"y":1680*.4}], "p":"origin", "fill":"#0006" },
            { "type":"img", "uri":"./img/pumpjack/crank.png",   "p":"A0", "wref":"a", "dx":-220*.4, "dy":-50*.4,  "w0":-Math.PI/2,     "scl":.4 },
            { "type":"img", "uri":"./img/pumpjack/rocker.png",  "p":"B0", "wref":"c", "dx":-430*.4, "dy":-226*.4, "w0":-1.005*Math.PI, "scl":.4 },
            { "type":"img", "uri":"./img/pumpjack/coupler.png", "p":"A",  "wref":"b", "dx":-34*.4,  "dy":-35*.4,  "w0":-Math.PI/2,     "scl":.4 },
            { "type":"img", "uri":"./img/pumpjack/frame.png",   "p":"B0",             "dx":-60*.4,  "dy":-34*.4,                       "scl":.4 }
        ]
    },
    'basictruss': {
        "id":"truss-basic",
        "nodes": [
          { "id":"A","x":100,"y":100,"base":true },
          { "id":"B","x":300,"y":100,"base":true },
          { "id":"C","x":200,"y":200 }
        ],
        "constraints": [
          { "id":"a","p1":"A","p2":"C","len":{ "type":"const" } },
          { "id":"b","p1":"B","p2":"C","len":{ "type":"const" } }
        ],
        "loads": [
          { "type":"force","id":"F = 1 N","p":"C","mode":"push","w0":-1.5707963267948966,"value":1 }
        ],
        "views": [
          { "id":"v1","show":"forceAbs","of":"a","as":"info" },
          { "id":"v2","show":"forceAbs","of":"b","as":"info" }
        ]
    },
    'truss': {
        "id":"GrossHauger-TM1-9.Aufl.-S.154",
        "nodes": [
          { "id":"A","x":0,"y":0,"base":true },
          { "id":"B","x":500,"y":0 },
          { "id":"C","x":1000,"y":0 },
          { "id":"D","x":1500,"y":0,"base":true },
          { "id":"E","x":0,"y":250 },
          { "id":"F","x":500,"y":250 },
          { "id":"G","x":1000,"y":250 },
          { "id":"H","x":1500,"y":250 }
        ],
        "constraints": [
          { "id":"a","p1":"A","p2":"B","len":{ "type":"const" } },
          { "id":"b","p1":"B","p2":"C","len":{ "type":"const" } },
          { "id":"c","p1":"C","p2":"D","len":{ "type":"const" } },
          { "id":"d","p1":"A","p2":"E","len":{ "type":"const" } },
          { "id":"e","p1":"E","p2":"F","len":{ "type":"const" } },
          { "id":"f","p1":"F","p2":"G","len":{ "type":"const" } },
          { "id":"g","p1":"G","p2":"H","len":{ "type":"const" } },
          { "id":"h","p1":"H","p2":"D","len":{ "type":"const" } },
          { "id":"i","p1":"B","p2":"F","len":{ "type":"const" } },
          { "id":"j","p1":"C","p2":"G","len":{ "type":"const" } },
          { "id":"k","p1":"E","p2":"B","len":{ "type":"const" } },
          { "id":"l","p1":"B","p2":"G","len":{ "type":"const" } },
          { "id":"m","p1":"G","p2":"D","len":{ "type":"const" } }
        ],
        "loads": [
          { "type":"force","id":"F = 5 kN","p":"G","mode":"push","w0":-1.5707963267948966,"value":5000 }
        ],
        "views": [
          { "id":"v1", "show":"forceAbs","of":"a","as":"info" },
          { "id":"v2", "show":"forceAbs","of":"b","as":"info" },
          { "id":"v3", "show":"forceAbs","of":"c","as":"info" },
          { "id":"v4", "show":"forceAbs","of":"d","as":"info" },
          { "id":"v5", "show":"forceAbs","of":"e","as":"info" },
          { "id":"v6", "show":"forceAbs","of":"f","as":"info" },
          { "id":"v7", "show":"forceAbs","of":"g","as":"info" },
          { "id":"v8", "show":"forceAbs","of":"h","as":"info" },
          { "id":"v9", "show":"forceAbs","of":"i","as":"info" },
          { "id":"v10","show":"forceAbs","of":"j","as":"info" },
          { "id":"v11","show":"forceAbs","of":"k","as":"info" },
          { "id":"v12","show":"forceAbs","of":"l","as":"info" },
          { "id":"v13","show":"forceAbs","of":"m","as":"info" },
          { "id":"v14","show":"force",   "of":"A","as":"info" },
          { "id":"v15","show":"force",   "of":"D","as":"info" }
        ]
    },
    'pendulums': {
        "id":"chaos-pendulums",
        "gravity":true,
        "nodes": [
          { "id":"A0","x":200,"y":400,"base":true },

          { "id":"A1","x":280,"y":480,"m":2 },
          { "id":"B1","x":279,"y":481,"m":2 },
          { "id":"C1","x":278,"y":482,"m":2 },
          { "id":"D1","x":277,"y":483,"m":2 },

          { "id":"A2","x":360,"y":560,"m":3 },
          { "id":"B2","x":359,"y":561,"m":3 },
          { "id":"C2","x":358,"y":562,"m":3 },
          { "id":"D2","x":357,"y":563,"m":3 },

          { "id":"A3","x":440,"y":640,"m":4.7 },
          { "id":"B3","x":439,"y":641,"m":4.7 },
          { "id":"C3","x":438,"y":642,"m":4.7 },
          { "id":"D3","x":437,"y":643,"m":4.7 }
        ],
        "constraints": [
          { "id":"a1","p1":"A0","p2":"A1","len":{ "type":"const" } },
          { "id":"a2","p1":"A1","p2":"A2","len":{ "type":"const" } },
          { "id":"a3","p1":"A2","p2":"A3","len":{ "type":"const" } },
          { "id":"b1","p1":"A0","p2":"B1","len":{ "type":"const" } },
          { "id":"b2","p1":"B1","p2":"B2","len":{ "type":"const" } },
          { "id":"b3","p1":"B2","p2":"B3","len":{ "type":"const" } },
          { "id":"c1","p1":"A0","p2":"C1","len":{ "type":"const" } },
          { "id":"c2","p1":"C1","p2":"C2","len":{ "type":"const" } },
          { "id":"c3","p1":"C2","p2":"C3","len":{ "type":"const" } },
          { "id":"d1","p1":"A0","p2":"D1","len":{ "type":"const" } },
          { "id":"d2","p1":"D1","p2":"D2","len":{ "type":"const" } },
          { "id":"d3","p1":"D2","p2":"D3","len":{ "type":"const" } }
        ],
        "views": [
          { "id":"view1","show":"pos","of":"A3","as":"trace","Dt":1,"stroke":"rgba(255,0,0,.5)" },
          { "id":"view2","show":"pos","of":"B3","as":"trace","Dt":1,"stroke":"rgba(0,255,0,.5)" },
          { "id":"view3","show":"pos","of":"C3","as":"trace","Dt":1,"stroke":"rgba(255,255,0,.5)" },
          { "id":"view4","show":"pos","of":"D3","as":"trace","Dt":1,"stroke":"rgba(255,0,255,.5)" }
        ]
    }
};