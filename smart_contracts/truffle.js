/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'coast donkey reform dose patient video powder people tide extend retreat setup';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*" // Match any network id
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/c017f93e767c40e19d89f0b25b2b8c99')
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000,
        }
    }
};
