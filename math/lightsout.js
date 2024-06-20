let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let container = document.getElementById('mynetwork');
let data = { nodes: nodes, edges: edges };
let options = {
    nodes: {
    shape: 'dot',
    size: 15,
    font: {
        size: 0,
        color: '#000000'
    },
    borderWidth: 2,
    // color: '#000000',
    // fixed: true
    },
    edges: {
    width: 2,
    color: { color: '#000000' },
    smooth: {
        enabled: false,
        type: "continuous"
    }
    },
    physics: {
    enabled: false,
    stabilization: false
    }
};
let network = new vis.Network(container, data, options);

let positions = {};

function getRandomPosition() {
    let range = 400;
    return {
        x: Math.random() * range - range / 2,
        y: Math.random() * range - range / 2
    };
}

function determinantGauss(matrix) {
    const n = matrix.length;
    let det = 1;
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                maxRow = k;
            }
        }
        if (i !== maxRow) {
            [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
            det *= -1;
        }
        if (matrix[i][i] === 0) return 0;

        for (let k = i + 1; k < n; k++) {
            const factor = matrix[k][i] / matrix[i][i];
            for (let j = i; j < n; j++) {
                matrix[k][j] -= factor * matrix[i][j];
            }
        }
        det *= matrix[i][i];
    }
    return det;
}

function copyMatrix(base) {
    const result = [];
    for (const line of base) {
      result.push([...line]);
    }
    return result;
  }

adjMatrix = document.getElementById('adjMatrix');

function updateGraph() {
    positions = network.getPositions();
    let input = document.getElementById('graphInput').value.trim();
    if (input === '') {
        nodes.clear();
        edges.clear();
        positions = {};
        return;
    }
    
    let lines = input.split('\n');
    let vertexCount = parseInt(lines[0], 10);
    if (isNaN(vertexCount)) return;
    
    let newNodes = [];
    let newEdges = [];

    // 頂点の生成
    let col = lines[1].trim().split(' ');
    if (col.length === vertexCount){
        for (let i = 1; i <= vertexCount; i++) {
            if (positions[i] === undefined) {
                positions[i] = getRandomPosition();
            }
            let c;
            if (col[i-1] === '0'){
                c = '#FFFFFF';
            }
            else if(col[i-1] === '1'){
                c = '#000000';
            }
            newNodes.push({
                id: i,
                label: String(i),
                x: positions[i].x, y: positions[i].y,
                fixed: { x: true, y: true },
                color: c 
            });
            //後々便利なので見えない辺を作る．
            newEdges.push({ from: i, to: i, hidden: true });
        }
    }
    // 辺の生成
    adjEdges = [];
    for (let i = 2; i < lines.length; i++) {
        let parts = lines[i].trim().split(' ');
        adjEdges.push([parseInt(parts[0]),parseInt(parts[1])]);
        if (parts.length === 2) {
            let from = parseInt(parts[0], 10);
            let to = parseInt(parts[1], 10);
            if (!isNaN(from) && !isNaN(to)) {
                newEdges.push({ from: from, to: to });
            }
        }
    }

    nodes.clear();
    edges.clear();
    nodes.add(newNodes);
    edges.add(newEdges);

    network.once('stabilizationIterationsDone', function() {
        positions = network.getPositions();
        newNodes.forEach(function(node) {
            nodes.update({ id: node.id, fixed: false });
        });
    });

    network.stabilize();


    const adjacencyMatrix = Array.from({ length: vertexCount }, () => Array(vertexCount).fill(0));
    adjEdges.forEach(([a, b]) => {
        adjacencyMatrix[a - 1][b - 1] = 1;
        adjacencyMatrix[b - 1][a - 1] = 1; // 無向グラフの場合
    });
    
    const modifiedMatrix = copyMatrix(adjacencyMatrix);
    for (let i=0;i<vertexCount;i++){
        modifiedMatrix[i][i]=1;
    }

    let latexMatrix = 'A=\\begin{pmatrix}\n';
        latexMatrix += adjacencyMatrix.map(row => row.join(' & ')).join(' \\\\\n');
        latexMatrix += '\n\\end{pmatrix}';

    let latexMatrix2 = 'A+I=\\begin{pmatrix}\n';
    latexMatrix2 += modifiedMatrix.map(row => row.join(' & ')).join(' \\\\\n');
    latexMatrix2 += '\n\\end{pmatrix}';

    const det = determinantGauss(modifiedMatrix);

    const container = document.getElementById('adjMatrix');
    const container2 = document.getElementById('adjMatrix2');
    const container3 = document.getElementById('determinant');
    katex.render(latexMatrix, container, {
        throwOnError: false
    });
    katex.render(latexMatrix2, container2, {
        throwOnError: false
    });
    katex.render(`\\det(A+I) = ${det}`, container3, {
        throwOnError: false
    });

    const solvability = document.getElementById("solvability");
    if(det % 2 === 0){
        solvability.innerText = "このライツアウトグラフは常に解を持つとは限りません．"
    }
    else{
        solvability.innerText = "このライツアウトグラフは常に解を持ちます．"
    }
}

document.getElementById('graphInput').addEventListener('keydown', (event) => {
    if (event.keyCode === 13) { // エンターが押されたら更新
        updateGraph();
    }
});

document.getElementById('redrawGraph').addEventListener('click',() => {
    nodes.clear();
    edges.clear();
    positions = {};
    updateGraph();
});

document.getElementById('isPhysics').addEventListener('click',() => {
    network.setOptions({ physics: { enabled: document.getElementById('isPhysics').checked } });
});

document.getElementById('isLabel').addEventListener('click', () => {
    network.setOptions({nodes: {font: { size: 14*document.getElementById('isLabel').checked}}});
});

network.on("click", (params) => {
    if (params.nodes.length > 0) {
    var clickedNodeId = params.nodes[0];
    // 接続されたノードを取得して色を変更
    var connectedNodes = network.getConnectedNodes(clickedNodeId);
    connectedNodes.forEach((nodeId) => {
        if (nodes.get(nodeId).color === '#FFFFFF'){
            nodes.update({ id: nodeId, color: '#000000' });
        }
        else{
            nodes.update({ id: nodeId, color: '#FFFFFF' });
        }
    });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    updateGraph();
});