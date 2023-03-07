// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm, SinglePedersen } from '@noir-lang/barretenberg';
import Identity from "../packages/identity"

/**
 * Creates a pedersen hash of a message.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
function hash(wasm: BarretenbergWasm, message: string): bigint {
    const pedersen = new SinglePedersen(wasm)

    const messageBuffer = Buffer.from(message)
    const hash = pedersen.compressInputs([messageBuffer])
    console.log({ message, hash: hash.toString('hex') })
    return BigInt(`0x${hash.toString('hex')}`)
}

async function main() {
  
  const barretenberg = await BarretenbergWasm.new();
  await barretenberg.init();

  const a = new Identity(barretenberg, 'message')
  const b = new Identity(barretenberg, 'message')

  console.log({ a: a.getTrapdoor(), b: b.getTrapdoor() })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
