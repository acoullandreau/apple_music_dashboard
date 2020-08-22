import React from 'react';

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
			'hasUploadedArchive': false,
			'archive': null,
			'archiveName': null,
			'errorMessage':''
		};


		this.filesInArchive = {
            'identifier_infos' : 'Apple_Media_Services/Apple Music Activity/Identifier Information.json.zip',
            'library_tracks' : 'Apple_Media_Services/Apple Music Activity/Apple Music Library Tracks.json.zip',
            'library_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Library Activity.json.zip',
            'likes_dislikes' : 'Apple_Media_Services/Apple Music Activity/Apple Music Likes and Dislikes.csv',
            'play_activity': 'Apple_Media_Services/Apple Music Activity/Apple Music Play Activity.csv'
        }
	}


	clearStorage = () => {
		localStorage.clear();
		this.setState(Object.assign({}, this.initialState));
	}

	onReset = () => {
		this.props.onReset();
		this.setState(Object.assign({}, this.initialState));
	}

	onFileSelection = (e) => {
		//check the format of the archive loaded -> zip file containing the structure we want!
		new Promise((resolve, reject) => {
			var archive = e.target.files;
			var isInputValid = this.validateInputFormat(archive);
			if (isInputValid) {
				this.props.onFileLoad(archive);

			} else {
				var errorMessage = 'You should provide a single file, archive with a .zip extension.'
				this.setState({'errorMessage': errorMessage });
			}
		});
	}

	storeArchive = (archive) => {
		if (typeof(archive) !== "undefined") {
	    	localStorage.setItem('hasUploadedArchive', true);
	    	localStorage.setItem('archive', JSON.stringify(archive));
	    	localStorage.setItem('archiveName', archive[0].name);
	    	this.setState({'archive': archive,'hasUploadedArchive': true, 'archiveName': archive[0].name });
	    }

	}

	validateInputFormat = (input) => {
		// as we limit the input by not having the 'multiple' keyword, we are sure the user passes a single file
		var archive = input[0];

		// now we need to validate that the input contains is a zip file, which name has the .zip extension
		if (!archive.name.includes('.zip') ) {
			return false;
		} 
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
	          			<div><input type="button" onClick={this.onReset} value="Load another archive" /></div>
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