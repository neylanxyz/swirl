// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


/**
* Mock verifier for local testing
* Always returns true
* DO NOT USE IN PRODUCTION
*/
contract MockVerifier {
    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external pure returns (bool) {
        return true;
    }
}