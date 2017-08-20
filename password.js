'use strict';
const logger = require('./Workflow/Logger.js');
const argon2 = require('argon2');
const randomNumber = require('random-number-csprng');
// increase defaults for more security
const options = {
    hashLength: 64,
    timeCost: 4,
    memoryCost: 14,
    parallelism: 2
};

// hash password
const hash = async (plain) => {
    return await argon2.hash(plain, await argon2.generateSalt(64), options);
};

// verify password against hash
const verify = async (hash, plain) => {
    try {
        return await argon2.verify(hash, plain);
    } catch (err) {
        logger.log('error', err);
    }
};

// create random password
const generate = async () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890!@#$%&';
    let password = '';
    for (var x = 0; x < 16; x++) {
        let i = await randomNumber(0, chars.length);
        password += chars.charAt(i);
    }

    return password;
};

module.exports = { hash, verify, generate };
