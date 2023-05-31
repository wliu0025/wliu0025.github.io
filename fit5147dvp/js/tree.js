$(function () {

    d3.csv("merged.csv").then(function (data) {
        //1.wrange the data
        const result = {};

        for (const item of data) {
            const jobType = item.Job_Type;
            const skills = item.Skills.split(", ");

            if (!result[jobType]) {
                result[jobType] = [];
            }

            for (const skill of skills) {
                if (skill == '') continue
                let found = false;
                for (const entry of result[jobType]) {
                    if (entry.skill === skill) {
                        entry.count++;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    result[jobType].push({ skill: skill, count: 1 });
                }
            }
        }

        for (const jobType in result) {
            result[jobType].sort((a, b) => b.count - a.count);
        }

        //console.log(result);


        //group data by job_type
        const groupedData = data.reduce(function (acc, obj) {
            const key = obj.Job_Type;
            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key]++;
            return acc;
        }, {});
        let total = 0;
        for (let role in groupedData) {
            total += groupedData[role];
        }
        groupedData["Data Science jobs"] = total


        //2.Draw the tree diagram
        const treeData = {
            name: 'Data Science jobs',
            children: []
        };

        // Create second level nodes
        for (const jobType in result) {
            const jobTypeNode = {
                name: jobType,
                children: []
            };
            treeData.children.push(jobTypeNode);

            // Create third level nodes
            for (const skillObj of result[jobType]) {
                const skillNode = {
                    name: skillObj.skill,
                    value: skillObj.count
                };
                jobTypeNode.children.push(skillNode);
            }
        }
        console.log(treeData)



        const width = 600;
        const height = 600;

        const svg = d3.select('#tree-diagram')
            .attr('width', width)
            .attr('height', height);

        const root = d3.hierarchy(treeData);
        const treeLayout = d3.tree().size([width, height - 100]);
        treeLayout(root);




        //Define the texture
        const node_texture = textures.lines().thicker();
        svg.call(node_texture)


        const link = svg.selectAll('.link')
            .data(root.descendants().slice(1))
            .join('path')
            .attr('class', 'link')
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });;

        const node = svg.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y + 6},${d.x})`);

        const Tooltip = d3.select(".tooltip")

        node.append('circle')
            .attr('r', 5)
            .data(root.descendants())
            .attr("fill", d => node_texture.url())
            .on("mouseover", function (event, d) {
                
                // hightlight the node when hover on
                d3.select(this)
                    .classed("circle-highlighted", true);
                if(!d.children){
                    let percentageForThisWord = (d.data.value / groupedData[d.parent.data.name]) * 100
                    Tooltip
                        .html( "<b>" + percentageForThisWord.toFixed(1) + "%</b> " + d.parent.data.name + " jobs require <b>"+d.data.name+"</b> skill")
                        .style("opacity", 1)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px")
                }
                
            })
            .on("mouseout", function () {
                // restore this node to normal mode
                d3.selectAll("circle")
                    .classed("circle-highlighted", false);

                Tooltip
                    .style("opacity", 0)
            });

        node.append('text')
            .attr("dx", d => {
                //console.log(d)
                if (d.data.name == 'Data Science jobs') {
                    return "13em"
                }
                if (d.children) {
                    return "3em"
                } else {
                    return "1em"
                }

            })
            .attr("dy", d => d.children ? "-1em" : "0.2em")
            .attr("class", "label")
            .attr('text-anchor', d => d.children ? 'end' : 'start')
            .text(d => {
                if (!d.children) {

                    return d.data.name
                }

                return d.data.name + ": " + groupedData[d.data.name] +" jobs"
            });
    })
})