$(function () {
    //Stacked barchart with group highlighting
    //https://d3-graph-gallery.com/graph/barplot_stacked_highlight.html
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 20, left: 50 },
        width = 460 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const Tooltip = d3.select(".tooltip")


    

    function chart1(data) {
        let groupedData = data.reduce((result, obj) => {
            const { Job_Type, Seniority_Level } = obj;
            const key = Job_Type.toLowerCase();

            if (!result[key]) {
                result[key] = {
                    group: Job_Type,
                    [Seniority_Level]: 1,
                    Associate: 0
                };
            } else {
                result[key][Seniority_Level] = (result[key][Seniority_Level] || 0) + 1;
            }

            result[key].Associate = (result[key].Associate || 0);

            return result;
        }, {});

        let convertedData = Object.values(groupedData).map(obj => {
            if (obj.group == 'Data Engineer') {
                obj.Internship = 0
                obj.Director = 0
            } else if (obj.group == "Data Scientist") {
                obj.Internship = 0
            }
            return obj
        });
        return convertedData
    }

    function chart2(data) {
        let groupedData = data.reduce((result, obj) => {
            const { Job_Type, Employment_Type } = obj;
            const key = Job_Type.toLowerCase();

            if (!result[key]) {
                result[key] = {
                    group: Job_Type,
                    [Employment_Type]: 1,
                    Associate: 0
                };
            } else {
                result[key][Employment_Type] = (result[key][Employment_Type] || 0) + 1;
            }

            result[key].Associate = (result[key].Associate || 0);

            return result;
        }, {});

        let convertedData = Object.values(groupedData).map(obj => {
            if (!obj.Other) {
                obj.Other = 0
            }
            if (!obj["Part-time"]) {
                obj["Part-time"] = 0
            }
            if (!obj.Temporary) {
                obj.Temporary = 0
            }
            if (!obj.Internship) {
                obj.Internship = 0
            }
            return obj
        });
        console.log(convertedData)

        return convertedData
    }


    function common(data, chart) {
        const svg = d3.select("#stacked_chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);



        let convertedData = chart(data)

        const subgroups = Object.keys(convertedData[0]).slice(1);
        //console.log(subgroups);  //['Mid-Senior level', 'Associate', 'Not Applicable', 'Entry level', 'Internship', 'Director']

        const groups = convertedData.map(d => d.group)
        //console.log(groups)  //['Data Analyst', 'Data Engineer', 'Data Scientist']



        // Add X axis
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 420])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number Of Jobs");

        // color palette = one color per subgroup
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        //stack the data? --> stack per subgroup
        const stackedData = d3.stack()
            .keys(subgroups)
            (convertedData)

        //console.log(stackedData)



        // ----------------
        // Highlight a specific subgroup when hovered
        // ----------------

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .attr("class", d => "myRect " + d.key.split(' ').join('')) // Add a class to each subgroup: their name
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.group))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", function (event, d) { // What happens when user hover a bar

                // what subgroup are we hovering?
                const subGroupName = d3.select(this.parentNode).datum().key
                // console.log(subGroupName)

                // Reduce opacity of all rect to 0.2
                d3.selectAll(".myRect").style("opacity", 0.2)

                // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
                d3.selectAll("." + subGroupName.split(' ').join('')).style("opacity", 1)

                //Show tooltips
                Tooltip
                    .html("Level: " + subGroupName + "</br>Jobs: <b>" + d.data[subGroupName] + "</b> jobs available")
                    .style("opacity", 1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY) + "px")
            })
            .on("mouseleave", function (event, d) { // When user do not hover anymore

                // Back to normal opacity: 1
                d3.selectAll(".myRect")
                    .style("opacity", 1)

                Tooltip
                    .style("opacity", 0)

            })



        const legendContainer = d3.select("#stacked_chart_legend");

        // Create a legend item for each subgroup
        const legendItems = legendContainer.selectAll(".legend-item")
            .data(subgroups)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        // Add color squares to the legend
        legendItems.append("div")
            .style("width", "12px")
            .style("height", "12px")
            .style("background-color", d => color(d));

        // Add labels to the legend
        legendItems.append("span")
            .text(d => d)
            .style("margin-left", "5px");
    }



    d3.csv("merged.csv").then(function (data) {
        common(data, chart1)

        d3.select("#button1")
            .on("click", function (event) {
                d3.select("#stacked_chart").selectAll("*").remove();
                d3.select("#stacked_chart_legend").selectAll("*").remove();
                common(data, chart1)
                //Change the right contents
                let content1="The majority of Data Analyst roles are available at the Associate and Mid-Senior levels, with 61 and 59 positions respectively. Entry-level positions follow closely behind with 55 openings. There is a single Director-level position and an Internship opportunity within the Data Analyst field."
                $("#content1").html(content1)
                let content2="In the Data Engineering domain, Mid-Senior level positions account for the highest number with 164\
                openings, followed by Associate positions with 84 opportunities. Entry-level roles positions is 83. There are no Director-level positions or Internship\
                opportunities within Data Engineering."
                $("#content2").html(content2)
                let content3="For Data Scientists,\
                Mid-Senior level positions have the highest count with 38 openings, while Associate\
                positions come in second with 26 opportunities. Entry-level roles and 12 positions respectively. Similar to Data Analysts, there is a\
                single Director-level position but no Internship opportunities in the Data Science field."
                $("#content3").html(content3)
            
            })

        d3.select("#button2")
            .on("click", function (event) {
                d3.select("#stacked_chart").selectAll("*").remove();
                d3.select("#stacked_chart_legend").selectAll("*").remove();
                common(data, chart2)
                //Change the right contents
                //Change the right contents
                let content1="Most Data Analyst jobs are full-time and contrast types. Part-time and tempoary employment types are limites"
                $("#content1").html(content1)
                let content2="There are only Full-time and contrast for Data Engineer"
                $("#content2").html(content2)
                let content3="Similarly,Full-time and contrast are basic emplyment types for Data scientist,but a few part-time and internship are available"
                $("#content3").html(content3)


            })

    })






})
