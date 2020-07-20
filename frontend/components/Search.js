import React, { Component } from 'react'
import DownShift from 'downshift'
import Router from 'next/router'
import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'


const SEARCH_ITEMS_QUERY = gql`
query SEARCH_ITEMS_QUERY ($searchTerm: String!){
  items(where: {
    OR: [ { title_contains: $searchTerm}, {description_contains: $searchTerm} ]
  }) {
    id
    image
    title
  }
}
`
//Apolloconsumer exposes the client so that we can manually run queries/mutations on demand instead of onPage load using usual render props method
//debounce creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked
//debounce will take all of the events that are fired between 350ms and only after 350ms has finish will it fire that event
class AutoComplete extends Component {
  state = {
    items: [],
    loading: false
  }
  onChange = debounce(async (e, client) => {
    //turn loading on
    this.setState({ loading: true })
    //manually query Apollo client
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    })
    this.setState({
      items: res.data.items,
      loading: false
    })
  }, 350)
  render() {
    return (
      <SearchStyles> 
        <div>
          <ApolloConsumer>
            {(client) => (
              <input type="search" onChange={e => {
                e.persist()
                this.onChange(e, client)
              }} />
            )}
          </ApolloConsumer>
          <DropDown>
            {this.state.items.map(item => (
              <DropDownItem key={item.id}>
                <img width="50" src={item.image} alt={item.title} />
                {item.title}
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </SearchStyles>
    )
  }
}

export default AutoComplete