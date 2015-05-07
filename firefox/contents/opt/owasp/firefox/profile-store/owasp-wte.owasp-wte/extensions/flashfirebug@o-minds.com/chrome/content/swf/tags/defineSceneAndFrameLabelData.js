/*
The DefineSceneAndFrameLabelData tag contains scene and frame label data for a
MovieClip. Scenes are supported for the main timeline only, for all other movie clips a single
scene is exported.
*/
function DefineSceneAndFrameLabelData(ba, obj) {
	this.header = new RecordHeader(ba);
	this.sceneCount = ba.readEncodedU32();
	this.scenes = [];
	
	var i = this.sceneCount;
	while (i--) {
		this.scenes.push({ offset:ba.readEncodedU32(), name:ba.readString()});
	}
	
	this.frameLabelCount = ba.readEncodedU32();
	this.frameLabels = [];
	
	i = this.frameLabelCount;
	while (i--) {
		this.frameLabels.push({ frameNum:ba.readEncodedU32(), frameLabel:ba.readString()});
	}
}