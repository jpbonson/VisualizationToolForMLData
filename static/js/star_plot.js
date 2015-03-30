function star_plot(brushed_data) {
    d3.select(star_plot_id).select("svg").remove("svg"); // reset

    // variables
    var obj = star_plot_id
    var width = 250
    var dot_size = 4
    var label_horizontal_space = 0.6
    var label_vertical_space = 1.0
    var ticks = 5
    var padding = 60
    var axis_text_alignment = 3
    var opacity = 0.5
    var opacity_min = 0.2
    var opacity_max = 0.9
    var radius = width/2;
    
    // load CSV data and process it
    d3.csv(data_file, function(error, data) {
        var original_data = data
        if(typeof brushed_data !== 'undefined') {
            data = brushed_data
        };
        var attributes = d3.keys(data[0]).filter(function(d, i) { return d !== "labels" && columns_mask[i]; })
        var classes = data.map(function(d) { return d.labels; }).filter( unique );
        var radians = (2 * Math.PI)/attributes.length

        // get mean values per class per column
        var avg_values = []
        classes.forEach(function(c) {
            var avg_values_per_class = []
            var temp_data = data.filter(function(d, i) {
                return d.labels === c;
            })
            attributes.forEach(function(k) {
                avg_values_per_class.push(round_to_one_decimal(d3.mean(temp_data, function(d) { return +d[k] })))
            });
            avg_values.push(avg_values_per_class)
        });

        // get max values per column
        max_values = []
        attributes.forEach(function(k) {
            max_values.push(round_to_one_decimal(d3.max(original_data, function(d) { return +d[k] })))
        });

        // create chart
        var svg = d3.select(obj).append("svg")
                .attr("width", width + padding)
                .attr("height", width + padding)
            .append("g")
                .attr("transform", "translate(" + padding/2 + "," + padding/2 + ")");
      
        for(var j = 1; j < ticks+1; j++) {
            var level = radius*(j/ticks);

            // path (background gray lines)
            svg.selectAll(".ticks") 
                .data(attributes)
                .enter().append("svg:line")
                    .attr("x1", function(d, i){return level*(1-Math.sin(i*radians));})
                    .attr("y1", function(d, i){return level*(1-Math.cos(i*radians));})
                    .attr("x2", function(d, i){return level*(1-Math.sin((i+1)*radians));})
                    .attr("y2", function(d, i){return level*(1-Math.cos((i+1)*radians));})
                    .attr("class", "line")
                    .style("stroke", "grey")
                    .style("stroke-width", "0.3px")
                    .attr("transform", "translate(" + (radius-level) + ", " + (radius-level) + ")");

            // axis texts
            svg.selectAll(".ticks")
               .data(attributes)
               .enter().append("svg:text")
                   .attr("x", function(d, i){return level*(1-Math.sin(i*radians));})
                   .attr("y", function(d, i){return level*(1-Math.cos(i*radians));})
                   .attr("class", "legend")
                   .style("font-family", "sans-serif")
                   .style("font-size", "10px")
                   .attr("transform", "translate(" + (radius-level + axis_text_alignment) + ", " + (radius-level - axis_text_alignment) + ")")
                   .text(function(d, i){return round_to_one_decimal(j*max_values[i]/ticks);});
        }

        // create axis
        var axis = svg.selectAll(".axis")
            .data(attributes)
            .enter().append("g")
                .attr("class", "axis");

        axis.append("line")
            .attr("x1", radius)
            .attr("y1", radius)
            .attr("x2", function(d, i){return radius*(1-Math.sin(i*radians));})
            .attr("y2", function(d, i){return radius*(1-Math.cos(i*radians));})
            .attr("class", "line")
            .style("stroke", "grey")
            .style("stroke-width", "1px");

        axis.append("text")
            .attr("class", "legend")
            .text(function(d) { return d } )
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .attr("transform", function(d, i) {return "translate(0, -10)"} )
            .attr("x", function(d, i) {return radius*(1-label_horizontal_space*Math.sin(i*radians))-60*Math.sin(i*radians); })
            .attr("y", function(d, i) {return radius*(1-label_vertical_space*Math.cos(i*radians))-20*Math.cos(i*radians); });

        // create colored data in the chart
        avg_values.forEach(function(item, class_id) {
            // define polygon shape
            dataValues = [];
            svg.selectAll(".nodes")
                .data(item, function(d, i){
                    dataValues.push([
                        radius*(1-(parseFloat(d)/max_values[i])*Math.sin(i*radians)), 
                        radius*(1-(parseFloat(d)/max_values[i])*Math.cos(i*radians))
                    ]);
                });
            // draw the polygon
            svg.selectAll(".area")
                .data([dataValues])
                .enter()
                    .append("polygon")
                    .attr("class", "radar-chart-"+class_id)
                    .style("stroke-width", "2px")
                    .style("stroke", colors(classes[class_id]) )
                    .attr("points", function(d) {
                        var str = "";
                        for (var point = 0; point < d.length; point++) {
                            str = str+d[point][0]+","+d[point][1]+" ";
                        }
                        return str;
                    })
                    .style("fill", colors(classes[class_id]) )
                    .style("fill-opacity", opacity)
                    .on('mouseover', function(d) {
                        svg.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", opacity_min); 
                        svg.selectAll("polygon."+d3.select(this).attr("class"))
                            .transition(200)
                            .style("fill-opacity", opacity_max);
                     })
                    .on('mouseout', function() {
                        svg.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", opacity);
                    });
        });

        // create tooltips
        var tooltip = svg.append("g")
            .style("position", "absolute")
            .style("opacity", 1)
            .style("display", "none");
            
        tooltip.append("rect")
            .attr("width", 50)
            .attr("height", 25)
            .attr("fill", "black")
            .style("stroke-width", 3)
            .style("stroke", "black")
            .style("position", "absolute")
            .style("opacity", 0.9);

        tooltip.append("text")
            .attr("x", 25)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .style("text-align", "center")
            .style("font", "16px sans-serif")
            .style("font-weight", "bold")
            .style("fill", "white")
            .attr("font-size", "12px");

        // create the dots at the end of the geometries
        avg_values.forEach(function(item, class_id){
            svg.selectAll(".nodes")
                .data(item)
                .enter().append("svg:circle")
                    .attr("class", "radar-chart-"+class_id)
                    .attr('r', dot_size)
                    .attr("cx", function(d, i) { return radius*(1-(d/max_values[i])*Math.sin(i*radians)); })
                    .attr("cy", function(d, i) { return radius*(1-(d/max_values[i])*Math.cos(i*radians)); })
                    .style("fill", colors(classes[class_id]) )
                    .on('mouseover', function(d) {
                        xPosition =  parseFloat(d3.select(this).attr('cx')) - 25;
                        yPosition =  parseFloat(d3.select(this).attr('cy')) - 35;
                        tooltip.style("display", null);
                        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                        tooltip.select("text").text(d);

                        svg.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", opacity_min); 
                        svg.selectAll("polygon."+d3.select(this).attr("class"))
                            .transition(200)
                            .style("fill-opacity", opacity_max);
                     })
                    .on('mouseout', function() {
                        tooltip.style("display", "none"); 

                        svg.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", opacity);
                    });
        });
    });
}