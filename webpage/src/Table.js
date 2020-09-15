import React from 'react';
import Table, { Column } from 'react-base-table';


function TableComponent(props) {

	const data = React.useMemo(
		() => props.data.map(elem => {
			return(
				{
					col0: elem['text']
				}
			)
		}),
		[]
	)

	const columns = React.useMemo(
		() => [{key: 'col0', dataKey:"col0"}],
		[]
	)

	return (
		<Table data={data}>
			<Column {...columns[0]} width={100} flexGrow={1} flexShrink={0} />
		</ Table>
	)

}

export default TableComponent;






// class Table extends React.Component {

// 	handleChange = (selection) => {
// 		this.props.onSelect(selection.selectedRows);
// 	};

// 	render() {
// 		return (
// 		  <DataTable
// 		    columns={[{
// 			    name: 'Select all',
// 			    selector: 'name',
// 			    sortable: true,
// 			}]}
// 		    data={this.props.data.map(elem => {
// 		        return(
// 			        {
// 			            name: elem['text']
// 			        }
// 			    )
// 	    	})}
// 		    selectableRows // add for checkbox selection
// 		    onSelectedRowsChange={this.handleChange}
// 		  />
// 		)
// 	}
// };

// export default Table;