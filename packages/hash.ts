// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm, SinglePedersen } from '@noir-lang/barretenberg';

/**
 * Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(wasm: BarretenbergWasm, message: string): bigint {
    const pedersen = new SinglePedersen(wasm)

    const messageBuffer = Buffer.from(message)
    const hash = pedersen.compressInputs([messageBuffer])
    return BigInt(`0x${hash.toString('hex')}`)
}
