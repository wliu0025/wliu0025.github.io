$(function(){
    $("#startBtn").click(function(){
        //triger button click in code: .trigger('click')
        //triger a click in code: 
        $("#nextPage")[0].click()
    })


    //  1.State Choropleth
    // Width and height of the map container
    var width = 600;
    var height = 400;

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

            let Tooltip=d3.select(".tooltip")

            //Define event functions
            let mouseOver = function (d) {
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

                let tooltipInfo=this.innerHTML.split("|")
                let state=tooltipInfo[0]
                let jobs=tooltipInfo[1]

                Tooltip
                    .html("State: " +state+"</br>Jobs: <b>"+jobs+ "</b> jobs available")
                    .style("opacity",1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px")
            }
            

            let mouseOut = function (d) {
                d3.selectAll(".state")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "transparent")

                Tooltip
                    .style("opacity",0)
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
                .text(function(d) {
                    var stateName = d.properties.STATE_NAME;
                    return stateName+"|"+groupedStateData[stateName];
                })
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            svg.selectAll("text")
                .data(data.features)
                .enter()
                .append("text")
                .attr("fill", "#aaa")
                .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
                .attr("text-anchor", "middle")
                .style("font-size","10px")
                .attr("dy", ".35em")
                .text(function(d) {
                    switch(d.properties.STATE_NAME){
                        case "Australian Capital Territory":
                            return "ACT"
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
                    
                    return d.properties.STATE_NAME;
                });


        })


    });






    


})