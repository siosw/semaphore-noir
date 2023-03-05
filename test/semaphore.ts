// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { setup_generic_prover_and_verifier, create_proof, verify_proof } from '@noir-lang/barretenberg';
import { compile } from '@noir-lang/noir_wasm';
import { serialise_public_inputs } from '@noir-lang/aztec_backend';
import path from 'path';
import { expect } from "chai";

describe("Semaphore", function () {
  let compiledProgram: any;
  let acir: any;

  before(async function() {
    compiledProgram = compile(path.resolve(__dirname, '../circuits/src/main.nr')); 
    acir = compiledProgram.circuit;
  });

  it("should generate and verify a valid proof", async function() {        
    const abi = {
      id_nullifier: 1,
      id_trapdoor: 1,
      indices: 1,
      siblings: [
        1,
        1,
      ],
      external_nullifier: 1,
      root: '0x' + Buffer.from(serialise_public_inputs(["0x01c32868af90e564102adc9e4138599c46e1ea926ff493291e17ee1d7fc70ab8"])).toString('hex'),
      nullifier_hash: '0x' + Buffer.from(serialise_public_inputs(["0x168e45d46c4afdae077fff6d498b7c374d45585fa7201308650986dc230ed974"])).toString('hex'),
    };

    console.log(abi);

    let [prover, verifier] = await setup_generic_prover_and_verifier(acir);
    const proof = await create_proof(prover, acir, abi);
    const verified = await verify_proof(verifier, proof);

    expect(verified).eq(true)
  });
});
