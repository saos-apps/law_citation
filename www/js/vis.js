
	var networkOutputBinding = new Shiny.OutputBinding();
	$.extend(networkOutputBinding, {

		find: function(scope) {
			return $(scope).find('.shiny-network-output');
		},
		
		renderValue: function(el, data) {
			var processedData = getNodes(data);
			var nodes = processedData.nodes;
			var links = processedData.links;
			var nodeRadius = 10;

			fillTooltip(data);
			drawSvg(nodes, links, nodeRadius);

		}
	});

	function getNodes(data) {
		nodes = [];
		links = [];
		data.forEach(function(judgement) {
			if (judgement.courtCases)
				judgement.courtCases.forEach(function(courtCase){
					if (courtCase.caseNumber)
						nodes.push({
							x : 0, 
							y : 0, 
							title 	: courtCase.caseNumber,
							href 	: judgement.href,
							id		: judgement.id,
							type 	: 'judgement'							
						});
					if (judgement.referencedRegulations)
						judgement.referencedRegulations.forEach(function (referencedRegulation) {
							var regulationIndex = findRegulation(nodes, referencedRegulation);
							if (regulationIndex < 0) {
								nodes.push({
									x : 0,
									y : 0,
									title 			: referencedRegulation.journalTitle,
									journalEntry 	: referencedRegulation.journalEntry,
									journalNo 		: referencedRegulation.journalNo,
									journalYear 	: referencedRegulation.journalYear,
									id				: createRegulationId(referencedRegulation),
									type 			: 'regulation'
								});

								links.push({ 
									source : findJudgement(nodes, judgement.id), 
									target : (nodes.length -1) 
								});
							}
							else
								links.push({ 
									source : findJudgement(nodes, judgement.id), 
									target : regulationIndex
								});
						});
				});
		});
		var obj = {};
		obj.nodes = nodes;
		obj.links = links;
		return obj;
	}

	function createRegulationId(regulation) {
		var id = regulation.journalEntry.toString();
		id += regulation.journalNo.toString();
		id += regulation.journalYear.toString();
		return Number(id);
	}

	function findRegulation(nodes, referencedRegulation) {
		var result = -1;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].type === 'regulation' &&
				nodes[i].id === createRegulationId(referencedRegulation)) {

				result = i;
				break;
			}
		}
		return result;
	}

	function findJudgement(nodes, judgementId) {
		var result = -1;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].type === 'judgement' &&
				nodes[i].id === judgementId) {

				result = i;
				break;
			}
		}
		return result;
	}

	function drawSvg(nodesData, links, nodeRadius) {
		var margin = 10;
		var width = $("#visualisation").width();
		var height = $(window).height() - $("#menuContent").height() - margin;

		var svg = d3.select('#visualisation').select("svg");
	  	svg.remove();
	  
	  	$('#visualisation').html("");

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
			.attr('r', radius)
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

	function radius(d) {
		if (d.type === 'judgement')
			return 3;
		if (d.type === 'regulation')
			return 5;
		else
			return 1;
	}

	function fillTooltip(data) {
		$('#judgements').html(judgementTable(data));
	}

	function judgementTable(data) {
		var table = '<table>';
		data.forEach(function(judgement) {
			if (judgement.courtCases)
				judgement.courtCases.forEach(function(courtCase) {
					table += '<tr><td class = "title" ><a href="' + judgement.href + '">';
					table += courtCase.caseNumber;
					table += '</a></td></tr>';
				});
		});
		table += '</table>';
		return table;
	}

	Shiny.outputBindings.register(networkOutputBinding, 'pawluczuk.networkbinding');