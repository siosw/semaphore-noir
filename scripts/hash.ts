import { BarretenbergWasm } from '@noir-lang/barretenberg/dest/wasm';
import { SinglePedersen } from '@noir-lang/barretenberg/dest/crypto/pedersen';
import { serialise_public_inputs } from '@noir-lang/aztec_backend';

function serialiseInputs(values: number[]) {
    return values.map(v => {
      const hex = v.toString(16);
      const paddedHex = hex.length % 2 === 0 ? '0x' + hex : '0x0' + hex;
      return Buffer.from(serialise_public_inputs([paddedHex]));
    });
}

async function main() {
  const barretenberg = await BarretenbergWasm.new();
  await barretenberg.init();
  const pedersen = new SinglePedersen(barretenberg);

  const input = Number(process.argv[2]);
  // a pedersen hash is a point (a,b)
  // compressInputs returns only a, 
  // this is important to keep in mind when comparing hashes in the circuit
  const hash = pedersen.compressInputs(serialiseInputs([input]));

  console.log(`input:\t${input}\nhash:\t${hash.toString('hex')}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
