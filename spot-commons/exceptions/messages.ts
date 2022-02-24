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
            GET_PENDING_FRIEND_REQUESTS: 'There was an error getting your pending friend requests',
            DELETE_PENDING_FRIEND_REQUEST: 'There was an errror deleting you pending friend request',
            ACCEPT_FRIEND_REQUEST: 'There was an error accepting the friend request',
            DECLINE_FRIEND_REQUEST: 'There was an error declining the friend request',
            EXISTS: 'You are already friends with this user',
            REQUEST_EXISTS: 'A friend request has already been sent',

            SELF: 'You cannot add yourself',
            NO_USER: 'No account found with that username',

            GENERIC: 'Error sending friend request'

        },

        SPOT: {

            INVALID_SPOT_CONTENT: 'Invalid spot content',
            INVALID_SPOT_LENGTH: 'Invalid spot length',
            INVALID_SPOT_LINE_LENGTH: 'Invalid spot line length',
            NO_CONTENT: 'No content',
            IMAGE: 'Error with image',
            INVALID_SPOT_PROFANITY: 'Spot cannot contain profanity',
            SPOT_ACTIVITY: 'Error getting spot activity',
            GET_SINGLE_SPOT: 'Error getting the requested spot',
            DELETE_SPOT: 'Error deleting spot',
            DISLIKE_SPOT: 'Error disliking spot',
            LIKE_SPOT: 'Error liking spot',
            DELETE_RATING_SPOT: 'Error removing rating from spot',
            GET_SPOT: 'Error getting spots'

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
            UNRATED_COMMENT: 'Error removing rating from comment',
            LIKE_REPLY: 'Error liking reply',
            DISLIKE_REPLY: 'Error disliking reply',
            UNRATED_REPLY: 'Error removing rating from reply',

            REPORT_COMMENT: 'Error reporting comment',
            NOT_IN_RANGE: 'Error, you are not close enough to comment on this spot',
            NOT_TAGGED: 'Error, you need to be tagged in this comment chain to add your own comment'

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
            UPDATE_USERNAME_TIMEOUT: 'You can only update your username once every 24h',
            UPDATE_EMAIL: 'Error updating email',
            UPDATE_EMAIL_TIMEOUT: 'You can only update your email once every 24h',
            UPDATE_PHONE: 'Error updating phone',
            UPDATE_PHONE_TIMEOUT: 'You can only update your phone number once every 24h',

            FACEBOOK_CONNECT: 'Error connecting account to facebook',
            FACEBOOK_CONNECT_EXISTS: 'This facebook account is already connected to an account',
            FACEBOOK_DISCONNECT: 'Error disconnecting account from facebook',
            GOOGLE_CONNECT: 'Error connecting account to google',
            GOOGLE_DISCONNECT: 'Error disconnecting account from google',

            GET_METADATA: 'Error getting account metadata',
            METADATA_DISTANCE_UNIT: 'Error updating metadata distance unit',
            METADATA_SEARCH_TYPE: 'Error updating metadata search type',
            METADATA_SEARCH_DISTANCE: 'Error updating metadata search distance',
            METADATA_MATURE_FILTER: 'Error updating metadata mature filter',
            METADATA_THEME_WEB: 'Error updating metadata theme web',

            SEND_VERIFY: 'Error sending verification email',
            CONFIRM_VERIFY: 'Error confirming email verification'

        },
    
        USER: {

            DELETE_USER: 'Error deleting user',
            GET_USER: 'Error getting user',

            UPDATE_USERNAME: 'Error updating username',
            UPDATE_USERNAME_TIMEOUT: 'You can only update your username once every 24h',
            UPDATE_EMAIL: 'Error updating email',
            UPDATE_EMAIL_TIMEOUT: 'You can only update your email once every 24h',
            UPDATE_PHONE: 'Error updating phone',
            UPDATE_PHONE_TIMEOUT: 'You can only update your phone number once every 24h',

            FACEBOOK_CONNECT: 'Error connecting user to facebook',
            FACEBOOK_CONNECT_EXISTS: 'This facebook user is already connected to a user',
            FACEBOOK_DISCONNECT: 'Error disconnecting user from facebook',
            GOOGLE_CONNECT: 'Error connecting user to google',
            GOOGLE_CONNECT_EXISTS: 'This google user is already connected to a user',
            GOOGLE_DISCONNECT: 'Error disconnecting user from google',

            GET_METADATA: 'Error getting user metadata',
            METADATA_UNIT_SYSTEM: 'Error updating metadata unit system',
            METADATA_SEARCH_TYPE: 'Error updating metadata search type',
            METADATA_LOCATION_TYPE: 'Error updating metadata location type',
            METADATA_MATURE_FILTER: 'Error updating metadata mature filter',
            METADATA_THEME_WEB: 'Error updating metadata theme web',

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
            REGISTER_ERROR: 'Something has gone wrong. Please try again',

            // Login
            LOGIN_ERROR: 'Something has gone wrong. Please try again',

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
