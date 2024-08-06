import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Buffer } from "node:buffer";

if (globalThis.Buffer === undefined) {
  globalThis.Buffer = Buffer;
}

// you should use a private RPC here
// const connection = new Connection("https://api.mainnet-beta.solana.com");
const connection = new Connection(clusterApiUrl("devnet"));

const app = new Hono();

app.use(
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Accept-Encoding"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  })
);

app.get("/", (c) => {
  const baseHref = "https://cf-blitzblinks.amitmanojgaikwad.workers.dev/";
  const response: ActionGetResponse = {
    title: "Daily Chess Puzzles",
    description: "Solve this chess puzzle to earn rewards!",
    icon: `https://raw.githubusercontent.com/ameeetgaikwad/BlitzBlinks-images/main/1.png`,
    label: "BlitzBlinks",
    links: {
      actions: [
        {
          label: "Send 1 SOL", // button text
          href: `${baseHref}?q=1`,
        },
        {
          label: "Send 5 SOL", // button text
          href: `${baseHref}?q=1`,
        },
        {
          label: "Send 10 SOL", // button text
          href: `${baseHref}?q=3`,
        },
      ],
    },
  };

  return c.json(response);
});

app.post("/", async (c) => {
  const req = await c.req.json<ActionPostRequest>();

  const query = c.req.query('q')
console.log(query,'qqq')
  const transaction = await prepareTransaction(new PublicKey(req.account));

  const response: ActionPostResponse = {
    transaction: Buffer.from(transaction.serialize()).toString("base64"),
    message: `${query=='3'?'success':'fail'}`,
  };

  return c.json(response);
});

async function prepareTransaction(payer: PublicKey) {
  const transferIx = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: new PublicKey("8gE6Uq126VEgjqFJKMWaAMpta797UdqfaEP63yaTx2v9"),
    lamports: 10000000, // 0.1 sol
  });

  const blockhash = await connection
    .getLatestBlockhash({ commitment: "max" })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [transferIx],
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}

export default app;
