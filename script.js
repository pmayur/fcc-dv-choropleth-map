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
var colorScale = d3.scaleQuantize().domain([3, 75]).range(d3.schemeBlues["9"]);

var promises = [
    d3.json(COUNTY_DATA),
    d3.json(EDUCATION_DATA).then((d) => {
        d.forEach((element) => {
            data.set(element.fips, {
                fips: element.fips,
                county: element.area_name,
                state: element.state,
                percentage: element.bachelorsOrHigher,
            });
        });
    }),
];

Promise.all(promises).then(ready);

function ready([us]) {
    // creates the map
    let map = svg
        .append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", (d) => data.get(d.id).fips)
        .attr("data-education", (d) => data.get(d.id).percentage)
        .attr("fill", function (d) {
            return colorScale(data.get(d.id).percentage);
        })
        .attr("d", path);

    // create a tooltip
    var tooltip = d3
        .select("#root")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);
    
    // add a mouseover function for counties
    map.on("mouseover", function(d){

        // get id from attributes
        let id = d.srcElement.getAttribute("data-fips");
        let element = data.get(parseInt(id))

        tooltip.attr("data-education", element.percentage)
        tooltip
                .html(
                    element.county + ", " + element.state +
                        "<br/>" +
                        "Graduate and ablove: " + element.percentage + "%"
                )
                .style("left", d.pageX + "px")
                .style("top", d.pageY - 28 + "px");

        // make tooltip visible
        tooltip.transition().duration(200).style("opacity", 0.9);
    })

    // make tooltip disappear
    map.on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    // declares the legend scale
    var x = d3.scaleLinear().domain([3, 75]).rangeRound([9, 226]);

    // append legend scale to the svg
    var g = svg
        .append("g")
        .attr("class", "key")
        .attr("transform", "translate(0," + (height - 20) + ")");

    // append legend description on legend scale
    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -15)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .text("Education rate (%)");

    // format scale, specify ticks
    g.call(d3.axisBottom(x).ticks(7)).select(".domain").remove();

    // specify color pallete for legend
    var pallete = svg.append("g").attr("id", "legend");

    // add colors to legend
    var swatch = pallete.selectAll("rect").data(d3.schemeBlues[8]);
    swatch
        .enter()
        .append("rect")
        .attr("fill", function (d) {
            return d;
        })
        .attr("x", function (d, i) {
            return i * 30 + "";
        })
        .attr("y", function (d, i) {
            return height - 30 + "";
        })
        .attr("width", "30")
        .attr("height", "10");
}
