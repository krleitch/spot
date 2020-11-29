// String Definitions

// TODO: Localization

// English
export const STRINGS = {

    // Main Pages
    MAIN: {

        NAV: {

            TITLE: 'Spot',
            LOGIN_REGISTER: 'Login / Sign Up',

            // Options
            ACTIVITY: 'Activity',
            FRIENDS: 'Friends',
            ACCOUNT: 'Account',
            LOGOUT: 'Logout',

        },

        HOME: {

            // loading posts
            LOADING_POSTS: 'Searching for Spots...',

            LOCATION_REQUIRED_1: 'Location is required to view',
            LOCATION_REQUIRED_2: 'Spots and add comments',
            LOCATION_ENABLE: 'Please enable location in your browser or continue with ',
            LOCATION_SAFE: 'Your location will never be given away',
            LOCATION_BROWSER: 'Your browser does not support geolocation',
            LOCATION_ERROR: 'Something went wrong with getting your location',
            LOCATION_REFRESH: 'Refresh to try again',
            LOCATION_CREATE: 'Enable browser location to create a spot or add comments',
            LOADING_LOCATION: 'Loading your location...',
            LOCATION_BACKGROUND_1: 'View',
            LOCATION_BACKGROUND_2: 'Spots while your location loads',

            NO_POSTS: 'There are no Spots in this area',
            NO_MORE_POSTS: 'You\'re all caught up!',
            FIRST_POST: 'Be the first to make a Spot!',

            // Posts Toggle
            NEW: 'New',
            HOT: 'Hot',

            VERIFY: 'You must verify your email before you can add spots',
            VERIFY_SEND: 'Send email verification',
            VERIFY_SENT: 'Verification email sent.',
            VERIFY_RESEND: 'Resend',

        },

        ACCOUNT: {

            // No account
            NO_ACCOUNT: 'No account. Please login to continue',

            // My account
            MY_ACCOUNT: 'My Account',

            EMAIL: 'Email',
            VERIFY: 'Send verification email',
            VERIFY_SENT: 'Verification email sent.',
            VERIFY_RESEND: 'Resend',
            VERIFY_CHECK: 'Verified',
            EMAIL_VERIFY_DESCRIPTION: 'You will need to verify your email to start making spots.',
            EMAIL_ERROR: 'Email is required',
            EMAIL_INVALID: 'Invalid email',
            EMAIL_CONFIRM: 'If you change your email you will need to verify your email again. Are you sure you would like to continue?',
            EMAIL_SUCCESS: 'Email was succesfully changed',

            USERNAME: 'Username',
            USERNAME_ERROR: 'Username is required',
            USERNAME_SUCCESS: 'Username was succesfully changed',

            NO_PHONE: 'None',
            PHONE: 'Phone number',
            PHONE_ERROR: 'Phone is required',
            PHONE_INVALID: 'Invalid phone number',
            PHONE_CONFIRM: 'Are you sure you would like to change your phone number?',
            PHONE_SUCCESS: 'Phone was succesfully changed',

            SCORE: 'Spot Score',

            CHANGE: 'Change',
            ADD: 'Add',
            EDIT: 'Edit',
            SUBMIT: 'Submit',

            SCORE_DESCRIPTION: 'Gain score by posting and and commenting on spots!',

            UNIT: 'Preferred Unit',
            IMPERIAL: 'Imperial',
            METRIC: 'Metric',

            MATURE: 'Mature Content Filter',
            MATURE_TRUE: 'On',
            MATURE_FALSE: 'Off',

            // Account options
            ACCOUNT_OPTIONS: 'Options',
            ENABLE_OPTIONS: 'Enable Options',
            DELETE: 'Delete Account',

            // Social
            SOCIAL: 'Social',
            FACEBOOK_CONNECT: 'Connect With Facebook',
            FACEBOOK_CONNECT_SUCCESS: 'Disconnect',
            FACEBOOK_CONNECT_DESCRIPTION: 'Connect with facebook to share spots with all your facebook friends'

        },

        CREATE: {

            CREATE_PLACEHOLDER: 'Spot something?',
            SUBMIT: 'Submit',

            // File options
            FILE_TITLE: 'File:'

        },

        POST: {

            // Left bar
            CURRENT_TIME: 'Now',

            COMMENTS: 'comments',
            COMMENTS_SINGLE: 'comment',
            SEE_MORE: 'See more',
            SEE_LESS: 'See less',

            // Options
            OPEN_POST: 'Open',
            DELETE: 'Delete',
            REPORT: 'Report',
            SHARE: 'Share',

        },

        POST_DETAILED: {

          NO_POST: 'No post found with this link',
          LOADING: 'Loading Spot ...',

        },

        COMMENTS_CONTAINER: {

          LOAD_MORE_COMMENTS: 'Load more comments',
          LOAD_RECENT_COMMENTS: 'Load recent commments',
          REFRESH_COMMENTS: 'Refresh commments',
          LOAD_RECENT_COMMENTS_AGAIN: 'Load recent commments',
          REFRESH_COMMENTS_AGAIN: 'No More Comments, Refresh again',

          // Form
          ADD_COMMENT_PLACEHOLDER: 'Write a comment...',

          TAGS_TITLE: 'Tags:',

          // File options
          FILE_TITLE: 'File:',

          NO_COMMENTS: 'There are no comments on this spot',
          LOGIN: 'Login or Sign Up to Comment',
          VERIFY: 'Email must be verified',
          MAKE_COMMENT: 'Write a comment...',

        },

        COMMENTS: {

          // Options
          DELETE: 'Delete',
          REPORT: 'Report',
          SHARE: 'Share',

          // Reply
          ADD_REPLY_PLACEHOLDER: 'Write a reply...',
          LOAD_MORE_REPLIES: 'Load more replies',

          // See more
          SEE_MORE: 'See more',
          SEE_LESS: 'See less',

          // File options
          FILE_TITLE: 'File:',

          // Tags
          TAGGER: 'tagged you'

          // Error

        },

        REPLY: {

          // Options
          DELETE: 'Delete',
          REPORT: 'Report',
          SHARE: 'Share',

          // Reply
          ADD_REPLY_PLACEHOLDER: 'Write a reply...',

          // See more
          SEE_MORE: 'See more',
          SEE_LESS: 'See less',

          // File options
          FILE_TITLE: 'File:',

          // Tags
          TAGGER: 'tagged you'

          // Error

        },

        SHARE: {

          TITLE: 'Share a Spot!',
          USERNAME_PLACEHOLDER: 'Enter Username',
          COPY_LINK: 'Copy link',
          SEND: 'Send',
          SENT: 'Sent',

          FRIENDS: 'Friends',
          NO_FRIENDS_FOUND: 'No friends found with this name',
          NO_FRIENDS: 'Add Friends to share spots quickly',
          LOGIN: 'Login to share with friends',

          SUCCESS: 'Notification sent',

          // Errors
          USERNAME_ERROR: 'Username is required',
          FRIEND_ERROR: 'You can only send notifications to friends',

        },

        CONFIRM: {

          TITLE: 'Confirm / Cancel',

          MESSAGE: 'Are you sure you would like to complete this action?',

          // Options

          CONFIRM: 'Confirm',
          CANCEL: 'Cancel'

        },

        NOTIFICATIONS: {

          TITLE: 'Notifications',
          CLEAR: 'Clear all',
          NO_NOTIFICATIONS: 'You\'re all caught up!',
          MARK_ALL_AS_SEEN: 'Mark all as seen',
          LOADING: 'Loading notifications...'

        },

        NOTIFICATION_ITEM: {

          PROMPT: 'sent a spot',
          COMMENT_PROMPT: 'tagged you',
          REPLY_PROMPT: 'tagged you'

        },

        FRIENDS: {

          TITLE: 'Friends',

          REQUESTS: 'Requests',
          FRIEND_REQUEST_PLACEHOLDER: 'Enter username',
          FRIEND_REQUEST_ACCEPT: 'Accept',
          FRIEND_REQUEST_DECLINE: 'Decline',
          ADD: 'Add Friends',

          FRIENDS_LIST: 'Friends List',
          FRIEND_SEARCH_PLACEHOLDER: 'Search username',
          REMOVE: 'Remove',

          // Errors
          USERNAME_REQUIRED: 'A username is required',

          NO_FRIENDS: 'Add friends to share spots quickly',
          NO_FRIENDS_FOUND: 'No friends found with this name',

          // Social
          FACEBOOK_CONNECT: 'Connect With Facebook',

        },

        ACTIVITY: {

          TITLE: 'Activity',

          // Tabs
          POSTS: 'Spots',
          COMMENTS_REPLIES: 'Comments & Replies',

          DATE_POST_PROMPT: 'Spotted',
          DATE_COMMENT_PROMPT: 'Commented',
          DATE_REPLY_PROMPT: 'Replied',
          DATE_PROMPT_END: 'ago.',

          POSTS_SCORE: 'Score: ',
          POSTS_COMMENTS: 'Comments: ',
          POSTS_LOCATION: 'Location: ',
          POSTS_OPEN: 'Open',
          COMMENTS_OPEN: 'Open',

          LOADING_POST_ACTIVITY: 'Loading Spot activity ...',
          NO_POST_ACTIVITY: 'You have no spots in recent activity',
          NO_POST_TIME: 'Activity is only shown for the last 72 hours',

          LOADING_COMMENT_ACTIVITY: 'Loading comment & replies activity ...',
          NO_COMMENT_ACTIVITY: 'You have no comments or replies in recent activity',
          NO_COMMENT_TIME: 'Activity is only shown for the last 72 hours',

        },

        REPORT: {

          TITLE: 'Report',

          REPORT_PLACEHOLDER: 'What would you like to report?',
          REPORT_BUTTON: 'Send Report',

          SUCCESS_MESSAGE: 'Report Sent'

        },

        TAG: {

          TAG: 'Tag a friend',

          NO_FRIENDS: 'No friends found'

        },

        WELCOME: {

          TITLE: 'Welcome',

          HEADING: 'Heading 1',
          TEXT: 'text'

        },

        VERIFY: {

          SUCCESS: 'Your email was successfully verified',
          CONTINUE: 'Continue to Spot',
          FAILURE: 'There was an error verifying your email. Your verification code was either invalid or expired',
          SEND: 'Send another verification email',
          SENT: 'Verification email sent'

        }

    },

    // Pre-Auth Pages
    PRE_AUTH: {

        NAV: {

            // NAVIGATION
            ABOUT: 'About',
            CAREERS: 'Careers',
            FAQ: 'FAQ',
            SUPPORT: 'Support',
            MOBILE_DOWNLOAD: 'Download Us',
            CONTACT: 'Contact Us'

        },

        LANDING: {

            // SHOWCASE
            SHOWCASE_TEXT: 'See what those around you are really saying',

            // SIGNUP FROM
            COMMUNITY: 'Join Your Community',
            FACEBOOK_LOGIN: 'Continue with Facebook',

            SIGN_UP_ALTERNATE: 'Or',

            SIGN_UP: 'Sign Up',

            EMAIL_PLACEHOLDER: 'Email',
            USERNAME_PLACEHOLDER: 'Username',
            PASSWORD_PLACEHOLDER: 'Password',
            PHONE_PLACEHOLDER: 'Phone Number',

            EXISTING_ACCOUNT: 'Already have an account?',
            SIGN_IN: 'Sign in',

            // TERMS AND COPYRIGHT
            TERMS_AND_CONDITIONS: 'I agree to the',
            TERMS_AND_CONDITIONS_LINK: 'terms and conditions & privacy policy',
            COPYRIGHT: '2020 Spot',

            // ERROR MESSAGES
            TERMS_ERROR: 'You must agree to the terms and conditions & privacy policy',
            EMAIL_ERROR: 'Email is required',
            USERNAME_ERROR: 'Username is required',
            PASSWORD_ERROR: 'Password is required',
            PHONE_ERROR: 'Phone is required',

            EMAIL_INVALID: 'Email is invalid',
            PHONE_INVALID: 'Phone number is invalid',

            EMAIL_USED: 'Email is already in use',
            USERNAME_USED: 'Username is already in use',
            PHONE_USED: 'Phone is already in use'

        },

        REGISTER: {

            // SIGNUP FORM
            TITLE: 'Join Your Community',
            FACEBOOK_LOGIN: 'Continue with Facebook',
            GOOGLE_LOGIN: 'Sign In With Google',

            SIGN_UP_ALTERNATE: 'Or',

            SIGN_UP: 'Sign Up',

            EMAIL_PLACEHOLDER: 'Email',
            USERNAME_PLACEHOLDER: 'Username',
            PASSWORD_PLACEHOLDER: 'Password',
            PHONE_PLACEHOLDER: 'Phone Number',

            EXISTING_ACCOUNT: 'Already have an account?',
            SIGN_IN: 'Sign in',

            // TERMS AND COPYRIGHT
            TERMS_AND_CONDITIONS: 'I agree to the',
            TERMS_AND_CONDITIONS_LINK: 'terms and conditions & privacy policy',
            COPYRIGHT: '2020 Spot',

            // ERROR MESSAGES
            TERMS_ERROR: 'You must agree to the terms and conditions & privacy policy',

            EMAIL_ERROR: 'Email is required',
            EMAIL_INVALID: 'Email is invalid',

            USERNAME_ERROR: 'Username is required',
            USERNAME_INVALID_LENGTH: 'Username must be between %MIN% and %MAX% characters',
            USERNAME_INVALID_CHARACTERS: 'Username must be alpha-numeric with non-repeated .-\'',

            PASSWORD_ERROR: 'Password is required',
            PASSWORD_INVALID_LENGTH: 'Password must be between %MIN% and %MAX% characters',

            PHONE_ERROR: 'Phone is required',
            PHONE_INVALID: 'Phone number is invalid',

        },

        LOGIN: {

            // SIGNUP FROM
            TITLE: 'Login',
            FACEBOOK_LOGIN: 'Continue with Facebook',
            GOOGLE_LOGIN: 'Sign In With Google',

            FORGOT_PASSWORD: 'Forgot Password',
            SIGN_UP_ALTERNATE: 'Or',

            SIGN_IN: 'Sign In',

            NO_ACCOUNT: 'Don\'t have an account?',
            SIGN_UP: 'Sign Up',

            EMAIL_OR_USERNAME_PLACEHOLDER: 'Email or Username',
            PASSWORD_PLACEHOLDER: 'Password',

            // TERMS AND COPYRIGHT
            TERMS_AND_CONDITIONS: 'By joining, you agree to the terms and conditions',
            COPYRIGHT: '2020 Spot',

            // ERRORS
            EMAIL_OR_USER_ERROR: 'Email / Username is required',
            PASSWORD_ERROR: 'Password is required',
            RATE_LIMIT: 'Too many requests. Please try again in %TIMEOUT% minutes'

        },

        USERNAME: {

          HEADING: 'Create a username for your account',
          DESCRIPTION: '*Your username will not be visible to anyone. All posts are anonymous',

          TERMS_AND_CONDITIONS: 'I agree to the',
          TERMS_AND_CONDITIONS_LINK: 'terms and conditions & privacy policy',

          USERNAME_PLACEHOLDER: 'Enter username',
          CONTINUE: 'Continue to Spot',

          USERNAME_ERROR: 'Username is required',
          TERMS_ERROR: 'You must agree to the terms and conditions & privacy policy',

        },

        PASSWORD_RESET: {

          TITLE: 'Reset Your Passsword',
          DESCRIPTION: 'Please enter your email, you will be sent a verification code which you will need to enter to reset your password',

          EMAIL_PLACEHOLDER: 'Enter email',
          REQUEST_RESET: 'Request Reset',

          EMAIL_NONE: 'Email is required',
          EMAIL_FORMAT: 'Invalid email format',
          REQUEST_SUCCESS: 'An email for recovery has been sent if an account exists under this email',

          RATE_LIMIT: 'Too many requests. Please try again in %TIMEOUT% minutes'

        },

        NEW_PASSWORD: {

          TITLE: 'Change Your Password',
          DESCRIPTION: 'Please enter the token that was emailed to you',

          TOKEN_PLACEHOLDER: 'Enter token',
          VALIDATE: 'Validate',
          TOKEN_NONE: 'Token is required',
          INVALID_TOKEN: 'The token has expired or is invalid',

          PASSWORD_PLACEHOLDER: 'Enter password',
          CONFIRM_PLACEHOLDER: 'Re-enter password',
          RESET_PASSWORD: 'Reset Password',
          PASSWORD_NONE: 'Password is required',
          CONFIRM_NONE: 'Password confirmation is required',
          INVALID_MATCH: 'Passwords must match',

          NEW_PASSWORD_SUCCESS: 'Your password has been reset. Please login to continue',
          CONTINUE_TO_SPOT: 'Login',

          RATE_LIMIT: 'Too many requests. Please try again in %TIMEOUT% minutes'

        },

        AUTH_MODAL: {

          // Modal Strings
          TITLE: 'Login / Sign Up',
          LOGIN: 'Login',
          REGISTER: 'Sign Up',

          // Other options
          FACEBOOK_LOGIN: 'Continue with Facebook',
          GOOGLE_LOGIN: 'Sign In With Google',

          // Both Login and Register
          PASSWORD_PLACEHOLDER: 'Password',
          PASSWORD_ERROR: 'Password is required',

          // Login form
          FORGOT_PASSWORD: 'Forgot Password',

          EMAIL_OR_USERNAME_PLACEHOLDER: 'Email or Username',

          LOGIN_BUTTON: 'Login',

          // Login errors
          EMAIL_OR_USER_ERROR: 'Email/Username is required',

          // Register Form
          TERMS_AND_CONDITIONS: 'I agree to the',
          TERMS_AND_CONDITIONS_LINK: 'terms and conditions & privacy policy',
          REGISTER_BUTTON: 'Sign Up',

          EMAIL_PLACEHOLDER: 'Email',
          USERNAME_PLACEHOLDER: 'Username',
          PHONE_PLACEHOLDER: 'Phone Number',

          // ERROR MESSAGES
          EMAIL_ERROR: 'Email is required',
          USERNAME_ERROR: 'Username is required',
          PHONE_ERROR: 'Phone is required',

          EMAIL_INVALID: 'Email is invalid',
          PHONE_INVALID: 'Phone number is invalid',

          EMAIL_USED: 'Email is already in use',
          USERNAME_USED: 'Username is already in use',
          PHONE_USED: 'Phone is already in use',
          TERMS_ERROR: 'You must agree to the terms and conditions & privacy policy',

        }

    }

};
