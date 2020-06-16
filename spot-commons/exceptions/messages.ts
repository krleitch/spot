// Strings for ALL error messages

// All strings should be defined here
// Localization is a todo

// English
export const ERROR_MESSAGES = {

    // Main Errors for main pages
    MAIN: {

        FRIENDS: {

            SELF: 'Cannot add yourself',
            NO_USER: 'No user exists with that username',

            GENERIC: 'Error sending friend request'

        },

        POSTS: {

            POST_ERROR: 'Post Error',
            INVALID_POST_CONTENT: 'Invalid post content',
            INVALID_POST_LENGTH: 'Invalid post length',
            NO_CONTENT: 'No content'

        }
    
    },

    PRE_AUTH: {

        AUTHENTICATION: {

            // Standard Authentication Error
            NO_AUTHENTICATION: 'User not Authenticated',

            // Register Validation

            // Username
            USERNAME_TAKEN: 'Username is not available',
            USERNAME_CHARACTER: 'Username of invalid form',
            USERNAME_LENGTH: 'Username length invalid',

        }

    }

};
