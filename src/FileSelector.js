import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

class FileSelector extends React.Component {

	constructor(props){
		super(props);
		this.fileInput = React.createRef();
		this.state = { 
			'hasUploadedArchive': String(localStorage.getItem('hasUploadedArchive')) === "true",
			'archive': localStorage.getItem('archive'),
			'archiveName': localStorage.getItem('archiveName'),
			'errorMessage':'',
			'showFilePicker': !(String(localStorage.getItem('hasUploadedArchive')) === "true")
		};

		// preserve the initial state in a new object
		this.initialState = { 
			'hasUploadedArchive': false,
			'archive': null,
			'archiveName': null,
			'errorMessage':'',
			'showFilePicker':true
		};
	}

	clearStorage = () => {
		localStorage.clear();
		this.setState(Object.assign({}, this.initialState));
	}

	onChange = () => {
		var files = this.fileInput.current.files;
		if (this.state.hasUploadedArchive) {
			this.onReset();
		}
		this.onFileSelection(files);
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
				this.props.onFileLoad(archive[0]);
				resolve();
			} else {
				var errorMessage = 'You should provide a single file, archive with a .zip extension.'
				this.setState({'errorMessage': errorMessage });
				this.props.onError({
					'display':true, 
					'hash':'#', 
					'type':'file', 
					'title':'Wrong file format', 
					'message':'You should provide a single file, archive with a .zip extension.'
				})
				reject();
			}
		}).catch(() => {
			console.warn('File selection - wrong input file format (expected .zip archive)');
		});
	}

	storeArchive = (archive) => {
		if (typeof(archive) !== "undefined") {
			localStorage.setItem('hasUploadedArchive', true);
			localStorage.setItem('archive', JSON.stringify(archive));
			localStorage.setItem('archiveName', archive.name || 'Demo data');
			this.setState({'archive': archive,'hasUploadedArchive': true, 'archiveName': archive.name });
		}

	}

	validateInputFormat = (input) => {
		if (input.length !== 1) {
			return false;
		}

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
		const showFilePicker = this.state.showFilePicker;
		let fileSelector;

		if ( hasUploadedArchive && errorMessage === '') {
			fileSelector = (
				<React.Fragment>
					<div className={['paragraph', 'instruction-text'].join(' ')}>You have loaded an archive {this.state.archiveName}</div>
					<div className="home-button">
						<Button 
							color="red" 
							onClick={() => this.fileInput.current.click()}
						>
							Load other data
						</Button>
						<input id="file-input" type="file" onChange={this.onChange} ref={this.fileInput} />
					</div>
				</React.Fragment>
			)
		} else if ( errorMessage !== '') {
			fileSelector = (
				<React.Fragment>
					<div className={['paragraph', 'instruction-text'].join(' ')}>
						The format of the archive you passed is wrong: {errorMessage}
					</div>
					<div className="home-button"><input type="button" onClick={this.clearStorage} value="Load another archive" /></div>
				</React.Fragment>
			)
		} else if (!hasUploadedArchive && showFilePicker) {
			fileSelector = (
				<React.Fragment> 
					<div className={['paragraph', 'instruction-text'].join(' ')}>Choose a file to upload</div>
					<div className="home-button">
						<Button 
							color="red" 
							onClick={() => this.fileInput.current.click()}
						>
							Load your data
						</Button>
						<input id="file-input" type="file" onChange={this.onChange} ref={this.fileInput} />
					</div>
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
	onError:PropTypes.func.isRequired,
	onReset: PropTypes.func.isRequired,
	onFileLoad: PropTypes.func.isRequired,
}


export default FileSelector;