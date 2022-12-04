const fs = require("fs");
const jose = require("jose");

const generate = async function() {
	const { publicKey, privateKey } = await jose.generateKeyPair('RS256')

	const privateJwk = await jose.exportJWK(privateKey)
	const publicJwk = await jose.exportJWK(publicKey)
	fs.writeFileSync("jwk_public", JSON.stringify(publicJwk));
	fs.writeFileSync("jwk_private", JSON.stringify(privateJwk));
}

generate();
