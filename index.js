const express = require("express");
const dotenv = require("dotenv");
const { Provider } = require("oidc-provider");
const customMemoryAdapter = require("./oidc-provider-src/custom-memory-adapter");

dotenv.config();
const app = express();

const port = process.env.SERVER_LISTEN_PORT;

const oidc = new Provider(process.env.ISSUER_BASE_URL, {
	cookies: {
		keys: [process.env.COOKIE_KEY]
	},
	renderError: (ctx, out, error) => {
		ctx.type = 'json';
		const body = {
			out,
			error
		};
		ctx.body = JSON.stringify(body, null, 4);
	},
	pkce: {
		required: () => false
	},
	adapter: customMemoryAdapter,
	jwks: {
		keys: [JSON.parse(process.env.JWK)]
	}

});

app.use((req, res, next) => {
	res.append('Pragma', "no-cache");
	res.append('Cache-Control', ['no-cache', 'no-store']);
	next();
});

// Homepage public access
app.get("/", (req, res) => {
	res.send("Homepage");
});

// Load authorization server middleware
app.use(oidc.callback());

oidc.on("authorization.error", (ctx, error) => {
	console.error("Authorisation error", { ctx, error });
});

oidc.on("grant.error", (ctx, error) => {
	console.error("Grant token error", { ctx, error });
});

app.use((error, request, response, next) => {
	console.error({ error, request });
	response.send(`Express error: <pre>${JSON.stringify(error, null, 2)}</pre>`);
});

app.listen(port, () => {
	console.log(`Server started in port: ${port}`);
});

