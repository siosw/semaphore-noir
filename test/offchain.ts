import {
  setup_generic_prover_and_verifier,
  create_proof,
  verify_proof,
} from "@noir-lang/barretenberg";
import { compile } from "@noir-lang/noir_wasm";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import path from "path";
import { expect } from "chai";
import Identity from "../packages/identity";
import hash, { pedersenFactory } from "../packages/hash";
import { type HashFunction } from "../types";
import Group from "../packages/group";
//
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

describe("Offchain Proof generation", function () {
  let pedersen: HashFunction;

  before(async () => {
    pedersen = await pedersenFactory();
  });

  it("Should verify proof using abi and acir from typescript", async function () {
    const compiledProgram = compile(
      path.resolve(__dirname, "../circuits/src/main.nr")
    );
    const acir = compiledProgram.circuit;

    const identity = new Identity(pedersen, "message");
    const group = new Group(pedersen, 1, 3);

    group.addMember(identity.getCommitment());
    const merkleProof = group.generateMerkleProof(group.indexOf(identity.getCommitment()));

    console.log({ merkleProof })
    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(''), 2))

    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()]),
      id_trapdoor: serialiseInputs([identity.getTrapdoor()]),
      indices: serialiseInputs([indices]),
      siblings: serialiseInputs(merkleProof.siblings),
      external_nullifier: serialiseInputs([1n]),
      root: serialiseInputs([merkleProof.root]),
      nullifier_hash: serialiseInputs([pedersen([1n, identity.getNullifier()])])
    };

    console.log({ abi })

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    const proof = await create_proof(prover, acir, abi);

    const verified = await verify_proof(verifier, proof);

    console.log(verified);

    expect(verified).eq(true);
  });
});
