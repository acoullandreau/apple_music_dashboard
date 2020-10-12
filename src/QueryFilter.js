import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, List } from 'semantic-ui-react';
import SearchList from './SearchList.js';
//import Table from './Table.js';

class QueryFilter extends React.Component {

	constructor(props) {
		super(props);

		this.elemRefs = {};

		this.state = { 
			'target':'', 
			'data':{'rating':'', 'offline':'', 'origin':'', 'skipped':'', 'inlib':'', 'year':'', 'genre':'', 'artist':'', 'title':''},
			'resetIsDisabled': true,
		};
	}

	componentDidMount() {
		this.setState({ 'target' : this.props.target });
	}

	handleChange = (e, selection) => {
		var data = {...this.state.data};
		data[selection.name] = selection.value;
		this.setState({ data });
	}

	onSearchSelect = (selection) => {
		var data = {...this.state.data};
		if (data[selection.type] === '') {
			data[selection.type] = [];
		}
		data[selection.type].push(selection.data);
		this.setState({ data });

	}

	onSubmit = () => {
		this.setState({ 'resetIsDisabled':false }, () => {
			this.props.onQuery(this.state);
		})
	}

	onQueryCleared = () => {
		this.setState({'resetIsDisabled':true });
	}

	onReset = () => {
		for (var ref in this.elemRefs) {
			if (ref.includes('dropdown')) {
				this.elemRefs[ref].clearValue();
			}
		}
		
		var data = {...this.state.data};
		for (var filter in data) {
			data[filter] = '';
		}
		this.setState({ 'data':data, 'resetIsDisabled':true }, () => {
			this.props.onReset(this.state.target);
		})
	}

	fetchOptionsRating = () =>  {
		var options = [
			{ key: 1, text: 'Love', value: 'LOVE' },
			{ key: 2, text: 'Dislike', value: 'DISLIKE' },
			{ key: 3, text: 'Not rated', value: 'Unknown' }
		];

		return options;
	}

	fetchOptionsOffline = () =>  {
		var options = [
			{ key: 4, text: 'Yes', value: true },
			{ key: 5, text: 'No', value: false }
		];

		return options;
	}


	fetchOptionsSkipped = () =>  {
		// column in file is 'Played Completely', so the value is the inverse than the answer to 'Skipped'
		var options = [
			{ key: 6, text: 'Yes', value: false },
			{ key: 7, text: 'No', value: true }
		];

		return options;
	}

	fetchOptionsLibrary = () => {
		var options = [
			{ key: 8, text: 'Yes', value: true },
			{ key: 9, text: 'No', value: false }
		];

		return options;
	}

	fetchOptionsOrigin = () => {
		var options = [];
		var k=10;
		var origins = this.props.data['origin'];
		for (var i in origins) {
			var option = { key: k, text: origins[i], value: origins[i] };
			options.push(option)
			k++;
		}

		return options;
	}

	fetchOptionsYear = () => {
		var options = [];
		var k=50;
		var years = this.props.data['year'];
		for (var i in years) {
			var option = { key: k, text: years[i], value: years[i] };
			options.push(option)
			k++;
		}

		return options;
	}

	fetchOptionsGenre = () => {
		var options = [];
		var k=100;
		var genres = this.props.data['genre'];
		for (var i in genres) {
			var option = { key: k, text: genres[i], value: genres[i] };
			options.push(option)
			k++;
		}

		return options;
	}

	fetchOptionsArtist = () => {
		var options = [];
		var k=1000;
		var artists = this.props.data['artist'];
		for (var i in artists) {
			var option = { key: k, title: artists[i], text: artists[i], value: artists[i] };
			options.push(option)
			k++;
		}

		return options;
	}

	fetchOptionsTitle = () => {
		var options = [];
		var k=10000;
		var titles = this.props.data['title'];
		for (var i in titles) {
			var option = { key: k, title: titles[i], text: titles[i], value: titles[i] };
			options.push(option)
			k++;
		}
		return options;
	}

	createElemRef = (ref, i) => {
		this.elemRefs[`dropdown${i}`] = ref;
	}

	renderDropdown(target) {
		var renderingDict = {
			'rating': { 'placeholder':'Rating', 'multiple':false, 'options':this.fetchOptionsRating() },
			'offline': { 'placeholder':'Offline', 'multiple':false, 'options':this.fetchOptionsOffline() },
			'skipped': { 'placeholder':'Skipped', 'multiple':false, 'options':this.fetchOptionsSkipped() },
			'origin': { 'placeholder':'Origin', 'multiple':true, 'options':this.fetchOptionsOrigin() },
			'inlib': { 'placeholder':'Library Track', 'multiple':false, 'options':this.fetchOptionsLibrary() },
		}

		if (target === 'heatMap') {
			renderingDict['year'] = { 'placeholder':'Year', 'multiple':true, 'options':this.fetchOptionsYear() };
			renderingDict['genre'] = { 'placeholder':'Genre', 'multiple':true, 'options':this.fetchOptionsGenre() };
		}

		return (
			<React.Fragment>
				<ul>
				  	{
						React.Children.toArray(
							Object.keys(renderingDict).map((item, i) => {
								if (renderingDict[item]['multiple']) {
									return (
										<li>
											<Dropdown
												placeholder={renderingDict[item]['placeholder']}
												name={item}
												onChange={this.handleChange}
												selection
												clearable
												search
												multiple
												options={renderingDict[item]['options']}
												ref={ (ref) => { this.createElemRef(ref, i) } }
											/>
										</li>
									)
								} else {
									return (
										<li>
											<Dropdown
												placeholder={renderingDict[item]['placeholder']}
												name={item}
												onChange={this.handleChange}
												selection
												clearable
												search
												options={renderingDict[item]['options']}
												ref={ (ref) => { this.createElemRef(ref, i) } }
											/>
										</li>
									)
								}
							})
						)
					}
				</ul>
			</React.Fragment>
		)

	}

	removeSearchItem = (e, data) => {
		var listData = {...this.state.data};
		var updatedList = [];
		for (var i in listData[data.target]) {
			if (listData[data.target][i] !== data.item) {
				updatedList.push(listData[data.target][i]);
			}
		}
		listData[data.target] = updatedList;
		this.setState({'data':listData});
	}

	renderSearchListItems = (target) => {
		if (this.state.data[target] !== '') {
			var itemList = this.state.data[target];
			return (
				<React.Fragment>
					<List>
						{
							itemList.map((item, i) => {
								return(
									<List.Item key={i}>
										<List.Content floated='right'>
											<Button basic compact circular size='mini' target={target} item={item} onClick={this.removeSearchItem}>x</Button>
										</List.Content>
										<List.Content>{item}</List.Content>
									</List.Item>
								)
							})
						}

					</List>
				</React.Fragment>
			)
		}
	}


	renderQueryHeatMap() {
		return (
			<React.Fragment>
				{ this.renderDropdown('heatMap') }
				<React.Fragment>
					<SearchList type='artist' data={this.fetchOptionsArtist()} onSelect={this.onSearchSelect} />
					{ this.renderSearchListItems('artist') }
				</React.Fragment>
				<React.Fragment>
					<SearchList type='title' data={this.fetchOptionsTitle()} onSelect={this.onSearchSelect} />
					{ this.renderSearchListItems('title') }
				</React.Fragment>
			</React.Fragment>
		)
	}

	renderQuerySunburst() {
		return (
			<React.Fragment>
				{ this.renderDropdown('sunburst') }
			</React.Fragment>
		)
	}

	renderButtons() {
		if (this.state.resetIsDisabled) {
			return (
				<div className='button-margin-top'>
					<Button 
						disabled 
						color='blue' 
						onClick={this.onReset}
					>
						Reset
					</Button>
					<Button 
						color='red' 
						onClick={this.onSubmit}
					>
						Refresh
					</Button>
				</div>
			)
		} else {
			return(
				<div className='button-margin-top'>
					<Button 
						color='blue' 
						onClick={this.onReset}
					>
						Reset
					</Button>
					<Button 
						color='red' 
						onClick={this.onSubmit}
					>
						Refresh
					</Button>
				</div>
			)
		}
	}

	render() {
		if (this.props.target.type === 'heatMap') {
			return (
				<React.Fragment>
					{this.renderQueryHeatMap()}
					{this.renderButtons()}
				</React.Fragment>
			)
		} else if (this.props.target.type === 'sunburst') {
			return (
				<React.Fragment>
					{this.renderQuerySunburst()}
					{this.renderButtons()}
				</React.Fragment>
			)
		}

	}
}

// props validation
QueryFilter.propTypes = {
   target: PropTypes.object.isRequired,
   data: PropTypes.object.isRequired,
   onQuery:PropTypes.func.isRequired,
   onReset:PropTypes.func.isRequired,
}



export default QueryFilter;