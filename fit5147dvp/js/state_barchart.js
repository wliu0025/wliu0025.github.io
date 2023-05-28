$(function () {
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

    //Sortable bar chart: https://gist.github.com/mbostock/3885705
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .range([0, width])
        .paddingInner(0.1)
        .paddingOuter(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);

    const yAxis = d3.axisLeft(y);

    const svg = d3.select("#state_barchart")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const Tooltip = d3.select(".tooltip")

    const bar_texture = textures.lines()
        .orientation("3/8")
        .stroke("darkorange");
    svg.call(bar_texture)

    d3.csv("merged.csv").then(function (data) {
        const groupedData = data.reduce(function (acc, obj) {
            const key = obj.State;
            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key]++;
            return acc;
        }, {});

        // const transformedData = Object.entries(groupedData).map(([state, jobs]) => {
        //     return { state, jobs };
        // });
        const transformedData = Object.entries(groupedData).map(([state, jobs]) => {
            state = convertStateName(state)
            return { state, jobs };
        });
        console.log(transformedData)

        x.domain(transformedData.map(function (d) {
            return d.state;
        }));
        y.domain([0, d3.max(transformedData, function (d) { return d.jobs; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number Of Jobs");

        svg.selectAll(".bar")
            .data(transformedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", d => bar_texture.url())
            .attr("x", function (d) {
                return x(d.state);
            })
            .attr("width", x.bandwidth())
            .attr("y", function (d) { return y(d.jobs); })
            .attr("height", function (d) { return height - y(d.jobs); })
            .on("mouseover", function (event, d) {
                //bar
                d3.selectAll(".bar")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", .3)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 1)

                //reflect in State Cholopleth
                d3.selectAll(".state")
                    .transition()
                    .duration(200)
                    .style("opacity", stateData => {
                        var state_name = stateData.properties.STATE_NAME
                        state_name = convertStateName(state_name)
                        if (state_name == d.state) {
                            return 1
                        }
                        return .5
                    })
                    .style("stroke", stateData => {
                        var state_name = stateData.properties.STATE_NAME
                        state_name = convertStateName(state_name)
                        if (state_name == d.state) {
                            return "black"
                        }
                        return "transparent"
                    })


                Tooltip
                    .html("State: " + d.state + "</br>Jobs: <b>" + d.jobs + "</b> jobs available")
                    .style("opacity", 1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px")
            })
            .on("mouseout", function (event, d) {

                d3.selectAll(".bar")
                    .transition()
                    .duration(200)
                    .style("fill-opacity", 0.8)

                d3.selectAll(".state")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent")


                Tooltip
                    .style("opacity", 0)

            });

        d3.select("input").on("change", change);


        //Sort 
        function change() {
            const x0 = x.domain(transformedData.sort(this.checked
                ? function (a, b) { return b.jobs - a.jobs; }
                : function (a, b) { return d3.ascending(a.state, b.state); })
                .map(function (d) { return d.state; }))
                .copy();

            svg.selectAll(".bar")
                .sort(function (a, b) { return x0(a.state) - x0(b.state); });

            const transition = svg.transition().duration(750);
            const delay = function (d, i) { return i * 50; };

            transition.selectAll(".bar")
                .delay(delay)
                .attr("x", function (d) { return x0(d.state); });

            transition.select(".x.axis")
                .call(xAxis)
                .selectAll("g")
                .delay(delay);
        }
    });

})