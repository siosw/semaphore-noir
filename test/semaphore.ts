// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {
  setup_generic_prover_and_verifier,
  create_proof,
  verify_proof,
} from "@noir-lang/barretenberg";
import { compile } from "@noir-lang/noir_wasm";
import path from "path";
import { expect } from "chai";

describe("Semaphore", function () {
  it("Should verify proof using abi and acir from typescript", async function () {
    // Compile noir program
    const compiledProgram = compile(
      path.resolve(__dirname, "../circuits/src/main.nr")
    );
    const acir = compiledProgram.circuit;
    const abiCompiled = compiledProgram.abi;

    console.log({ abiCompiled });

    // Specify abi
    const abi = {
      id_nullifier: 1,
      id_trapdoor: 1,
      indices: 3,
      siblings: [1, 1],
      external_nullifier: 123,
    };

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    const proof = await create_proof(prover, acir, abi);

    const verified = await verify_proof(verifier, proof);

    console.log(verified);

    expect(verified).eq(true);
  });
});
