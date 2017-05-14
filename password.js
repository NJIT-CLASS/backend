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

// create random password
const generate = () => {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP1234567890!@#$%&';
	let password = '';
	for (var x = 0; x < 16; x++) {
		let i = Math.floor(Math.random() * chars.length);
		password += chars.charAt(i);
	}
	return password;
}

module.exports = { hash, verify, generate }
