use dep::std;

global LEVELS: Field = 2;

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  siblings: [Field; LEVELS],
  indices: Field,
  external_nullifier: Field,
  // debug: pub Field
) -> pub [Field; 2] {
  // reconstruct the commitment from the private nullfiers
  let secret = std::hash::pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = std::hash::pedersen([secret[0]]);

  // compute the root of the merkle tree given the provided merkle merkle path
  // and the reconstructed id commitment
  // this can later be verified against a trusted root onchain or offchain
   let root = std::merkle::compute_root_from_leaf(id_commitment[0], indices, siblings); 
  //let root = id_commitment[0] * indices * siblings[0];

  // the nullifier hash allows us to check how often a given identity signaled per topic
  // every topic should use a distinct external nullifier
  let nullifier_hash = std::hash::pedersen([external_nullifier, id_nullifier]);

  [root, nullifier_hash[0]]
}
