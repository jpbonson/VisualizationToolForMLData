// Initialize columns mask with true values
function initialize_columns_mask() {
    var columns_mask = []
    d3.csv(data_file, function(error, data) {
        var attributes = d3.keys(data[0]).filter(function(d, i) { return d !== "labels"; })
        for (var i = 0; i < attributes.length; i++) {
            columns_mask.push(true)
        }
    });
    return columns_mask
}

// Add the attributes to the checkbox list
function chart_attributes(obj, matrix_id) {
    d3.csv(data_file, function(error, data) {
        var attributes = d3.keys(data[0]).filter(function(d, i) { return d !== "labels"; })
        for (var i = 0; i < attributes.length; i++) {
            $(obj).append('<input type="checkbox" checked="checked" value="checkbox-attribute-'+i+'" id="'+i+'" class="checkbox-attribute" onclick="filter_attribute(this, matrix_id)">'+attributes[i]+'<br>')
        }
    });
}

// Modify the chart using the checkboxes to filter the attributes
function filter_attribute(obj, matrix_id) {
    var index = +(obj.id)
    if (obj.checked) {
        columns_mask[index] = true
    } else {
        columns_mask[index] = false
    }
    if(columns_mask.every(is_false)) {
        alert("Warning: The chart must have at least one attribute!");
        columns_mask[index] = true;
        $(obj).prop('checked', true);
    } else {
        d3.select(matrix_id).select("svg").remove("svg");
        chart_scatter_matrix(matrix_id);
    }
}