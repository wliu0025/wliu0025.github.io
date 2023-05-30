$(function () {

    //Create a word cloud using d3
    //https://gist.github.com/joews/9697914


    // Load the skills.txt file
    d3.text("skills.txt").then(function (data) {
        // Count the number of jobs
        var jobsCount = (data.match(/\n/g) || []).length;


        //remove the ""
        data = data.replace(/"/g, "")

        // Parse the skills data
        var skills = data.split("\n").flatMap(function (line) {
            return line.split(", ");
        }).map(function (skill) {
            return skill.trim();
        });

        // Count the frequency of each skill
        var skillCounts = skills.reduce(function (counts, skill) {
            counts[skill] = (counts[skill] || 0) + 1;
            return counts;
        }, {});
        delete skillCounts[""]
        //console.log(skillCounts)


        // Convert the skill counts to an array of objects
        var wordCloudData = Object.entries(skillCounts).map(function (entry) {
            return { text: entry[0], size: entry[1] };
        });
        //console.log(wordCloudData)

        const Tooltip = d3.select(".tooltip")



        // Set up the word cloud layout
        var width = 600;
        var height = 400;
        var svg = d3.select("#wordCloud")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


        // Generate the word cloud
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(wordCloudData)
            .padding(5)
            .rotate(function () { return ~~(Math.random() * 2) * 90; })
            .fontSize(function (d) { return d.size / 4; }) // Adjust the font size scaling as needed
            .on("end", draw);

        layout.start();

        // Draw the word cloud
        function draw(words) {
            svg.append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function (d) { return d.size + "px"; })
                .style("fill", function () { return d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255); }) // Random color for each word
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .attr("class", "wordcloudText")
                .text(function (d) { return d.text; })
                .on("mouseover", function (event, d) {
                    d3.selectAll(".wordcloudText")
                        .transition()
                        .duration(200)
                        .style("opacity", .5)

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 1)

                    //Add tooltips when mouseover
                    let percentageForThisWord = (d.size / jobsCount) * 100
                    Tooltip
                        .html("<b>" + percentageForThisWord.toFixed(1) + "%</b> data science jobs require <b>" + d.text + "</b>")
                        .style("opacity", 1)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px")
                })
                .on("mouseout", function (event, d) {

                    d3.selectAll(".bar")
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                    //remove tooltip when mouse leave
                    Tooltip
                        .style("opacity", 0)

                });
        }
    });
})