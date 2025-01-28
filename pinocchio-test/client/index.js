import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import idl from './idl.json';

export class PinocchioTestClient {
  constructor(connection, programId) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }

  async processInstruction(payer) {
    const ix = {
      programId: this.programId,
      keys: [],
      data: Buffer.from([0]), // discriminant
    };

    const tx = new Transaction().add(ix);
    const signature = await this.connection.sendTransaction(tx, [payer]);
    return signature;
  }
}

// Example usage:
const connection = new Connection('http://localhost:8899', 'confirmed');
const programId = new PublicKey('H6q6F2Zrv7aGua88DY7fCJ9GgqNCPh7KbPRZfRc6CTXX');
const client = new PinocchioTestClient(connection, programId);
const wallet = generateKeypair();

const signature = await client.processInstruction(wallet.payer);
