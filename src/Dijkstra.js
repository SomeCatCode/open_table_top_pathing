class PriorityList {
  constructor(data) {
    this.next = null;
    this.data = data;
  }
}


class PriorityQueue {
  constructor(comparator) {
    this.size = 0;
    this.liststart = null;
    this.comparator = comparator;
  }

  add(x) {
    this.size++;

    if (this.liststart === null) {
      this.liststart = new PriorityList(x);
    } else {
      let node = this.liststart;
      let newnode = new PriorityList(x);
      let lastnode = null;
      let added = false;

      while (node) {
        if (this.comparator(newnode, node) < 0) {
          newnode.next = node;
          if (lastnode === null) {
            this.liststart = newnode;
          } else {
            lastnode.next = newnode;
          }
          added = true;
          break;
        }
        lastnode = node;
        node = node.next;
      }
      if (!added) {
        lastnode.next = newnode;
      }
    }
  }

  debug() {
    let node = this.liststart;
    let i = 0;
    if (!node) {
      console.log("<< No nodes >>");
      return;
    }
    while (node) {
      console.log(`[${i}]=${node.data[1]} (${node.data[0]})`);
      node = node.next;
      i++;
    }
  }

  size() {
    return this.size;
  }

  peak() {
    return this.liststart.data;
  }

  remove() {
    const x = this.peak();
    this.size--;
    this.liststart = this.liststart.next;
    return x;
  }
}

class Edge {
  constructor(start, end, weight) {
    this.start = start;
    this.end = end;
    this.weight = weight;
  }
}

class Graph {
  constructor() {
    this.nodes = {};
  }

  addedge(start, end, weight = 0) {
    if (!this.nodes[start]) {
      this.nodes[start] = [];
    }
    this.nodes[start].push(new Edge(start, end, weight));
  }

  removenode(index) {
    delete this.nodes[index];
  }

  paths_from(from) {
    let dist = {};
    dist[from] = 0;

    let visited = {};
    let previous = {};

    let Q = new PriorityQueue((a, b) => a.data[0] - b.data[0]);
    Q.add([dist[from], from]);

    while (Q.size > 0) {
      let [distance, u] = Q.remove();

      if (visited[u]) {
        continue;
      }
      visited[u] = true;

      if (!this.nodes[u]) {
        console.log(`WARNING: '${u}' is not found in the node list`);
        continue;
      }

      this.nodes[u].forEach((edge) => {
        let alt = dist[u] + edge.weight;
        let end = edge.end;
        if (dist[end] === undefined || alt < dist[end]) {
          previous[end] = u;
          dist[end] = alt;
          Q.add([dist[end], end]);
        }
      });
    }
    return [dist, previous];
  }

  paths_to(node_dsts, tonode) {
    let current = tonode;
    let path = [];

    if (node_dsts[current] !== undefined) {
      path.push(tonode);
    }
    while (node_dsts[current] !== undefined) {
      let nextnode = node_dsts[current];
      path.push(nextnode);
      current = nextnode;
    }

    return path.reverse();
  }

  getpath(from, to) {
    let [distances, prev] = this.paths_from(from);
    return this.paths_to(prev, to);
  }
}

function compareWeights(a, b) {
  return a.data[0] - b.data[0];
}
