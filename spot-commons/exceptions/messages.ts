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

            ADD_COMMENT: 'Error creating comment',
            INVALID_COMMENT_CONTENT: 'Invalid comment content',
            INVALID_COMMENT_LENGTH: 'Invalid comment length',
            IMAGE: 'Error with comment image',
            INVALID_COMMENT_LINE_LENGTH: 'Invalid comment line length',
            NO_CONTENT: 'No content',
            INVALID_COMMENT_PROFANITY: 'Comment cannot contain profanity',

            COMMENT_ACTIVITY: 'Error getting comment activity',
            GET_COMMENTS: 'Error getting comments',
            GET_REPLIES: 'Error getting replies',
            DELETE_COMMENT: 'Error deleting comment',
            DELETE_REPLY: 'Error deleting reply',

            LIKE_COMMENT: 'Error liking comment',
            DISLIKE_COMMENT: 'Error disliking comment',
            LIKE_REPLY: 'Error liking reply',
            DISLIKE_REPLY: 'Error disliking reply',

            REPORT_COMMENT: 'Error reporting comment'

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
            UPDATE_PHONE: 'Error updating phone',

            FACEBOOK_CONNECT: 'Error connecting account to facebook',
            FACEBOOK_DISCONNECT: 'Error disconnecting account from facebook',
            GOOGLE_CONNECT: 'Error connecting account to google',
            GOOGLE_DISCONNECT: 'Error disconnecting account from google',

            GET_METADATA: 'Error getting account metadata',
            METADATA_DISTANCE_UNIT: 'Error updating metadata distance unit',
            METADATA_SEARCH_TYPE: 'Error updating metadata search type',
            METADATA_SEARCH_DISTANCE: 'Error updating metadata search distance',

            SEND_VERIFY: 'Error sending verification email',
            CONFIRM_VERIFY: 'Error confirming email verification'

        }
    
    },

    PRE_AUTH: {

        AUTHENTICATION: {

            // Standard Authentication Error
            NO_AUTHENTICATION: 'User not Authenticated',
            VERIFY: 'User email not verified',

            // Register
            REGISTER: 'Something has gone wrong. Please try again',

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
            PASSWORD_RESET: 'Error sending password reset',
            PASSWORD_RESET_VALIDATE: 'Error validating password reset token',
            NEW_PASSWORD: 'Error setting new passowrd',

            // Update Username
            UPDATE_USERNAME: 'There was an error updating your username',

            // Facebook
            FACEBOOK_SIGNUP: 'There was an error signing up with facebook',

            // Google
            GOOGLE_SIGNUP: 'There was an error signing up with google'

        }

    }

};
