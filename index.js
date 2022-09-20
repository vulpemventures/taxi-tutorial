const axios = require('axios');

const taxiBaseUrl = 'https://stage-api.liquid.taxi';
const usdt = 'f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958';

const fetchAssets = async () => {
  const { data, status } = await axios.get(`${taxiBaseUrl}/v1/assets`);
  if (status !== 200) {
    throw new Error(data.message);
  }
  const assets = data.assets.map(details => details.assetHash);
  if (assets.length === 0) {
    throw new Error('Taxi list of supported assets is empty');
  }
  return assets;
}

const assetSupportedByTaxi = async (target) => {
  const assets = await fetchAssets();
  return assets.find(a => a === target) !== undefined;
}

const fetchTopupWithAsset = async (targetAsset) => {
  const { data, status } = await axios.post(
    `${taxiBaseUrl}/v1/asset/topup`,
    { assetHash: targetAsset, estimated_tx_size: 300, millisat_per_byte: 100 }
  );
  if (status !== 200) {
    throw new Error(data.message);
  }
  return data;
}

async function main() {
  try {
    if (!await assetSupportedByTaxi(usdt)) {
      throw new Error('Taxi does not support usdt as topup service fee');
    }

    // Request a topup for USDt asset.
    console.log(`Requesting topup for asset ${usdt}`)
    const topup = await fetchTopupWithAsset(usdt);

    // If for example, you request a topup with asset USDt, you can transfer your
    // USDt funds to somebody without having LBTCs to pay for network fees.
    // Taxi takes care of that in exchange for a service fee that you'll pay with
    // your USDt funds.
    // You can only add inputs and outputs to the given transaction. Trying to
    // change the existing inputs or outputs will invalidate the signature of the
    // input added by Taxi.
    console.log('\nTopup details:', topup);
  } catch(e) {
    console.error(e);
  }
}

main();