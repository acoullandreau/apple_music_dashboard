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

				var target_url = 'mail/mail.php';
				var form_content = {
					'email':this.state.email,
					'message':this.state.message
				}

				var formData = new FormData();
				for(var elem in form_content) {
					formData.append(elem, form_content[elem]);
				}

				var post_request = new Request(target_url, {
					method: 'POST',
					body: formData,
				});

				//post form content
				fetch(post_request).then(response => {
					console.log(response)
					this.props.displayOverlay({
						'display':true, 
						'hash':'#help', 
						'type':'contact success', 
						'title':'Thank you !', 
						'message':'Your message has been successfully sent.'
					})
				}).catch(function(e) {
					console.warn('Something went wrong.', e);
					this.props.displayOverlay({
						'display':true, 
						'hash':'#help', 
						'type':'contact fail', 
						'title':'Oops !', 
						'message':'Your message could not be sent. Please try again!'
					})
				})

				this.props.displayOverlay({
					'display':true, 
					'hash':'#help', 
					'type':'contact pending', 
					'title':'Sending !', 
					'message':'Your message is being sent.'
				})

			} else {
				this.props.displayOverlay({
					'display':true, 
					'hash':'#help', 
					'type':'email', 
					'title':'Invalid email address', 
					'message':'Please enter a valid email address so I can answer you!'
				})
			}
		} else if (this.state.email !== '') {
			this.props.displayOverlay({
				'display':true, 
				'hash':'#help', 
				'type':'email', 
				'title':'Invalid email address', 
				'message':'Please enter a valid email address so I can answer you!'
			})
		} else if (this.state.message !== '') {
			this.props.displayOverlay({
				'display':true, 
				'hash':'#help', 
				'type':'message', 
				'title':'Empty message', 
				'message':'Please ensure that you enter your question, request or comment in the message field!'
			})
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


