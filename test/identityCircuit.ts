import {
  setup_generic_prover_and_verifier,
  create_proof,
  verify_proof,
} from "@noir-lang/barretenberg";
import { compile } from "@noir-lang/noir_wasm";
import path from "path";
import { expect } from "chai";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import Identity from "../packages/identity";
import { pedersenFactory } from "../packages/hash";
import { type HashFunction } from "../types";

// TODO: share serialisation functions accross files
// to specify the value of a single field we can set an array of len == 1 in the abi
function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => {
    const hex = v.toString(16);
    const paddedHex = hex.length % 2 === 0 ? "0x" + hex : "0x0" + hex;
    return (
      "0x" + Buffer.from(serialise_public_inputs([paddedHex])).toString("hex")
    );
  });
}

describe("IdentityCircuit", function () {
  let pedersen: HashFunction;

  before(async () => {
    pedersen = await pedersenFactory();
  });

  it("identity calculation should be identical in TS and Noir", async function () {
    const compiledProgram = compile(
      path.resolve(__dirname, "../circuits/src/identity.nr")
    );
    const acir = compiledProgram.circuit;

    const identity = new Identity(pedersen);

    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()]),
      id_trapdoor: serialiseInputs([identity.getTrapdoor()]),
      pub_commitment: serialiseInputs([identity.getCommitment()]),
    };

    console.log({ abi });

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    const proof = await create_proof(prover, acir, abi);

    const verified = await verify_proof(verifier, proof);

    console.log(verified);

    expect(verified).eq(true);
  });

  it("the proof can't be generated if one of the secrets is wrong", async function () {
    const compiledProgram = compile(
      path.resolve(__dirname, "../circuits/src/identity.nr")
    );
    const acir = compiledProgram.circuit;

    const identity = new Identity(pedersen);

    const abi = {
      id_nullifier: "0x00",
      id_trapdoor: serialiseInputs([identity.getTrapdoor()]),
      pub_commitment: serialiseInputs([identity.getCommitment()]),
    };

    console.log(abi);

    const [prover] = await setup_generic_prover_and_verifier(acir);

    try {
      await create_proof(prover, acir, abi);
      expect("the proof should not be created").to.equal(false);
    } catch (e) {}
  });

  it("the proof can't be generated if the commitment is wrong", async function () {
    const compiledProgram = compile(
      path.resolve(__dirname, "../circuits/src/identity.nr")
    );
    const acir = compiledProgram.circuit;

    const identity = new Identity(pedersen);

    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()]),
      id_trapdoor: serialiseInputs([identity.getTrapdoor()]),
      pub_commitment: "0x00",
    };

    console.log(abi);

    const [prover] = await setup_generic_prover_and_verifier(acir);

    try {
      await create_proof(prover, acir, abi);
      expect("the proof should not be created").to.equal(false);
    } catch (e) {}
  });
});
