'use strict';
const argon2 = require('argon2');

// increase defaults for more security
const options = {
	hashLength: 64,
	timeCost: 4,
	memoryCost: 14,
	parallelism: 2
}

// hash password
const hash = async (plain) => {
	return await argon2.hash(plain, await argon2.generateSalt(64), options);
}

// verify password against hash
const verify = async (hash, plain) => {
	try {
		return await argon2.verify(hash, plain);
	} catch (err) {
		console.log(err);
	}
}

module.exports = { hash, verify }
