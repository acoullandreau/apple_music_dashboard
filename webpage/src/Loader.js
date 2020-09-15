import React from 'react';

const Loader = (props) => {
  return (
	<div className='ui active dimmer'>
	  <div className="ui big text loader">{props.message}</div>
	</div>
  );
}

//we can specify the default value of the props in case none is provided when using the component
Loader.defaultProps = {
  message:'Processing your files to build visualizations...'
};

export default Loader;