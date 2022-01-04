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
    uint256 public immutable maxPublic;
    uint256 public immutable maxReserved;
    uint256 public immutable startingReservedId;
    uint256 public immutable maxPerAddress;

    mapping(address => uint256) private _mintedList;

    uint256 public totalReservedSupply;
    uint256 public totalPublicSupply;
    uint256 public temporaryPublicMax;

    bytes32 public constant MINTER_ROLE = keccak256("ADMIN_ROLE");

    constructor(
        uint256 _maxPublic,
        uint256 _maxReserved,
        uint256 _startingReservedId,
        uint256 _maxPerAddress,
        address[] memory _adminAddresses
    ) ERC721("MyNFT", "NFT") {
        maxPublic = _maxPublic;
        maxReserved = _maxReserved;
        startingReservedId = _startingReservedId;
        maxPerAddress = _maxPerAddress;

        for(uint256 i = 0; i < _adminAddresses.length; i++) {
            require(_adminAddresses[i] != address(0), "Can't add the null address");
            _setupRole(DEFAULT_ADMIN_ROLE, _adminAddresses[i]);
        }
    }

    function totalSupply() public view returns (uint256) {
        return totalReservedSupply + totalPublicSupply;
    }

    function setTemporaryPublicMax(uint256 _temporaryPublicMax) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_temporaryPublicMax <= maxPublic, "You cannot set the temporary max above the absolute total.");
        temporaryPublicMax = _temporaryPublicMax;
    }

    function mintReserved(uint256[] calldata tokenIds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(totalReservedSupply + tokenIds.length <= maxReserved, "This would exceed the total number of reserved NFTs.");

        for(uint256 i = 0; i < tokenIds.length; i++) {
          uint256 tokenId = tokenIds[i];
          require(tokenId >= startingReservedId && tokenId < startingReservedId + maxReserved, "Token ID is not in the reserve range.");

          totalReservedSupply += 1;

          _safeMint(msg.sender, tokenId);
        }
    }

    // TODO: change _mintedList to Counter
    function mintPublic() public {
        require(_mintedList[msg.sender] < maxPerAddress, "You have reached your minting limit.");
        require(totalPublicSupply < maxPublic, "There are no more NFTs for public minting.");
        require(totalPublicSupply < temporaryPublicMax, "There are no more NFTs for public minting at this time.");
        
        _mintedList[msg.sender] += 1;
        
        uint256 tokenId = totalPublicSupply + 1;
        
        // Skip the reserved block
        if (tokenId >= startingReservedId) {
            tokenId += maxReserved;
        }
        
        totalPublicSupply += 1;
        _safeMint(msg.sender, tokenId);
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