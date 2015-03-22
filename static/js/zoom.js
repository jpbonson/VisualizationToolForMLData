// Initialize values in the zoom comboboxes using the data
function initialize_zoom_comboboxes() {
    $(combobox_rows_id).empty();
    $(combobox_columns_id).empty();
    $(combobox_rows_id).append(new Option("-", "-"));
    $(combobox_columns_id).append(new Option("-", "-"));
    d3.csv(data_file, function(error, data) {
        var attributes = d3.keys(data[0]).filter(function(d, i) { return d !== "labels" && columns_mask[i]; })
        for (var i = 0; i < attributes.length; i++) {
            $(combobox_rows_id).append(new Option(i+": "+attributes[i], i));
            $(combobox_columns_id).append(new Option(i+": "+attributes[i], i));
        }
    });
}

// Change the row selection and update the scatter matrix
function zoom_row() {
    d3.select(matrix_id).select("svg").remove("svg");
    var v = $(combobox_rows_id).val()
    if(v !== "-") {
        selected_row = +v
        chart_scatter_matrix();
    } else {
        selected_row = -1
        chart_scatter_matrix();
    }
}

// Change the column selection and update the scatter matrix
function zoom_column() {
    d3.select(matrix_id).select("svg").remove("svg");
    var v = $(combobox_columns_id).val()
    if(v !== "-") {
        selected_column = +v
        chart_scatter_matrix();
    } else {
        selected_column = -1
        chart_scatter_matrix();
    }
}