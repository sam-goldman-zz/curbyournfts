// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CurbYourNFT is 
    ERC721Burnable,
    AccessControl,
    Ownable
{
    using Counters for Counters.Counter;

    Counters.Counter private _publicTokenIdTracker;
    Counters.Counter private _reservedTokenIdTracker;

    mapping(address => uint256) private _mintedPublic;

    uint256 public constant MAX_PUBLIC = 40;
    uint256 public constant MAX_RESERVED = 10;
    uint256 public constant MAX_PER_PUBLIC_ADDRESS = 2;

    uint256 public temporaryMaxPublic;
    string public baseTokenURI;

    constructor(
        uint256 _temporaryMaxPublic,
        address[] memory _adminAddresses
    ) ERC721("CurbYourNFT", "CURB") {
        require(_temporaryMaxPublic <= MAX_PUBLIC, "_temporaryMaxPublic cannot be greater than max public value");
        require(_adminAddresses.length > 0, "_adminAddresses length cannot be zero");

        temporaryMaxPublic = _temporaryMaxPublic;

        for (uint256 i = 0; i < _adminAddresses.length; i++) {
            require(_adminAddresses[i] != address(0), "admin cannot be zero address");
            _grantRole(DEFAULT_ADMIN_ROLE, _adminAddresses[i]);
        }
    }

    function mintReserved(uint256 numReservedTokens) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(numReservedTokens > 0, "numReservedTokens cannot be zero");
        require(_reservedTokenIdTracker.current() + numReservedTokens <= MAX_RESERVED, "number of tokens requested exceeds max reserved");

        for (uint256 i = 0; i < numReservedTokens; i++) {
            _reservedTokenIdTracker.increment();
            _safeMint(msg.sender, _reservedTokenIdTracker.current() + MAX_PUBLIC);
        }
    }

    function mintPublic() external {
        require(_mintedPublic[msg.sender] < MAX_PER_PUBLIC_ADDRESS, "this address has reached its minting limit");
        require(_publicTokenIdTracker.current() < MAX_PUBLIC, "maximum number of public tokens have been minted");
        require(_publicTokenIdTracker.current() < temporaryMaxPublic, "there are currently no more public tokens to mint");
        
        _mintedPublic[msg.sender] += 1;

        _publicTokenIdTracker.increment();
        _safeMint(msg.sender, _publicTokenIdTracker.current());
    }

    function setTemporaryMaxPublic(uint256 _temporaryMaxPublic) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_temporaryMaxPublic <= MAX_PUBLIC, "cannot change temporary public value to exceed max value");
        temporaryMaxPublic = _temporaryMaxPublic;
    }

    function totalSupply() external view returns (uint256) {
        return _reservedTokenIdTracker.current() + _publicTokenIdTracker.current();
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseTokenURI(string memory _baseTokenURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        baseTokenURI = _baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}