// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    uint256 public temporaryPublicMax;

    bytes32 public constant MINTER_ROLE = keccak256("ADMIN_ROLE");

    constructor(
        string memory name,
        string memory symbol,
        uint256 _temporaryPublicMax,
        address[] memory _adminAddresses
    ) ERC721(name, symbol) {
        temporaryPublicMax = _temporaryPublicMax;

        for(uint256 i = 0; i < _adminAddresses.length; i++) {
            require(_adminAddresses[i] != address(0), "Can't add the null address");
            _setupRole(DEFAULT_ADMIN_ROLE, _adminAddresses[i]);
        }
    }

    function totalSupply() public view returns (uint256) {
        return _reservedTokenIdTracker.current() + _publicTokenIdTracker.current();
    }

    function setTemporaryPublicMax(uint256 _temporaryPublicMax) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_temporaryPublicMax <= MAX_PUBLIC, "You cannot set the temporary max above the absolute total.");
        temporaryPublicMax = _temporaryPublicMax;
    }

    function mintReserved(uint256 numTokens) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_reservedTokenIdTracker.current() + numTokens <= MAX_RESERVED, "This would exceed the total number of reserved NFTs.");

        for (uint256 i = 0; i < numTokens; i++) {
            _reservedTokenIdTracker.increment();
            _safeMint(msg.sender, _reservedTokenIdTracker.current() + MAX_PUBLIC);
        }
    }

    function mintPublic() public {
        require(balanceOf(msg.sender) < MAX_PER_PUBLIC_ADDRESS, "You have reached your minting limit.");
        require(_publicTokenIdTracker.current() < MAX_PUBLIC, "There are no more NFTs for public minting.");
        require(_publicTokenIdTracker.current() < temporaryPublicMax, "There are no more NFTs for public minting at this time.");
        
        _publicTokenIdTracker.increment();
        _safeMint(msg.sender, _publicTokenIdTracker.current());
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