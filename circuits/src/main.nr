// use dep::std;

global LEVELS: Field = 3;


#[foreign(pedersen)]
fn pedersen<N>(_input : [Field; N]) -> [Field; 2] {}

fn modulo(_a: u32, _b: u32) -> u1 {
  (_a - (_a / (_b * _b))) as u1
}

// #[builtin(to_le_bits)]
// fn to_le_bits(_x : Field, _bit_size: u32) -> [u1] {}

// native Noir implementation of to_le_bits
// when compiling from TS the builtin causes the proof generation to fail.
fn to_le_bits(_x : Field) -> [u1; LEVELS] {
  let mut remainder = _x as u32;
  let z: u1 = 0;
  let mut bits: [u1; LEVELS] = [z, z, z];
  for i in 0..LEVELS {
    bits[i] = modulo(remainder, 2);
    remainder = remainder / 2;
  }

  bits
}


// Returns the root of the tree from the provided leaf and its hashpath, using pedersen hash
fn compute_root_from_leaf(leaf : Field, index : Field, hash_path: [Field]) -> Field {
    let n = LEVELS;
    let index_bits = to_le_bits(index);
    let mut current = leaf;

    for i in 0..n {
      let mut path_bit = index_bits[i] as bool;

      let (hash_left, hash_right) = if path_bit {
        (hash_path[i], current)
      } else {
        (current, hash_path[i])
      };

      current = pedersen([hash_left, hash_right])[0];
    };
    current
}

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  siblings: [Field; LEVELS],
  indices: Field,
  external_nullifier: Field,
  root: pub Field,
  nullifier_hash: pub Field,
  signal_hash: pub Field
) {
  // reconstruct the commitment from the private nullfiers
  let secret = pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = pedersen([secret[0]]);

  // compute the root of the merkle tree given the provided merkle merkle path
  // and the reconstructed id commitment
  // this can later be verified against a trusted root onchain or offchain
  constrain root == compute_root_from_leaf(id_commitment[0], indices, siblings);

  // the nullifier hash allows us to check how often a given identity signaled per topic
  // every topic should use a distinct external nullifier
  constrain nullifier_hash == pedersen([external_nullifier, id_nullifier])[0];
  
  // dummy operation to prevent signal hash tampering.
  let mut signal_square = signal_hash;
  signal_square = signal_square * signal_hash;

  // [
  //   root, 
  //   compute_root_from_leaf(id_commitment[0], indices, siblings), 
  //   nullifier_hash, 
  //   pedersen([external_nullifier, id_nullifier])[0]
  // ]
}
