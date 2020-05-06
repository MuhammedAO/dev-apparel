import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import ErrorMessage from './ErrorMessage'
import Router from 'next/router'


//CREATE_ITEM_MUTATION = function with args/variables(that are linked to the state of this component.)
//createItem() = actual mutation from the backend
const CREATE_ITEM_MUTATION = gql`
mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
){
  createItem(
    title: $title
    description: $description
    image: $image
    largeImage: $largeImage
    price: $price
  ) {
    id
  }
}

`


//The reason why i have a state here is b/c b4 data is sent to the gql api..
//it needs to be stored somewhere.
class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  }

  handleChange = (e) => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }
  render() {
    const { title, description, price } = this.state
    return (
      //expose create_item_muttation to this component via props
      //variable = when this mutation fires, it takes a copy of the state and send it along just like i mentioned up there
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { error, loading }) => (

          <Form onSubmit={async (e) => {
            e.preventDefault()

            //call mutation
            const res = await createItem();

            //reroute to single item page
            console.log(res);
            Router.push({
              pathname: '/item',
              query: { id: res.data.createItem.id }
            })
          }}>
            <h2>Sell an item</h2>

            {/*Error message */}
            <ErrorMessage error={error} />

            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">
                Title
              <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="price">
                Price
               <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="description">
                Description
              <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
export { CREATE_ITEM_MUTATION }