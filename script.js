const EDUCATION_DATA =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

// SAMPLE EDUCATION DATA:
// {
//  "fips": 1001,
//  "state": "AL",
//  "area_name": "Autauga County",
//  "bachelorsOrHigher": 21.9
// }

const COUNTY_DATA =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();

var projection = d3
    .geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Data and color scale
var data = new Map();

// returns color in the scale
var colorScale = d3
    .scaleThreshold()
    .domain(d3.range(10, 65))
    .range(d3.schemeBlues[9]);

var promises = [
    d3.json(COUNTY_DATA),
    d3.json(EDUCATION_DATA).then((d) => {
        d.forEach((element) => {
            data.set(element.fips, element.bachelorsOrHigher);
        });
    }),
];

Promise.all(promises).then(ready);

function ready([us]) {
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("fill", function (d) {
            return colorScale(data.get(d.id));
        })
        .attr("d", path)
        .append("title")
        .text(function (d, i) {
            return data.get(d.id) + " %";
        });
}
