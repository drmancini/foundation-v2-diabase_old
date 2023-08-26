const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main Transactions Function
const Transactions = function(config, rpcData) {

  const _this = this;
  this.config = config;
  this.rpcData = rpcData;

  // Mainnet Configuration
  this.configMainnet = {
    bech32: '',
    bip32: {
      public: Buffer.from('0488B21E', 'hex').readUInt32LE(0),
      private: Buffer.from('0488ADE4', 'hex').readUInt32LE(0),
    },
    peerMagic: 'ee88063f',
    pubKeyHash: Buffer.from('19', 'hex').readUInt8(0),
    scriptHash: Buffer.from('1A', 'hex').readUInt8(0),
    wif: Buffer.from('99', 'hex').readUInt8(0),
    coin: 'blocx',
  };

  // Testnet Configuration
  this.configTestnet = {
    bech32: '',
    bip32: {
      public: Buffer.from('043587CF', 'hex').readUInt32LE(0),
      private: Buffer.from('04358394', 'hex').readUInt32LE(0),
    },
    peerMagic: '9955083E',
    pubKeyHash: Buffer.from('4B', 'hex').readUInt8(0),
    scriptHash: Buffer.from('4C', 'hex').readUInt8(0),
    wif: Buffer.from('CB', 'hex').readUInt8(0),
    coin: 'blocx',
  };

  // Calculate Generation Transaction
  this.handleGeneration = function(placeholder) {

    const txLockTime = 0;
    const txInSequence = 0;
    const txInPrevOutHash = '';
    const txInPrevOutIndex = Math.pow(2, 32) - 1;
    const txOutputBuffers = [];

    let txExtraPayload;
    let txVersion = 3;
    const network = !_this.config.settings.testnet ?
      _this.configMainnet :
      _this.configTestnet;

    // Use Version Found in CoinbaseTxn
    if (_this.rpcData.coinbasetxn && _this.rpcData.coinbasetxn.data) {
      txVersion = parseInt(utils.reverseHex(_this.rpcData.coinbasetxn.data.slice(0, 8)), 16);
    }

    // Support Coinbase v3 Block Template
    if (_this.rpcData.coinbase_payload && _this.rpcData.coinbase_payload.length > 0) {
      txExtraPayload = Buffer.from(_this.rpcData.coinbase_payload, 'hex');
      txVersion = txVersion + (5 << 16);
    }

    // Calculate Coin Block Reward
    let reward = _this.rpcData.coinbasevalue;

    // Handle Pool/Coinbase Addr/Flags
    const poolAddressScript = utils.addressToScript(_this.config.primary.address, network);
    const coinbaseAux = _this.rpcData.coinbaseaux && _this.rpcData.coinbaseaux.flags ?
      Buffer.from(_this.rpcData.coinbaseaux.flags, 'hex') :
      Buffer.from([]);

    // Build Initial ScriptSig
    let scriptSig = Buffer.concat([
      utils.serializeNumber(_this.rpcData.height),
      coinbaseAux,
      utils.serializeNumber(Date.now() / 1000 | 0),
      Buffer.from([placeholder.length]),
    ]);

    // Add Auxiliary Data to ScriptSig
    if (_this.config.auxiliary && _this.config.auxiliary.enabled && _this.rpcData.auxData) {
      scriptSig = Buffer.concat([
        scriptSig,
        Buffer.from(_this.config.auxiliary.coin.header, 'hex'),
        Buffer.from(_this.rpcData.auxData.hash, 'hex'),
        utils.packUInt32LE(1),
        utils.packUInt32LE(0)
      ]);
    }

    // Build First Part of Generation Transaction
    const p1 = Buffer.concat([
      utils.packUInt32LE(txVersion),
      utils.varIntBuffer(1),
      utils.uint256BufferFromHash(txInPrevOutHash),
      utils.packUInt32LE(txInPrevOutIndex),
      utils.varIntBuffer(scriptSig.length + placeholder.length),
      scriptSig,
    ]);

    // Handle Masternodes
    if (_this.rpcData.masternode.length > 0) {
      _this.rpcData.masternode.forEach((payee) => {
        const payeeReward = payee.amount;
        let payeeScript;
        if (payee.script) payeeScript = Buffer.from(payee.script, 'hex');
        else payeeScript = utils.addressToScript(payee.payee, network);
        reward -= payeeReward;
        txOutputBuffers.push(Buffer.concat([
          utils.packUInt64LE(payeeReward),
          utils.varIntBuffer(payeeScript.length),
          payeeScript,
        ]));
      });
    }

    // Handle Manual Superblocks
    if (_this.rpcData.superblock.length > 0) {
      _this.rpcData.superblock.forEach((payee) => {
        const payeeReward = payee.amount;
        let payeeScript;
        if (payee.script) payeeScript = Buffer.from(payee.script, 'hex');
        else payeeScript = utils.addressToScript(payee.payee, network);
        reward -= payeeReward;
        txOutputBuffers.push(Buffer.concat([
          utils.packUInt64LE(payeeReward),
          utils.varIntBuffer(payeeScript.length),
          payeeScript,
        ]));
      });
    }

    // Handle Founder Transactions
    // if (_this.rpcData.founder_payments_started && _this.rpcData.founder) {
    //   const founderReward = _this.rpcData.founder.amount;
    //   let founderScript;
    //   if (_this.rpcData.founder.script) founderScript = Buffer.from(_this.rpcData.founder.script, 'hex');
    //   else founderScript = utils.addressToScript(_this.rpcData.founder.payee, network);
    //   reward -= founderReward;
    //   txOutputBuffers.push(Buffer.concat([
    //     utils.packUInt64LE(founderReward),
    //     utils.varIntBuffer(founderScript.length),
    //     founderScript,
    //   ]));
    // } else {

      // Devfee
      let founderReward = _this.rpcData.coinbasevalue * 0.03;
      if (_this.rpcData.height > 18000 && _this.rpcData.height < 24001)
        founderReward = _this.rpcData.coinbasevalue * 0.18;
      const founderPayee = 'B4ZQyV266uUDFyJa3vr7D7RV9TD18Th3Dp';
      const founderScript = utils.addressToScript(founderPayee, network);
      reward -= founderReward;
      txOutputBuffers.push(Buffer.concat([
        utils.packUInt64LE(founderReward),
        utils.varIntBuffer(founderScript.length),
        founderScript,
      ]));

      // Reimbursement
      if (_this.rpcData.height < 18001) {
        let founderReward2 = _this.rpcData.coinbasevalue * 0.15;
        const founderPayee2 = 'BCkGmkwuiiJoMpdRiAEivJd9AendntmSE3';
        const founderScript2 = utils.addressToScript(founderPayee2, network);
        reward -= founderReward2;
        txOutputBuffers.push(Buffer.concat([
          utils.packUInt64LE(founderReward2),
          utils.varIntBuffer(founderScript2.length),
          founderScript2,
        ]));
      }


    // }    

    // Handle Recipient Transactions
    let recipientTotal = 0;
    _this.config.primary.recipients.forEach((recipient) => {
      const recipientReward = Math.floor(recipient.percentage * reward);
      const recipientScript = utils.addressToScript(recipient.address, network);
      recipientTotal += recipientReward;
      txOutputBuffers.push(Buffer.concat([
        utils.packUInt64LE(recipientReward),
        utils.varIntBuffer(recipientScript.length),
        recipientScript,
      ]));
    });

    // Handle Pool Transaction
    reward -= recipientTotal;
    txOutputBuffers.unshift(Buffer.concat([
      utils.packUInt64LE(reward),
      utils.varIntBuffer(poolAddressScript.length),
      poolAddressScript
    ]));

    // Build Second Part of Generation Transaction
    const p2 = Buffer.concat([
      utils.packUInt32LE(txInSequence),
      utils.varIntBuffer(txOutputBuffers.length),
      Buffer.concat(txOutputBuffers),
      utils.packUInt32LE(txLockTime),
      utils.varIntBuffer(txExtraPayload.length),
      txExtraPayload
    ]);

    return [p1, p2];
  };
};

module.exports = Transactions;
