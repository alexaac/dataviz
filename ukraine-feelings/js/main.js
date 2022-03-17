/* Global constants */
const width = 1300,
  height = 800;

let projectionType = 'equi';

const blueColor = '#ffd500ff',
  yellowColor = '#005bbbff';
const color = d3.scaleLinear().domain([1, 2]).range([blueColor, yellowColor]);
const stroke = (id) => (id === 1 ? yellowColor : blueColor);

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const zoomHandler = () => {
  const transform = d3.event.transform;

  g.attr(
    'transform',
    'translate(' +
      transform.x +
      ',' +
      transform.y +
      ')scale(' +
      transform.k +
      ')'
  );
};

let countries;

const g = svg
  .append('g')
  .attr('class', 'counties')
  .call(d3.zoom().scaleExtent([1, 10]).on('zoom', zoomHandler));

/* Map Legend */
// drawLegend();

/* Load the data */
const promises = [d3.json('data/world.json')];

Promise.all(promises).then((data) => {
  const world = data[0];
  console.log(world);

  countries = topojson.feature(world, {
    type: 'GeometryCollection',
    geometries: world.objects['simplified'].geometries,
  });

  const globe = g
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path');

  console.log(countries);
  const changeProjection = () => {
    console.log(projectionType);
    let projection, path;

    if (projectionType === 'equi') {
      projectionType = 'azim';

      projection = d3
        .geoAzimuthalEqualArea()
        .translate([width / 2, height / 2])
        .scale(width / 7);

      path = d3.geoPath().projection(projection);
    } else {
      projectionType = 'equi';

      projection = d3
        .geoEquirectangular()
        .translate([width / 2, height / 2])
        .scale(width / 7);

      path = d3.geoPath().projection(projection);
    }

    globe
      .transition()
      .duration(1000)
      .attr('d', path)
      .style('fill', (d) => color([d.properties.id]))
      .style('stroke-width', '0.5px')
      .style('stroke', (d) => stroke(d.properties.id));
  };

  document.getElementById('proj').addEventListener('click', changeProjection);

  changeProjection();
});
