export { generateSalt, hashPassword, validatePassword, generateToken, getFacebookDetails}

const { randomBytes, pbkdf2Sync } = require('crypto');
const jwt = require('jsonwebtoken');
const request = require('request');

const secret = require('../../../../secret.json');

function generateSalt(): string {
    return randomBytes(128).toString('hex');
}

function hashPassword(password: string, salt: string): string {
    const iterations = 10000;
    const hashLength = 512;
    const digest = 'sha512';
    return pbkdf2Sync(password, salt, iterations, hashLength, digest).toString('hex');
}

function validatePassword(user: any, password: string): boolean {
    if (user === undefined) return false;
    const hashedPassword = hashPassword(password, user.salt);
    return hashedPassword === user.pass;
}

function generateToken(user: any): any {
    return jwt.sign({ id: user }, secret.secret);
}

function getFacebookDetails(accessToken: String): Promise<any> {
    
    const url = "https://graph.facebook.com/me?fields=id,email&access_token=" + accessToken;

    return new Promise((resolve, reject) => {
        request(url, function (error: any, response: any, body: any) {
            if (error) {
                return reject(error);
            }
            resolve({response: response, body: JSON.parse(body)});
          });
    })
}
