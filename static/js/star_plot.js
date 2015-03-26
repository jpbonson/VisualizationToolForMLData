function star_plot(data) {
    d3.select(obj).select("svg").remove(); // reset

    // variables
    var obj = star_plot_id
    var width = 250
    var dot_size = 4
    var label_horizontal_space = 0.6
    var label_vertical_space = 1.0
    var ticks = 5
    var max_value = 1.0 // TODO: max per axis
    // max_value = Math.max(max_value, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    var padding = 60
    var axis_text_alignment = 3
    var opacity = 0.6
    var axis_labels = ["sepal length", "sepal width", "petal length", "petal width"]
    var radius = width/2;
    var radians = (2 * Math.PI)/axis_labels.length
    
    // create chart
    var svg = d3.select(obj).append("svg")
            .attr("width", width + padding)
            .attr("height", width + padding)
        .append("g")
            .attr("transform", "translate(" + padding/2 + "," + padding/2 + ")");
  
    for(var j = 0; j < ticks; j++) {
        var level = radius*((j+1)/ticks);

        // path (background gray lines)
        svg.selectAll(".ticks") 
            .data(axis_labels)
            .enter().append("svg:line")
                .attr("x1", function(d, i){return level*(1-Math.sin(i*radians));})
                .attr("y1", function(d, i){return level*(1-Math.cos(i*radians));})
                .attr("x2", function(d, i){return level*(1-Math.sin((i+1)*radians));})
                .attr("y2", function(d, i){return level*(1-Math.cos((i+1)*radians));})
                .attr("class", "line")
                .style("stroke", "grey")
                .style("stroke-opacity", "0.75")
                .style("stroke-width", "0.3px")
                .attr("transform", "translate(" + (radius-level) + ", " + (radius-level) + ")");

        // axis texts
        svg.selectAll(".ticks")
           .data(axis_labels)
           .enter().append("svg:text")
               .attr("x", function(d, i){return level*(1-Math.sin(i*radians));})
               .attr("y", function(d, i){return level*(1-Math.cos(i*radians));})
               .attr("class", "legend")
               .style("font-family", "sans-serif")
               .style("font-size", "10px")
               .attr("transform", "translate(" + (radius-level + axis_text_alignment) + ", " + (radius-level - axis_text_alignment) + ")")
               .text((j+1)*max_value/ticks);
    }

    // create axis
    var axis = svg.selectAll(".axis")
        .data(axis_labels)
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
    cont = 0;
    data.forEach(function(item) {
        // define polygon shape
        dataValues = [];
        svg.selectAll(".nodes")
            .data(item, function(d, i){
                dataValues.push([
                    radius*(1-(parseFloat(d)/max_value)*Math.sin(i*radians)), 
                    radius*(1-(parseFloat(d)/max_value)*Math.cos(i*radians))
                ]);
            });
        // draw the polygon
        svg.selectAll(".area")
            .data([dataValues])
            .enter()
                .append("polygon")
                .attr("class", "radar-chart-"+cont)
                .style("stroke-width", "2px")
                .style("stroke", colors(cont))
                .attr("points", function(d) {
                    var str = "";
                    for (var point = 0; point < d.length; point++) {
                        str = str+d[point][0]+","+d[point][1]+" ";
                    }
                    return str;
                })
                .style("fill", function(d, i) { return colors(cont) })
                .style("fill-opacity", opacity)
                .on('mouseover', function(d) {
                    svg.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", 0.3); 
                    svg.selectAll("polygon."+d3.select(this).attr("class"))
                        .transition(200)
                        .style("fill-opacity", 0.8);
                 })
                .on('mouseout', function() {
                    svg.selectAll("polygon")
                        .transition(200)
                        .style("fill-opacity", opacity);
                });
        cont++;
    });

    // create the dots at the end of the geometries
    cont=0;
    data.forEach(function(item){
        svg.selectAll(".nodes")
            .data(item)
            .enter().append("svg:circle")
                .attr('r', dot_size)
                .attr("cx", function(d, i) { return radius*(1-(d/max_value)*Math.sin(i*radians)); })
                .attr("cy", function(d, i) { return radius*(1-(d/max_value)*Math.cos(i*radians)); })
                .style("fill", colors(cont))
                .append("svg:title")
                .text(function(d) { return d } );
        cont++;
    });
}