// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is 
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl
{
    using Counters for Counters.Counter;

    Counters.Counter private _publicTokenIdTracker;
    Counters.Counter private _reservedTokenIdTracker;

    uint256 public constant MAX_PUBLIC = 4000;
    uint256 public constant MAX_RESERVED = 1000;
    uint256 public constant MAX_PER_PUBLIC_ADDRESS = 5;

    uint256 public temporaryMaxPublic;

    constructor(
        uint256 _temporaryMaxPublic,
        address[] memory _adminAddresses
    ) ERC721("MyNFT", "NFT") {
        require(_temporaryMaxPublic <= MAX_PUBLIC, "_temporaryMaxPublic cannot be greater than max public value");
        require(_adminAddresses.length > 0, "_adminAddresses length cannot be zero");

        temporaryMaxPublic = _temporaryMaxPublic;

        for (uint256 i = 0; i < _adminAddresses.length; i++) {
            require(_adminAddresses[i] != address(0), "admin cannot be zero address");
            _grantRole(DEFAULT_ADMIN_ROLE, _adminAddresses[i]);
        }
    }

    function mintReserved(uint256 numTokens) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(numTokens > 0, "numTokens cannot be zero");
        require(_reservedTokenIdTracker.current() + numTokens <= MAX_RESERVED, "number of tokens requested exceeds max reserved");

        for (uint256 i = 0; i < numTokens; i++) {
            _reservedTokenIdTracker.increment();
            _safeMint(msg.sender, _reservedTokenIdTracker.current() + MAX_PUBLIC);
        }
    }

    function mintPublic() public {
        require(balanceOf(msg.sender) < MAX_PER_PUBLIC_ADDRESS, "sender cannot mint any more tokens");
        require(_publicTokenIdTracker.current() < MAX_PUBLIC, "there are no more public tokens to mint");
        require(_publicTokenIdTracker.current() < temporaryMaxPublic, "there are currently no more public tokens to mint. check back later");
        
        _publicTokenIdTracker.increment();
        _safeMint(msg.sender, _publicTokenIdTracker.current());
    }

    function totalSupply() public view returns (uint256) {
        return _reservedTokenIdTracker.current() + _publicTokenIdTracker.current();
    }

    function setTemporaryMaxPublic(uint256 _temporaryMaxPublic) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_temporaryMaxPublic <= MAX_PUBLIC, "_temporaryMaxPublic cannot exceed max public value");
        temporaryMaxPublic = _temporaryMaxPublic;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721) returns (bool) {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}