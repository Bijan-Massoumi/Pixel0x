pragma solidity ^0.4.18;

contract SimpleStorage {

    struct PixelOwner {
        address owner;
        uint value;
    }

    mapping(uint => PixelOwner ) pixelPrice;
    mapping(address => uint) refundAmount;
    address constant developer = 0xd00a7D58C98f785d389adccE4026fF8F77739Ba0;
    uint constant canvasSize = 400;

    event PixelPurchased(address indexed who, uint24 indexed pixelNumber, uint8 color );

    function set(uint24 pixelNum, uint8 color) public payable {
        if(msg.value == 0 || pixelNum < 0 || pixelNum >= canvasSize ) revert(); //look into pixelnum < 0

        if (msg.value > pixelPrice[pixelNum].value) {
            PixelOwner currOwner = pixelPrice[pixelNum];
            refundAmount[currOwner.owner] += currOwner.value;
            refundAmount[developer] += (msg.value - currOwner.value);
            currOwner.value = msg.value;
            currOwner.owner = msg.sender;
            emit PixelPurchased(msg.sender, pixelNum, color);
            return;
        }
        // That means the ammount they provided is less than the current top bid
        revert();
    }

    function  withdraw() public {
        // Check if there is a balance for the caller
        require(refundAmount[msg.sender] > 0);

        uint amt = refundAmount[msg.sender];

        refundAmount[msg.sender] = 0;

        assert(msg.sender.send(amt));

        return;
    }

    function getPixelPrice(uint pixelNum) public view returns (address, uint) {
        return (pixelPrice[pixelNum].owner, pixelPrice[pixelNum].value);
    }

    function getAddrPayout() public view returns (uint) {
        return refundAmount[msg.sender];
    }

}
