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
            INVALID_POST_LINE_LENGTH: 'Invalid post line length',
            NO_CONTENT: 'No content',
            IMAGE: 'Error with image',
            INVALID_POST_PROFANITY: 'Spot cannot contain profanity'

        },

        COMMENTS: {

            COMMENT_ERROR: 'Comment Error',
            INVALID_COMMENT_CONTENT: 'Invalid comment content',
            INVALID_COMMENT_LENGTH: 'Invalid comment length',
            IMAGE: 'Error with image',
            INVALID_COMMENT_LINE_LENGTH: 'Invalid post line length',
            NO_CONTENT: 'No content',
            INVALID_COMMENT_PROFANITY: 'Comment cannot contain profanity'

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
            VERIFY: 'User email not verified',

            // Register Validation

            // Username
            USERNAME_TAKEN: 'Username is not available',
            USERNAME_CHARACTER: 'Username of invalid form',
            USERNAME_LENGTH: 'Username length invalid',

        }

    }

};
