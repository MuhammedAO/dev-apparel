import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'


const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String! $password: String! $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken password: $password confirmPassword: $confirmPassword) {
     id
     email
     name
    }
  }
`;

class Reset extends Component {

  state = {
    password: '',
    confirmPassword: '',
  };

  saveToState = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {

    const { password, confirmPassword } = this.state
    return (

      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password,
          confirmPassword
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(requestReset, { error, loading }) => (

          <Form method="post"
            onSubmit={async e => {
              e.preventDefault();
              await requestReset();
              this.setState({ password: '', confirmPassword: '' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your password</h2>
              <ErrorMessage error={error} />
              <label htmlFor="password">
                Password
             <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={this.saveToState}
                />
              </label>

              <label htmlFor="password">
                Confirm Password
             <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirm your password"
                  value={confirmPassword}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Reset Your Password!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Reset