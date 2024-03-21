//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC720 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address payable public seller;
    address public inspector;
    address public nftAddress;

    //mapping
    mapping(uint256 => bool) public islisted;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;

    //modifiers
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }
    modifier onlyBuyer(uint256 _nftID) {
        require(
            msg.sender == buyer[_nftID],
            "only Buyer can call this method "
        );
        _;
    }
    modifier onlyInspector(){
        require(msg.sender==inspector,"only inspector can call this method");
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        IERC720(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        islisted[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }
    function depositEther(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }
    //receiving th ether
    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    function updateInspectionStatus(uint256 _nftID,bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }
}
