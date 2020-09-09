import React from 'react';
import { Search } from 'semantic-ui-react';

const initialState = {
  loading: false,
  results: [],
  value: '',
}

function exampleReducer(state, action) {
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

function SearchList(props) {

  const source = props.data;
  const [state, dispatch] = React.useReducer(exampleReducer, initialState)
  const { loading, results, value } = state

  const timeoutRef = React.useRef()
  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({ type: 'CLEAN_QUERY' })
        return
      }

      const re = new RegExp(data.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const isMatch = (result) => re.test(result.text)

      console.log(source)
      console.log(isMatch(source))


      dispatch({
        type: 'FINISH_SEARCH',
        //results: source.filter(isMatch),
      })
    }, 300)
  }, [])
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
      <Search
        loading={loading}
        onResultSelect={(e, data) =>
          dispatch({ type: 'UPDATE_SELECTION', selection: data.result.title })
        }
        onSearchChange={handleSearchChange}
        results={results}
        value={value}
      />

  )
}

    //   <Grid.Column width={10}>
    //     <Segment>
    //       <Header>State</Header>
    //       <pre style={{ overflowX: 'auto' }}>
    //         {JSON.stringify({ loading, results, value }, null, 2)}
    //       </pre>
    //       <Header>Options</Header>
    //       <pre style={{ overflowX: 'auto' }}>
    //         {JSON.stringify(source, null, 2)}
    //       </pre>
    //     </Segment>
    //   </Grid.Column>
    // </Grid>
export default SearchList;