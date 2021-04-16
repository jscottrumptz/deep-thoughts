import gql from 'graphql-tag';

// the code inside the template literal can be taken right from playground we've wrapped the entire query code in a
// tagged template literal using the imported gql function. We've also saved it as QUERY_THOUGHTS and exported it
// using the ES6 module export syntax.
export const QUERY_THOUGHTS = gql`
  query thoughts($username: String) {
    thoughts(username: $username) {
      _id
      thoughtText
      createdAt
      username
      reactionCount
      reactions {
        _id
        createdAt
        username
        reactionBody
      }
    }
  }
`;