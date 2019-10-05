const StarNotary = artifacts.require('StarNotary')

const expectThrow = async (promise) => {
    try {
        await promise;
    } catch (error) {
        assert.exists(error);
        return
    }

    assert.fail('Expected an error.');
}

contract('StarNotary', accounts => {

    const user1 = accounts[1]
    const user2 = accounts[2]

    const name = 'awesome star!'
    const starStory = "this star was bought for my wife's birthday"
    const ra = "1"
    const dec = "1"
    const mag = "1"
    const starId = 1

    const createMainStar = async () => await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: user1});

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
        this.createMainStar = async () => await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: user1});
    })

    describe('can create a star', () => {
        beforeEach(async function() {
            await this.createMainStar();
        })

        it('can create a star and get its parameters', async function () {
            const expected = [name, starStory, ra, dec, mag];
            assert.deepEqual(await this.contract.tokenIdToStarInfo(1), expected);
        })

        it('can check if a given star exists', async function () {
            const [name, starStory, ra, dec, mag] = await this.contract.tokenIdToStarInfo(1);

            // This star should exists
            assert.equal(await this.contract.checkIfStarExists(ra, dec, mag), true);
            // Not this one
            assert.equal(await this.contract.checkIfStarExists(ra, dec, 'incorrect mag'), false);
        })
    })

    describe('star uniqueness', () => {
        it('only stars unique stars can be minted', async function() {
            await this.createMainStar();
            await expectThrow(this.createMainStar());
        })

        it('only stars unique stars can be minted even if their ID is different', async function() {
            await this.createMainStar();
            await expectThrow(this.contract.createStar('another star', "description", ra, dec, mag, 2, {from: user1}));
        })

        it('minting unique stars does not fail', async function() {
            for(let i = 0; i < 10; i ++) {
                let id = i
                let newRa = i.toString()
                let newDec = i.toString()
                let newMag = i.toString()

                await this.contract.createStar(name, starStory, newRa, newDec, newMag, id, {from: user1})

                let starInfo = await this.contract.tokenIdToStarInfo(id)
                assert.equal(starInfo[0], name)
            }
        })
    })

    describe('buying and selling stars', () => {
        const starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(name, starStory, ra, dec, mag, starId, {from: user1})
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })
})