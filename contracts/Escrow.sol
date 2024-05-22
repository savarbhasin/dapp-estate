//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from,address _to,uint256 _id) external;
}

contract Escrow {

    address payable public seller;
    address public lender;
    address public inspector;
    address public nftAddress;

    mapping (uint => bool) public isListed;
    mapping(uint => uint) public purchasePrice;
    mapping (uint => address) public buyer;
    mapping(uint=>uint) public escrowAmount;
    mapping(uint=>bool) public inspectionPassed;
    mapping(uint=>mapping(address=>bool)) approval;

    constructor(address _nftAddress, address payable _seller, address _inspector, address _lender){
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    modifier onlySeller(){
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }
   
    modifier onlyBuyer(uint _tokenId){
        require(msg.sender == buyer[_tokenId], "Only buyer can call this function");
        _;
    }
    
    modifier onlyInspector(){
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    // list property - transfer from seller to buyer
    function list(uint _tokenId, uint _purchasePrice, address _buyer, uint _escrowAmt ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _tokenId);
        isListed[_tokenId] = true;
        purchasePrice[_tokenId] = _purchasePrice;
        buyer[_tokenId] = _buyer;
        escrowAmount[_tokenId] = _escrowAmt;
    }

    function depositEarnest(uint _tokenId) public payable onlyBuyer(_tokenId){
        require(msg.value == escrowAmount[_tokenId], "Deposit amount should be equal to escrow amount");
    }

    // allows contract to receive ether
    receive() external payable {}

    function updateInspection(uint _tokenId, bool _inspectionPassed) public onlyInspector{
        inspectionPassed[_tokenId] = _inspectionPassed;
    }

    function approveSale(uint _tokenId) public{
        approval[_tokenId][msg.sender] = true;
    }   

    function finaliseSale(uint _tokenId) public payable{
        require(inspectionPassed[_tokenId] == true, "Inspection not passed");
        require(approval[_tokenId][buyer[_tokenId]] == true, "Approval not given");
        require(approval[_tokenId][seller]);
        require(approval[_tokenId][lender]);
        require(purchasePrice[_tokenId] == msg.value, "Purchase price not equal to value");

        isListed[_tokenId] = false;

        (bool success,) = payable(seller).call{value:address(this).balance}("");
        require(success, "Transfer failed");

        IERC721(nftAddress).transferFrom(address(this) , buyer[_tokenId], _tokenId);
    }



}
