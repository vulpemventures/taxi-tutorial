const axios = require('axios');

const taxiBaseUrl = 'https://stage-api.liquid.taxi';

const fetchAssets = async () => {
  const { data, status } = await axios.get(`${taxiBaseUrl}/v1/assets`);
  if (status !== 200) {
    throw new Error(data.message);
  }
  const assets = data.assets.map(details => details.assetHash);
  if (assets.length === 0) {
    throw new Error('Taxi list of supported assets is empty');
  }
  return assets
}

const fetchTopupWithAsset = async (targetAsset) => {
  const { data, status } = await axios.post(
    `${taxiBaseUrl}/v1/asset/topup`,
    { assetHash: targetAsset, estimated_tx_size: 300, millisat_per_byte: 100 }
  );
  if (status !== 200) {
    throw new Error(data.message);
  }
  return data
}

async function main() {
  try {
    // Retrieve the list of supported assets.
    console.log('Retrieve list of supported assets');
    const assets = await fetchAssets();
    console.log('[');
    assets.forEach(v => {
      console.log(` "${v}",`);
    });
    console.log(']');

    // Request a topup for one of the supported assets.
    const targetAsset = assets[0];
    console.log(`\nRequesting topup for asset ${targetAsset}`)
    const topup = await fetchTopupWithAsset(targetAsset);

    // If for example, you request a topup with asset USDt, you can transfer your
    // USDt funds to somebody without having LBTCs to pay for network fees.
    // Taxi takes care of that in exchange for a service fee that you'll pay with
    // your USDt funds.
    // You can only add inputs and outputs to the given transaction. Trying to
    // change the existing inputs or outputs will invalidate the signature of the
    // input added by Taxi.
    console.log('Topup details:', topup);
  } catch(e) {
    console.error(e);
  }
}

main()