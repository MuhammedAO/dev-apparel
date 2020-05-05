import App, { Container } from 'next/app';
import Page from '../components/Page';
import { ApolloProvider } from 'react-apollo'
import withData from '../lib/withData'

//Custom App component for persistent layout between page changes and also for keeping state when..
//..when navigating between pages
//component can be any file in the pages directory => the actual component you're trying to render
//Page is the parent component for all /component files

//To setup apollo client you need to use the apollo provider

//getInitialProps enables server-side rendering in a page and allows you to do initial data population, 
//it means sending the page with the data already populated from the server.
//Also surfacing page values
class MyApp extends App {

  static async getInitalProps({ Component, context }) {
    let pageProps = {}
    if (Component.getInitalProps) {
      pageProps = await Component.getInitalProps(context)
    }
    //exposes query to the user
    pageProps.query = context.query
    return { pageProps }
  }

  render() {
    const { Component, apollo, pageProps } = this.props
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    )
  }
}

//withData exposes the client via props
export default withData(MyApp);