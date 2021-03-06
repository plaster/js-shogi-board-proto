function () {
	var svgview = function(opt) {
		this.svgWidth = opt && opt.width || 420;
		this.svgHeight = opt && opt.height || 360;
		this.boardHeight = Math.min(this.svgHeight * 0.9, this.svgWidth * 0.85);
		this.boardWidth = this.boardHeight * 0.9;
		this.cellWidth = this.boardWidth / 9;
		this.cellHeight = this.boardHeight / 9;
		this.boardMarginLeft = (this.svgWidth - this.boardWidth) * 0.5;
		this.boardMarginTop = (this.svgHeight - this.boardHeight) * 0.5;
		this.pieceFontSize = Math.min(this.boardWidth, this.boardHeight) / 10;
		this.gaugeFontSize = this.pieceFontSize / 4;
		this.pieceStandWidth = this.pieceFontSize * 0.9;
		this.classPrefix = opt && opt.classPrefix || 'shogi-board';
		this.stars = [[3, 3], [3, 6], [6, 3], [6, 6]];
		this.boardflip = false;
		this.boarddata =
		{ "pcs0":[]
		, "pcs1":[]
		, "ps0":{}
		, "ps1":{}
		, "hllist":[]
		};
		this.selection = null;
	};
	svgview.prototype.piece_textmap =
	{"FU":"歩"
	,"GI":"銀"
	,"HI":"飛"
	,"KA":"角"
	,"KE":"桂"
	,"KI":"金"
	,"KY":"香"
	,"NG":"成銀"
	,"NK":"成香"
	,"NY":"成桂"
	,"OU":"玉"
	,"RY":"龍"
	,"TO":"と"
	,"UM":"馬"
	};
	svgview.prototype.piece_colormap =
	{"FU":"black"
	,"GI":"black"
	,"HI":"black"
	,"KA":"black"
	,"KE":"black"
	,"KI":"black"
	,"KY":"black"
	,"NG":"red"
	,"NK":"red"
	,"NY":"red"
	,"OU":"black"
	,"RY":"red"
	,"TO":"red"
	,"UM":"red"
	};
	svgview.prototype.nummap =
	[null
	,'一'
	,'二'
	,'三'
	,'四'
	,'五'
	,'六'
	,'七'
	,'八'
	,'九'
	,'十'
	];

	svgview.prototype.select = function(sel) {
		var sb = this;
		if (typeof(sel) == "string") {
			sb.selection = d3.select(sel);
		} else {
			sb.selection = sel;
		}
		return sb;
	};

	svgview.prototype.data = function(o) {
		var sb = this;
		sb.boarddata = o;
		return sb;
	};

	svgview.prototype.flip = function(b) {
		var sb = this;
		sb.boardflip = b;
		return sb;
	};

	svgview.prototype.tosvg = function() {
		var sb = this;
		var sel = this.selection;
		var o = this.boarddata;
		var pcs0 = o[this.boardflip ? 'pcs1' : 'pcs0'];
		var pcs1 = o[this.boardflip ? 'pcs0' : 'pcs1'];
		var ps0 = o[this.boardflip ? 'ps1' : 'ps0'];
		var ps1 = o[this.boardflip ? 'ps0' : 'ps1'];
		var marker0 = this.boardflip ? '\u2616' : '\u2617';
		var marker1 = this.boardflip ? '\u2617' : '\u2616';
		var hllist = o['hllist'];
		var className = function(s) { return sb.classPrefix + '-' + s; };
		var svg = sel.selectAll("svg")
		  .data([1])
		svg.enter().append("svg")
		  ;
		svg
		  .attr("width", this.svgWidth)
		  .attr("height", this.svgHeight)
		  ;
		var scX = d3.scale.linear().domain([9, 0]).range([sb.boardMarginLeft, sb.boardWidth + sb.boardMarginLeft]);
		var scY = d3.scale.linear().domain([0, 9]).range([sb.boardMarginTop, sb.boardHeight + sb.boardMarginTop]);
		var c = function(v) { return sb.boardflip ? 10 - v : v; };
		var sel_ghilite = svg.selectAll("g." + className("hilite"))
		  .data([1])
		  ;
		sel_ghilite.enter().append('g').attr("class",className("hilite"));

		var sel_hilite = sel_ghilite.selectAll("rect." + className("hilite"))
		  .data(hllist)
		  ;
		sel_hilite
		  .enter().append("rect")
		  .attr("class", className("hilite"))
		  ;
		sel_hilite
		  .exit().remove()
		  ;
		sel_hilite
		  .attr("x", function(d) { return Math.min(scX(c(d[0])), scX(c(d[0]) - 1))})
		  .attr("y", function(d) { return Math.min(scY(c(d[1])), scY(c(d[1]) - 1))})
		  .attr("width", function(d) { return Math.abs(scX(c(d[0])) - scX(c(d[0]) - 1))})
		  .attr("height", function(d) { return Math.abs(scY(c(d[1])) - scY(c(d[1]) - 1))})
		  .attr("fill", "#CCFFAA")
		  ;
		var sel_gridX = svg.selectAll("line." + className("gridX"))
		  .data(d3.range(0, 9+1, 1))
		  ;
		sel_gridX
		  .enter().append("line")
		  .attr("class", className("gridX"))
		  ;
		sel_gridX
		  .attr("x1", function(d) { return scX(d) })
		  .attr("y1", scY(0))
		  .attr("x2", function(d) { return scX(d) })
		  .attr("y2", scY(9))
		  .attr("stroke", "black")
		  ;
		var sel_gridY = svg.selectAll("line." + className("gridY"))
		  .data(d3.range(0, 9+1, 1))
		sel_gridY
		  .enter().append("line")
		  .attr("class", className("gridY"))
		  ;
		sel_gridY
		  .attr("x1", scX(0))
		  .attr("y1", function(d) { return scY(d) })
		  .attr("x2", scX(9))
		  .attr("y2", function(d) { return scY(d) })
		  .attr("stroke", "black")
		  ;
		var sel_star = svg.selectAll("circle." + className("star"))
		  .data(sb.stars)
		sel_star
		  .enter().append("circle")
		  .attr("class", className("star"))
		  ;
		sel_star
		  .exit().remove()
		  ;
		sel_star
		  .attr("cx", function(d) { return scX(d[0]) })
		  .attr("cy", function(d) { return scY(d[1]) })
		  .attr("r", "3")
		  .attr("stroke", "black")
		  .attr("fill", "black")
		  ;
		var sel_gaugeX = svg.selectAll("text." + className("gaugeX"))
		  .data(sb.boardflip
		  ? ['９','８','７','６','５','４','３','２','１']
		  : ['１','２','３','４','５','６','７','８','９']
		  )
		  ;
		sel_gaugeX
		  .enter().append("text").attr("class",className("gaugeX"))
		  ;
		sel_gaugeX
		  .attr("font-size",sb.gaugeFontSize)
		  .attr("text-anchor","middle")
		  // .attr("dominant-baseline","central")
		  .attr("x",function(d, i) { return scX(i + 0.5); })
		  .attr("y",scY(0) - sb.gaugeFontSize * 0.4)
		  .text(function(d) { return d })
		  ;
		var sel_gaugeY = svg.selectAll("text." + className("gaugeY"))
		  .data(sb.boardflip
		  ? ['九','八','七','六','五','四','三','二','一']
		  : ['一','二','三','四','五','六','七','八','九']
		  )
		  ;
		sel_gaugeY
		  .enter().append("text").attr("class",className("gaugeY"))
		  ;
		sel_gaugeY
		  .attr("font-size",sb.gaugeFontSize)
		  .attr("text-anchor","middle")
		  // .attr("dominant-baseline","central")
		  .attr("x",scX(0) + sb.gaugeFontSize)
		  .attr("y",function(d, i) { return scY(i + 0.5) + sb.gaugeFontSize * 0.4; })
		  .text(function(d) { return d })
		  ;
		var settext = function(d) {
			var g = d3.select(this);
			g.attr("font-size",sb.pieceFontSize);
			g.selectAll("text").remove();

			var chs = sb.piece_textmap[d[0]].split('');
			var x = c(d[1]) - 0.5;
			var y0 = c(d[2]);

			for (var i = 0; i < chs.length; ++i) {
				var y = y0 - 1 + (i+0.8) /chs.length
				g.append("text")
				.attr("text-anchor","middle")
				// .attr("dominant-baseline","text-after-edge")
				.attr("x", scX(x))
				.attr("y", 0)
				.attr("fill", sb.piece_colormap[d[0]])
				.attr("transform", "matrix(" + [1, 0, 0, 1/Math.pow(chs.length,0.9), 0, scY(y)].join() + ")")
				.text(chs[i])
				;
			}
		};
		var sel_pcs0 = svg.selectAll("g." + className("pcs0"))
		  .data(pcs0)
		  ;
		sel_pcs0
		  .enter().append("g").attr("class",className("pcs0"))
		  ;
		sel_pcs0
		  .exit().remove()
		  ;
		sel_pcs0
		  .each(settext)
		  ;
		var sel_pcs1 = svg.selectAll("g." + className("pcs1"))
		  .data(pcs1)
		  ;
		sel_pcs1
		  .enter().append("g").attr("class",className("pcs1"))
		sel_pcs1
		  .exit().remove()
		  ;
		sel_pcs1
		  .attr("transform", function(d) { return "rotate(" + [180, scX(c(d[1]) - 0.5), scY(c(d[2]) - 0.5)].join(' ') + ")" })
		  .each(settext)
		  ;
		var ps2textlist = function(playerlabel, ps) {
			var res = [];
			["HI","KA","KI","GI","KE","KY","FU"].forEach(function(k) {
				if(ps[k]) {
					res.push([sb.piece_textmap[k], sb.pieceFontSize * 0.7]);
					if (ps[k] > 10) {
						res.push([sb.nummap[10], sb.pieceFontSize * 0.55]);
						res.push([sb.nummap[ps[k] - 10], sb.pieceFontSize * 0.55]);
					} else if (ps[k] > 2) {
						res.push([sb.nummap[ps[k]], sb.pieceFontSize * 0.65]);
					} else if (ps[k] == 2) {
						res.push([sb.piece_textmap[k], sb.pieceFontSize * 0.7]);
					}
				}
			});
			if (res.length == 0) {
				res =
				[["持", sb.pieceFontSize * 0.6]
				,["駒", sb.pieceFontSize * 0.6]
				,["な", sb.pieceFontSize * 0.6]
				,["し", sb.pieceFontSize * 0.6]
				];
			}
			if (playerlabel) {
				res.unshift([playerlabel, sb.pieceFontSize]);
			}
			var y = 0;
			for (var i = 0; i < res.length; ++i) {
				var h = res[i][1];
				y += h;
				res[i].push(y);
			}
			return res;
		};
		var sel_g_ps0 = svg.selectAll('g.' + className('ps0')).data([0]);
		sel_g_ps0.enter().append("g").attr("class",className("ps0"));
		var sel_g_ps1 = svg.selectAll('g.' + className('ps1')).data([1]);
		sel_g_ps1.enter().append("g").attr("class",className("ps1"));

		(function(g){
			var textlist = ps2textlist(marker0, ps0);
			g
				.attr("text-anchor","middle")
				// .attr("dominant-baseline","text-after-edge")
				.attr("transform", "matrix(" + [1, 0, 0, 1,
						sb.boardMarginLeft + sb.boardWidth + (sb.pieceStandWidth * 0.5 + sb.gaugeFontSize * 2.0),
						sb.boardMarginTop - sb.gaugeFontSize
				].join() + ")")
				;
			var sel_text = g.selectAll("text").data(textlist);
			sel_text.enter().append("text");
			sel_text.exit().remove();
			sel_text
				.text(function(d){return d[0];})
				// .attr("transform", "matrix(" + [-1, 0, 0, 1, 0, 0].join() + ")")
				.attr("font-size", function(d) { return d[1]; })
				.attr("x", 0)
				.attr("y", function(d){ return d[2]; })
			;
		})(sel_g_ps0);
		(function(g){
			var textlist = ps2textlist(marker1, ps1);
			g
				.attr("text-anchor","middle")
				// .attr("dominant-baseline","text-after-edge")
				.attr("transform", "matrix(" + [1, 0, 0, -1,
						sb.boardMarginLeft - (sb.pieceStandWidth * 0.5 + sb.gaugeFontSize * 0.5),
						sb.boardMarginTop + sb.boardHeight + sb.gaugeFontSize
				].join() + ")")
				;
			var sel_text = g.selectAll("text").data(textlist);
			sel_text.enter().append("text");
			sel_text.exit().remove();
			sel_text
				.text(function(d){return d[0];})
				.attr("font-size", function(d) { return d[1]; })
				.attr("transform", "matrix(" + [-1, 0, 0, 1, 0, 0].join() + ")")
				.attr("x", 0)
				.attr("y", function(d){ return d[2]; })
			;
		})(sel_g_ps1);
	};

	return svgview;
}
