import React from 'react';
import fs from 'fs';
import jsZip from 'jszip';

class FileSelector extends React.Component {

	constructor(props){
		super(props)
		this.state = { 
			'hasUploadedArchive': String(localStorage.getItem('hasUploadedArchive')) === "true",
			'archive': localStorage.getItem('archive'),
			'archiveName': localStorage.getItem('archiveName'),
			'errorMessage':''
		};

		// preserve the initial state in a new object
		this.initialState = { 
			'hasUploadedArchive': String(localStorage.getItem('hasUploadedArchive')) === "true",
			'archive': localStorage.getItem('archive'),
			'archiveName': localStorage.getItem('archiveName'),
			'errorMessage':''
		};
	}


	clearStorage = () => {
		localStorage.clear();
		this.setState(this.initialState);
	}

	onFileSelection = (e) => {
		//check the format of the archive loaded -> zip file containing the structure we want!


		// create a promise to validate input
		// if input validated, storeArchive and call onFileLoad
		// else catch error

		var isInputValid = this.validateInput(e.target.files);

		if (isInputValid === true) {
			this.storeArchive(e.target.files);
			this.props.onFileLoad(e.target.files);
		}
		//console.log(isInputValid)

	}

	storeArchive = (archive) => {
		if (typeof(archive) !== "undefined") {
	    	localStorage.setItem('hasUploadedArchive', true);
	    	localStorage.setItem('archive', archive);
	    	localStorage.setItem('archiveName', archive[0].name);
	    	this.setState({'archive': archive,'hasUploadedArchive': true, 'archiveName': archive[0].name });
	    }

	}

	validateInput = (input) => {
		// as we limit the input by not having the 'multiple' keyword, we are sure the user passes a single file
		var archive = input[0];

		// now we need to validate that the input contains is a zip file, which name has the .zip extension
		if (!archive.name.includes('.zip') ) {
			var errorMessage = 'You should provide a single file, expected to be an archive with a .zip extension.'
			this.setState({'errorMessage': errorMessage });
			return false;
		} 

		// we load the zip archive, and validate that it contains the files we expect
		var archivePromise = jsZip.loadAsync(archive)
		.then(function(zip) {
			//validate that we have the five files we want using the file names
			console.log(zip.files)
		});
		return true;
	}

	renderComponent() {
		const hasUploadedArchive = this.state.hasUploadedArchive;
		const errorMessage = this.state.errorMessage;
		let fileSelector;

		if ( hasUploadedArchive === true && errorMessage === '') {
			fileSelector = (
				<div>
				    <label className="custom-file-upload">
				    	<div>You have loaded an archive {this.state.archiveName}</div>
	          			<div><input type="button" onClick={this.clearStorage} value="Load another archive" /></div>
	        		</label>
				</div>
			)
		} else if ( errorMessage !== '') {
			fileSelector = (
				<div>
				    <label className="custom-file-upload">
				    	<div>The format of the archive you passed is wrong: {errorMessage}</div>
				    	<div>Please check the documentation.</div>
	          			<div><input type="button" onClick={this.clearStorage} value="Load another archive" /></div>
	        		</label>
				</div>
			)
		} else {
			fileSelector = (
				<div> 
	        		<label className="custom-file-upload">
	          			<input type="file" onChange={this.onFileSelection}/>
	        		</label>
				</div>
			)
		}
		
		return <div>{fileSelector}</div>;

	}

	render() {
		return <div>{this.renderComponent()}</div>;
	}
}

export default FileSelector;