$(function() {
    // calls server to return a columns_mask using automatic filtering, then update the system
    $('#automatic_filtering').click(function(e) {
        if ($("#filter1").is(':checked')) {
            var type = "type1"
        } else {
            var type = "type2"
        }
        e.preventDefault();
        $.post('../automatic_filter', 
            {
                'algorithm_type': type
            }, 
            function(data) {
            if(data['result']){
                temp = JSON.parse(data["msg"])
                columns_mask = []
                for (var i = 0; i < temp.length; i++) {
                    if(temp[i] == 0) {
                        columns_mask.push(false)
                    } else {
                        columns_mask.push(true)
                    }
                }
                // reload
                selected_row = -1
                selected_column = -1
                d3.select(matrix_id).select("svg").remove("svg");
                chart_scatter_matrix();
                initialize_zoom_comboboxes();
                chart_attributes();
            }else{
                alert('Failed! Message: '+data['msg']);
            }
        }, 'json');
    })
});