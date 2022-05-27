const { ethers } = require("ethers");
require('dotenv').config();

const { ABI } = require("./ABI/abi.js");
const { ETHABI } = require('./ABI/ethabi');
const privateKey = process.env.PRIVATE_KEY;

const ETHprovider = new ethers.providers.WebSocketProvider("wss://eth-mainnet.alchemyapi.io/v2/LNQf8Y4wDbAspLYGTu6fFQN2QVB3-v8Z");
// const POLYprovider = new ethers.providers.WebSocketProvider("wss://polygon-mainnet.g.alchemy.com/v2/gc-aX2SBlByVETru1dR9Z1PzMBn5YtQQ");

const POLYprovider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com")


let walletSigner = new ethers.Wallet(privateKey, POLYprovider);
let ETHwalletSigner = new ethers.Wallet(privateKey, ETHprovider);
const ETHcontractAddress = "0x29c7aC3C0b9AaCa1d53f75720ba2821C65FE77Fa";
const contractAddress = "0xaf01cfC75a781AC3aB7B8562D0946b15b1fD1124";
const ETHcontract = new ethers.Contract(ETHcontractAddress, ETHABI, ETHwalletSigner);
const contract = new ethers.Contract(contractAddress, ABI, walletSigner);

async function run() {
    try {
        const gas = await ETHcontract.estimateGas.depositBridge("0x28557F28711948D46f5336181ca96ff8f304E186", [1001]);
        const gasPrice = await ETHprovider.getGasPrice();
        const gasFormat = ethers.utils.formatUnits(gas, "wei");
        // console.log(2)
        const gasPriceFormat = parseInt(ethers.utils.formatUnits(gasPrice, "wei") * 1.35);
        // console.log(ethers.utils.formatUnits(gasFormat * gasPriceFormat, 'wei'))
        const newGasEth = ethers.utils.formatUnits(gasFormat * gasPriceFormat, 'wei');
        // console.log(1)



        const POLYgasPrice = await POLYprovider.getGasPrice();
        const POLYgasPriceFormat = parseInt(ethers.utils.formatUnits(POLYgasPrice, "wei") * 1.5).toString();
        console.log(POLYgasPriceFormat)
        // const thing = POLYgasPriceFormat.toString()
        const POLYgas = await contract.estimateGas.setGasEth(newGasEth);
        const POLYgasFormat = ethers.utils.formatUnits(POLYgas, 'wei')
        const noncee = await walletSigner.getTransactionCount()

        var overrideOptions = {
            gasLimit: POLYgasFormat,
            gasPrice: POLYgasPriceFormat,
            nonce: noncee
        };
        console.log(overrideOptions)

        let write = await contract.setGasEth(newGasEth, overrideOptions)
        write.wait()
            .then(async (transaction) => {
                console.log(`tx hash (${newGasEth}): ` + transaction.transactionHash);
            })
    } catch (error) {
        console.log('oh no something went wrong')
        console.log(error)
        return
    }
}
run()
setInterval(() => {
console.log(new Date())    
run()
}, 600000);

