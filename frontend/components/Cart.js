import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'

//local state is data that might not neccesarily live in ur Db 
//but it's data that needs to live inside ur browser
//when u use Apollo to store ur gql data, it makes sense to also use Apollo to store ur local data
//@client directive is to let Apollo know not to try to fetch data frm the server but the Apollo store
const LOCAL_STATE_QUERY = gql`
query {
  cartOpen @client
}
`

const TOGGLE_CART_MUTATION = gql`
mutation {
  toggleCart @client
}
`

const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {(toggleCart) => (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <CartStyles open={data.cartOpen}>
              <header>
                <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
                <Supreme>Your Cart</Supreme>
                <p>You have __ items in your cart.</p>
              </header>
              <footer>
                <p>$10.10</p>
                <SickButton>Checkout</SickButton>
              </footer>
            </CartStyles>)}
        </Query>
      )}
    </Mutation>
  )
}

export default Cart
export {LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION}