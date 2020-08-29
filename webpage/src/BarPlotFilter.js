
import React, { Component } from 'react'
import { Form, Checkbox, Radio } from 'semantic-ui-react'

class BarPlotFilter extends Component {

    state = { 'granularity':'month', 'unit':'count' };

    handleChange = (e, selection) => {
        if (selection.type === 'checkbox') {
            this.setState({ 'granularity': selection.value });
            this.props.onChange({ 'type': 'bar', 'payload': {'type': selection.value, 'unit': this.state.unit } })
        } else if (selection.type === 'radio') {
            this.setState({ 'unit': selection.value });
            this.props.onChange({ 'type': 'bar', 'payload': {'type': this.state.granularity, 'unit': selection.value } })
        }
    }

    render() {
        console.log(this.state)
            // <div>
            //     <Button attached='left'>Left</Button>
            //     <Button attached='right'>Right</Button>
            // </div>

            // <Button.Group>
            //     <Button>Count</Button>
            //     <Button.Or />
            //     <Button positive>Percentage</Button>
            // </Button.Group>

            // <Radio toggle label='Display values in percentage' onChange={this.handleChange}/> 
        return (
          <Form>

        	<Form.Field>
        	  Choose time granularity:
        	</Form.Field>
        	<Form.Field>
        	  <Checkbox
        		radio
        		label='Per month'
        		name='checkboxRadioGroup'
        		value='month'
        		checked={this.state.granularity === 'month'}
        		onChange={this.handleChange}
        	  />
        	</Form.Field>
        	<Form.Field>
              <Checkbox
                radio
                label='Per day of the month'
                name='checkboxRadioGroup'
                value='dom'
                checked={this.state.granularity === 'dom'}
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                radio
                label='Per day of the week'
                name='checkboxRadioGroup'
                value='dow'
                checked={this.state.granularity === 'dow'}
                onChange={this.handleChange}
              />
            </Form.Field>
                        <Form.Field>
              <Checkbox
                radio
                label='Per hour of the day'
                name='checkboxRadioGroup'
                value='hod'
                checked={this.state.granularity === 'hod'}
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form>
        )
    }
}

export default BarPlotFilter;