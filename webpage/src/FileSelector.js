import React from 'react';

class FileSelector extends React.Component {

	state = { 
		'hasUploadedArchive': String(localStorage.getItem('hasUploadedArchive')) === "true",
		'archive': localStorage.getItem('archive'),
		'archiveName': localStorage.getItem('archiveName')
	};


	onFileSelection = (e) => {
		this.storeArchive(e.target.files);
		this.props.onFileLoad(e.target.files);
	}

	storeArchive = (archive) => {
		if (typeof(archive) !== "undefined") {
	    	localStorage.setItem('hasUploadedArchive', true);
	    	localStorage.setItem('archive', archive);
	    	localStorage.setItem('archiveName', archive[0].name);
	    	this.setState({'archive': archive,'hasUploadedArchive': true, 'archiveName': archive[0].name });
	    }

	}

	clearStorage = () => {
		localStorage.clear();
		this.setState({ 'hasUploadedArchive': false, 'archive':null, 'archiveName': '' });
	}

	renderComponent() {
		const hasUploadedArchive = this.state.hasUploadedArchive;
		let fileSelector;

		if ( hasUploadedArchive === true) {
			fileSelector = (
				<div>
				    <label className="custom-file-upload">
				    	<div>You have already loaded an archive {this.state.archiveName}</div>
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
		console.log(this.props);
		return <div>{this.renderComponent()}</div>;
	}
}

export default FileSelector;