import { Kernel } from "./System/Kernel.js";

const KERNEL: Kernel = await Kernel.Create();

await KERNEL.start();

/*
const KEY: Buffer = await Reader.readFile(`${System.RootDirectory}/build/resources/privateKey.key`);
const CERT: Buffer = await Reader.readFile(`${System.RootDirectory}/build/resources/certificate.crt`);

const OPTIONS = {
	key: KEY,
	cert: CERT
};
const SERVER: Server = new Server(OPTIONS, undefined);

SERVER.addListener(
	"request",
	async (message: IncomingMessage, response: ServerResponse): Promise<void> =>
	{
		await SERVER.handleRequest(message, response);
	}
);
await SERVER.start();
*/
