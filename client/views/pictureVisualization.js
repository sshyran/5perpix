/**
 * Template pictureVisualizationHolder filler for selected_picture. Gets Session and updates selected_picture in template
 * @return {string} The name of the selected picture
 */
Template.pictureVisualizationHolder.selected_picture = function () {
	var pic = MrtPictureCollection.findOne(Session.get("selected_picture"));
	return pic && pic.name;
};



/**
 * Template pictureVisualizationItemSVG destroyed function: Kills Deps.autorun handle when the Template is no longer needed.
 */
Template.pictureVisualizationItemSVG.destroyed = function () {
	this.handle && this.handle.stop();
};



	/**
 * Template pictureVisualizationItemSVG rendered function. Called when pictureVisualizationItemSVG was successfully rendered the first time
 * Defines algorithms to be executed by Deps.autorun on Template Change / Datachange.
 */
Template.pictureVisualizationItemSVG.rendered = function () {
	console.log("Template.pictureVisualizationItemSVG.rendered");
	var self = this;
	self.node = self.find("svg");

	if(! self.handle) {
		
		// define a Dep.autorun for the Template, which automatically runs when changes happen
		self.handle = Deps.autorun(function (){
			console.log("Template.pictureVisualizationItemSVG.rendered: Deps.autorun");

			/**
			 * Init / Update on change
			 * @param  {svg:rect} Needs d3.js rects as parameter.
			 */
			var updateRaw = function (rect) {

				console.log("Template.pictureVisualizationItemSVG.rendered: Deps.autorun: updateRaw")

				rect.attr("x", function(d) { return (d.x) * MrtPictureCollection.findOne(d.picID).itemwidth; })
					.attr("y", function(d) { return (d.y) * MrtPictureCollection.findOne(d.picID).itemheight; })
					.attr("width", function(d) { return MrtPictureCollection.findOne(d.picID).itemwidth; })
					.attr("height", function(d) { return MrtPictureCollection.findOne(d.picID).itemheight; })
					// .attr("rx", 6)
					// .attr("ry", 6)
					.style("fill", function(d) { return getStringEJSONColor(d.color); })
					// .style("stroke", '#555')
					.on('click', function(e) { // on click
							//console.log("click: _id=" + e._id);
							Meteor.call('changePixelColor', e.picID, e._id, function (error, result) { console.log("error=" + error + " result=" + result) });
					 })
					.on('mouseover', function(e) { // on mouseover
							//console.log("mouseover: _id=" + e._id);
							Meteor.call('changePixelColor', e.picID, e._id, function (error, result) { console.log("error=" + error + " result=" + result) });
					 })
					 .on('mouseout', function() { // on mouseout
							d3.select(this)
									.style("fill", function(d) { return getStringEJSONColor(d.color); });
					 });
			};

			// bind my pixel data to the g class .pixels 
			var minpix = d3.select(self.node).select(".pictureVisualizationItemSVGPixels").selectAll("rect")
				.data(MrtPixelCollection.find({picID: Session.get("selected_picture")}).fetch(), 
					function (minpix) {return minpix._id; });


			// data update only triggers fill to refresh
			updateRaw(minpix.enter().append("svg:rect"));
			
			d3.select(self.node).select(".pictureVisualizationItemSVGPixels").selectAll("rect")
				.data(MrtPixelCollection.find({picID: Session.get("selected_picture")}).fetch(), 
					function (minpix) {return minpix._id; })
				.style("fill", function(d) { return getStringEJSONColor(d.color); })

			// kill pixel on remove from data source
			minpix.exit().remove();
			
		});
	}
};


/**
 * Helper function to parse a color as EJSON binaray Uint8Array containing rgb-channels. rgb is automatically appended for use in fillstyle, fill, ...
 * @param  {Uint8Array} colorEJSON, a color in EJSON binary Uint8Array format
 * @return {string} a string of rgb-colors for use in fill, fillstyle, ...
 */
function getStringEJSONColor(colorEJSON) {
	return "rgb(" 
		+ colorEJSON[0] + "," 
		+ colorEJSON[1] + "," 
		+ colorEJSON[2] + ")";
}