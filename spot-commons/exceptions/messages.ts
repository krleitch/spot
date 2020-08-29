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
            INVALID_POST_PROFANITY: 'Spot cannot contain profanity',
            POST_ACTIVITY: 'Error getting post activity',
            GET_SINGLE_POST: 'Error getting the requested post'

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

        },

        LOCATION: {

            LOCATION_ERROR: 'You are using an invalid location'

        }
    
    },

    PRE_AUTH: {

        AUTHENTICATION: {

            // Generic
            SERVER_ERROR: 'Something has gone wrong. Please try again',

            // Standard Authentication Error
            NO_AUTHENTICATION: 'User not Authenticated',
            VERIFY: 'User email not verified',

            // Register Validation

            // Username
            USERNAME_TAKEN: 'Username is not available',
            USERNAME_CHARACTER: 'Username must be alpha-numeric with non-repeated .-\'',
            USERNAME_LENGTH: 'Username length invalid',

            // Password
            PASSWORD_LENGTH: 'Password length invalid',

            // Email
            EMAIL_TAKEN: 'Email is not available',
            EMAIL_INVALID: 'Email is invalid',

            // Phone
            PHONE_TAKEN: 'Phone is not available',
            PHONE_INVALID: 'Phone is invalid',

            // Invalid Account
            USERNAME_OR_PASSWORD: 'Email / Username or Password is invalid',

            // Password Reset
            TOKEN: 'This token as expired or is invalid',
            PASSWORD_RESET: 'Error resetting password',

            // Update Username
            UPDATE_USERNAME: 'There was an error updating your username',

        }

    }

};
