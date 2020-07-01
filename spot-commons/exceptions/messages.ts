// Strings for ALL error messages

// All strings should be defined here
// Localization is a todo

// English
export const ERROR_MESSAGES = {

    RATE_LIMIT: {

        RATE_LIMIT: 'Too many requests'

    },

    // Main Errors for main pages
    MAIN: {

        FRIENDS: {

            EXISTS: 'You are already friends with this person',

            SELF: 'Cannot add yourself',
            NO_USER: 'No user exists with that username',

            GENERIC: 'Error sending friend request'

        },

        POSTS: {

            POST_ERROR: 'Post Error',
            INVALID_POST_CONTENT: 'Invalid post content',
            INVALID_POST_LENGTH: 'Invalid post length',
            NO_CONTENT: 'No content'

        },

        REPORT: {

            REPORT_ERROR: 'There was an error sending your report. Please try again.',
            REPORT_LENGTH: 'Invalid report length'

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
