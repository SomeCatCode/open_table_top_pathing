class DijkstraPriorityList {
  constructor(data) {
    this.next = null;
    this.data = data;
  }
}

class DijkstraPriorityQueue {
  constructor(comparator) {
    this.size = 0;
    this.liststart = null;
    this.listend = null;
    this.comparator = comparator;
  }

  add(x) {
    this.size = this.size + 1;

    if (this.liststart == null) {
      this.liststart = new DijkstraPriorityList(x);
    } else {
      let node = this.liststart;
      let comparator = this.comparator;
      let newnode = new DijkstraPriorityList(x);
      let lastnode = null;
      let added = false;
      while (node) {
        if (comparator(newnode, node) < 0) {
          newnode.next = node;
          if (lastnode == null) {
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

//   debug() {
//     let node = this.liststart;
//     let i = 0;
//     if (!node) {
//       return;
//     }
//     while (node) {
//       node = node.next;
//       i++;
//     }
//   }

  size() {
    return this.size;
  }

  peak() {
    return this.liststart.data;
  }

  remove() {
    let x = this.peak();
    this.size = this.size - 1;
    this.liststart = this.liststart.next;
    return x;
  }
}

class DijkstraEdge {
  constructor(start, end, weight) {
    this.start = start;
    this.end = end;
    this.weight = weight;
  }
}

class DijkstraGraph {
  constructor() {
    this.nodes = {};
  }

//   debug() {
//     console.log(this.nodes);
//   }

  addEdge(start, end, weight = 0) {
    // make sure that they are numeric
    start = start * 1;
    end = end * 1;
    weight = weight * 1;

    if (!this.nodes[start]) {
      this.nodes[start] = [];
    }
    this.nodes[start].push(new DijkstraEdge(start, end, weight));
  }

  removeNode(index) {
    delete this.nodes[index];
  }

  paths_from(from) {
    let dist = {};
    dist[from] = 0;

    let visited = {};
    let previous = {};

    let Q = new DijkstraPriorityQueue((a, b) => a.data[0] - b.data[0]);
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
