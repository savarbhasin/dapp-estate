const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}


describe("Escrow", ()=>{

    let realEstate, escrow;
    let buyer,seller, inspector, lender;

    beforeEach(async()=>{
        // fake 20 accounts that hardhat gives us
        [seller, buyer, inspector, lender] = await ethers.getSigners();

        const RealEstate = await ethers.getContractFactory("RealEstate");
        realEstate = await RealEstate.deploy();
        
      
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
        await transaction.wait();
       
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(realEstate.address, seller.address, inspector.address, lender.address);
    
        transaction = await realEstate.connect(seller).approve(escrow.address, 1);
        await transaction.wait();

        transaction = await escrow.connect(seller).list(1, tokens(1),buyer.address, tokens(1));
        await transaction.wait();
    })

    describe("Deployment", ()=>{
        
        it('returns nft address', async()=>{
            const nftAd = await escrow.nftAddress();   
            expect(nftAd).to.equal(realEstate.address);
    
        })
        it("returns the buyer address", async()=>{
            const sellerAd = await escrow.seller();
            expect(sellerAd).to.equal(seller.address);
        })
        it("returns the inspector address", async()=>{
            const inspectorAd = await escrow.inspector();
            expect(inspectorAd).to.equal(inspector.address);
        })
        it("returns the lender address", async()=>{
            const lenderAd = await escrow.lender();
            expect(lenderAd).to.equal(lender.address);
        })
    })
    describe("Listing", ()=>{
        it("transfer property", async()=>{
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        })
        it("update mapping to listed" , async()=>{
            const res = await escrow.isListed(1);
            expect(res).to.be.true;
        })
        it("returns buyer", async()=>{
            const res = await escrow.buyer(1);
            expect(res).to.be.equal(buyer.address);
        })
        it("returns purchase price", async()=>{
            const res = await escrow.purchasePrice(1);
            expect(res).to.be.equal(tokens(1));
        })
        it("returns escrow amount", async()=>{
            const res = await escrow.escrowAmount(1);
            expect(res).to.be.equal(tokens(1));
        })
        
    })

    describe("Deposits", ()=>{
        it("update contract balance", async()=>{
            const transaction = await escrow.connect(buyer).depositEarnest(1, {value:tokens(1)})
            await transaction.wait();

            const res = await escrow.getBalance();
            expect(res).to.be.equal(tokens(1));
        })

    })
    describe("Inspection", ()=>{
        it("update inspection", async()=>{
            const transaction = await escrow.connect(inspector).updateInspection(1,true);
            await transaction.wait();
            
            const res = await escrow.inspectionPassed(1);
            expect(res).to.be.true;
        })
    })

    describe("Approval", async()=>{
        it("update approval status", async()=>{
            let transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();


            // expect(await escrow.approval(1, buyer.address)).to.be.true; 
            // expect(await escrow.approval(1, seller.address)).to.be.true;
            // expect(await escrow.approval(1, lender.address)).to.be.true;

        })
    })


    describe("Sale", ()=>{
        beforeEach(async()=>{
            let transaction = await escrow.connect(buyer).depositEarnest(1, {value:tokens(1)})
            await transaction.wait();

            transaction = await escrow.connect(inspector).updateInspection(1,true);
            await transaction.wait();

            transaction = await escrow.connect(buyer).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(seller).approveSale(1);
            await transaction.wait();

            transaction = await escrow.connect(lender).approveSale(1);
            await transaction.wait();


            transaction = await escrow.connect(seller).finaliseSale(1, {value:tokens(1)});
            await transaction.wait();
        })
        it("updates balance", async()=>{
            expect(await escrow.getBalance()).to.be.equal(0);
        })
        it("transfers ownership", async()=>{
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
        })
    })

    

    

})