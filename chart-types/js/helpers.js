import { data } from './data.js';

let categories = data.categories;
console.log(categories);
let charts = data.charts;
console.log(charts);

const getGraph = (charts) => {
  let graph = {
    nodes: [],
    links: [],
  };

  graph.nodes = charts;
  let values = Object.keys(categories || {}).map(function (key) {
    return categories[key];
  });
  graph.nodes.push(...values);

  graph.nodes.forEach((item) => {
    item.categories.forEach((cat) => {
      graph.links.push({ source: cat, target: item.name });
    });
  });

  return graph;
};
let graph = getGraph(charts);

const getNestedCategories = (charts) => {
  let filteredData = charts.filter((d) => d.type !== 'parent');

  let nestedData = d3
    .nest()
    .key((d) => categories[d.categories[0]].title)
    .entries(filteredData);

  return nestedData.sort((a, b) => ('' + a.key).localeCompare(b.key));
};

let nestedCharts = getNestedCategories(charts);

const helpers = {
  dump: (obj) => JSON.stringify(obj, null, 2),
  globals: {
    siteName: `30 Day Charts Challenge`,
    icon: (name) => `../icons/${name}.svg`,
    menu: [
      { title: 'Comparisons', slug: '#comparisons', icon: 'comparisons' },
      { title: 'Distribution', slug: '#distributions', icon: 'distributions' },
      { title: 'Relationship', slug: '#relationships', icon: 'relationships' },
      { title: 'Time', slug: '#time', icon: 'time' },
      { title: 'Geospatial', slug: '#geospatial', icon: 'geospatial' },
      { title: 'Uncertainties', slug: '#uncertainties', icon: 'uncertainties' },
    ],
  },
  charts: nestedCharts,
  graph,
};

export { helpers };
