
	var networkOutputBinding = new Shiny.OutputBinding();
	var neighbours = [];

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
		var nodes = [];
		var links = [];
		neighbours = [];
		data.forEach(function(judgement) {
			if (judgement.courtCases)
				judgement.courtCases.forEach(function(courtCase){
					if (courtCase.caseNumber)
						nodes.push(judgementToNode(judgement, courtCase.caseNumber));
					if (judgement.referencedRegulations)
						judgement.referencedRegulations.forEach(function (referencedRegulation) {
							var regulationIndex = findRegulation(nodes, referencedRegulation);
							if (regulationIndex < 0) {
								nodes.push(referencedRegulationToNode(referencedRegulation));

								var source = findJudgement(nodes, judgement.id);
								var target = (nodes.length -1);
								links.push({ 
									source : source, 
									target : target
								});
								insertNeighbour(source, target);
							}
							else {
								var source = findJudgement(nodes, judgement.id);
								var target = regulationIndex;
								links.push({ 
									source : source, 
									target : target
								});
								insertNeighbour(source, target);
							}
						});
				});
		});
		var obj = {};
		obj.nodes = nodes;
		obj.links = links;
		return obj;
	}

	function judgementToNode(judgement, caseNumber) {
		return {
					x : 0, 
					y : 0, 
					title 	: caseNumber,
					href 	: judgement.href,
					id		: judgement.id,
					judgementDate 	: judgement.judgmentDate,
					judges 			: judgement.judges,
					courtReporters 	: judgement.courtReporters,
					division		: judgement.division,
					type 	: 'judgement',
					clicked 		: false
				};
	}

	function referencedRegulationToNode(referencedRegulation) {
		return {
					x : 0,
					y : 0,
					title 			: referencedRegulation.journalTitle,
					journalEntry 	: referencedRegulation.journalEntry,
					journalNo 		: referencedRegulation.journalNo,
					journalYear 	: referencedRegulation.journalYear,
					id				: createRegulationId(referencedRegulation),
					type 			: 'regulation',
					clicked 		: false
				};
	}

	function insertNeighbour(source, target) {
		if (neighbours[source]) neighbours[source].push(target);
		else {
			neighbours[source] = [];
			neighbours[source].push(target);
		}

		if (neighbours[target]) neighbours[target].push(source);
		else {
			neighbours[target] = [];
			neighbours[target].push(source);
		}
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
			.charge(-100)
			.gravity(0.2);

		var link = background.selectAll('.link')
			.data(links)
			.enter().append('line')
			.attr('class', 'link');

		var nodes = background.selectAll("g").data(nodesData);

		var g = nodes.enter()
			.append('g')
			.attr('class', 'graph-node')
			.call(force.drag);

		var node = g.append('circle')
			.attr('class', 'circle')
			.attr('r', radius)
			.style('fill', color)
			.on('mouseover', highlightNode)
			.on('mouseout', dehighlightNode)
			.on('click', clickNode);

		var hyperlinks = g.append('a')
			.attr('xlink:href', function(d) { return d.href;});

		var titles = hyperlinks.append('text')
			//.text(function(d) {	return d.title; })
			.attr('fill', color);

		/*var zoom = d3.behavior.zoom()
			.scaleExtent([0.5, 5])
			.on("zoom",function() {
				background.attr("transform", "translate(" +  zoom.translate() + ")scale(" + zoom.scale() + ")");
			});

		background.call(zoom);*/

		force.on('tick', function(d) {
			var k = 100 * d.alpha;
			g.forEach(function(d) {
				d.y += (d.type === 'judgement') ? k : -k;
				d.x += (d.type === 'judgement') ? k : -k;
			});

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
			return '#ff7f0e';
		if (d.type === 'regulation')
			return '#bcbd22';
		else
			return 'green';
	}

	function radius(d) {
		if (d.type === 'judgement')
			return 5;
		if (d.type === 'regulation')
			return 7;
		else
			return 1;
	}

	function clickNode(d) {
		if (otherNodesSelected(d.index)) return;

		if (d.clicked === false || d.clicked === undefined) {
			d.clicked = true;
			highlightNode(d);
		}
		else if (d.clicked === true) {
			d.clicked = false;
			dehighlightNode(d);
		}
	}

	function otherNodesSelected(selectedIndex) {
		var circle = d3.selectAll("circle");
		var otherNodeClicked = false;

		circle.each(function(d) {
			if (d.clicked === false) 
				return true;
			else if (d.clicked === true && d.index !== selectedIndex) {
				otherNodeClicked = true;
				return false;
			}
		});

		return otherNodeClicked;
	}

	function highlightNode(d) {
		var circle = d3.selectAll("circle");
		var line = d3.selectAll("line");
		var selectedIndex = d.index;
		var selectedType = d.type;

		if (otherNodesSelected(selectedIndex)) return;

		if (d.type === 'regulation') console.log(d);
		console.log(neighbours[selectedIndex]);

		highlightedInfo(d);

		circle
			.transition()
			.style('stroke-opacity', function (d) {
				if (d.index === selectedIndex)
					return 1;
				else 
					return neighbours[selectedIndex] && neighbours[selectedIndex].indexOf(d.index) > -1 &&
							d.type !== selectedType ? 1 : 0.3;
			})
			.style('fill', function(d) {
				if (d.index === selectedIndex)
					return color(d);
				else 
					return neighbours[selectedIndex] && neighbours[selectedIndex].indexOf(d.index) > -1 &&
							d.type !== selectedType ? color(d) : '#F2F2F2';
			})
			.attr('r', function(d) {
				if (d.index === selectedIndex) 
					return d.clicked ? 15 : 10;
				else
					return neighbours[selectedIndex] && neighbours[selectedIndex].indexOf(d.index) > -1 &&
							d.type !== selectedType ? 10 : radius(d);
			});

		line
			.transition()
			.style('stroke-opacity', function (d) {
				if (d.source.index === selectedIndex || d.target.index === selectedIndex)
					return 1;
				else return 0.3;
			})
			.style('stroke-width', function (d) {
				if (d.source.index === selectedIndex || d.target.index === selectedIndex)
					return 2;
				else return 1;
			});

	}

	function dehighlightNode(d) {
		if (d.clicked || otherNodesSelected(d.index)) return; 

		var circle = d3.selectAll('circle');
		var line = d3.selectAll('line');
		var selectedIndex = d.index;

		clearHighlightedInfo();

		circle
			.transition()
			.style('fill', color)
			.style('stroke-opacity', 1)
			.attr('r', radius);

		line
			.transition()
			.style('stroke-width', 1)
			.style('stroke-opacity', 0.3);
	}

	function highlightedInfo(d) {
		var html = '';
		if (d.type === 'regulation') html = regulationInfo(d);
		else if (d.type === 'judgement') html = judgementInfo(d);
		$('#highlightedNode').html(html);
	}

	function clearHighlightedInfo() {
		$('#highlightedNode').html('');
	}

	function regulationInfo(d) {
		var text =  '<p><a href="http://dziennikustaw.gov.pl/du/' + d.journalYear;
		text += '/s/' + d.journalNo + '/' + d.journalEntry + '">';
		text += d.title + '</a></p>';
		return text;
	}

	function judgementInfo(d) {
		var text = '<p><a href="https://saos-test.icm.edu.pl/judgments/' + d.id + '"><h5>' + d.title + '</h5></a></p>';
		if (d.judgementDate)
			text += '<p><span class="label-title">Data orzeczenia:</span> ' + d.judgementDate + '</p>';
		if (d.division && d.division.court && d.division.court.name)
			text += '<p><span class="label-title">Sąd:</span> ' + d.division.court.name + '</p>';
		if (d.division && d.division.name)
			text += '<p><span class="label-title">Wydział:</span> ' + d.division.name + '</p>';
		if (d.judges && d.judges.length !== 0)
			text += '<p><span class="label-title">Skład sędziowski:</span> ' + judgesToList(d.judges) + '</p>';
		if (d.courtReporters && d.courtReporters.length !== 0)
			text += '<p><span class="label-title">Protokolanci:</span> ' + reportersToList(d.courtReporters) + '</p>';			
		return text;
	}

	function judgesToList(judges) {
		var text = '';
		for (var i = 0; i < judges.length; i++) {
			text += judges[i].name;
			if (i !== judges.length - 1) text += ', ';
		}
		return text;
	}

	function reportersToList(reporters) {
		var text = '';
		for (var i = 0; i < reporters.length; i++) {
			text += reporters[i];
			if (i !== reporters.length - 1) text += ', ';
		}
		return text;
	}

	function fillTooltip(data) {
		//$('#allNodes').html(judgementTable(data));
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