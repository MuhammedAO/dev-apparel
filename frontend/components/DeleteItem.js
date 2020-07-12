import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {ALL_ITEMS_QUERY} from './Items'

const DELETE_ITEM_MUTATION = gql`
mutation DELETE_ITEM_MUTATION($id: ID!){
 deleteItem(id: $id) {
     id
  }

}

`

class DeleteItem extends Component {

//the update func is used for interface update in Apollo..
//what this does is it removes an item from a page and immediately updates the UI.
//Apollo gives u access to the cache(current items) and payload(data from deleted item)
//ALL_ITEMS_QUERY is the query that was used to get the items unto the page initially.
update = (cache, payload) => {
 //manually update the cache on the client so it matches the server
 //1. read the cache for the items we want
 const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
//  console.log(data,payload);
 // 2. Filter the deleted itemout of the page
 data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
  // 3. Put the items back!
  cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
}

  render() {
    const { id } = this.props
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id }}
        update={this.update}
      >
        {(deleteItem, { error }) => (
          <button onClick={() => {
            if (confirm('Are you sure you want to delete this item?')) {
              deleteItem().catch(err => {
                alert(err.message)
              })
            }
          }}>{this.props.children}</button>
        )}
      </Mutation>
    )
  }
}

export default DeleteItem