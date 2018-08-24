'use strict';

const examples = {
    'crankrocker': {
        id: 'crank-rocker',
        gravity: false,
        nodes: [
            { id: 'A0', x: 100, y: 100, base: true },
            { id: 'A', x: 100, y: 150 },
            { id: 'B', x: 350, y: 220 },
            { id: 'B0', x: 300, y: 100, base: true },
            { id: 'C', x: 250, y: 320, m: 1 }
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A', len: { type: 'const' } },
            { id: 'b', p1: 'A', p2: 'B', len: { type: 'const' } },
            { id: 'c', p1: 'B0', p2: 'B', len: { type: 'const' } },
            { id: 'd', p1: 'B', p2: 'C', ori: { type:'ref', ref:'b'}, len: { type: 'const' } }
        ],
        views: [
            { id:'view1',type:'trace',p:'C', fill:'rgba(255,235,13,.5)' },
            { id:'ia',type:'info',elem:'a',value:'w' }
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
            { id: 'a', p1: 'A0', p2: 'A', len: { type: 'const' } },
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
            { id:'a2',p1:'B1',p2:'B2',len:{type:'const'},ori:{type:'ref',ref:'a1'} },
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
    'basictruss': {
        id: 'truss-basic',
        gravity: false,
        nodes: [
            { id: 'A', x: 100, y: 100, base: true },
            { id: 'B', x: 200, y: 100, base: true },                    
            { id: 'C', x: 150, y: 200 },
        ],
        constraints: [
            { id:'a',p1:'A',p2:'C',len:{type:'const'}},
            { id:'b',p1:'B',p2:'C',len:{type:'const'}}
        ],
        loads: [
            { type:'force',id:'F',p:'C', mode:'push', value:2000 }
        ],
        views: [
            { id:'F1',type:'info',elem:'a',value:'forceAbs' },
            { id:'F2',type:'info',elem:'b',value:'forceAbs' },
        ]
    },
    'truss': {
        id: 'truss',
        gravity: true,
        nodes: [
            { id: 'A', x: 100, y: 100, base: true },
            { id: 'B', x: 200, y: 100 },                    
            { id: 'C', x: 300, y: 100 },
            { id: 'D', x: 400, y: 100 },
            { id: 'E', x: 500, y: 100, base: true },
            { id: 'G', x: 150, y: 200 },
            { id: 'H', x: 250, y: 200 },
            { id: 'I', x: 350, y: 200 },
            { id: 'J', x: 450, y: 200 }
        ],
        constraints: [
            { id:'a',p1:'A',p2:'B',len:{type:'const'}},
            { id:'b',p1:'B',p2:'C',len:{type:'const'}},
            { id:'c',p1:'C',p2:'D',len:{type:'const'}},
            { id:'d',p1:'D',p2:'E',len:{type:'const'}},
            { id:'e',p1:'A',p2:'G',len:{type:'const'}},
            { id:'f',p1:'G',p2:'B',len:{type:'const'}},
            { id:'g',p1:'B',p2:'H',len:{type:'const'}},
            { id:'h',p1:'H',p2:'C',len:{type:'const'}},
            { id:'i',p1:'C',p2:'I',len:{type:'const'}},
            { id:'j',p1:'I',p2:'D',len:{type:'const'}},
            { id:'k',p1:'D',p2:'J',len:{type:'const'}},
            { id:'l',p1:'J',p2:'E',len:{type:'const'}},
            { id:'m',p1:'G',p2:'H',len:{type:'const'}},
            { id:'n',p1:'H',p2:'I',len:{type:'const'}},
            { id:'o',p1:'I',p2:'J',len:{type:'const'}}
        ],
        loads: [
            { type:'force',id:'F',p:'H', mode:'push', value:2000, w0:-Math.PI/2 }
        ],
        views: [
            { id:'F1',type:'info',elem:'a',value:'forceAbs' },
            { id:'F2',type:'info',elem:'b',value:'forceAbs' },
            { id:'F3',type:'info',elem:'c',value:'forceAbs' },
            { id:'F4',type:'info',elem:'d',value:'forceAbs' },
            { id:'F5',type:'info',elem:'e',value:'forceAbs' },
            { id:'F6',type:'info',elem:'f',value:'forceAbs' },
            { id:'F7',type:'info',elem:'g',value:'forceAbs' },
            { id:'F8',type:'info',elem:'h',value:'forceAbs' },
            { id:'F9',type:'info',elem:'i',value:'forceAbs' },
            { id:'F10',type:'info',elem:'j',value:'forceAbs' },
            { id:'F11',type:'info',elem:'k',value:'forceAbs' },
            { id:'F12',type:'info',elem:'l',value:'forceAbs' },
            { id:'F13',type:'info',elem:'m',value:'forceAbs' },
            { id:'F14',type:'info',elem:'n',value:'forceAbs' },
            { id:'F15',type:'info',elem:'o',value:'forceAbs' }
        ]
    },
    'pendulums': {
        id: 'chaos-pendulums',
        gravity: true,
        nodes: [
            { id: 'A0', x: 200, y: 400, base: true },
            { id: 'A1', x: 280, y: 480, m:5 },
            { id: 'A2', x: 360, y: 560, m:4 },
            { id: 'A3', x: 440, y: 640, m:2 },
            { id: 'B1', x: 280, y: 480, m:5 },
            { id: 'B2', x: 360, y: 560, m:4 },
            { id: 'B3', x: 440, y: 640, m:2.01 },
            { id: 'C1', x: 280, y: 480, m:5 },
            { id: 'C2', x: 360, y: 560, m:4 },
            { id: 'C3', x: 440, y: 640, m:1.99 },
            { id: 'D1', x: 280, y: 480, m:5 },
            { id: 'D2', x: 360, y: 560, m:4.01 },
            { id: 'D3', x: 440, y: 640, m:1.99 }
        ],
        constraints: [
            { id: 'a1', p1: 'A0', p2: 'A1', len: { type: 'const' } },
            { id: 'a2', p1: 'A1', p2: 'A2', len: { type: 'const' } },
            { id: 'a3', p1: 'A2', p2: 'A3', len: { type: 'const' } },
            { id: 'b1', p1: 'A0', p2: 'B1', len: { type: 'const' } },
            { id: 'b2', p1: 'B1', p2: 'B2', len: { type: 'const' } },
            { id: 'b3', p1: 'B2', p2: 'B3', len: { type: 'const' } },
            { id: 'c1', p1: 'A0', p2: 'C1', len: { type: 'const' } },
            { id: 'c2', p1: 'C1', p2: 'C2', len: { type: 'const' } },
            { id: 'c3', p1: 'C2', p2: 'C3', len: { type: 'const' } },
            { id: 'd1', p1: 'A0', p2: 'D1', len: { type: 'const' } },
            { id: 'd2', p1: 'D1', p2: 'D2', len: { type: 'const' } },
            { id: 'd3', p1: 'D2', p2: 'D3', len: { type: 'const' } }
        ],
        views: [
            { id:'view1',type:'trace',p:'A3', stroke:'rgba(255,0,0,.5)' },
            { id:'view2',type:'trace',p:'B3', stroke:'rgba(0,255,0,.5)' },
            { id:'view3',type:'trace',p:'C3', stroke:'rgba(255,255,0,.5)' },
            { id:'view4',type:'trace',p:'D3', stroke:'rgba(255,0,255,.5)' }
        ]
    }
};