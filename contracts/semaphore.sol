//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import { TurboVerifier } from './plonk_vk.sol';

contract Semaphore {

  TurboVerifier verifier;

  constructor(address _verifier) {
    verifier = TurboVerifier(_verifier);
  }

  function verifyProof(
    bytes calldata proof
  ) public returns (bool) {

    return verifier.verify(proof);
  }
}
