var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {

    // Expected behavior - result is initialized to 10
    // Test Case#1
    it("should assert true", function() {
      var better;
      return SimpleStorage.deployed().then(function(instance){
          better = instance;
          return better.set(0,1,{from: accounts[1],value: 10});
      }).then(function (result) {
          return better.getPixelPrice.call(0);
      }).then(function (result) {
          console.log("pixel price for pxl 0:",result.valueOf()[1])
          assert.equal(result.valueOf()[1].c[0], 10, "pixels price isnt 10");
          return better.set(0,1,{from: accounts[1],value: 20})
      }).then(function (result) {
          return better.getPixelPrice.call(0);
      }).then(function (result) {
          console.log("pixel price for pxl 0:", result.valueOf()[1])
          assert.equal(result.valueOf()[1].c[0], 20, "pixels price isnt 20");
          return better.getAddrPayout.call({from: accounts[0]});
      }).then(function (result) {
          console.log("Dev-payout is:", result.valueOf())
          assert.equal(result.valueOf(), 20, "dev payout isnt 20");
          return better.withdraw({from: accounts[0]})
      }).then(function (result) {
          return better.getAddrPayout.call({from: accounts[0]});
      }).then(function (result) {
          console.log("Payout should be 0", result.valueOf())
          assert.equal(result.valueOf(), 0, "dev payout isnt 0");
      });
   });
});
