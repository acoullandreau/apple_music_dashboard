import React from 'react';
import PropTypes from 'prop-types';
import { Search } from 'semantic-ui-react';

// IMPORTANT NOTE : SearchResult seems to expect a title key - so make sure to include a title in the objects in the "source"

const initialState = {
	loading: false,
	results: [],
	value: ''
}


// handles operations depending on the stage of the search
function reducer(state, action) {
	switch (action.type) {
		case 'CLEAN_QUERY':
			return initialState;
		case 'START_SEARCH':
			return { ...state, loading: true, value: action.query };
		case 'FINISH_SEARCH':
			return { ...state, loading: false, results: action.results };

		default:
			throw new Error();
	}
}

// formatting of the result list (simple p)
const resultRenderer = ({ text }) => <p>{text}</p>    


// functional component for the search
function SearchList(props) {

	const source = props.data;
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { loading, results, value } = state

	const timeoutRef = React.useRef() // we create a ref for the timeout object to be able to use it in useEffect
	// useCallback is used here due to the intensity of the computation required here, so prevent recomputing it unecessarily at every render
	const handleSearchChange = React.useCallback((e, data) => {
		// we add this step to reinitialize the search
		clearTimeout(timeoutRef.current)
		dispatch({ type: 'START_SEARCH', query: data.value })

		// timeout used for debouncing
		timeoutRef.current = setTimeout(() => {
			// if the value entered at the new rerender is null, we do not compute anything
			if (data.value.length === 0) {
				dispatch({ type: 'CLEAN_QUERY', query: props.type })
				return
			}

			// otherwise, we look for a match using a regex
			const re = new RegExp(data.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // i for case-insensitive search

			dispatch({
				type: 'FINISH_SEARCH',
				results: source.filter((result) => re.test(result.title)),
			})

		}, 500)
	}, [source, props.type])

	React.useEffect(() => {
		return () => {
			clearTimeout(timeoutRef.current) // we use the ref of the timeout object to clear it
		}
	}, [])

	function handleSelect(e, data) {
		dispatch({ type: 'CLEAN_QUERY' })
		props.onSelect({'type':props.type, 'data': data.result.text})
	}


	return (
		<Search
			loading={loading}
			onResultSelect={handleSelect}
			onSearchChange={handleSearchChange}
			resultRenderer={resultRenderer}
			results={results}
			value={value}
			placeholder={`Search ${props.type}`}
		/>
	)
}

// props validation
SearchList.propTypes = {
   type: PropTypes.string,
   data: PropTypes.array,
   onSelect:PropTypes.func
}


export default SearchList;