import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'semantic-ui-react';

class ContactForm extends React.Component {
	state = { 'email':'', 'message':'' };

	handleChange = (e) => {
		const target = e.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value
		});
	}

	checkEmailValidity = () => {
		var email_regex = /\S+@\S+\.\S+/;
		return email_regex.test(this.state.email);
	}

	sendContactMessage = () => {
		if (this.state.email !== '' & this.state.message !== '') {
			var emailValid = this.checkEmailValidity();
			if (emailValid) {
				// send the email
				console.log('Ready to send email');
			} else {
				this.props.displayOverlay({'display':true, 'hash':'#help', 'type':'email', 'title':'Invalid email address', 'message':'Please enter a valid email address so I can answer you!'})
				//overlay provide a valid email address
			}
		} else {
			//overlay provide a valid email address and a message
		}

	}

	render() {
		return (
			<Form onSubmit={this.sendContactMessage} className={['grid-two', 'row-four'].join(' ')}>
				<div className='form-block'>
					<p className={['form-title', 'bold'].join(' ')}>Email</p>
					<input type="email" className='form-field' name="email" onChange={this.handleChange} />
				</div>
				<div className='form-block'>
					<p className={['form-title', 'bold'].join(' ')}>Message</p>
					<textarea className={['form-field', 'message-field'].join(' ')} name="message" onChange={this.handleChange} ></textarea>
				</div>
				<Button 
					className='form-button'
					color='red'
					toggle 
					size='medium'
				>
					Send message
				</Button>
			</Form>
		) 
	}
}

ContactForm.propTypes = {
   displayOverlay:PropTypes.func.isRequired
}

export default ContactForm;

//FormSubmit = function() {
//var target_url = 'mail/mail.php';
////retrieve the content of the form
//var form = document.getElementById("contact-form");
//var form_content = {
//'name':form.elements[0].value,
//'email':form.elements[1].value,
//'message':form.elements[2].value
//}

////check integrity of email address
//var email_regex = /\S+@\S+\.\S+/;
//if (email_regex.test(form_content['email']) == true) {
//use js form data;
//for(var elem in form_content) {
//formData.append(elem, form_content[elem]);
//}

//var post_request = new Request(target_url, {
//method: 'POST',
//body: formData,
//});

////post form content
//fetch(post_request).then(function(response) {
//OpenOverlay('form', 'success');
//}).catch(function (err) {
//console.warn('Something went wrong.', err);
//OpenOverlay('form', 'error');
//})

////display an acknowledgment message for the form submission
//OpenOverlay('form', 'pending');

//} else {
////display an error message for the form submission
//OpenOverlay('form', 'email_error');
//}

//}


