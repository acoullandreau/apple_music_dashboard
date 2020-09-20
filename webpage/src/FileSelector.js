import React from 'react';
import PropTypes from 'prop-types';

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
	}

	clearStorage = () => {
		localStorage.clear();
		this.setState(Object.assign({}, this.initialState));
	}

	onReset = () => {
		this.setState(Object.assign({}, this.initialState));
		this.props.onReset();
	}

	onFileSelection = (files) => {
		//check the format of the archive loaded -> zip file containing the structure we want!
		new Promise((resolve, reject) => {
			var archive = files;
			var isInputValid = this.validateInputFormat(archive);
			if (isInputValid) {
				this.props.onFileLoad(archive);
				resolve();
			} else {
				var errorMessage = 'You should provide a single file, archive with a .zip extension.'
				this.setState({'errorMessage': errorMessage });
				reject();
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
				<React.Fragment>
					<div className={['paragraph', 'instruction-text'].join(' ')}>You have loaded an archive {this.state.archiveName}</div>
					<div className="home-button"><input type="button" onClick={this.onReset} value="Load another archive" /></div>
				</React.Fragment>
			)
		} else if ( errorMessage !== '') {
			fileSelector = (
				<React.Fragment>
					<div className={['paragraph', 'instruction-text'].join(' ')}>
						The format of the archive you passed is wrong: {errorMessage} <br/> Please check the documentation.
					</div>
					<div className="home-button"><input type="button" onClick={this.clearStorage} value="Load another archive" /></div>
				</React.Fragment>
			)
		} else {
			fileSelector = (
				<React.Fragment> 
					<div className={['paragraph', 'instruction-text'].join(' ')}>Choose a file to upload</div>
					<div className="home-button"><input type="file" onChange={e => this.onFileSelection([...e.target.files]) } value=""/></div>
				</React.Fragment>
			)
		}
		
		return fileSelector;

	}

	render() {
		return <React.Fragment>{this.renderComponent()}</React.Fragment>;
	}
}

// props validation
FileSelector.propTypes = {
   onReset: PropTypes.func.isRequired,
   onFileLoad: PropTypes.func.isRequired,
}


export default FileSelector;