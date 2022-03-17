import { helpers } from './helpers.js';

let graph = helpers.graph;
console.log(graph);
let WIDTH = 2000,
  HEIGHT = 1800;

let svg = d3
  .select('#chart')
  .append('svg')
  .attr('class', 'chart-group')
  .attr('preserveAspectRatio', 'xMinYMin')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .attr('viewBox', [-WIDTH / 1.9, -HEIGHT / 3, WIDTH, HEIGHT]);

let zoomableGroup = svg
  .append('g')
  .attr('class', 'zoomable-group')
  .attr('transform', `translate(0, 0)`);

const zoomed = () => {
  zoomableGroup.attr('transform', d3.event.transform);

  let scale = d3.event.transform.k;
  console.log(scale);
  if (scale > 1.3) {
    zoomableGroup
      .selectAll('.node-labels > text')
      .attr('transform', 'scale(' + 1 / scale + ')');
    zoomableGroup
      .selectAll('.node-icons')
      .attr('width', `${50 / scale}`)
      .attr('height', `${50 / scale}`);
  }
  if (scale > 2) {
    zoomableGroup
      .selectAll('.node-labels > text')
      .attr('transform', 'scale(' + 2 / scale + ')');
    zoomableGroup
      .attr('width', `${200 / scale}`)
      .attr('height', `${200 / scale}`);
  }
};

const zoomGraph = d3
  .zoom()
  .scaleExtent([0.2, 10])
  .on('zoom', () => zoomed());

const tooltip_div = d3
  .select('body')
  .append('tooltip_div')
  .attr('class', 'tooltip')
  .style('opacity', 0)
  .style('display', 'none');

tooltip_div.append('div').classed('tooltip__text', true);
tooltip_div
  .append('div')
  .append('button')
  .classed('tooltip__remove', true)
  .on('click', function () {
    tooltip_div.transition().duration(200).style('opacity', 0);
  })
  .text('x');

let simulation = d3
  .forceSimulation(graph.nodes)
  .force(
    'link',
    d3.forceLink(graph.links).id((d) => {
      let name = JSON.parse(JSON.stringify(d)).name;
      return name;
    })
    // .distance(100)
  )
  .force('center', d3.forceCenter(0, 0))
  .force(
    'collision',
    d3
      .forceCollide()
      .radius((d) => 150)
      .strength(0.1)
  )
  .force('charge', d3.forceManyBody())
  .force(
    'r',
    d3.forceRadial((d) => (d.type !== 'child' ? 240 : 150))
  )
  // .force("x", d3.forceX())
  // .force("y", d3.forceY())
  .alphaDecay([0.02])
  .stop();

simulation.force('link').links(graph.links);
simulation.on('tick', () => {
  nodes
    .attr('cx', (d) => d.fx || d.x)
    .attr('cy', (d) => d.fy || d.y)
    .attr('fixed', (d) => (d.fixed ? true : false));
});
simulation.tick(120);

svg.call(zoomGraph);

const highlight = (d) => {
  console.log(d);
  let chartId = d.name;

  d3.selectAll('.links').style('stroke', '#d6d6d6');
  d3.selectAll('.nodes')
    .style('stroke', '#d6d6d6')
    .attr('r', (d) => (d.type === 'parent' ? 10 : 30));

  d3.selectAll('.CO-nodes-' + chartId)
    .transition()
    .duration(1000)
    .style('stroke', 'firebrick');
  const children = d3
    .selectAll('.nodes')
    .filter((d) => d.categories.indexOf(chartId) >= 0);

  console.log(children);

  children
    .transition()
    .duration(1000)
    .style('stroke', 'firebrick')
    .attr('stroke-width', 3)
    .attr('r', (d) => (d.type === 'parent' ? 15 : 32));
  d3.selectAll('.CO-links-' + chartId)
    .style('stroke', 'firebrick')
    .transition()
    .duration(200)
    .attr('stroke-dashoffset', 0)
    .style('opacity', 1);
};

const showInfo = (d) => {
  d3.event.preventDefault();

  let left = d3.event.pageX - 20;
  let top = d3.event.pageY + 20;

  if (window.innerWidth - left < 150) {
    left = currentEvent.pageX - 40;
  }

  tooltip_div.transition().duration(200).style('opacity', 0.9);

  tooltip_div.select('.tooltip__text').html(() => {
    let examples = d.examples
      ? `${d.examples
          .map(
            (example) => `<a href="${example}" target="_blank">${example}</a>`
          )
          .join('<br />')}`
      : '';
    return `<strong>${d.title}</strong> <br />
        ${d.description ? d.description.replace(/\n/g, '<br />') : ''} <br />
        ${examples}`;
  });
  tooltip_div
    .style('left', left + 'px')
    .style('top', top + 'px')
    .style('display', null);
};

let nodesGroup = zoomableGroup.append('g').attr('class', 'nodes-group');
let links = nodesGroup
  .selectAll('.link')
  .data(graph.links)
  .enter()
  .append('g')
  .attr('class', 'link');
const linkArc = (d) => {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
            M${d.source.x},${d.source.y}
            ${d.target.x},${d.target.y}
            // A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
        `;
};

links
  .append('path')
  .attr('class', (d) => `CO-links-${d.source.name}`)
  .classed('links', true)
  .attr(
    'marker-end',
    (d) => `url(${new URL(`#arrow-${d.type}`, location.toString())})`
  )
  .attr('d', (d) => linkArc(d));

// adds images

// var defs = svg.append('svg:defs');
// graph.nodes.forEach((d) => {
//   defs
//     .append('svg:pattern')
//     .attr('id', d.name)
//     .attr('width', 80)
//     .attr('height', 80)
//     .attr('patternUnits', 'userSpaceOnUse')
//     .attr('preserveAspectRatio', 'xMidYMid slice')
//     .append('svg:image')
//     .attr('xlink:href', d.icon && `./icons/${d.icon}`)
//     .attr('width', 80)
//     .attr('height', 80)
//     .attr('x', 20)
//     .attr('y', 20);
// });

let nodes = nodesGroup
  .selectAll('.node')
  .data(graph.nodes)
  .enter()
  .append('g')
  .attr('class', 'node');

const defs = nodes.append('defs');
defs
  .append('pattern')
  .attr('id', (d) => d.name)
  .attr('width', 1)
  .attr('height', 1)
  .append('svg:image')
  .attr('xlink:href', (d) => d.icon && `./icons/${d.icon}`)
  .attr('width', 25 * 2)
  .attr('x', 6)
  .attr('y', 6)
  .attr('preserveAspectRatio', 'xMidYMid slice');

nodes
  .append('circle')
  .attr('id', (d) => d.name)
  .attr('class', (d) => `CO-nodes-${d.name}`)
  .classed('nodes', true)
  .attr('r', (d) => (d.type === 'parent' ? 10 : 30))
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('fill', (d) => (d.type === 'parent' ? 'cyan' : `url(#${d.name})`))
  // .attr('fill', (d) => (d.type === 'parent' ? 'cyan' : d.icon && 'white'))
  .on('touchstart mouseover', (d) => highlight(d))
  .on('click', (d) => {
    highlight(d);
    showInfo(d);
  });

// nodes
//   .append('svg:image')
//   .classed('node-icons', true)
//   .attr('xlink:href', function (d) {
//     return d.icon && `./icons/${d.icon}`;
//   })
//   .attr('x', -25)
//   .attr('y', -25)
//   .attr('width', '50')
//   .attr('height', '50')
//   .attr('preserveAspectRatio', 'xMidYMid slice')
//   .on('touchstart mouseover', (d) => highlight(d))
//   .on('click', (d) => {
//     highlight(d);
//     showInfo(d);
//   });

// adds text
nodes
  .append('g')
  .classed('node-labels', true)
  .append('text')
  .attr(
    'class',
    (d) => d.source && `CO-labels-${d.source} CO-labels-self-${d.name}`
  )
  .attr('x', 8)
  .attr('y', '0.31em')
  .text((d) => d.title)
  .clone(true)
  .lower();

d3.selectAll('.node-labels').attr(
  'transform',
  (d) => `translate(${d.x},${d.y})`
);
d3.selectAll('.node-icons').attr(
  'transform',
  (d) => `translate(${d.x},${d.y})`
);

// Draw nodes and links
// Draw.NodesAndLinks(graph);
