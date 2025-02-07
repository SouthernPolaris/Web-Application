

function getGoogleOAuthURL() {

    const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = {

        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT,
        clientID: process.env.GOOGLE_CLIENT_OAUTH,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(" ")

    };

    const queryString = new URLSearchParams(options);

    return `${rootURL}?${queryString.toString()}`;

}