const kSize = 20;

export const kNodesSimple = [
    { id: 'n1', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n2', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n3', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n4', shape: { type: 'rectangle', width: 2*kSize, height: kSize },
    ports: {
        'east1': { location: 'east' },
    }},
    { id: 'n5', shape: { type: 'circle', radius: kSize / 2 }},
    { id: 'n6', shape: { type: 'circle', radius: kSize / 2 }},
    { id: 'n7', shape: { type: 'circle', radius: kSize / 2  }},
    { id: 'n8', shape: { type: 'rectangle', width: 2*kSize, height: kSize }},
    { id: 'n9', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n10', shape: { type: 'rectangle', width: 2*kSize, height: kSize }},
    { id: 'n11', shape: { type: 'rectangle', width: 3*kSize, height: kSize }},
    { id: 'n12', shape: { type: 'rectangle', width: 2*kSize, height: kSize },
    ports: {
        'west1': { location: 'west' },
        'south1': { location: 'south', order: 2 },
        'south2': { location: 'south', order: 1 },
        'east1': { location: 'east' },
    }},
    { id: 'n13', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n14', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n15', shape: { type: 'rectangle', width: 2*kSize, height: kSize }},
    { id: 'n16', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n17', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n18', shape: { type: 'rectangle', width: kSize, height: kSize },
    ports: {
        'west1': { location: 'west' },
    }},
    { id: 'n19', shape: { type: 'rectangle', width: kSize, height: kSize },
    ports: {
        'west1': { location: 'west' },
    }},
    { id: 'n20', shape: { type: 'rectangle', width: kSize, height: kSize },
    ports: {
        'west1': { location: 'west' },
    }},
    { id: 'n21', shape: { type: 'rectangle', width: kSize, height: kSize }},
    { id: 'n22', shape: { type: 'rectangle', width: kSize, height: kSize }},
];

export const kNodesCompound = [
    { id: 'p1', children: ['n1', 'n2', 'n3', 'n4', 'n8', 'p1-1'] },
    { id: 'p1-1', children: ['n5', 'n6', 'n7'] },
    { id: 'p2', children: ['n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15', 'p2-1'], ports: {
        'east1': { location: 'east' }, 'west1': { location: 'west' }
    } },
    { id: 'p2-1', children: ['n16', 'n17'] },
    { id: 'p3', children: ['n18', 'n19', 'n20', 'p3-1'] },
    { id: 'p3-1', children: ['n21', 'n22'], shape: { type: 'circle', radius: kSize * 2, } },
];

export const kEdgesSimple = [
    // Parent 'p1' simple edges.
    { id: 'e1->2', source: { id: 'n1' }, target: { id: 'n2' } },
    { id: 'e1->3', source: { id: 'n1' }, target: { id: 'n3' } },
    { id: 'e2->4', source: { id: 'n2' }, target: { id: 'n4' } },
    { id: 'e3->4', source: { id: 'n3' }, target: { id: 'n4' } },
    { id: 'e4->5', source: { id: 'n4' }, target: { id: 'n5' } },
    { id: 'e4->6', source: { id: 'n4' }, target: { id: 'n6' } },
    { id: 'e4->7', source: { id: 'n4' }, target: { id: 'n7' } },
    { id: 'e5->8', source: { id: 'n5' }, target: { id: 'n8' } },
    { id: 'e6->8', source: { id: 'n6' }, target: { id: 'n8' } },
    { id: 'e7->8', source: { id: 'n7' }, target: { id: 'n8' } },
    // Parent 'p2' simple edges.
    { id: 'e9->10', source: { id: 'n9' }, target: { id: 'n10' } },
    { id: 'e10->11', source: { id: 'n10' }, target: { id: 'n11' } },
    { id: 'e11->12', source: { id: 'n11' }, target: { id: 'n12' } },
    { id: 'e12->13', source: { id: 'n12', port: 'south1' }, target: { id: 'n13' } },
    { id: 'e12->14', source: { id: 'n12', port: 'south2' }, target: { id: 'n14' } },
    { id: 'e13->15', source: { id: 'n13' }, target: { id: 'n15' } },
    { id: 'e14->15', source: { id: 'n14' }, target: { id: 'n15' } },
    { id: 'e16->17', source: { id: 'n16' }, target: { id: 'n17' }, meta: { flow: 'east' } },
    // Parent 'p3' simple edges.
    { id: 'e18->19', source: { id: 'n18' }, target: { id: 'n19' } },
    { id: 'e19->20', source: { id: 'n19' }, target: { id: 'n20' } },
    { id: 'e19->21', source: { id: 'n19' }, target: { id: 'n21' }, meta: { flow: 'east' } },
    { id: 'e21->22', source: { id: 'n21' }, target: { id: 'n22' } },
];

export const kEdgesNoCompound = [
    { id: 'e4->12', source: { id: 'n4', port: 'east1' }, target: { id: 'n12', port: 'west1' }, meta: { flow: 'east', length: 1.5 } },
    { id: 'e12->18', source: { id: 'n12', port: 'east1' }, target: { id: 'n18', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e12->19', source: { id: 'n12', port: 'east1' }, target: { id: 'n19', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e12->20', source: { id: 'n12', port: 'east1' }, target: { id: 'n20', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e15->16', source: { id: 'n15' }, target: { id: 'n16' } },
];

export const kEdgesCompound = [
    // { id: 'e4->12', source: { id: 'n4', port: 'east1' }, target: { id: 'n12', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e4->p2', source: { id: 'n4', port: 'east1' }, target: { id: 'p2', port: 'west1' }, meta: { flow: 'east', length: 1.5 } },
    { id: 'ep2->12', source: { id: 'p2', port: 'west1' }, target: { id: 'n12', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e12->p2', source: { id: 'n12', port: 'east1' }, target: { id: 'p2', port: 'east1' }, meta: { flow: 'east' } },
    { id: 'ep2->18', source: { id: 'p2', port: 'east1' }, target: { id: 'n18', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'ep2->19', source: { id: 'p2', port: 'east1' }, target: { id: 'n19', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'ep2->20', source: { id: 'p2', port: 'east1' }, target: { id: 'n20', port: 'west1' }, meta: { flow: 'east' } },
    { id: 'e15->p2-1', source: { id: 'n15' }, target: { id: 'p2-1' } },
];

export const kAlignments = [
    { ids: ['n4', 'n12', 'n19', 'n21'], axis: [1, 0] },
    { ids: ['n21', 'n22'], axis: [0, 1]},
];