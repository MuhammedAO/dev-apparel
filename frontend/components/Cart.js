import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import CartStyles from './styles/CartStyles'
import User from './User'
import calcTotalPrice from '../lib/calcTotalPrice'
import CartItem from './CartItem'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import formatMoney from '../lib/formatMoney'

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

const Cart = () => (
    <User>{({data:{me}}) => {
      if(!me) return null
     console.log(me)
     return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {(toggleCart) => (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <CartStyles open={data.cartOpen}>
              <header>
                <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
                <Supreme>{me.name}'s Cart</Supreme>
                <p>You have {me.cart.length} item{me.cart.length <= 1 ? '' :'s'} in your cart.</p>
              </header>
              <ul>{me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem} />)}</ul>
              <footer>
                <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                <SickButton>Checkout</SickButton> 
              </footer>
            </CartStyles>)}
        </Query>
      )}
    </Mutation>
    )
  }}</User> 
)

export default Cart
export {LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION}