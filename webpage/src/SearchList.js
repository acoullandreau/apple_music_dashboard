import React from 'react';
import { Search, Label } from 'semantic-ui-react';

// IMPORTANT NOTE : SearchResult seems to expect a title key - so make sure to include a title in the objects in the "source"

const initialState = {
  loading: false,
  results: [],
  value: '',
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
    case 'UPDATE_SELECTION':
      return { ...state, value: action.selection };

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

  // timeout used for debouncing
  const timeoutRef = React.useRef()
  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({ type: 'CLEAN_QUERY' })
        return
      }

      const re = new RegExp(data.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // i for case-insensitive search

      dispatch({
        type: 'FINISH_SEARCH',
        results: source.filter((result) => re.test(result.title)),
      })

    }, 300)
  }, [])
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleSelect = React.useCallback((e, data) => {
    console.log(e, data)
    // update state with the selected value
    dispatch({ type: 'UPDATE_SELECTION', selection: data.result.text });
    console.log(props)
    console.log(value)
  })

  return (
      <Search
        loading={loading}
        onResultSelect={handleSelect}
        onSearchChange={handleSearchChange}
        resultRenderer={resultRenderer}
        results={results}
        value={value}
      />

  )
}


export default SearchList;