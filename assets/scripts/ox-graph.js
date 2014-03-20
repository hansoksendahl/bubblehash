//                      ▄▄▄▄▄▄
//                   ▄██▀▀▀▀▀▀██▄
//                 ▄█▀          ▀█▄
//                ██              ██
//               ██ ▄▀▀▀▄ ▀▄ ▄▀    ██
//               ██ █   █   █   █████
//               ██ ▀▄▄▄▀ ▄▀ ▀▄    ██
//                ██              ██
//                 ▀█▄          ▄█▀
//                   ▀██▄▄▄▄▄▄██▀
//                      ▀▀▀▀▀▀
// OX-Tools is developed and maintained by OX-Design
//            MIT user license 2013-2014
var ox = ox ? ox : function() { /* OX-Tools */ };

// ## ox.graph
//
// The function ox.graph returns a directed graph of a Javascript object.
//
// Output is in the form:
// 
//     { nodes: [], links: [] }
ox.graph = function ox_graph(x) {
    var items = [],
        graph = {
            nodes: [{
                type: "node",
                value: x
            }],
            links: []
        };

    function __ox_graph(obj) {
        var source, member, entry, node;
        items.push(obj);
        source = items.indexOf(obj);

        for (member in obj) {
            entry = obj[member];
            type = typeof entry;
            node = {
                value: entry
            };

            node.type = (type === "function" || type === "object") ? "node" : "leaf";

            if (node.type === "node") {
                if (items.indexOf(entry) === -1) {
                    graph.nodes.push(node);
                    __ox_graph(entry);
                }
            } else {
                graph.nodes.push(node);
                items.push(entry);
            }

            if (source !== -1) {
                graph.links.push({
                    source: graph.nodes[source],
                    target: graph.nodes[items.lastIndexOf(entry)],
                    key: member
                });
            }
        }
    }

    __ox_graph(x);
    return graph;
};
