import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';
import {LOCAL_STATE_QUERY} from '../components/Cart'


//Apollo Store

const createClient = ({ headers }) => {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    //local data
    //const {cache} = client
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) {
            //read the cartOpen value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            })
            // console.log(cartOpen)
            //write the cart state to the opposite
            const data = {
              data: { cartOpen: !cartOpen }
            }
            cache.writeData(data)
            return data
          }
        }
      },
      defaults: {
        cartOpen: !true
      }
    }
  });
}

//withApollo => HOC from Apollo for next.js
export default withApollo(createClient);
