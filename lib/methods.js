Meteor.methods({
	changePixelColor: function (picID, pixID) {
		check(picID, String);
		check(pixID, String);

		if(!this.userId) {
			throw new Meteor.Error(404, "changePixelColor: Can't change pixel, undefined userId=" + this.userId);
		} 

		if(this.isSimulation) {
			
			console.log("changePixelColor (client): picID=" + picID + " pixID=" + pixID);

			var test = EJSON.newBinary(3);
			test[0] = 0;
			test[1] = 0;
			test[2] = 0;

			MrtPixelCollection.update(pixID, {$set: {color: test }});

		} else {

			console.log("changePixelColor (server): picID=" + picID + " pixID=" + pixID);
			
			if(MrtPixelCollection.find({picID: picID, _id: pixID}).count() === 1) {
				MrtPixelCollection.update(pixID, {$set: {color: getRandomEJSONColor() }});
			} else {
				// not able to distinguisch pixel from picture OR invalid operation (more likely ^^)
				throw new Meteor.Error(404, "changePixelColor (server): Can't match pixel with picture, lookup failed.");
			}
		}

		return pixID;
	},
	addMessage: function (message, messageReference) {
		check(message, String);
		check(messageReference, String);
		
		var msgReference = MrtMessageReferenceCollection.findOne(messageReference);

		if(!msgReference) {
			throw new Meteor.Error(404, "addMessage: Cannot match messageReference=" + messageReference);
		}

		if(Meteor.isServer) {
			MrtMessageCollection.insert({
				text: message, 
				messageReferenceID: messageReference,
				author: "severadded",
				timestamp: new Date().toUTCString()
			});
		}
	}
});



/**
 * Helper function to return a color as EJSON binary Uint8Array containing rgb channels
 * @return {Uint8Array} binary array containing uint8s
 */
function getRandomEJSONColor() {
	var color = EJSON.newBinary(3);
				color[0] = getRandomColorChannel();
				color[1] = getRandomColorChannel();
				color[2] = getRandomColorChannel();
	return color;
}

/**
 * Helper function to return a randomly generated color channel as int
 * @return {int} Random int between 0 and 256
 */
function getRandomColorChannel() {
	return Math.floor(Math.random()*256);
}