import React from 'react';
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

  // timeout used for debouncing
  const timeoutRef = React.useRef() // we create a ref for the timeout object
  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({ type: 'CLEAN_QUERY', query: props.type })
        return
      }

      const re = new RegExp(data.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // i for case-insensitive search

      dispatch({
        type: 'FINISH_SEARCH',
        results: source.filter((result) => re.test(result.title)),
      })

    }, 500)
  }, [])

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


export default SearchList;