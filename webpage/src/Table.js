import React from 'react';
import DataTable from 'react-data-table-component';


class Table extends React.Component {

	handleChange = (selection) => {
		this.props.onSelect(selection.selectedRows);
	};

	render() {
		return (
		  <DataTable
		    columns={[{
			    name: 'Select all',
			    selector: 'select',
			    sortable: true,
			}]}
		    data={this.props.data.map(elem => {
		        return(
			        {
			            select: elem['text']
			        }
			    )
	    	})}
		    selectableRows // add for checkbox selection
		    onSelectedRowsChange={this.handleChange}
		  />
		)
	}
};

export default Table;