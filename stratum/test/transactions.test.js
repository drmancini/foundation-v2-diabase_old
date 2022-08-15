const Transactions = require('../main/transactions');
const config = require('../../configs/example');
const testdata = require('../../daemon/test/daemon.mock');

config.primary.address = 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM';
config.primary.recipients = [];

const auxiliaryConfig = {
  'enabled': false,
  'coin': {
    'header': 'fabe6d6d',
  }
};

const auxiliaryData = {
  'chainid': 1,
  'hash': '17a35a38e70cd01488e0d5ece6ded04a9bc8125865471d36b9d5c47a08a5907c',
};

const extraNonce = Buffer.from('f000000ff111111f', 'hex');

////////////////////////////////////////////////////////////////////////////////

describe('Test transactions functionality', () => {

  let configCopy, rpcDataCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    rpcDataCopy = JSON.parse(JSON.stringify(testdata.getBlockTemplate()));
  });

  test('Test main transaction builder [1]', () => {
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [2]', () => {
    rpcDataCopy.coinbasetxn = {};
    rpcDataCopy.coinbasetxn.data = '0500008085202';
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('05000580010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [3]', () => {
    rpcDataCopy.masternode[0] = { payee: 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM', amount: 1080885569 };
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [4]', () => {
    rpcDataCopy.coinbasevalue += 1080885569;
    rpcDataCopy.superblock = [{ payee: 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM', amount: 1080885569 }];
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000032c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac41016d40000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [5]', () => {
    rpcDataCopy.coinbasevalue += 1080885569;
    rpcDataCopy.superblock = [{ script: '76a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac', amount: 1080885569 }];
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000032c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [6]', () => {
    configCopy.primary.recipients.push({ address: 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM', percentage: 0.05 });
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('0000000003dd91cd28000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac4fc42502000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [7]', () => {
    configCopy.primary.recipients.push({ address: 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM', percentage: 0.05 });
    configCopy.primary.recipients.push({ address: 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM', percentage: 0.05 });
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000048ecda726000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac4fc42502000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac4fc42502000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [8]', () => {
    rpcDataCopy.coinbaseaux.flags = 'test';
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [9]', () => {
    rpcDataCopy.auxData = auxiliaryData;
    configCopy.auxiliary = auxiliaryConfig;
    configCopy.auxiliary.enabled = true;
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, 44)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff3e037c', 'hex'));
    expect(transaction[0].slice(52, 56)).toStrictEqual(Buffer.from('fabe6d6d', 'hex'));
    expect(transaction[0].slice(56)).toStrictEqual(Buffer.from('17a35a38e70cd01488e0d5ece6ded04a9bc8125865471d36b9d5c47a08a5907c0100000000000000', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test main transaction builder [10]', () => {
    configCopy.settings.testnet = true;
    configCopy.primary.address = 'yPPjTaXStJRkj9Sts8XULnHjjXpTMPwTHb';
    const transaction = new Transactions(configCopy, rpcDataCopy).handleGeneration(extraNonce);
    expect(transaction[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(transaction[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a91421b7e80e4030a4b3b5bd75a450bc7b467349eca788ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });
});
