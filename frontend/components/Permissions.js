import React from 'react'
import { Query, Mutation } from 'react-apollo'
import ErrorMessage from './ErrorMessage'
import gql from 'graphql-tag'
import Table from './styles/Table'
import SickButton from './styles/SickButton'
import PropTypes from 'prop-types'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]


const UPDATE_PERMISSIONS_MUTATION = gql`
mutation updatePermissions($permissions: [Permission], $userId: ID!){
 updatePermissions(permissions: $permissions, userId: $userId){
 id
 permissions
 name
 email
 }
 }
`

const ALL_USERS_QUERY = gql`
query {
  users {
    id
    name
    email
    permissions
  }
}
`

const Permissions = () => {
  return (
    <React.Fragment>
      <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => (
          <div>
            <ErrorMessage error={error} />
            <div>
              <h2>Manage Permissions</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {possiblePermissions.map((permission, index) => <th key={index}>{permission}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user, index) => <UserPermissions key={index} user={user} />)}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Query>
    </React.Fragment>
  )
}

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = (e) => {
    const checkbox = e.target
    //take the copy of current permissions
    let updatedPermissions = [...this.state.permissions]

    //figure out if u need to remove or add this permission

    if(checkbox.checked){
      //add it in
      updatedPermissions.push(checkbox.value)
    }
     else{
       updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value)
     }
    this.setState({permissions: updatedPermissions})
    // console.log(updatedPermissions)
  }

  render() {
    const user = this.props.user
    return (
      <Mutation 
      mutation={UPDATE_PERMISSIONS_MUTATION}
      variables={{
      permissions: this.state.permissions,
      userId: this.props.user.id
      }}
      >

      {(updatePermissions, {loading, error}) => (
        <React.Fragment>
        {error && <tr><td colSpan="8"><ErrorMessage error={error}/></td></tr>}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map((permission, index) => (
          <td key={index}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input 
              id={`${user.id}-permission-${permission}`}
              type="checkbox" 
              checked={this.state.permissions.includes(permission)}
              value={permission}
              onChange={this.handlePermissionChange}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton
          type="button"
          disabled={loading}
          onClick={updatePermissions}
          >
          Updat{loading?'ing' : 'e'}
          </SickButton>
        </td>
      </tr>
      </React.Fragment>
      )}
      </Mutation>
    )
  }
}

export default Permissions
