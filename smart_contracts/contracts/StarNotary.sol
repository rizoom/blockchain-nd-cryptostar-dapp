pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string starStory;
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(bytes32 => bool) public uniqueStars;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, string _starStory, string _ra, string _dec, string _mag, uint256 _tokenId) public {
        require(bytes(_name).length > 0, "Required star name.");
        require(bytes(_starStory).length > 0, "Required star story.");
        require(bytes(_ra).length > 0, "Required star ra.");
        require(bytes(_dec).length > 0, "Required star dec.");
        require(bytes(_mag).length > 0, "Required star mag.");
        require(!checkIfStarExists(_ra, _dec, _mag), "This star already exists.");

        // register star
        Star memory newStar = Star(_name, _starStory, _ra, _dec, _mag);
        tokenIdToStarInfo[_tokenId] = newStar;

        // handle uniquness
        bytes32 hash = keccak256(abi.encodePacked(_ra, _dec, _mag));
        uniqueStars[hash] = true;

        _mint(msg.sender, _tokenId);
    }

    function checkIfStarExists(string _ra, string _dec, string _mag) public view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(_ra, _dec, _mag));
        return uniqueStars[hash] == true;
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }
}