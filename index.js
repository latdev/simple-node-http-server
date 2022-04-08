const http = require("http");


function applyResponse(response, statusCode, type, payload) {
	response.statusCode = statusCode;
	response.setHeader("Content-Type", "application/json; charset=UTF-8");
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "GET, POST");
	response.end(JSON.stringify({
		"type": type,
		"payload": payload
	}));
	return void 0;
}


const router = {
	"get": {
		"time": function(request, response) {
			applyResponse(response, 200, "RES_TIME", (new Date()).toISOString());
		},
		"subroute/test": function(request, response) {
			applyResponse(response, 200, "RES_SUBROUTE", "Test passed");
		},
	},
	"post": {
		"test": function(request, response) {
			applyResponse(response, 200, "RES_TEST", request.body);
		}
	},
	"system": {
		"error400": function(response) {
			applyResponse(response, 400, "RES_ERROR", "Error: 400 Bad Request");
		},
		"error404": function(response) {
			applyResponse(response, 404, "RES_ERROR", "Error: 404 Not Found");
		},
		"error405": function(response) {
			applyResponse(response, 405, "RES_ERROR", "Error: 405 Method Not Allowed");
		}
	}
}


function uploadHandler(request, response, next) {
	const buffer = [];
	request.on("data", function(chunk) {
		buffer.push(chunk);
	});
	request.on("end", function() {
		const body = Buffer.concat(buffer).toString();
		try {
			request.body = JSON.parse(body);
			next(request, response);
		} catch (error) {
			router.system.error400(response);
		}
	});
}


function requestHandler(request, response) {
	const document = request.url.substr(1);
	if (request.method === "GET") {
		if (typeof(router.get[document]) === "undefined") {
			return router.system.error404(response);
		}
		router.get[document](request, response);
	}
	else if (request.method === "POST") {
		if (typeof(router.post[document]) === "undefined") {
			return router.system.error404(response);
		}
		uploadHandler(request, response, router.post[document]);
	} else {
		return router.system.error405(response);
	}
}


const server = http.createServer(requestHandler);
server.listen(8080);
