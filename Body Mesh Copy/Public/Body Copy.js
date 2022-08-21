// By Max van Leeuwen
// twitter.com/maksvanleeuwen
//
// On tap, copies the body mesh using MeshBuilder into another RenderMeshVisual. Also bakes the screen texture into it.



//@input SceneObject bodyTracking
//@input Component.RenderMeshVisual rmv
//@input Component.RenderMeshVisual newRMV

//@input Component.Camera cam
//@input Asset.Material bodyMaterial
//@input Asset.Texture screenTex



function copyMesh(){
	// get mesh data
	var indices = script.rmv.mesh.extractIndices();
	var positions = script.rmv.mesh.extractVerticesForAttribute("position");
	
	// create meshbuilder var
	var builder = new MeshBuilder([
		{name:"position", components:3}, // make position attribute
		{name:"texture0", components:2} // make UV attribute (purely so the snap() function works!)
	]);
	builder.topology = MeshTopology.Triangles;
	builder.indexType = MeshIndexType.UInt16;

	var vertices = [];
	for(var i = 0; i < positions.length/3; i++){ // iterate over positions from mesh data, add two numbers interleaved so there is UV data as well
		vertices.push(positions[(i*3)+0]);
		vertices.push(positions[(i*3)+1]);
		vertices.push(positions[(i*3)+2]);
		vertices.push(0); // add any number to the interleaved data to fill the spot of the UV information in the mesh, that way the snap() function can later overwrite this with screen coords
		vertices.push(0);
	}

	// add the indices and vertices to meshbuilder
	builder.appendIndices(indices);
	builder.appendVerticesInterleaved(vertices);

	// apply meshbuilder to new renderMeshVisual
	builder.updateMesh();
	var mesh = builder.getMesh();
	script.newRMV.mesh = mesh;

	// apply transformations from body tracker to new renderMeshVisual
	script.newRMV.getTransform().setWorldPosition( script.bodyTracking.getTransform().getWorldPosition());
	script.newRMV.getTransform().setWorldScale( script.bodyTracking.getTransform().getWorldScale());
	script.newRMV.getTransform().setWorldRotation( script.bodyTracking.getTransform().getWorldRotation());

	// use the snap() function to project UVs from the current camera
	script.newRMV.snap(script.cam);

	// assign a 'screenshot' of the current deviceCameraTexture frame to the material on the new renderMeshVisual
	script.bodyMaterial.mainPass.baseTex = script.screenTex.copyFrame();
}

// assign to tap
var tapEvent = script.createEvent("TapEvent")
tapEvent.bind(copyMesh);