"use strict";
const querystring_1 = require("querystring");
var Model;
(function (Model) {
    class Request {
        constructor(message) {
            this.pathFragments = [];
            this.query = {};
            this.request = {};
            this.rawBody = "";
            this.body = "";
            this.contentType = "";
            this.boundary = "";
            this.requestedURL = message.url || "";
            this.headers = message.headers;
            if (this.headers['content-type'] !== undefined) {
                this.contentType = this.headers['content-type'];
                if (this.contentType.match(/multipart\/form-data;/) !== null) {
                    let splitted_content_type = this.contentType.split("=");
                    if (splitted_content_type.length === 2) {
                        this.boundary = `--${splitted_content_type[1]}`;
                    }
                    else {
                    }
                    this.contentType = "multipart/form-data";
                }
            }
            let splitted_url = this.requestedURL.split("?");
            this.requestedPath = splitted_url[0];
            if (splitted_url[1] !== undefined) {
                this.query = querystring_1.parse(splitted_url[1]);
            }
            let path_fragments = this.requestedPath.split("/");
            path_fragments = path_fragments.filter((value) => {
                return value.length !== 0;
            });
            this.pathFragments = path_fragments;
        }
        getRawBody() {
            return this.rawBody;
        }
        async setRawBody(value) {
            this.rawBody = value;
            switch (this.getContentType()) {
                case "application/json":
                    try {
                        this.body = JSON.parse(this.rawBody);
                    }
                    catch (e) {
                    }
                    break;
                case "application/x-www-form-urlencoded":
                    this.request = querystring_1.parse(this.rawBody);
                    break;
                case "multipart/form-data":
                    let parts = this.rawBody.split(this.boundary);
                    let files = [];
                    parts.forEach(async (part, index) => {
                        if (index !== 0 && index < parts.length - 1) {
                            let name_matches = part.match(/name="([^"]+)";?\s+/i);
                            let name = "";
                            if (name_matches !== null) {
                                name = name_matches[1].trim();
                            }
                            let filename_matches = part.match(/filename="([^\n]+)";?\s+/i);
                            let filename = "";
                            if (filename_matches !== null) {
                                filename = filename_matches[1].trim();
                            }
                            let content_type_matches = part.match(/Content-Type: ([^\s]+)\s+/i);
                            let content_type = "";
                            if (content_type_matches !== null) {
                                content_type = content_type_matches[1].trim();
                            }
                            let splitted_part = part.split("\r\n\r\n");
                            if (filename === "") {
                                this.request[name] = splitted_part[1];
                            }
                            else {
                                files.push({
                                    name: filename,
                                    mimeType: content_type,
                                    content: splitted_part[1]
                                });
                            }
                        }
                    });
                    break;
                default:
                    this.body = this.rawBody;
                    break;
            }
        }
        getBody() {
            return this.body;
        }
        getBoundary() {
            return this.boundary;
        }
        getContentType() {
            return this.contentType;
        }
        getHeaders() {
            return this.headers;
        }
        getHeader(name) {
            name = name.toString();
            name = name.toLowerCase();
            let header = this.headers[name];
            if (header !== undefined) {
                return header;
            }
            return null;
        }
        getQuery() {
            return this.query;
        }
        setQuery(query) {
            this.query = query;
        }
        getRequestedPath() {
            return this.requestedPath;
        }
        getPathFragments() {
            return this.pathFragments;
        }
        getRequest() {
            return this.request;
        }
    }
    Model.Request = Request;
})(Model || (Model = {}));
module.exports = Model;
