// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BytecodeDeployer {
    event Deployed(address addr);

    function deploy(bytes memory bytecode) external returns (address addr) {
        assembly {
            addr := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        require(addr != address(0), "Deploy failed");
        emit Deployed(addr);
    }
}
