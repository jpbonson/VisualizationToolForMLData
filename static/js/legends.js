// Add the classes to the legend list
function chart_legends() {
    d3.select(chart_legends_id).select("svg").remove("svg"); // reset
    
    var obj = chart_legends_id
    d3.csv(data_file, function(error, data) {
        var classes = data.map(function(d) { return d.labels; }).filter( unique );

        square_size = 18
        square_total_size = square_size+2
        height = classes.length*(square_total_size)
        width = 900
        horizontal_text_align = 24
        vertical_text_align = 9
        
        var legend = d3.select(obj).append("svg")
                .attr("class", "legend")
                .attr("width", width)
                .attr("height", height)
            .selectAll("g")
                .data(classes)
            .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * square_total_size + ")"; });

        legend.append("rect")
            .attr("width", square_size)
            .attr("height", square_size)
            .style("fill", colors);

        legend.append("text")
            .attr("x", horizontal_text_align)
            .attr("y", vertical_text_align)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

        $(obj).height(height)
    })
}
