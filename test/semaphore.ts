// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm, setup_generic_prover_and_verifier, create_proof, verify_proof } from '@noir-lang/barretenberg';
import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
import fs from "fs"
import { expect } from "chai";
import { generateCommitment } from '../packages/utils';
import Identity from '../packages/identity';
import { serialise_public_inputs } from '@noir-lang/aztec_backend';

async function compile2() {
    
      // I'm running on the server so I can use the file system
      initialiseResolver((id: any) => {
          try {
            const code = fs.readFileSync(`circuits/src/${id}`, { encoding: 'utf8' }) as string;
              return code
          } catch (err) {
              console.error(err);
              throw err;
          }
      });
      
      const compiled_noir = compile({
          entry_point: 'semaphore.nr',
      });
      const compiled = compiled_noir;
      
  
      return compiled;

};
  
// TODO: share serialisation functions accross files
// to specify the value of a single field we can set an array of len == 1 in the abi
function serialiseInputs(values: bigint[]): string[] {
  return values.map(v => {
    const hex = v.toString(16)
    const paddedHex = hex.length % 2 === 0 ? '0x' + hex : '0x0' + hex
    return '0x' + Buffer.from(serialise_public_inputs([paddedHex])).toString('hex')
  })
}


describe("Semaphore", function () {
  let wasm: BarretenbergWasm

  before(async () => {
    wasm = await BarretenbergWasm.new()
    await wasm.init()
  });
  

  it("Should verify proof using abi and acir from typescript", async function() {        
    // Compile noir program
    const compiled_program = await compile2(); 
    console.log("compiled",compiled_program)

    const acir = await acir_read_bytes(compiled_program.circuit);
    const abiCompiled = compiled_program.abi;


    const identity1 = new Identity(wasm, "message")


    const trapdoor1 = identity1.getTrapdoor();
    const nulifier1 = identity1.getNullifier();
    const external_nullifier1 = identity1.getCommitment()


    console.log('trapdoor1', trapdoor1)
    console.log('nulifier1', nulifier1)
    console.log('external_nullifier1',external_nullifier1)
    console.log("acir", acir)
    console.log("abi", abiCompiled)

    let [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    console.log("prover", prover)
    console.log("verifier", verifier)

    // Specify abi for semaphore circuit
    const abi = {
      id_nullifier: serialiseInputs([identity1.getNullifier()]),
      id_trapdoor: serialiseInputs([identity1.getTrapdoor()]),
      indices: 3,
      siblings: [
        1,
        1,
      ],
      external_nullifier: serialiseInputs([identity1.getCommitment()]),
    };

    // Specify abi for identity circuit
    const abi_identity = {
      id_nullifier: serialiseInputs([identity1.getNullifier()]),
      id_trapdoor: serialiseInputs([identity1.getTrapdoor()]),
      pub_commitment: serialiseInputs([identity1.getCommitment()]),
    };

    // Specify abi for random circuit
    const abi_test = {
      x: 1,
      y:2
    }

    //generate proof
    const proof = await create_proof(prover, acir, abi);
    console.log('proof', proof)

    const verified = await verify_proof(verifier, proof);
    console.log(verified);

    expect(verified).eq(true)
    
  });
});
