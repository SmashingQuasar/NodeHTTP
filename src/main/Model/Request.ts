import { IncomingMessage, IncomingHttpHeaders } from "http";
// import { Socket } from "net";
import { parse as parseQuery, ParsedUrlQuery } from "querystring";

module Model
{
    export class Request
    {
        private requestedURL: string;
        private requestedPath: string;
        private pathFragments: Array<string> = [];
        private query: ParsedUrlQuery = {};
        private request: ParsedUrlQuery = {};
        private rawBody: string = "";
        private body: object|string = "";
        private headers: IncomingHttpHeaders;
        private contentType: string = "";
        private boundary: string = "";

        /**
         * constructor
         */
        public constructor(message: IncomingMessage)
        {
            this.requestedURL = message.url || "";
            this.headers = message.headers;

            if (this.headers['content-type'] !== undefined)
            {
                this.contentType = this.headers['content-type'];

                if (this.contentType.match(/multipart\/form-data;/) !== null)
                {
                    let splitted_content_type: Array<string> = this.contentType.split("=");
                    
                    if (splitted_content_type.length === 2)
                    {

                        this.boundary = `--${splitted_content_type[1]}`;
                    }
                    else
                    {
                        //TODO Log the error of received header
                    }
                    this.contentType = "multipart/form-data";
                }
            }

            let splitted_url: Array<string> = this.requestedURL.split("?");
            this.requestedPath = splitted_url[0];

            if (splitted_url[1] !== undefined)
            {
                this.query = parseQuery(splitted_url[1]);
            }

            let path_fragments: Array<string> = this.requestedPath.split("/");
            path_fragments = path_fragments.filter(
                (value: string): boolean => {
                    return value.length !== 0;
                }
            );

            this.pathFragments = path_fragments;
        }

        /**
         * getRawBody
         */
        public getRawBody(): string
        {
            return this.rawBody;
        }

        /**
         * setRawBody
         */
        public async setRawBody(value: string): Promise<void>
        {
            this.rawBody = value;

            switch (this.getContentType())
            {
                case "application/json":

                    try
                    {
                        this.body = JSON.parse(this.rawBody);
                    }
                    catch (e)
                    {
                        //TODO: Add error log here
                    }

                break;

                case "application/x-www-form-urlencoded":

                    this.request = parseQuery(this.rawBody);

                break;

                case "multipart/form-data":

                    let parts: Array<string> = this.rawBody.split(this.boundary);
                    
                    let files: Array<RequestFile> = [];

                    parts.forEach(
                        async (part: string, index: number): Promise<void> => {
                            if (index !== 0 && index < parts.length - 1)
                            {
                                // let content_disposition_matches: RegExpMatchArray|null = part.match(/Content-Disposition: ([^;]+);\s+/i);
                                // let content_disposition: string = "";

                                // if (content_disposition_matches !== null)
                                // {
                                //     content_disposition = content_disposition_matches[1].trim();
                                // }

                                let name_matches: RegExpMatchArray|null = part.match(/name="([^"]+)";?\s+/i);
                                let name: string = "";

                                if (name_matches !== null)
                                {
                                    name = name_matches[1].trim();
                                }

                                let filename_matches: RegExpMatchArray|null = part.match(/filename="([^\n]+)";?\s+/i);
                                let filename: string = "";

                                if (filename_matches !== null)
                                {
                                    filename = filename_matches[1].trim();
                                }

                                let content_type_matches: RegExpMatchArray|null = part.match(/Content-Type: ([^\s]+)\s+/i);
                                let content_type: string = "";

                                if (content_type_matches !== null)
                                {
                                    content_type = content_type_matches[1].trim();
                                }

                                let splitted_part: Array<string> = part.split("\r\n\r\n"); // Splitting on double Carriage Return + Line Feed is the distinctive point between preamble and content.

                                if (filename === "")
                                {
                                    this.request[name] = splitted_part[1];
                                }
                                else
                                {
                                    files.push(
                                        {
                                            name: filename,
                                            mimeType: content_type,
                                            content: splitted_part[1]
                                        }
                                    );
                                }

                            }
                        }
                    );

                break;

                default:

                    this.body = this.rawBody;

                break;
            }


        }

        /**
         * getBody
         */
        public getBody(): object|string
        {
            return this.body;
        }

        /**
         * getBoundary
         */
        public getBoundary(): string
        {
            return this.boundary;    
        }

        /**
         * getContentType
         */
        public getContentType(): string
        {
            return this.contentType;
        }

        /**
         * getHeaders
         */
        public getHeaders(): IncomingHttpHeaders
        {
            return this.headers;    
        }

        /**
         * getHeader
         */
        public getHeader(name: keyof IncomingHttpHeaders): string|string[]|null
        {
            name = name.toString();
            name = name.toLowerCase();

            let header: string|string[]|undefined = this.headers[name];

            if (header !== undefined)
            {
                return header;
            }

            return null;
        }

        /**
         * getQuery
         */
        public getQuery(): ParsedUrlQuery
        {
            return this.query;
        }

        /**
         * setQuery
         */
        public setQuery(query: ParsedUrlQuery): void
        {
            this.query = query;    
        }

        /**
         * getRequestedPath
         */
        public getRequestedPath(): string
        {
            return this.requestedPath;
        }

        /**
         * getPathFragments
         */
        public getPathFragments(): Array<string>
        {
            return this.pathFragments;
        }

        /**
         * getRequest
         */
        public getRequest(): ParsedUrlQuery
        {
            return this.request;    
        }
    }
}

export = Model;