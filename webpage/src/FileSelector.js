import React from 'react';
import PropTypes from 'prop-types';

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

	onFocus = () => {
		// this function is used to handle the case of the user opening the file input and clicking cancel (no file selection) 
		// we add a timetout because the focus event is fired before the change event - 
		//and we want to execute the function AFTER the change event had a chance to be fired too
		// check https://stackoverflow.com/questions/34855400/cancel-event-on-input-type-file for more info about the order the events are triggered
		setTimeout(() => {
			this.setState({'showFilePicker':false});
		}, 100)
	}

	onChange = () => {
		var files = this.fileInput.current.files;
		this.onReset();
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
				this.props.onFileLoad(archive);
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
			localStorage.setItem('archiveName', archive.name);
			this.setState({'archive': archive,'hasUploadedArchive': true, 'archiveName': archive.name });
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
		const showFilePicker = this.state.showFilePicker;
		let fileSelector;

		if ( hasUploadedArchive === true && errorMessage === '') {
			if (showFilePicker) {
				fileSelector = (
					<React.Fragment> 
						<div className={['paragraph', 'instruction-text'].join(' ')}>Choose a file to upload</div>
						<div className="home-button"><input type="file" onFocus={this.onFocus} onChange={this.onChange} ref={this.fileInput} value=""/></div>
					</React.Fragment>
				)
			} else {
				fileSelector = (
					<React.Fragment>
						<div className={['paragraph', 'instruction-text'].join(' ')}>You have loaded an archive {this.state.archiveName}</div>
						<div className="home-button"><input type="button" onClick={() => this.setState({'showFilePicker':true})} value="Load another archive" /></div>
					</React.Fragment>
				)
			}
		} else if ( errorMessage !== '') {
			fileSelector = (
				<React.Fragment>
					<div className={['paragraph', 'instruction-text'].join(' ')}>
						The format of the archive you passed is wrong: {errorMessage}
					</div>
					<div className="home-button"><input type="button" onClick={this.clearStorage} value="Load another archive" /></div>
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