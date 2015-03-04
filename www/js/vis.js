
	var networkOutputBinding = new Shiny.OutputBinding();
	$.extend(networkOutputBinding, {

		find: function(scope) {
			return $(scope).find('.shiny-network-output');
		},
		
		renderValue: function(el, data) {
			nodes = getNodes(data);
			var nodeRadius = 10;

			var links = [
					{ source: 0, target: 1 }
			];
			fillTooltip(data);
			drawSvg(nodes, links, nodeRadius);

		}
	});

	function getNodes(data) {
		nodes = [];
		data.forEach(function(judgement) {
			if (judgement.courtCases)
				judgement.courtCases.forEach(function(courtCase){
					if (courtCase.caseNumber)
						nodes.push({
							x : 0, 
							y : 0, 
							title 	: courtCase.caseNumber,
							href 	: judgement.href,
							type 	: 'judgement'
						});
				});
		});
		return nodes;
	}

	function drawSvg(nodesData, links, nodeRadius) {
		var margin = 10;
		var width = $("#visualisation").width();
		var height = $(window).height() - $("#menuContent").height() - margin;

		var svg = d3.select('#visualisation').append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr("pointer-events", "all");

		var background = svg.append('svg:g');
			
			background.append('svg:rect')
		        .attr('width', width)
		        .attr('height', height)
		        .attr('fill', 'white');

		var force = d3.layout.force()
			.size([width, height])
			.nodes(nodesData)
			.links(links)
			.linkDistance(80)
			.charge(-15)
			.gravity(0.05);

		var nodes = background.selectAll("g").data(nodesData);

		var g = nodes.enter()
			.append('g')
			.attr('class', 'graph-node')
			.call(force.drag);

		var node = g.append('circle')
			.attr('class', 'circle')
			.attr('r', nodeRadius)
			.style('fill', color);

		var hyperlinks = g.append('a')
			.attr('xlink:href', function(d) { return d.href;});

		var titles = hyperlinks.append('text')
			.text(function(d) {	return d.title; });

		var link = background.selectAll('.link')
			.data(links)
			.enter().append('line')
			.attr('class', 'link');

		/*var zoom = d3.behavior.zoom()
			.scaleExtent([0.5, 5])
			.on("zoom",function() {
				background.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")");
			});

		background.call(zoom);*/

		force.on('tick', function() {
			g
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });  

			link.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });

		});

		force.start();
	}

	function color(d) {
		if (d.type === 'judgement')
			return 'steelblue';
		if (d.type === 'regulation')
			return 'red';
		else
			return 'green';
	}

	function fillTooltip(data) {
		$('#judgements').html(judgementTable(data));
	}

	function judgementTable(data) {
		var table = '<table>';
		data.forEach(function(judgement) {
			table += judgement.title;
		})
		table += '</table>';
		return table;
	}

	Shiny.outputBindings.register(networkOutputBinding, 'pawluczuk.networkbinding');