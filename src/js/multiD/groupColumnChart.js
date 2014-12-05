PykCharts.multiD.groupedColumn = function(options) {
    var that = this;
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function () {
        that = new PykCharts.multiD.processInputs(that, options, "column");

        if(that.stop)
            return;
        that.grid_color = options.chart_grid_color ? options.chart_grid_color : theme.stylesheet.chart_grid_color;
         that.panels_enable = "no";

        if(that.mode === "default") {
           that.k.loading();
        }
        that.multiD = new PykCharts.multiD.configuration(that);

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data);
            if(that.stop || validate === false) {
                $(that.selector+" #chart-loader").remove();
                return;
            }
            that.data = that.k.__proto__._groupBy("column",data);
            that.compare_data = that.k.__proto__._groupBy("column",data);
            that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
            $(that.selector+" #chart-loader").remove();
            // PykCharts.multiD.columnFunctions(options,that,"group_column");
            that.render();
        };
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    };

    that.dataTransformation = function () {
        that.group_arr = [], that.new_data = [];
        that.data_length = that.data.length;
        for(j = 0;j < that.data_length;j++) {
            that.group_arr[j] = that.data[j].x;
        }
        that.uniq_group_arr = _.unique(that.group_arr);
        var len = that.uniq_group_arr.length;
        
        for (k = 0;k < len;k++) {
            that.new_data[k] = {
                    name: that.uniq_group_arr[k],
                    data: []
            };
            for (l = 0;l < that.data_length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].x) {
                    that.new_data[k].data.push({
                        y: that.data[l].y,
                        name: that.data[l].group,
                        tooltip: that.data[l].tooltip,
                        color: that.data[l].color
                    });
                }
            }
        }
        that.new_data_length = that.new_data.length;
    };

    that.refresh = function () {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("column",data);
            that.refresh_data = that.k.__proto__._groupBy("column",data);
            that.map_group_data = that.multiD.mapGroup(that.data);
            that.dataTransformation();
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.optionalFeatures()
                    .createChart()
                    // .legends();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScaleInvert,undefined,that.y_tick_values,that.legendsGroup_width)
                .yGrid(that.svgContainer,that.group,that.yScaleInvert,that.legendsGroup_width);
        };
        that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
    };

    that.render = function() {
        var that = this;
        var l = $(".svgcontainer").length;
        that.container_id = "svgcontainer" + l;
        that.map_group_data = that.multiD.mapGroup(that.data);
        that.dataTransformation();

        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        that.mouseEvent1 = new PykCharts.multiD.mouseEvent(that);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+that.container_id,"groupColumnChart")
                .emptyDiv()
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(1)
                .legendsContainer(1);


            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                // .legends()
                .createGroups(1)
                .createChart()
                .axisContainer()
                // .highlightRect();

            that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain/*,that.x_tick_values,that.legendsGroup_height*/)
            .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain/*,that.y_tick_values,that.legendsGroup_width*/);

        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+that.container_id,"columnChart")
                .emptyDiv()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures().svgContainer(1)
                .legendsContainer(1)
                .createGroups(1)
                .createChart()
                .axisContainer()
                // .highlightRect();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
            // that.k.yAxis(that.svgContainer,that.yGroup,that.yScaleInvert,undefined,that.y_tick_values,that.legendsGroup_width)
            //      .yAxisTitle(that.yGroup,that.legendsGroup_width);
        }

        that.k.exportSVG(that,"#"+that.container_id,"columnChart")
        if(PykCharts.boolean(that.legends_enable)) {
            $(document).ready(function () { return that.k.resize(that.svgContainer,"",that.legendsContainer); })
            $(window).on("resize", function () { return that.k.resize(that.svgContainer,"",that.legendsContainer); });
        } else {
            $(document).ready(function () { return that.k.resize(that.svgContainer,""); })
            $(window).on("resize", function () { return that.k.resize(that.svgContainer,""); });
        }
    };

    that.optionalFeatures = function() {
        var that = this;
        var optional = {
            svgContainer: function (i) {
               $(that.selector).attr("class","PykCharts-twoD");
                that.svgContainer = d3.select(options.selector + " #tooltip-svg-container-" + i)
                    .append("svg:svg")
                    .attr("width",that.width )
                    .attr("height",that.height)
                    .attr("id",that.container_id)
                    .attr("class","svgcontainer")
                    .attr("preserveAspectRatio", "xMinYMin")
                    .attr("viewBox", "0 0 " + that.width + " " + that.height);
                return this;
            },
            createGroups: function (i) {
                that.group = that.svgContainer.append("g")
                    .attr("id","svggroup")
                    .attr("class","svggroup")
                    .attr("transform","translate(" + that.margin_left + "," + (that.margin_top + that.legendsGroup_height) +")");

                if(PykCharts.boolean(that.grid_y_enable)) {
                    that.group.append("g")
                        .attr("id","ygrid")
                        .style("stroke",that.grid_color)
                        .attr("class","y grid-line");
                }
                return this;
            },
            legendsContainer: function (i) {
                if(PykCharts.boolean(that.legends_enable) && that.mode === "default") {

                    that.legendsGroup = that.svgContainer.append("g")
                        .attr("id","legends")
                        .attr("class","legends")
                        .style("visibility","hidden")
                        .attr("transform","translate(0,10)");

                } else {
                    that.legendsGroup_height = 0;
                    that.legendsGroup_width = 0;
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable) || that.axis_x_title) {
                    that.xGroup = that.group.append("g")
                        .attr("class", "x axis")
                        .attr("id","xaxis")
                        .style("stroke","black");
                }

                if(PykCharts.boolean(that.axis_y_enable) || that.axis_y_title){
                    that.yGroup = that.group.append("g")
                        .attr("class", "y axis")
                        .attr("id","yaxis")
                        .style("stroke","blue");
                }
                return this;
            },  
            createChart: function() {
                that.reduced_width = that.width - that.margin_left - that.margin_right - that.legendsGroup_width;
                that.reduced_height = that.height - that.margin_top - that.margin_bottom - that.legendsGroup_height;

                that.getuniqueGroups = _.map(that.data,function(d) {
                    return d.group;
                })
                that.getuniqueGroups = _.unique(that.getuniqueGroups)

                that.max_y_value = d3.max(that.new_data, function(d) { return d3.max(d.data, function(d) { return d.y; }); });


                that.yScale = d3.scale.linear()
                    .domain([0,that.max_y_value])
                    .range([that.reduced_height, 0])

                that.xScale = d3.scale.ordinal()
                    .domain(that.new_data.map(function (d) { return d.name; }))
                    .rangeRoundBands([0, that.reduced_width], 0.2);


                that.x1 = d3.scale.ordinal()
                    .domain(that.getuniqueGroups)
                    .rangeRoundBands([0, that.xScale.rangeBand()]) ;

                that.xdomain = that.xScale.domain();
                that.ydomain = that.yScale.domain();
                that.extra_left_margin = (that.xScale.rangeBand()/2);

                var chart = that.group.selectAll(".column-group")
                    .data(that.new_data);
                
                chart.enter()
                    .append("g")
                    .attr("class", "column-group")
                    
                chart.attr("class", "g")
                    .attr("transform", function (d) { return "translate(" + that.xScale(d.name) + ",0)"; })
                    .on('mouseout',function (d) {
                      //  that.mouseEvent.axisHighlightHide(".x.axis");
                    })
                    .on('mousemove', function (d) {
                        //that.mouseEvent.axisHighlightShow(d.name, ".x.axis");
                    });

                var bar = chart.selectAll("rect")
                            .data(function (d) { return d.data; });

                bar.enter()
                    .append("rect")
                      
                bar.attr("height", 0)
                    .attr("x", function (d) {return that.x1(d.name); })
                    .attr("y", that.height)
                    .attr("width", function (d){ return that.x1.rangeBand(); })
                    .attr("fill", function (d,i) {
                        return that.fillColor.colorGroup(d);
                    })
                    // .attr("fill-opacity", function (d,i) { return that.saturation.enable === "yes" ? (i+1)/(that.data.length) : 1 ;})
                    .attr("stroke",that.border.color())
                    .attr("stroke-width",that.border.width())
                    .on('mouseover',function (d) {
                        that.mouseEvent.tooltipPosition(d);
                        that.mouseEvent.tooltipTextShow(d.tooltip);
                    })
                    .on('mouseout',function (d) {
                        that.mouseEvent.tooltipHide(d);
                    })
                    .on('mousemove', function (d) {
                        that.mouseEvent.tooltipPosition(d);
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr("height", function (d) { return that.reduced_height - that.yScale(d.y); })
                    .attr("y",function (d) {return that.yScale(d.y); });

                // chart.exit().remove(); 

                return this;
            }
        }
        return optional;
    };


};
