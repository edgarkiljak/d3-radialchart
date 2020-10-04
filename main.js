//Define SVG width and height
let fullSVGHeight = 700;
let fullSVGWidth = 900;

//Define margins
let markerCirclesScale = d3.scalePoint().range([0, fullSVGWidth]);

//Fetch data
d3.json('./data.json')
  .then((data) => {
    console.log(data);

    markerCirclesScale.domain(
      data.map(function (d) {
        return d['Person name'];
      })
    );

    let svg = d3
      .select('body')
      .append('svg')
      .attr('width', fullSVGWidth)
      .attr('height', fullSVGHeight)
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + 0 + ')');
    data.forEach(function (d) {
      return render(d['Person name']);
    });

    const defs = svg.append('defs');

    //append linearGradient element to defs
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', 'linear-gradient');

    //stop-color: the color you want to have in the gradient

    //offset: at what location along the directional vector/arrow that you defined with the x and y attributes
    //should the stop-color be its exact color (i.e. the pure color). This is set in percentages along the directional arrow

    //stop-opacity: the opacity of the stop-color at the offset location.
    //This is very useful if you want a gradient that goes from a color to transparent (the default is 1)

    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'blue');

    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'red');

    function render(name) {
      let g = svg
        .selectAll('g')
        .data(['2014', '2015', '2016', '2017', '2018'])
        .enter()
        .append('g')
        .attr(
          'transform',
          'translate(' +
            (markerCirclesScale(name) + 330) +
            ',' +
            (fullSVGHeight / 2 - 30) +
            ')'
        );

      g.append('rect')
        .attr('x', function (d) {
          return this.parentNode.getBBox().x - 28;
        })
        .attr('y', function (d, i) {
          return -20 - i * 65;
        })
        .attr('width', function (d) {
          return this.parentNode.getBBox().width + 56;
        })
        .attr('height', function (d) {
          return 40;
        })
        .style('fill', 'black');

      g.append('text')
        .attr('text-anchor', 'middle')
        .style('font-size', 8)
        .style('fill', 'white')
        .attr('y', function (d, i) {
          return i * -65;
        })
        .text(function (d) {
          return d;
        });

      let markerCircles = svg
        .selectAll('circle')
        .data([1, 2, 3, 4, 5])
        .enter()
        .append('circle')
        .style('fill', 'none')
        .attr('stroke', 'url(#linear-gradient)')
        .style('stroke-width', '1.5px')
        .attr('cy', fullSVGHeight / 2)
        .attr('cx', markerCirclesScale(name) + 330)
        .attr('r', 0);

      markerCircles
        .transition()
        .duration(1000)
        .attr('r', function (d) {
          return d * 65;
        });

      let personCircles = svg
        .selectAll('a')
        .data(data)
        .enter()
        .append('a')
        .attr('id', function (d) {
          console.log(d['Person name']);
          if (d && d.length !== 0) {
            return d['Person name'].replace(' ', '_');
          }
        })
        .attr('x', function (d) {
          return markerCirclesScale(name);
        })
        .attr('y', function (d) {
          return fullSVGHeight / 2 + 8;
        })
        .style('opacity', 1)
        .call(
          d3
            .drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );

      //Define defs
      let defs = personCircles.append('defs');

      defs
        .append('rect')
        .attr('id', function (d) {
          return 'rect-' + d['Person name'].replace(' ', '_');
        })
        .attr('x', function (d) {
          return markerCirclesScale(name);
        })
        .attr('y', function (d) {
          return fullSVGHeight / 2;
        })
        .attr('width', 50)
        .attr('height', 50)
        .attr('rx', 30)
        .style('fill', function (d) {
          if (
            d['Person name'] === 'Barak Obama' ||
            d['Person name'] === 'Vladimir Putin'
          ) {
            return 'blue';
          } else {
            return 'red';
          }
        });

      defs
        .append('clipPath')
        .attr('id', function (d) {
          return 'clip-' + d['Person name'].replace(' ', '_');
        })
        .append('use')
        .attr('href', function (d) {
          return '#rect-' + d['Person name'].replace(' ', '_');
        });

      let simulation = d3
        .forceSimulation(data)
        .force('charge', d3.forceCollide().radius(100))
        .force('center', d3.forceCenter(fullSVGWidth / 2, fullSVGHeight / 2))
        .force(
          'radius',
          d3
            .forceRadial(
              function (d) {
                return +d['Period'] * 40;
              },
              fullSVGWidth / 2,
              fullSVGHeight / 2
            )
            .strength(0.3)
        )
        .on('tick', ticked)
        .velocityDecay(0.3)
        .stop();

      function ticked() {
        personCircles
          .selectAll('image, rect')
          .attr('x', function (d) {
            return d.x;
          })
          .attr('y', function (d) {
            return d.y;
          });
      }

      d3.timeout(function () {
        personCircles.append('use').attr('href', function (d) {
          return '#rect-' + d['Person name'].replace(' ', '_');
        });
        personCircles
          .append('image')
          .attr('transform', function (d) {
            if (d['Person name'] === 'Vladimir Putin') {
              return 'translate(' + 0 + ',' + 0 + ')';
            }
          })
          .attr('href', function (d) {
            if (d['Person name'] === 'Vladimir Putin') {
              return 'i/person-putin.png';
            } else if (d['Person name'] === 'Barak Obama') {
              return 'i/person-obama.png';
            } else {
              return 'i/person-trump.png';
            }
          })
          .attr('clip-path', function (d) {
            return 'url(#clip-' + d['Person name'].replace(' ', '_');
            +')';
          })
          .attr('x', function (d) {
            return markerCirclesScale(name);
          })
          .attr('y', function (d) {
            return fullSVGHeight / 2 + 8;
          })
          .attr('width', function (d) {
            return 65;
          })
          .attr('height', 50);

        simulation.restart().on('tick', ticked);
      }, 2000);

      function dragstarted(d) {
        d.dragged = true;
        simulation.alphaTarget(0.8).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.timeout(function () {
          d.dragged = false;
        }, 1000);
      }
    }
  })
  .catch((error) => console.log(error));
