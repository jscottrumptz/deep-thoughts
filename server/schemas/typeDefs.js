// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
// tagged templates are an advanced use of template literals
// to define a query, you use the type Query {} data type, which is built into GraphQL
// type definitions need to specify what type of data is expected in return
// we specify that the type of data to be returned by this query will be a thought as defined by the type Thought
// (username: string) is the parameter we are passing through. Our Thought type definition includes a nested array
// of reactions. So, we create the Reaction custom type.
const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        friendCount: Int
        thoughts: [Thought]
        friends: [User]
    }
    
    type Thought {
        _id: ID
        thoughtText: String
        createdAt: String
        username: String
        reactionCount: Int
        reactions: [Reaction]
    }
    
    type Reaction {
        _id: ID
        reactionBody: String
        createdAt: String
        username: String
    }
    
    type Query {
        users: [User]
        user(username: String!): User
        thoughts(username: String): [Thought]
        thought(_id: ID!): Thought
    }
`;

// export the typeDefs
module.exports = typeDefs;