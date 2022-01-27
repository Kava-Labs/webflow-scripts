const SWAP_DATA_URL = "https://lucid-snyder-df4e9f.netlify.app/.netlify/functions/swap";

function formatElementId(value, pool) {
  return `${value}-${pool}`.toUpperCase();
};

function setDisplayValueById(elementId, value) {
  const element = document.getElementById(elementId)
  if (element) { element.innerHTML = value; }
};

function mapelementIds(pools) {
  let ids = {};
  ids['TAV'] = {
    d: 'TAV',
    m: 'TAV-M'
  };
  ids['DV'] = {
    d: 'DV',
    m: 'DV-M'
  };
  for (const pool of pools) {
    ids[pool] = {};
    ids[pool].totalValueLocked = {
      d: formatElementId('tvl', pool),
      m: formatElementId('tvl-m', pool)
    };
    ids[pool].rewardApy = {
      d: formatElementId('rapy', pool),
      m: formatElementId('rapy-m', pool)
    };
    ids[pool].dailyVolume = {
      d: formatElementId('dv', pool),
      m: formatElementId('dv-m', pool)
    };
  }
  return ids;
};

function setTotalLiquidityDisplay(elementIds, totalLiquidity) {
  const elementIdDesktopTAV = elementIds['TAV']['d'];
  const elementIdMobileTAV = elementIds['TAV']['m'];
  const totalAssetValueUsd = totalLiquidity.replace("$", "");
  setDisplayValueById(elementIdDesktopTAV, totalAssetValueUsd);
  setDisplayValueById(elementIdMobileTAV, totalAssetValueUsd);
};

function setSwapVolumesDisplay(elementIds, poolsVolume) {
  for (const pool in poolsVolume) {
    const elementIdDailyVolumeDesktop = elementIds[pool].dailyVolume['d'];
    const elementIdDailyVolumeMobile = elementIds[pool].dailyVolume['m'];
    setDisplayValueById(elementIdDailyVolumeDesktop, poolsVolume[pool]);
    setDisplayValueById(elementIdDailyVolumeMobile, poolsVolume[pool]);
  };
};

function setSwapPoolTvlsDisplay(elementIds, poolsTVL) {
  for (const pool in poolsTVL) {
    const elementIdDesktopTVL = elementIds[pool].totalValueLocked['d'];
    const elementIdMobileTVL = elementIds[pool].totalValueLocked['m'];
    setDisplayValueById(elementIdDesktopTVL, poolsTVL[pool]);
    setDisplayValueById(elementIdMobileTVL, poolsTVL[pool]);
  };
};

function setRewardsPerYearDisplay(elementIds, poolsReward) {
  for (const pool in poolsReward) {
    const elementIdDesktop = elementIds[pool].rewardApy['d'];
    const elementIdMobile = elementIds[pool].rewardApy['m'];
    setDisplayValueById(elementIdDesktop, poolsReward[pool]);
    setDisplayValueById(elementIdMobile, poolsReward[pool]);
  };
};

function updateSwapUI(elementIds, totalLiquidity, swapVolumes, swapPoolTvl, rewardsPerYear) {
  setTotalLiquidityDisplay(elementIds, totalLiquidity);
  setSwapVolumesDisplay(elementIds, swapVolumes);
  setSwapPoolTvlsDisplay(elementIds, swapPoolTvl);
  setRewardsPerYearDisplay(elementIds, rewardsPerYear);

  $(".metric-blur").css("background-color", "transparent");
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"});
};


async function getSwapData() {
  const resp = await fetch(SWAP_DATA_URL);
  const swapDataJson = await resp.json();
  return swapDataJson;
};

async function swapPageInit() {
  const swapData = await getSwapData();
  const elementIds = mapelementIds(Object.keys(swapData.swapPoolTVLS));
  updateSwapUI(elementIds, swapData.totalAssetsLockedAcrossPools, swapData.swapPoolsVolume, swapData.swapPoolTVLS, swapData.rewardsPerYear);
  await sleep(30000);

  swapPageInit();
};

function sleep(ms = 10000) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

swapPageInit(); 