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

            GET_FRIENDS: 'There was an error getting your friends',
            DELETE_FRIEND: 'There was an error deleting the requested friend',
            GET_FRIEND_REQUESTS: 'There was an error getting your friend requests',
            ACCEPT_FRIEND_REQUEST: 'There was an error accepting the friend request',
            DECLINE_FRIEND_REQUEST: 'There was an error declining the friend request',
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
            GET_SINGLE_POST: 'Error getting the requested post',
            DELETE_POST: 'Error deleting post',
            DISLIKE_POST: 'Error disliking post',
            LIKE_POST: 'Error liking post',
            GET_POSTS: 'Error getting posts'

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

        },

        NOTIFICATIONS: {

            GET_NOTIFICATIONS: 'Error getting notifications',
            GET_UNREAD_NOTIFICATIONS: 'Error getting unread notifications number',
            SEND_NOTIFICATION: 'Error sending notification',
            SEEN_NOTIFICATION: 'Error setting notification seen',
            SEEN_ALL_NOTIFICATION: 'Error setting all notifications seen',
            DELETE_NOTIFICATION: 'Error deleting notification',
            DELETE_ALL_NOTIFICATION: 'Error deleting all notifications'

        },

        ACCOUNTS: {

            DELETE_ACCOUNT: 'Error deleting account',
            GET_ACCOUNT: 'Error getting account',

            UPDATE_USERNAME: 'Error updating username',
            UPDATE_EMAIL: 'Error updating email',
            UPDATE_PHONE: 'Error updating phone'

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

            // Facebook
            FACEBOOK_SIGNUP: 'There was an error signing up with facebook',

            // Google
            GOOGLE_SIGNUP: 'There was an error signing up with google'

        }

    }

};
