$(function () {
    $("#startBtn").click(function () {
        //triger button click in code: .trigger('click')
        //triger a click in code: 
        $("#nextPage")[0].click()
    })

    let convertStateName = (state) => {
        switch (state) {
            case "Australian Capital Territory":
                state = "ACT"
                break
            case "Western Australia":
                state = "WA"
                break
            case "Northern Territory":
                state = "NT"
                break

            case "South Australia":
                state = "SA"
                break

            case "Queensland":
                state = "QLD"
                break

            case "New South Wales":
                state = "NSW"
                break

            case "Victoria":
                state = "VIC"
                break

            case "Tasmania":
                state = "TAS"
                break
        }
        return state
    }

    //  1.State Choropleth
    // Width and height of the map container
    var width = 600;
    var height = 550;

    // Create an SVG element
    var svg = d3.select("#state_choropleth")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define the projection
    var projection = d3.geoMercator()
        .center([133.7751, -25.2744]) // Longitude and latitude of Australia's center
        .scale(700) // Zoom level
        .translate([width / 2, height / 2]);

    // Create a path generator
    var path = d3.geoPath()
        .projection(projection);



    // Load the GeoJSON data
    //Data source: https://github.com/rowanhogan/australian-states/blob/master/states.geojson
    d3.json("australia-states.geojson").then(function (data) {
        // Read the data values for each state
        d3.csv("merged.csv").then(function (mergedData) {
            // Group the data by State
            var groupedStateData = mergedData.reduce(function (acc, obj) {
                var key = obj.State;
                if (!acc[key]) {
                    acc[key] = 0;
                }
                acc[key]++;
                return acc;
            }, {});
            //console.log(groupedStateData);
            //console.log(Object.values(groupedStateData))

            // Set up color scale
            var colorScale = d3.scaleSequential()
                .domain(d3.extent(Object.values(groupedStateData)))
                .interpolator(d3.interpolateReds);

            let Tooltip = d3.select(".tooltip")

            //Define event functions
            let mouseOver = function (event,d) {
                //console.log(d)
                d3.selectAll(".state")
                    .transition()
                    .duration(200)
                    .style("opacity", .5)
                    .style("stroke", "transparent")
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black")

                let tooltipInfo = this.innerHTML.split("|")
                let state = tooltipInfo[0]
                let jobs = tooltipInfo[1]
                
                let state2=convertStateName(state)
                //bar
                d3.selectAll(".bar")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", stateData=>{
                        if(state2==stateData.state){
                            return 1
                        }
                        return 0.3
                    })
            

                //Display tooltip
                Tooltip
                    .html("State: " + state + "</br>Jobs: <b>" + jobs + "</b> jobs available")
                    .style("opacity", 1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px")
            }


            let mouseOut = function (d) {
                d3.selectAll(".state")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent")
                    

                d3.selectAll(".bar")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 1)

                Tooltip
                    .style("opacity", 0)
            }

            // Draw the states
            svg.selectAll(".state")
                .data(data.features)
                .enter().append("path")
                .attr("class", "state")
                .attr("d", path)
                .style("stroke", "transparent")
                .style("fill", function (d) {
                    var stateName = d.properties.STATE_NAME;
                    var value = groupedStateData[stateName];
                    return colorScale(value);
                })
                .text(function (d) {
                    var stateName = d.properties.STATE_NAME;
                    return stateName + "|" + groupedStateData[stateName];
                })
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            //                                                 State text
            svg.selectAll("text")
                .data(data.features)
                .enter()
                .append("text")
                .attr("fill", "#666")
                .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
                .attr("text-anchor", "middle")
                .style("font-size", "5px")
                .attr("dy", ".35em")
                .text(function (d) {
                    switch (d.properties.STATE_NAME) {
                        case "Australian Capital Territory":
                            return ""
                        case "Western Australia":
                            return "WA"
                        case "Northern Territory":
                            return "NT"
                        case "South Australia":
                            return "SA"
                        case "Queensland":
                            return "QLD"
                        case "New South Wales":
                            return "NSW"
                        case "Victoria":
                            return "VIC"
                        case "Tasmania":
                            return "TAS"
                    }

                    return "";
                });



            //                                                         State legend
            var legendSvg = d3.select("#state_legend")
                .attr("width", 200)
                .attr("height", 50);

            // Add legend
            var legend = legendSvg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(20, 20)");

            var legendWidth = 180;
            var legendHeight = 10;

            // Create a linear gradient for the legend colors
            var defs = legend.append("defs");
            var gradient = defs.append("linearGradient")
                .attr("id", "legend-gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            // Add color stops to the gradient
            var numStops = 30;
            for (var i = 0; i < numStops; i++) {
                var offset = (i / (numStops - 1)) * 100 + "%";
                gradient.append("stop")
                    .attr("offset", offset)
                    .style("stop-color", colorScale(i * 10))
                    .style("stop-opacity", 1);
            }

            // Add the gradient rectangle to the legend
            legend.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)");

            // Add legend text labels
            legend.append("text")
                .attr("class", "legend-label")
                .attr("x", 0)
                .attr("y", legendHeight + 10)
                .text(d3.min(Object.values(groupedStateData)));

            legend.append("text")
                .attr("class", "legend-label")
                .attr("x", legendWidth)
                .attr("y", legendHeight + 10)
                .attr("text-anchor", "end")
                .text(d3.max(Object.values(groupedStateData)));





        })


    });









})