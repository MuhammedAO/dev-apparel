import React from 'react'
import {Query} from 'react-apollo'
import {CURRENT_USER_QUERY} from './User'
import SignIn from './SignIn'

const PleaseSignIn = (props) => {
  return (
    <React.Fragment>
     <Query query={CURRENT_USER_QUERY}>
     {({data, loading}) => {
       if (loading) return <p>Loading...</p>
       //check if user is signed in
       if(!data.me) {
         return <div>
         <p>Please sign in before continuing</p>
         <SignIn/>
         </div>
       }
       return props.children
     }}
     
     </Query>
    </React.Fragment>
  )
}

export default PleaseSignIn
