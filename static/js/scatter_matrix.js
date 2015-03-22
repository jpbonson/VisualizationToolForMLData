function chart_scatter_matrix() { 
    var obj = matrix_id
    var width = 650
    var padding = 19.5
    var dot_size = 3

    var use_zoom = false
    var use_partial_row_zoom = false
    var use_partial_column_zoom = false
    if(selected_row !== -1 && selected_column !== -1) {
        use_zoom = true
    } else if(selected_row !== -1) {
        use_partial_row_zoom = true
    } else if(selected_column !== -1) {
        use_partial_column_zoom = true
    }

    d3.csv(data_file, function(error, data) {
        var domain_per_attribute = {}
        var attributes = d3.keys(data[0]).filter(function(d, i) { return d !== "labels" && columns_mask[i]; })

        var n = attributes.length;
        if(use_zoom) {
            n = 1
        }
        var classes = data.map(function(d) { return d.labels; }).filter( unique );

        attributes.forEach(function(trait) {
            domain_per_attribute[trait] = d3.extent(data, function(d, i) { return d[trait]; });
        });

        chart_size = width/n

        var data_axis_x = attributes
        var data_axis_y = attributes
        var ticks = 5
        if(use_zoom) {
            data_axis_x = [attributes[selected_column]]
            data_axis_y = [attributes[selected_row]]
            ticks = 10
        }

        var x = d3.scale.linear()
            .range([padding / 2, chart_size - padding / 2]);

        var y = d3.scale.linear()
            .range([chart_size - padding / 2, padding / 2]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(ticks);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(ticks);

        xAxis.tickSize(width);
        yAxis.tickSize(-width);

        var svg = d3.select(obj).append("svg")
                .attr("width", width + padding)
                .attr("height", width + padding)
            .append("g")
                .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
                .data(data_axis_x)
            .enter().append("g")
                .attr("class", "x axis")
                .attr("transform", function(d, i) { return "translate(" + i * chart_size + ",0)"; })
                .each(function(d) { x.domain(domain_per_attribute[d]); d3.select(this).call(xAxis); });

        svg.selectAll(".y.axis")
                .data(data_axis_y)
            .enter().append("g")
                .attr("class", "y axis")
                .attr("transform", function(d, i) { return "translate(0," + i * chart_size + ")"; })
                .each(function(d) { y.domain(domain_per_attribute[d]); d3.select(this).call(yAxis); });

        var cell = svg.selectAll(".cell")
                .data(attributes_matrix(attributes, attributes))
            .enter().append("g")
                .attr("class", "cell")
                .attr("transform", function(d) {
                    if(use_zoom) {
                        return "translate(0,0)";
                    } else {
                        return "translate(" + d.column * chart_size + "," + d.row * chart_size + ")";
                    }
                })
                .each(plot);

        var brush = d3.svg.brush()
            .x(x)
            .y(y)
            .on("brushstart", brushstart)
            .on("brush", brushmove)
            .on("brushend", brushend);

        cell.filter(function(d) { return d.row !== d.column; }).call(brush);

        var brush_cell;

        // reset the previous brush
        function brushstart(p) {
                if (brush_cell !== this) {
                    d3.select(brush_cell).call(brush.clear());
                    x.domain(domain_per_attribute[p.attributes_x]);
                    y.domain(domain_per_attribute[p.attributes_y]);
                    brush_cell = this;
                }
        }

        // highlights the selected data in the scatter plots
        function brushmove(p) {
                var e = brush.extent();
                svg.selectAll("circle").classed("hidden", function(d) {
                    return e[0][0] > d[p.attributes_x] || d[p.attributes_x] > e[1][0] || e[0][1] > d[p.attributes_y] || d[p.attributes_y] > e[1][1];
                });
        }

        // if there is no brush, select all data (default)
        function brushend() {
            if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
        }

        // create the charts inside the matrix
        function plot(chart) {
            var cell = d3.select(this);

            x.domain(domain_per_attribute[chart.attributes_x]);
            y.domain(domain_per_attribute[chart.attributes_y]);

            height = chart_size - padding

            // chart box
            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", height)
                .attr("height", height);

            // chart data
            if (chart.column !== chart.row) { // scatter plot
                cell.selectAll("circle")
                        .data(data)
                    .enter().append("circle")
                        .attr("class", "circle")
                        .attr("cx", function(d) { return x(d[chart.attributes_x]); })
                        .attr("cy", function(d) { return y(d[chart.attributes_y]); })
                        .attr("r", dot_size)
                        .style("fill", function(d) { return colors(d.labels); });
            } else { // histogram
                // bars content
                var num_bars = 5
                var start = +domain_per_attribute[chart.attributes_x][0]
                var end = +domain_per_attribute[chart.attributes_x][1]
                var step = Number(((end - start)/num_bars).toFixed(1));
                var histogram_data = []
                var cont = 0
                for (var i = start; i < end-step; i+=step) {
                    cont += 1
                    var temp = 0
                    var current_step = Number((i+step).toFixed(1));
                    i = Number((i).toFixed(1));
                    for (var k = 0; k < data.length; k++) {
                        d = data[k]
                        if(d[chart.attributes_x] >= i && d[chart.attributes_x] < current_step) {
                            temp++
                        } else {
                            if (cont == num_bars && d[chart.attributes_x] >= current_step) {
                                temp++
                            }
                        }
                    }
                    histogram_data.push({x: "["+i+", "+current_step+"]", y:temp})
                }

                var x2 = d3.scale.ordinal().rangeRoundBands([0, chart_size - padding], .5);
                var y2 = d3.scale.linear().range([chart_size - padding, 10]);

                x2.domain(histogram_data.map(function(data) { return data.x; }));
                y2.domain([0, d3.max(histogram_data, function(data) { return data.y; })]);

                // setup tooltip
                var tooltip_width = 80
                var tooltip_height = 25
                var tooltip = svg.append("g")
                    .attr("class", "row-tooltip")
                    .style("position", "absolute")
                    .style("opacity", 1)
                    .style("display", "none");
                    
                tooltip.append("rect")
                    .attr("width", tooltip_width)
                    .attr("height", tooltip_height)
                    .attr("fill", "black")
                    .style("stroke-width", 3)
                    .style("stroke", "black")
                    .style("position", "absolute")
                    .style("opacity", 0.9);

                tooltip.append("text")
                    .attr("x", tooltip_width/2)
                    .attr("y", "1.2em")
                    .style("text-anchor", "middle")
                    .style("text-align", "center")
                    .style("fill", "white")
                    .attr("font-size", "12px");

                // bars chart
                var bar = cell.selectAll("bar")
                    .data(histogram_data)
                .enter()

                bar.append("rect")
                    .style("fill", "#C80000")
                    .attr("x", function(d) { return x2(d.x) + 10 ; })
                    .attr("width", x2.rangeBand())
                    .attr("y", function(d) { return y2(d.y) + padding/2; })
                    .attr("height", function(d) { return (chart_size - padding) - y2(d.y); })
                    .on("mouseover", function(d) { 
                        tooltip.style("display", null); 
                        d3.select(this)
                            .transition().duration(100)
                                .style("fill", "#500000")
                    })
                    .on("mouseout", function() { 
                        tooltip.style("display", "none"); 
                        d3.select(this)
                            .transition().duration(100)
                                .style("fill", "#C80000")
                    })
                    .on("mousemove", function(data) {
                        var xPosition = chart.column*chart_size + d3.mouse(this)[0] - tooltip_width/2;
                        var yPosition = chart.row*chart_size + d3.mouse(this)[1]  - tooltip_height*1.5;
                        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                        tooltip.select("text").text(data.x);
                    });

                bar.append("text")
                        .attr("x", function(d) { return x2(d.x) + 10 ; })
                        .attr("y", function(d) { return y2(d.y); })
                        .attr("dy", ".70em")
                        .text(function(d) { return d.y; })
                        .style("fill", "black")
                        .style("font-size", x2.rangeBand()*0.77+"px")

                // titles
                cell.append("text")
                    .attr("class", "histograms-titles")
                    .attr("x", padding)
                    .attr("y", padding)
                    .attr("dy", ".71em")
                    .text(function(d) { return d.attributes_x; });
                }
        }

        // cross the attributes to create the matrix of attributes
        function attributes_matrix(attribute1, attribute2) {
            var crossed_attributes = []
            for (var i = 0; i < attribute1.length; i++) {
                for (var j = 0; j < attribute2.length; j++) {
                    if(use_zoom) {
                        if(selected_row === j && selected_column === i) {
                            crossed_attributes.push({attributes_x: attribute1[i], column: i, attributes_y: attribute2[j], row: j});
                        }
                    } else if(use_partial_row_zoom) {
                        if(selected_row === j) {
                            crossed_attributes.push({attributes_x: attribute1[i], column: i, attributes_y: attribute2[j], row: j});
                        }
                    } else if(use_partial_column_zoom) {
                        if(selected_column === i) {
                            crossed_attributes.push({attributes_x: attribute1[i], column: i, attributes_y: attribute2[j], row: j});
                        }
                    } else {
                        crossed_attributes.push({attributes_x: attribute1[i], column: i, attributes_y: attribute2[j], row: j});
                    }
                }
            }
            return crossed_attributes;
        }
    });  
}
