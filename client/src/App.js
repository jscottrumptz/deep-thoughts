import React from 'react';

// ApolloProvider, is a special type of React component that we'll use to provide data to all of the other components
import { ApolloProvider } from '@apollo/react-hooks';

//  We'll use the ApolloClient to get that data when we're ready to use it.
import ApolloClient from 'apollo-boost';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';

const client = new ApolloClient({
    uri: '/graphql'
});

function App() {
    // Note how we wrap the entire returning JSX code with <ApolloProvider>. Because we're passing the client variable
    // in as the value for the client prop in the provider, everything between the JSX tags will eventually have access
    // to the server's API data through the client we set up.
    return (
        <ApolloProvider client={client}>
            <div className="flex-column justify-flex-start min-100-vh">
                <Header />
                <div className="container">
                    <Home />
                </div>
                <Footer />
            </div>
        </ApolloProvider>
    );
}

export default App;
