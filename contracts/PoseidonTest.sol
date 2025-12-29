//SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

interface IPoseidonT2 {
    function poseidon(uint256[2] calldata input) external pure returns (uint256);
}

contract PoseidonTest {
    IPoseidonT2 public immutable poseidon;

    constructor(address _poseidon_address) {
        poseidon = IPoseidonT2(_poseidon_address);
    }

    function poseidon_hash(uint256 a, uint256 b) public view returns (uint256) {
        uint256 res = poseidon.poseidon([a, b]);

        return res;
    }
}


//12583541437132735734108669866114103169564651237895298778035846191048104863326
//12583541437132735734108669866114103169564651237895298778035846191048104863326