import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

class Overlay extends React.Component {

	state = { 'display': false, 'type':'', 'message':''};

	closeModal() {
		// object passed to displayOverlay function of App through props 
		this.props.onClose({'display':false, 'hash':this.props.params.hash, 'type':'', 'title':'', 'message':''});
	}

	render() {
		if (this.props.params.type === 'loader') {
			return (
				<div>
					<div className="Blur"></div>
					<div className='ui active dimmer'>
						<div className="ui big text loader">Processing your files to build visualizations...</div>
					</div>
				</div>
			) 
		} else {
			return (
				<div>
					<div className="Blur" onClick={() => this.closeModal()}></div>
					<div className='OverlayWindow'>
						<div>
							<div className={['bold', 'subtitle'].join(' ')}>{this.props.params.title}</div>
							<div >{this.props.params.message}</div>
							<Button onClick={() => this.closeModal()}>Close</Button>
						</div>
					</div>
				</div>
			) 
		}
						// <div><a href={this.props.params.hash} className="Close" onClick={() => this.closeModal()}>x</a></div>


	}
}


Overlay.propTypes = {
   onClose:PropTypes.func.isRequired,
   params:PropTypes.object.isRequired
}

export default Overlay;