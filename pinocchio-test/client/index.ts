import {
  AccountRole,
  createSolanaRpc,
  generateKeyPairSigner,
  type KeyPairSigner,
  address,
  pipe,
  createTransactionMessage,
  signTransactionMessageWithSigners,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  getBase64EncodedWireTransaction,
  type SolanaRpcApiDevnet,
  type Rpc,
  lamports,
  addSignersToTransactionMessage,
  type Address,
  sendAndConfirmTransactionFactory,
  type IInstruction,
  createSolanaRpcSubscriptions,
  type RpcSubscriptions,
  getSignatureFromTransaction,
  type SolanaRpcSubscriptionsApi} from '@solana/web3.js';

import idl from './idl.json';

export class PinocchioTestClient {
  constructor(
    public readonly rpc: Rpc<SolanaRpcApiDevnet>,
    private readonly rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    private readonly programId: string
  ) { }

  static create(endpoint: string = 'http://localhost:8899'): PinocchioTestClient {
    const rpc = createSolanaRpc(endpoint);
    const rpcSubscriptions = createSolanaRpcSubscriptions(endpoint.replace("http", "ws"));
    return new PinocchioTestClient(rpc, rpcSubscriptions, idl.metadata.address);
  }

  async getAirdrop(publicKey: Address) {
    await this.rpc.requestAirdrop(publicKey, lamports(10000000n)).send();
  }

  async processInstruction(
    signer: KeyPairSigner
  ): Promise<string> {
    // Get latest blockhash
    const { value: { blockhash, lastValidBlockHeight } } =
      await this.rpc.getLatestBlockhash().send();

    // Create instruction
    const instruction: IInstruction = {
      programAddress: address(this.programId),
      accounts: [
        {
          address: signer.address,
          role: AccountRole.READONLY_SIGNER
        },
      ],
      data: Buffer.from([0]),
    };

    // Build transaction message
    const tx = await pipe(
      // Create base message
      createTransactionMessage({ version: 0 }),
      tx => setTransactionMessageFeePayer(signer.address, tx),
      tx => setTransactionMessageLifetimeUsingBlockhash(
        { blockhash, lastValidBlockHeight: BigInt(lastValidBlockHeight) },
        tx
      ),
      tx => appendTransactionMessageInstructions([instruction], tx),
      tx => addSignersToTransactionMessage([signer], tx),
      tx => signTransactionMessageWithSigners(tx)
    );

    const sig = getSignatureFromTransaction(tx);
    console.log("SIG: ", sig);

    // Send and confirm transaction
    await (sendAndConfirmTransactionFactory({
      rpc: this.rpc,
      rpcSubscriptions: this.rpcSubscriptions
    }))(tx, {
      commitment: 'confirmed',
      maxRetries: 3n,
    });

    return sig;
  }
}

// Example usage
async function main() {
  try {
    // Create client
    const client = PinocchioTestClient.create('http://127.0.0.1:8899');

    // Generate signer
    const signer = await generateKeyPairSigner();
    console.log(signer.address);
    await client.getAirdrop(signer.address);
    await Bun.sleep(3000)
    console.log((await client.rpc.getBalance(signer.address).send()).value);

    // Send transaction
    const signature = await client.processInstruction(signer);
    console.log('Transaction signature:', signature);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}