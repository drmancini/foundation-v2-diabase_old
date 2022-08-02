const Algorithms = require('../main/algorithms');
const Template = require('../main/template');
const config = require('../../configs/example');
const testdata = require('../../daemon/test/daemon.mock');
const utils = require('../main/utils');

config.primary.address = 'XbtkVnc9XRLhxfmafNkafderCWSsXYZJaM';
config.primary.recipients = [];

const jobId = 1;
const extraNonce = Buffer.from('f000000ff111111f', 'hex');

////////////////////////////////////////////////////////////////////////////////

describe('Test template functionality', () => {

  let configCopy, rpcDataCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    rpcDataCopy = JSON.parse(JSON.stringify(testdata.getBlockTemplate()));
  });

  test('Test current bigint implementation [1]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    expect(Number(template.target).toFixed(9)).toBe('7.795215829306603e+69');
  });

  test('Test current bigint implementation [2]', () => {
    rpcDataCopy.target = null;
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    expect(Number(template.target).toFixed(9)).toBe('7.795215829306603e+69');
  });

  test('Test if target is not defined', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    delete rpcDataCopy.target;
    expect(Number(template.target).toFixed(9)).toBe('7.795215829306603e+69');
    expect(template.difficulty.toFixed(9)).toBe('0.003458472');
  });

  test('Test template difficulty calculation', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    expect(template.difficulty.toFixed(9)).toBe('0.003458472');
  });

  test('Test generation transaction handling', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    expect(template.generation.length).toBe(2);
    expect(template.generation[0].slice(0, -5)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c550b04', 'hex'));
    expect(template.generation[1]).toStrictEqual(Buffer.from('00000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test coinbase serialization [1]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const extraNonce1 = Buffer.from('01', 'hex');
    const extraNonce2 = Buffer.from('00', 'hex');
    const coinbase = template.handleCoinbase(extraNonce1, extraNonce2);
    expect(coinbase.slice(0, 44)).toStrictEqual(Buffer.from('03000500010000000000000000000000000000000000000000000000000000000000000000ffffffff12037c', 'hex'));
    expect(coinbase.slice(51)).toStrictEqual(Buffer.from('08010000000000022c56f32a000000001976a9140d38a9d28604df5924cff3560b95e0a377c671b388ac41016d40000000001976a9141ec5c66e9789c655ae068d35088b4073345fe0b088ac000000004602007c550b000ec66728cf59b7f525f47b239b7f432f527b2986ea56618e907cc1dc3f45d0d3139c2b50ce2dd3369cc3c0c824b87b0b1acf6fae039b1ce746c421b60f2ff274', 'hex'));
  });

  test('Test coinbase serialization [2]', () => {
    const coinbaseBuffer = Buffer.from('01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff020101ffffffff0100f2052a010000001976a914614ca2f0f4baccdd63f45a0e0e0ff7ffb88041fb88ac00000000', 'hex');
    const hashDigest = Algorithms.sha256d.hash();
    const coinbaseHash = hashDigest(coinbaseBuffer);
    expect(coinbaseHash).toStrictEqual(Buffer.from('afd031100bff85a9ac01f1718be0b3d6c20228592f0242ea1e4d91a519b53031', 'hex'));
  });

  test('Test header serialization [1]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const merkleRoot = '3130b519a5914d1eea42022f592802c2d6b3e08b71f101aca985ff0b1031d0af';
    const time = '6036c54f'.toString('hex');
    const nonce = 'fe1a0000'.toString('hex');
    const headerBuffer = template.handleHeader(template.rpcData.version, merkleRoot, time, nonce);
    expect(headerBuffer).toStrictEqual(Buffer.from('00000020f87296a304368e101c665fed8cb34275a106b803b19f371a8b607b8b1501000000060003000008000701000100010000000908050000000001000301000000004fc536602421011e00001afe', 'hex'));
  });

  test('Test header serialization [2]', () => {
    const headerBuffer = Buffer.from('00000020e22777bc309503ee6be3c65f370ba629b6497dbe8b804cbd8365ef83fbae1997afd031100bff85a9ac01f1718be0b3d6c20228592f0242ea1e4d91a519b530314fc53660f0ff0f1e00001afe', 'hex');
    const hashDigest = Algorithms.x11.hash();
    const headerHash = hashDigest(headerBuffer, 1614202191);
    expect(headerHash).toStrictEqual(Buffer.from('267dbe534fa3b3be1c56afccd9a125581a447bfbd3798889b53f12c49209914a', 'hex'));
  });

  test('Test block serialization [1]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const headerBuffer = Buffer.from('00000020e22777bc309503ee6be3c65f370ba629b6497dbe8b804cbd8365ef83fbae1997afd031100bff85a9ac01f1718be0b3d6c20228592f0242ea1e4d91a519b530314fc53660f0ff0f1e00001afe', 'hex');
    const coinbase = Buffer.from('01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff020101ffffffff0100f2052a010000001976a914614ca2f0f4baccdd63f45a0e0e0ff7ffb88041fb88ac00000000', 'hex');
    const templateHex = template.handleBlocks(headerBuffer, coinbase);
    expect(templateHex).toStrictEqual(Buffer.from('00000020e22777bc309503ee6be3c65f370ba629b6497dbe8b804cbd8365ef83fbae1997afd031100bff85a9ac01f1718be0b3d6c20228592f0242ea1e4d91a519b530314fc53660f0ff0f1e00001afe0101000000010000000000000000000000000000000000000000000000000000000000000000ffffffff020101ffffffff0100f2052a010000001976a914614ca2f0f4baccdd63f45a0e0e0ff7ffb88041fb88ac00000000', 'hex'));
  });

  test('Test block serialization [2]', () => {
    const headerBuffer = Buffer.from('00000020e22777bc309503ee6be3c65f370ba629b6497dbe8b804cbd8365ef83fbae1997afd031100bff85a9ac01f1718be0b3d6c20228592f0242ea1e4d91a519b530314fc53660f0ff0f1e00001afe', 'hex');
    const hashDigest = Algorithms.x11.hash();
    const blockHash = hashDigest(headerBuffer, 1614202191);
    expect(blockHash).toStrictEqual(Buffer.from('267dbe534fa3b3be1c56afccd9a125581a447bfbd3798889b53f12c49209914a', 'hex'));
  });

  test('Test template submission', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const extraNonce1 = Buffer.from('01', 'hex');
    const extraNonce2 = Buffer.from('00', 'hex');
    const time = '6036c54f'.toString('hex');
    const nonce = 'fe1a0000'.toString('hex');
    const templateSubmitted1 = template.handleSubmissions([extraNonce1, extraNonce2, time, nonce]);
    const templateSubmitted2 = template.handleSubmissions([extraNonce1, extraNonce2, time, nonce]);
    expect(templateSubmitted1).toBe(true);
    expect(templateSubmitted2).toBe(false);
  });

  test('Test current job parameters [1]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const jobParams = [
      template.jobId,
      template.previous,
      template.generation[0].toString('hex'),
      template.generation[1].toString('hex'),
      utils.getMerkleSteps(template.rpcData.transactions).map((step) => step.toString('hex')),
      utils.packInt32BE(template.rpcData.version).toString('hex'),
      template.rpcData.bits,
      utils.packInt32BE(template.rpcData.curtime).toString('hex'),
      true
    ];
    const currentParams = template.handleParameters(true);
    expect(currentParams).toStrictEqual(jobParams);
  });

  test('Test current job parameters [2]', () => {
    const template = new Template(jobId.toString(16), configCopy, rpcDataCopy, extraNonce);
    const jobParams = [
      template.jobId,
      template.previous,
      template.generation[0].toString('hex'),
      template.generation[1].toString('hex'),
      utils.getMerkleSteps(template.rpcData.transactions).map((step) => step.toString('hex')),
      utils.packInt32BE(template.rpcData.version).toString('hex'),
      template.rpcData.bits,
      utils.packInt32BE(template.rpcData.curtime).toString('hex'),
      true
    ];
    template.jobParams = jobParams;
    const currentParams = template.handleParameters(true);
    expect(currentParams).toStrictEqual(jobParams);
  });
});
