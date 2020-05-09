import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Item from './Item'

//query to get all items
const ALL_ITEMS_QUERY = gql`
query ALL_ITEMS_QUERY {
  items {
    id
    title
    price
    description
    image
    largeImage
  }
}
`
const Center = styled.div`
text-align: center;
`

const ItemsList = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
grid-gap: 60px;
max-width: ${props => props.theme.maxWidth};
margin: 0 auto;
`

// Query(Component) allows us to query data directly into this component via render props.
//“render prop” refers to a technique for sharing code between React components... 
//..using a prop whose value is a function.

export default class Items extends Component {
  render() {
    return (
      <Center>
        <Query query={ALL_ITEMS_QUERY}>
          {({ data, error, loading }) => {
            // console.log(payload)
            loading ? <p>Loading...</p> : null
            if (error) return <p>Error: {error.message}</p>
            return (
              <ItemsList>
                {data.items.map((item) => (
                  <Item item={item} key={item.id}/>
                ))}
              </ItemsList>
            )
          }}
        </Query>
      </Center>
    )
  }
}

export {ALL_ITEMS_QUERY}
