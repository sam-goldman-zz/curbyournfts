// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is 
    ERC721,
    ERC721URIStorage,
    AccessControl 
{
    mapping(address => uint256) private _mintedList;
    mapping(address => bool) private _reserveWhitelist;

    uint256 public immutable MAX_PER_ADDRESS;
    uint256 public immutable MAX_PUBLIC;
    uint256 public immutable MAX_RESERVED;

    uint256 public totalReservedSupply;
    uint256 public totalPublicSupply;
    uint256 public temporaryPublicMax;

    bytes32 public constant MINTER_ROLE = keccak256("ADMIN_ROLE");

    // TODO: constructor should have list of add

    // constructor(uint256 maxPublic, uint256 maxReserved, uint256 startingReservedID, uint256 maxPerAddress, address[] memory whitelistAddresses) ERC721("Tunes", "TUNE") {
    //     MAX_PUBLIC = maxPublic;
    //     MAX_RESERVED = maxReserved;
    //     STARTING_RESERVED_ID = startingReservedID;
    //     MAX_PER_ADDRESS = maxPerAddress;

    //     for (uint256 i = 0; i < whitelistAddresses.length; i++) {
    //         require(whitelistAddresses[i] != address(0), "Can't add the null address");
    //         _reserveWhitelist[whitelistAddresses[i]] = true;
    //     }
    // }

    function totalSupply() public view returns (uint256) {
        return totalReservedSupply + totalPublicSupply;
    }

    function setTemporaryPublicMax(uint256 _temporaryPublicMax) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_temporaryPublicMax <= MAX_PUBLIC, "You cannot set the temporary max above the absolute total.");
        temporaryPublicMax = _temporaryPublicMax;
    }
}