// import models
const { User, Thought } = require('../models');

// error handling
const { AuthenticationError } = require('apollo-server-express');

// import the token function from utils
const { signToken } = require('../utils/auth');

// A resolver can accept four arguments in the following order:
//
// parent: This is if we used nested resolvers to handle more complicated actions, as it would hold the reference to the
// resolver that executed the nested resolver function. We won't need this throughout the project, but we need to include
// it as the first argument.
//
// args: This is an object of all of the values passed into a query or mutation request as parameters. In our case, we
// destructure the username parameter out to be used.
//
// context: This will come into play later. If we were to need the same data to be accessible by all resolvers, such as
// a logged-in user's status or API access token, this data will come through this context parameter as an object.
//
// info: This will contain extra information about an operation's current state. This isn't used as frequently, but it
// can be implemented for more advanced uses.

// just a simple object called resolvers with a Query nested object that holds a series of methods. These methods get
// the same name of the query or mutation they are resolvers for. Now when we query thoughts, we will perform a .find()
// method on the Thought model. We're also returning the thought data in descending order, as can be seen in the .sort()
// method that we chained onto it. We don't have to worry about error handling here because Apollo can infer if
// something goes wrong and will respond for us.
const resolvers = {
    Query: {
        // Here, we pass in the parent as more of a placeholder parameter. It won't be used, but we need something in
        // that first parameter's spot so we can access the username argument from the second parameter. We use a
        // ternary operator to check if username exists. If it does, we set params to an object with a username key set
        // to that value. If it doesn't, we simply return an empty object.
        thoughts: async (parent, {username}) => {
            const params = username ? {username} : {};
            // We then pass that object, with or without any data in it, to our .find() method. If there's data, it'll
            // perform a lookup by a specific username. If there's not, it'll simply return every thought. Let's test this out.
            return Thought.find(params).sort({createdAt: -1});
        },
        // get a thought by _id
        thought: async (parent, {_id}) => {
            return Thought.findOne({_id});
        },
        // get all users
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        // get a user by username
        user: async (parent, {username}) => {
            return User.findOne({username})
                .select('-__v -password')
                .populate('friends')
                .populate('thoughts');
        },

        // read request header for jwt
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id})
                    .select('-__v -password')
                    .populate('thoughts')
                    .populate('friends');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        // creates a user and issues them a token
        addUser: async (parent, args) => {
            const user = await User.create(args);
            // create the token
            const token = signToken(user);

            return { token, user };
        },
        // verifies user exits and issues them a token
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            // create the token
            const token = signToken(user);
            return { token, user };
        },
        // create a thought
        addThought: async (parent, args, context) => {
            if (context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { thoughts: thought._id } },
                    //  without the { new: true } flag  Mongo would return the original document instead of the updated document.
                    { new: true }
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        // create a reaction
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: { reactionBody, username: context.user.username } } },
                    { new: true, runValidators: true }
                );

                return updatedThought;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        // add a friend
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    // A user can't be friends with the same person twice, though, hence why we're using the $addToSet
                    // operator instead of $push to prevent duplicate entries.
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate('friends');

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;