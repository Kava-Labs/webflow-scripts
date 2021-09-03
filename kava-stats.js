const FACTOR_SIX = Number(10 ** 6)
const FACTOR_EIGHT = Number(10 ** 8)
const BASE_URL = "https://api.kava.io/";
const BINANACE_URL = "https://api.binance.com/api/v3/"

// import coinGeckoSwapData from './coinGeckoSwapData.json'

const swpExternalMarketJson = {
  "id": "kava-swap",
  "symbol": "swp",
  "name": "Kava Swap",
  "asset_platform_id": null,
  "platforms": {
    "": ""
  },
  "block_time_in_minutes": 0,
  "hashing_algorithm": null,
  "categories": [],
  "public_notice": null,
  "additional_notices": [],
  "localization": {
    "en": "Kava Swap",
    "de": "Kava Swap",
    "es": "Kava Swap",
    "fr": "Kava Swap",
    "it": "Kava Swap",
    "pl": "Kava Swap",
    "ro": "Kava Swap",
    "hu": "Kava Swap",
    "nl": "Kava Swap",
    "pt": "Kava Swap",
    "sv": "Kava Swap",
    "vi": "Kava Swap",
    "tr": "Kava Swap",
    "ru": "Kava Swap",
    "ja": "Kava Swap",
    "zh": "Kava Swap",
    "zh-tw": "Kava Swap",
    "ko": "Kava Swap",
    "ar": "Kava Swap",
    "th": "Kava Swap",
    "id": "Kava Swap"
  },
  "description": {
    "en": "",
    "de": "",
    "es": "",
    "fr": "",
    "it": "",
    "pl": "",
    "ro": "",
    "hu": "",
    "nl": "",
    "pt": "",
    "sv": "",
    "vi": "",
    "tr": "",
    "ru": "",
    "ja": "",
    "zh": "",
    "zh-tw": "",
    "ko": "",
    "ar": "",
    "th": "",
    "id": ""
  },
  "links": {
    "homepage": [
      "https://www.kava.io/swap",
      "",
      ""
    ],
    "blockchain_site": [
      "https://www.mintscan.io/",
      "",
      "",
      "",
      ""
    ],
    "official_forum_url": [
      "",
      "",
      ""
    ],
    "chat_url": [
      "",
      "",
      ""
    ],
    "announcement_url": [
      "https://medium.com/kava-labs",
      ""
    ],
    "twitter_screen_name": "kava_swap",
    "facebook_username": "",
    "bitcointalk_thread_identifier": null,
    "telegram_channel_identifier": "kavalabs",
    "subreddit_url": null,
    "repos_url": {
      "github": [
        "https://github.com/Kava-Labs/kava"
      ],
      "bitbucket": []
    }
  },
  "image": {
    "thumb": "https://assets.coingecko.com/coins/images/18031/thumb/6123a3093aeaba00d21e7685_Kava_Swap-Logo-White-p-500.png?1630296688",
    "small": "https://assets.coingecko.com/coins/images/18031/small/6123a3093aeaba00d21e7685_Kava_Swap-Logo-White-p-500.png?1630296688",
    "large": "https://assets.coingecko.com/coins/images/18031/large/6123a3093aeaba00d21e7685_Kava_Swap-Logo-White-p-500.png?1630296688"
  },
  "country_origin": "",
  "genesis_date": null,
  "sentiment_votes_up_percentage": 81.25,
  "sentiment_votes_down_percentage": 18.75,
  "market_cap_rank": null,
  "coingecko_rank": 606,
  "coingecko_score": 26.751,
  "developer_score": 79.12,
  "community_score": 0.0,
  "liquidity_score": 34.854,
  "public_interest_score": 0.0,
  "market_data": {
    "current_price": {
      "aed": 8.11,
      "ars": 216.08,
      "aud": 2.96,
      "bch": 0.00313193,
      "bdt": 187.95,
      "bhd": 0.832135,
      "bmd": 2.21,
      "bnb": 0.00449113,
      "brl": 11.43,
      "btc": 4.364e-05,
      "cad": 2.76,
      "chf": 2.02,
      "clp": 1696.0,
      "cny": 14.25,
      "czk": 47.11,
      "dkk": 13.81,
      "dot": 0.06693154,
      "eos": 0.39679586,
      "eth": 0.00055609,
      "eur": 1.86,
      "gbp": 1.59,
      "hkd": 17.16,
      "huf": 645.11,
      "idr": 31480,
      "ils": 7.07,
      "inr": 161.19,
      "jpy": 242.04,
      "krw": 2550.95,
      "kwd": 0.663647,
      "lkr": 439.44,
      "ltc": 0.01062642,
      "mmk": 3633.09,
      "mxn": 43.95,
      "myr": 9.15,
      "ngn": 908.56,
      "nok": 19.11,
      "nzd": 3.09,
      "php": 110.19,
      "pkr": 369.18,
      "pln": 8.37,
      "rub": 160.57,
      "sar": 8.28,
      "sek": 18.87,
      "sgd": 2.96,
      "thb": 71.71,
      "try": 18.35,
      "twd": 60.98,
      "uah": 59.38,
      "usd": 2.21,
      "vef": 0.221069,
      "vnd": 50189,
      "xag": 0.089349,
      "xau": 0.00120633,
      "xdr": 1.56,
      "xlm": 5.960213,
      "xrp": 1.69903,
      "yfi": 5.619e-05,
      "zar": 31.57,
      "bits": 43.64,
      "link": 0.07129394,
      "sats": 4363.53
    },
    "total_value_locked": null,
    "mcap_to_tvl_ratio": null,
    "fdv_to_tvl_ratio": null,
    "roi": null,
    "ath": {
      "aed": 10.36,
      "ars": 275.71,
      "aud": 3.82,
      "bch": 0.00422464,
      "bdt": 239.92,
      "bhd": 1.06,
      "bmd": 2.82,
      "bnb": 0.00574313,
      "brl": 14.63,
      "btc": 5.671e-05,
      "cad": 3.56,
      "chf": 2.58,
      "clp": 2177.64,
      "cny": 18.23,
      "czk": 60.49,
      "dkk": 17.72,
      "dot": 0.08782757,
      "eos": 0.53175879,
      "eth": 0.00075357,
      "eur": 2.38,
      "gbp": 2.05,
      "hkd": 21.94,
      "huf": 828.89,
      "idr": 40274,
      "ils": 9.05,
      "inr": 205.88,
      "jpy": 310.44,
      "krw": 3274.11,
      "kwd": 0.848748,
      "lkr": 561.78,
      "ltc": 0.0153534,
      "mmk": 4635.02,
      "mxn": 56.39,
      "myr": 11.73,
      "ngn": 1160.15,
      "nok": 24.52,
      "nzd": 3.99,
      "php": 141.0,
      "pkr": 470.61,
      "pln": 10.75,
      "rub": 205.89,
      "sar": 10.58,
      "sek": 24.3,
      "sgd": 3.79,
      "thb": 91.61,
      "try": 23.39,
      "twd": 78.16,
      "uah": 76.08,
      "usd": 2.82,
      "vef": 0.282532,
      "vnd": 64106,
      "xag": 0.116744,
      "xau": 0.00155532,
      "xdr": 1.99,
      "xlm": 7.820764,
      "xrp": 2.257435,
      "yfi": 7.188e-05,
      "zar": 40.57,
      "bits": 56.71,
      "link": 0.09686401,
      "sats": 5671.03
    },
    "ath_change_percentage": {
      "aed": -20.61054,
      "ars": -20.48063,
      "aud": -21.29686,
      "bch": -24.70473,
      "bdt": -20.52158,
      "bhd": -20.6193,
      "bmd": -20.61467,
      "bnb": -20.70466,
      "brl": -20.87708,
      "btc": -22.00996,
      "cad": -21.12907,
      "chf": -20.73856,
      "clp": -21.04578,
      "cny": -20.71787,
      "czk": -20.98312,
      "dkk": -20.90018,
      "dot": -22.44765,
      "eos": -24.47128,
      "eth": -25.1212,
      "eur": -20.89917,
      "gbp": -21.10752,
      "hkd": -20.6553,
      "huf": -21.02149,
      "idr": -20.69531,
      "ils": -20.76353,
      "inr": -20.56515,
      "jpy": -20.90425,
      "krw": -20.94861,
      "kwd": -20.66481,
      "lkr": -20.63722,
      "ltc": -29.44795,
      "mmk": -20.47462,
      "mxn": -20.97461,
      "myr": -20.84374,
      "ngn": -20.54516,
      "nok": -20.91601,
      "nzd": -21.43381,
      "php": -20.74382,
      "pkr": -20.40999,
      "pln": -20.92365,
      "rub": -20.88959,
      "sar": -20.61623,
      "sek": -21.21614,
      "sgd": -20.78431,
      "thb": -20.59942,
      "try": -20.39426,
      "twd": -20.85254,
      "uah": -20.80994,
      "usd": -20.61467,
      "vef": -20.61467,
      "vnd": -20.56981,
      "xag": -22.27406,
      "xau": -21.27572,
      "xdr": -20.59223,
      "xlm": -22.93339,
      "xrp": -23.73273,
      "yfi": -20.69635,
      "zar": -21.09603,
      "bits": -22.00996,
      "link": -25.32044,
      "sats": -22.00996
    },
    "ath_date": {
      "aed": "2021-09-02T06:53:35.582Z",
      "ars": "2021-09-02T06:53:35.582Z",
      "aud": "2021-09-02T06:53:35.582Z",
      "bch": "2021-09-02T06:57:49.903Z",
      "bdt": "2021-09-02T06:53:35.582Z",
      "bhd": "2021-09-02T06:53:35.582Z",
      "bmd": "2021-09-02T06:53:35.582Z",
      "bnb": "2021-09-02T06:53:35.582Z",
      "brl": "2021-09-02T06:53:35.582Z",
      "btc": "2021-09-02T06:53:35.582Z",
      "cad": "2021-09-02T06:53:35.582Z",
      "chf": "2021-09-02T06:53:35.582Z",
      "clp": "2021-09-02T06:53:35.582Z",
      "cny": "2021-09-02T06:53:35.582Z",
      "czk": "2021-09-02T06:53:35.582Z",
      "dkk": "2021-09-02T06:53:35.582Z",
      "dot": "2021-09-02T06:57:49.903Z",
      "eos": "2021-09-02T06:53:35.582Z",
      "eth": "2021-09-02T06:57:49.903Z",
      "eur": "2021-09-02T06:53:35.582Z",
      "gbp": "2021-09-02T06:53:35.582Z",
      "hkd": "2021-09-02T06:53:35.582Z",
      "huf": "2021-09-02T06:53:35.582Z",
      "idr": "2021-09-02T06:53:35.582Z",
      "ils": "2021-09-02T06:53:35.582Z",
      "inr": "2021-09-02T06:53:35.582Z",
      "jpy": "2021-09-02T06:53:35.582Z",
      "krw": "2021-09-02T06:53:35.582Z",
      "kwd": "2021-09-02T06:53:35.582Z",
      "lkr": "2021-09-02T06:53:35.582Z",
      "ltc": "2021-09-02T06:45:10.777Z",
      "mmk": "2021-09-02T06:53:35.582Z",
      "mxn": "2021-09-02T06:53:35.582Z",
      "myr": "2021-09-02T06:53:35.582Z",
      "ngn": "2021-09-02T06:53:35.582Z",
      "nok": "2021-09-02T06:53:35.582Z",
      "nzd": "2021-09-02T06:53:35.582Z",
      "php": "2021-09-02T06:53:35.582Z",
      "pkr": "2021-09-02T06:53:35.582Z",
      "pln": "2021-09-02T06:53:35.582Z",
      "rub": "2021-09-02T06:53:35.582Z",
      "sar": "2021-09-02T06:53:35.582Z",
      "sek": "2021-09-02T06:53:35.582Z",
      "sgd": "2021-09-02T06:53:35.582Z",
      "thb": "2021-09-02T06:53:35.582Z",
      "try": "2021-09-02T06:53:35.582Z",
      "twd": "2021-09-02T06:53:35.582Z",
      "uah": "2021-09-02T06:53:35.582Z",
      "usd": "2021-09-02T06:53:35.582Z",
      "vef": "2021-09-02T06:53:35.582Z",
      "vnd": "2021-09-02T06:53:35.582Z",
      "xag": "2021-09-02T06:53:35.582Z",
      "xau": "2021-09-02T06:53:35.582Z",
      "xdr": "2021-09-02T06:53:35.582Z",
      "xlm": "2021-09-02T06:53:35.582Z",
      "xrp": "2021-09-02T06:53:35.582Z",
      "yfi": "2021-09-02T06:53:35.582Z",
      "zar": "2021-09-02T06:53:35.582Z",
      "bits": "2021-09-02T06:53:35.582Z",
      "link": "2021-09-02T06:53:35.582Z",
      "sats": "2021-09-02T06:53:35.582Z"
    },
    "atl": {
      "aed": 6.98,
      "ars": 185.59,
      "aud": 2.58,
      "bch": 0.00288505,
      "bdt": 161.82,
      "bhd": 0.71598,
      "bmd": 1.9,
      "bnb": 0.00386968,
      "brl": 9.85,
      "btc": 3.884e-05,
      "cad": 2.4,
      "chf": 1.74,
      "clp": 1465.78,
      "cny": 12.27,
      "czk": 40.66,
      "dkk": 11.92,
      "dot": 0.05779917,
      "eos": 0.35847491,
      "eth": 0.00049844,
      "eur": 1.6,
      "gbp": 1.38,
      "hkd": 14.77,
      "huf": 557.93,
      "idr": 27061,
      "ils": 6.09,
      "inr": 138.62,
      "jpy": 209.02,
      "krw": 2197.23,
      "kwd": 0.57094,
      "lkr": 378.92,
      "ltc": 0.01049163,
      "mmk": 3126.31,
      "mxn": 37.98,
      "myr": 7.88,
      "ngn": 781.55,
      "nok": 16.51,
      "nzd": 2.69,
      "php": 94.87,
      "pkr": 317.43,
      "pln": 7.24,
      "rub": 138.67,
      "sar": 7.12,
      "sek": 16.35,
      "sgd": 2.55,
      "thb": 61.38,
      "try": 15.75,
      "twd": 52.58,
      "uah": 51.32,
      "usd": 1.9,
      "vef": 0.190174,
      "vnd": 43150,
      "xag": 0.078581,
      "xau": 0.0010465,
      "xdr": 1.34,
      "xlm": 5.354041,
      "xrp": 1.543597,
      "yfi": 4.728e-05,
      "zar": 27.34,
      "bits": 38.84,
      "link": 0.06403717,
      "sats": 3883.84
    },
    "atl_change_percentage": {
      "aed": 17.93885,
      "ars": 18.13594,
      "aud": 16.68504,
      "bch": 10.25626,
      "bdt": 17.83387,
      "bhd": 17.91695,
      "bmd": 17.93885,
      "bnb": 17.68498,
      "brl": 17.55126,
      "btc": 13.87792,
      "cad": 17.04815,
      "chf": 17.71361,
      "clp": 17.29837,
      "cny": 17.8147,
      "czk": 17.55843,
      "dkk": 17.51832,
      "dot": 17.84312,
      "eos": 12.03869,
      "eth": 13.20773,
      "eur": 17.52006,
      "gbp": 17.14997,
      "hkd": 17.84983,
      "huf": 17.33445,
      "idr": 18.02507,
      "ils": 17.72,
      "inr": 17.97561,
      "jpy": 17.47589,
      "krw": 17.79502,
      "kwd": 17.93806,
      "lkr": 17.66243,
      "ltc": 3.24549,
      "mmk": 17.90295,
      "mxn": 17.33827,
      "myr": 17.8962,
      "ngn": 17.94458,
      "nok": 17.44575,
      "nzd": 16.55345,
      "php": 17.79822,
      "pkr": 17.99831,
      "pln": 17.4215,
      "rub": 17.45491,
      "sar": 17.93253,
      "sek": 17.08265,
      "sgd": 17.77211,
      "thb": 18.50105,
      "try": 18.18844,
      "twd": 17.64406,
      "uah": 17.40339,
      "usd": 17.93885,
      "vef": 17.93885,
      "vnd": 18.00549,
      "xag": 15.47357,
      "xau": 17.00133,
      "xdr": 17.97218,
      "xlm": 12.57288,
      "xrp": 11.53716,
      "yfi": 20.56753,
      "zar": 17.09269,
      "bits": 13.87792,
      "link": 12.96192,
      "sats": 13.87792
    },
    "atl_date": {
      "aed": "2021-09-02T00:27:03.271Z",
      "ars": "2021-09-02T00:27:03.271Z",
      "aud": "2021-09-02T00:27:03.271Z",
      "bch": "2021-09-02T00:27:03.271Z",
      "bdt": "2021-09-02T00:27:03.271Z",
      "bhd": "2021-09-02T00:27:03.271Z",
      "bmd": "2021-09-02T00:27:03.271Z",
      "bnb": "2021-09-02T00:27:03.271Z",
      "brl": "2021-09-02T00:27:03.271Z",
      "btc": "2021-09-02T00:27:03.271Z",
      "cad": "2021-09-02T00:27:03.271Z",
      "chf": "2021-09-02T00:27:03.271Z",
      "clp": "2021-09-02T00:27:03.271Z",
      "cny": "2021-09-02T00:27:03.271Z",
      "czk": "2021-09-02T00:27:03.271Z",
      "dkk": "2021-09-02T00:27:03.271Z",
      "dot": "2021-09-02T00:27:03.271Z",
      "eos": "2021-09-02T00:27:03.271Z",
      "eth": "2021-09-02T00:27:03.271Z",
      "eur": "2021-09-02T00:27:03.271Z",
      "gbp": "2021-09-02T00:27:03.271Z",
      "hkd": "2021-09-02T00:27:03.271Z",
      "huf": "2021-09-02T00:27:03.271Z",
      "idr": "2021-09-02T00:27:03.271Z",
      "ils": "2021-09-02T00:27:03.271Z",
      "inr": "2021-09-02T00:27:03.271Z",
      "jpy": "2021-09-02T00:27:03.271Z",
      "krw": "2021-09-02T00:27:03.271Z",
      "kwd": "2021-09-02T00:27:03.271Z",
      "lkr": "2021-09-02T00:27:03.271Z",
      "ltc": "2021-09-02T00:27:03.271Z",
      "mmk": "2021-09-02T00:27:03.271Z",
      "mxn": "2021-09-02T00:27:03.271Z",
      "myr": "2021-09-02T00:27:03.271Z",
      "ngn": "2021-09-02T00:27:03.271Z",
      "nok": "2021-09-02T00:27:03.271Z",
      "nzd": "2021-09-02T00:27:03.271Z",
      "php": "2021-09-02T00:27:03.271Z",
      "pkr": "2021-09-02T00:27:03.271Z",
      "pln": "2021-09-02T00:27:03.271Z",
      "rub": "2021-09-02T00:27:03.271Z",
      "sar": "2021-09-02T00:27:03.271Z",
      "sek": "2021-09-02T00:27:03.271Z",
      "sgd": "2021-09-02T00:27:03.271Z",
      "thb": "2021-09-02T00:27:03.271Z",
      "try": "2021-09-02T00:27:03.271Z",
      "twd": "2021-09-02T00:27:03.271Z",
      "uah": "2021-09-02T00:27:03.271Z",
      "usd": "2021-09-02T00:27:03.271Z",
      "vef": "2021-09-02T00:27:03.271Z",
      "vnd": "2021-09-02T00:27:03.271Z",
      "xag": "2021-09-02T00:27:03.271Z",
      "xau": "2021-09-02T00:27:03.271Z",
      "xdr": "2021-09-02T00:27:03.271Z",
      "xlm": "2021-09-02T00:27:03.271Z",
      "xrp": "2021-09-02T00:27:03.271Z",
      "yfi": "2021-09-02T00:27:03.271Z",
      "zar": "2021-09-02T00:27:03.271Z",
      "bits": "2021-09-02T00:27:03.271Z",
      "link": "2021-09-02T00:27:03.271Z",
      "sats": "2021-09-02T00:27:03.271Z"
    },
    "market_cap": {
      "aed": 0.0,
      "ars": 0.0,
      "aud": 0.0,
      "bch": 0.0,
      "bdt": 0.0,
      "bhd": 0.0,
      "bmd": 0.0,
      "bnb": 0.0,
      "brl": 0.0,
      "btc": 0.0,
      "cad": 0.0,
      "chf": 0.0,
      "clp": 0.0,
      "cny": 0.0,
      "czk": 0.0,
      "dkk": 0.0,
      "dot": 0.0,
      "eos": 0.0,
      "eth": 0.0,
      "eur": 0.0,
      "gbp": 0.0,
      "hkd": 0.0,
      "huf": 0.0,
      "idr": 0.0,
      "ils": 0.0,
      "inr": 0.0,
      "jpy": 0.0,
      "krw": 0.0,
      "kwd": 0.0,
      "lkr": 0.0,
      "ltc": 0.0,
      "mmk": 0.0,
      "mxn": 0.0,
      "myr": 0.0,
      "ngn": 0.0,
      "nok": 0.0,
      "nzd": 0.0,
      "php": 0.0,
      "pkr": 0.0,
      "pln": 0.0,
      "rub": 0.0,
      "sar": 0.0,
      "sek": 0.0,
      "sgd": 0.0,
      "thb": 0.0,
      "try": 0.0,
      "twd": 0.0,
      "uah": 0.0,
      "usd": 0.0,
      "vef": 0.0,
      "vnd": 0.0,
      "xag": 0.0,
      "xau": 0.0,
      "xdr": 0.0,
      "xlm": 0.0,
      "xrp": 0.0,
      "yfi": 0.0,
      "zar": 0.0,
      "bits": 0.0,
      "link": 0.0,
      "sats": 0.0
    },
    "market_cap_rank": null,
    "fully_diluted_valuation": {},
    "total_volume": {
      "aed": 19257850,
      "ars": 513110666,
      "aud": 7036371,
      "bch": 7437,
      "bdt": 446305927,
      "bhd": 1976032,
      "bmd": 5242799,
      "bnb": 10665,
      "brl": 27141447,
      "btc": 103.619,
      "cad": 6564310,
      "chf": 4790739,
      "clp": 4027413528,
      "cny": 33834405,
      "czk": 111865083,
      "dkk": 32795282,
      "dot": 158939,
      "eos": 942253,
      "eth": 1321,
      "eur": 4410348,
      "gbp": 3780430,
      "hkd": 40749138,
      "huf": 1531922207,
      "idr": 74754977396,
      "ils": 16780103,
      "inr": 382767074,
      "jpy": 574768082,
      "krw": 6057635110,
      "kwd": 1575933,
      "lkr": 1043526852,
      "ltc": 25234,
      "mmk": 8627334973,
      "mxn": 104376557,
      "myr": 21739267,
      "ngn": 2157516748,
      "nok": 45377476,
      "nzd": 7329203,
      "php": 261657012,
      "pkr": 876678001,
      "pln": 19884066,
      "rub": 381308265,
      "sar": 19661682,
      "sek": 44804595,
      "sgd": 7034788,
      "thb": 170286120,
      "try": 43584439,
      "twd": 144812407,
      "uah": 141017181,
      "usd": 5242799,
      "vef": 524961,
      "vnd": 119180537610,
      "xag": 212173,
      "xau": 2864.61,
      "xdr": 3692587,
      "xlm": 14153444,
      "xrp": 4034609,
      "yfi": 133.431,
      "zar": 74976444,
      "bits": 103618800,
      "link": 169298,
      "sats": 10361880009
    },
    "high_24h": {
      "aed": 9.9,
      "ars": 263.79,
      "aud": 3.64,
      "bch": 0.00407946,
      "bdt": 229.73,
      "bhd": 1.02,
      "bmd": 2.7,
      "bnb": 0.00559781,
      "brl": 13.96,
      "btc": 5.49e-05,
      "cad": 3.38,
      "chf": 2.47,
      "clp": 2074.47,
      "cny": 17.41,
      "czk": 57.66,
      "dkk": 16.88,
      "dot": 0.08550454,
      "eos": 0.51716712,
      "eth": 0.00071432,
      "eur": 2.27,
      "gbp": 1.95,
      "hkd": 20.95,
      "huf": 791.71,
      "idr": 38413,
      "ils": 8.65,
      "inr": 196.92,
      "jpy": 296.44,
      "krw": 3123.02,
      "kwd": 0.810827,
      "lkr": 538.08,
      "ltc": 0.01476482,
      "mmk": 4439.47,
      "mxn": 53.83,
      "myr": 11.21,
      "ngn": 1109.6,
      "nok": 23.31,
      "nzd": 3.79,
      "php": 134.22,
      "pkr": 451.12,
      "pln": 10.25,
      "rub": 196.53,
      "sar": 10.11,
      "sek": 23.11,
      "sgd": 3.62,
      "thb": 87.53,
      "try": 22.32,
      "twd": 74.61,
      "uah": 72.76,
      "usd": 2.7,
      "vef": 0.269997,
      "vnd": 61269,
      "xag": 0.112832,
      "xau": 0.00148993,
      "xdr": 1.9,
      "xlm": 7.548711,
      "xrp": 2.166934,
      "yfi": 7.049e-05,
      "zar": 38.98,
      "bits": 54.9,
      "link": 0.09101514,
      "sats": 5489.74
    },
    "low_24h": {
      "aed": 7.49,
      "ars": 199.5,
      "aud": 2.74,
      "bch": 0.00302664,
      "bdt": 173.3,
      "bhd": 0.768686,
      "bmd": 2.04,
      "bnb": 0.00415998,
      "brl": 10.57,
      "btc": 4.084e-05,
      "cad": 2.56,
      "chf": 1.86,
      "clp": 1568.93,
      "cny": 13.17,
      "czk": 43.59,
      "dkk": 12.77,
      "dot": 0.06141283,
      "eos": 0.38261201,
      "eth": 0.00052147,
      "eur": 1.72,
      "gbp": 1.47,
      "hkd": 15.85,
      "huf": 598.7,
      "idr": 29067,
      "ils": 6.54,
      "inr": 149.07,
      "jpy": 224.26,
      "krw": 2358.76,
      "kwd": 0.61319,
      "lkr": 405.91,
      "ltc": 0.01059039,
      "mmk": 3349.02,
      "mxn": 40.72,
      "myr": 8.46,
      "ngn": 838.68,
      "nok": 17.64,
      "nzd": 2.86,
      "php": 101.67,
      "pkr": 340.31,
      "pln": 7.75,
      "rub": 148.48,
      "sar": 7.65,
      "sek": 17.49,
      "sgd": 2.74,
      "thb": 66.55,
      "try": 16.97,
      "twd": 56.41,
      "uah": 54.89,
      "usd": 2.04,
      "vef": 0.2042,
      "vnd": 46359,
      "xag": 0.085072,
      "xau": 0.00112568,
      "xdr": 1.43,
      "xlm": 5.600034,
      "xrp": 1.592809,
      "yfi": 5.238e-05,
      "zar": 29.4,
      "bits": 40.84,
      "link": 0.06639995,
      "sats": 4083.76
    },
    "price_change_24h": -0.354089505447,
    "price_change_percentage_24h": -13.82133,
    "price_change_percentage_7d": 0.0,
    "price_change_percentage_14d": 0.0,
    "price_change_percentage_30d": 0.0,
    "price_change_percentage_60d": 0.0,
    "price_change_percentage_200d": 0.0,
    "price_change_percentage_1y": 0.0,
    "market_cap_change_24h": 0.0,
    "market_cap_change_percentage_24h": 0.0,
    "price_change_24h_in_currency": {
      "aed": -1.300152247436,
      "ars": -34.585170619951,
      "aud": -0.498991031907,
      "bch": -0.000730886991,
      "bdt": -30.317939272304,
      "bhd": -0.13345262715,
      "bmd": -0.354089505447,
      "bnb": -0.000786360853,
      "brl": -1.781335467161,
      "btc": -7.990217e-06,
      "cad": -0.452623798443,
      "chf": -0.328728063388,
      "clp": -270.928475932871,
      "cny": -2.292802340275,
      "czk": -7.742831955685,
      "dkk": -2.249783123713,
      "dot": -0.01191391892,
      "eos": -0.088978200742,
      "eth": -0.000121638392,
      "eur": -0.302593889647,
      "gbp": -0.260980361399,
      "hkd": -2.748152110608,
      "huf": -108.219510384785,
      "idr": -5030.502997167019,
      "ils": -1.15305116349,
      "inr": -25.91367403378,
      "jpy": -39.83078520339,
      "krw": -418.700605490247,
      "kwd": -0.106758564551,
      "lkr": -71.7816632221,
      "ltc": -0.003281998425,
      "mmk": -584.844277311915,
      "mxn": -7.256179235071,
      "myr": -1.497694049005,
      "ngn": -145.663675169277,
      "nok": -3.060321819405,
      "nzd": -0.51799208974,
      "php": -17.507752182797,
      "pkr": -59.427775333884,
      "pln": -1.375315009381,
      "rub": -26.068264904466,
      "sar": -1.32840499363,
      "sek": -3.115872719402,
      "sgd": -0.478417032852,
      "thb": -11.423969968236,
      "try": -2.879825426667,
      "twd": -9.916926617585,
      "uah": -9.745607731797,
      "usd": -0.354089505447,
      "vef": -0.03545498218,
      "vnd": -8095.824864573603,
      "xag": -0.017991776897,
      "xau": -0.000210456399,
      "xdr": -0.247021141417,
      "xlm": -1.180960693905,
      "xrp": -0.340925253856,
      "yfi": -9.256815e-06,
      "zar": -5.478186801068,
      "bits": -7.990216779867,
      "link": -0.013915997409,
      "sats": -799.02167798668
    },
    "price_change_percentage_1h_in_currency": {
      "aed": -2.19132,
      "ars": -2.19641,
      "aud": -2.27374,
      "bch": -2.08994,
      "bdt": -2.19132,
      "bhd": -2.1882,
      "bmd": -2.19132,
      "bnb": -2.1679,
      "brl": -1.96898,
      "btc": -2.18686,
      "cad": -2.19296,
      "chf": -2.16059,
      "clp": -2.11996,
      "cny": -2.18525,
      "czk": -2.20065,
      "dkk": -2.21422,
      "dot": -2.71312,
      "eos": -2.28324,
      "eth": -2.24906,
      "eur": -2.21433,
      "gbp": -2.2141,
      "hkd": -2.18293,
      "huf": -2.25366,
      "idr": -2.19646,
      "ils": -2.19132,
      "inr": -2.1905,
      "jpy": -2.20425,
      "krw": -2.21682,
      "kwd": -2.19489,
      "lkr": -2.19132,
      "ltc": -3.12478,
      "mmk": -2.19132,
      "mxn": -2.09434,
      "myr": -2.19132,
      "ngn": -2.19132,
      "nok": -2.25341,
      "nzd": -2.26256,
      "php": -2.18174,
      "pkr": -2.19132,
      "pln": -2.21452,
      "rub": -2.15378,
      "sar": -2.19546,
      "sek": -2.18314,
      "sgd": -2.18344,
      "thb": -2.16119,
      "try": -2.0971,
      "twd": -2.17643,
      "uah": -2.19132,
      "usd": -2.19132,
      "vef": -2.19132,
      "vnd": -2.21355,
      "xag": -2.1121,
      "xau": -2.25035,
      "xdr": -2.19132,
      "xlm": -1.72042,
      "xrp": -1.67463,
      "yfi": -2.91344,
      "zar": -2.07188,
      "bits": -2.18686,
      "link": -2.08947,
      "sats": -2.18686
    },
    "price_change_percentage_24h_in_currency": {
      "aed": -13.81685,
      "ars": -13.79746,
      "aud": -14.41294,
      "bch": -18.92107,
      "bdt": -13.89051,
      "bhd": -13.82088,
      "bmd": -13.82133,
      "bnb": -14.90027,
      "brl": -13.48375,
      "btc": -15.47725,
      "cad": -14.06998,
      "chf": -14.01123,
      "clp": -13.77419,
      "cny": -13.86138,
      "czk": -14.11617,
      "dkk": -14.00832,
      "dot": -15.11047,
      "eos": -18.31679,
      "eth": -17.94801,
      "eur": -14.00993,
      "gbp": -14.08442,
      "hkd": -13.80413,
      "huf": -14.36542,
      "idr": -13.7781,
      "ils": -14.02843,
      "inr": -13.85001,
      "jpy": -14.13072,
      "krw": -14.0993,
      "kwd": -13.85744,
      "lkr": -14.0411,
      "ltc": -23.59721,
      "mmk": -13.86565,
      "mxn": -14.16929,
      "myr": -14.05968,
      "ngn": -13.81714,
      "nok": -13.80425,
      "nzd": -14.37102,
      "php": -13.71058,
      "pkr": -13.86526,
      "pln": -14.10757,
      "rub": -13.96695,
      "sar": -13.82572,
      "sek": -14.17355,
      "sgd": -13.90398,
      "thb": -13.74166,
      "try": -13.56243,
      "twd": -13.98731,
      "uah": -14.09753,
      "usd": -13.82133,
      "vef": -13.82133,
      "vnd": -13.8902,
      "xag": -16.76134,
      "xau": -14.8545,
      "xdr": -13.708,
      "xlm": -16.53735,
      "xrp": -16.71239,
      "yfi": -14.14414,
      "zar": -14.7852,
      "bits": -15.47725,
      "link": -16.33142,
      "sats": -15.47725
    },
    "price_change_percentage_7d_in_currency": {},
    "price_change_percentage_14d_in_currency": {},
    "price_change_percentage_30d_in_currency": {},
    "price_change_percentage_60d_in_currency": {},
    "price_change_percentage_200d_in_currency": {},
    "price_change_percentage_1y_in_currency": {},
    "market_cap_change_24h_in_currency": {
      "aed": 0.0,
      "ars": 0.0,
      "aud": 0.0,
      "bch": 0.0,
      "bdt": 0.0,
      "bhd": 0.0,
      "bmd": 0.0,
      "bnb": 0.0,
      "brl": 0.0,
      "btc": 0.0,
      "cad": 0.0,
      "chf": 0.0,
      "clp": 0.0,
      "cny": 0.0,
      "czk": 0.0,
      "dkk": 0.0,
      "dot": 0.0,
      "eos": 0.0,
      "eth": 0.0,
      "eur": 0.0,
      "gbp": 0.0,
      "hkd": 0.0,
      "huf": 0.0,
      "idr": 0.0,
      "ils": 0.0,
      "inr": 0.0,
      "jpy": 0.0,
      "krw": 0.0,
      "kwd": 0.0,
      "lkr": 0.0,
      "ltc": 0.0,
      "mmk": 0.0,
      "mxn": 0.0,
      "myr": 0.0,
      "ngn": 0.0,
      "nok": 0.0,
      "nzd": 0.0,
      "php": 0.0,
      "pkr": 0.0,
      "pln": 0.0,
      "rub": 0.0,
      "sar": 0.0,
      "sek": 0.0,
      "sgd": 0.0,
      "thb": 0.0,
      "try": 0.0,
      "twd": 0.0,
      "uah": 0.0,
      "usd": 0.0,
      "vef": 0.0,
      "vnd": 0.0,
      "xag": 0.0,
      "xau": 0.0,
      "xdr": 0.0,
      "xlm": 0.0,
      "xrp": 0.0,
      "yfi": 0.0,
      "zar": 0.0,
      "bits": 0.0,
      "link": 0.0,
      "sats": 0.0
    },
    "market_cap_change_percentage_24h_in_currency": {
      "aed": 0.0,
      "ars": 0.0,
      "aud": 0.0,
      "bch": 0.0,
      "bdt": 0.0,
      "bhd": 0.0,
      "bmd": 0.0,
      "bnb": 0.0,
      "brl": 0.0,
      "btc": 0.0,
      "cad": 0.0,
      "chf": 0.0,
      "clp": 0.0,
      "cny": 0.0,
      "czk": 0.0,
      "dkk": 0.0,
      "dot": 0.0,
      "eos": 0.0,
      "eth": 0.0,
      "eur": 0.0,
      "gbp": 0.0,
      "hkd": 0.0,
      "huf": 0.0,
      "idr": 0.0,
      "ils": 0.0,
      "inr": 0.0,
      "jpy": 0.0,
      "krw": 0.0,
      "kwd": 0.0,
      "lkr": 0.0,
      "ltc": 0.0,
      "mmk": 0.0,
      "mxn": 0.0,
      "myr": 0.0,
      "ngn": 0.0,
      "nok": 0.0,
      "nzd": 0.0,
      "php": 0.0,
      "pkr": 0.0,
      "pln": 0.0,
      "rub": 0.0,
      "sar": 0.0,
      "sek": 0.0,
      "sgd": 0.0,
      "thb": 0.0,
      "try": 0.0,
      "twd": 0.0,
      "uah": 0.0,
      "usd": 0.0,
      "vef": 0.0,
      "vnd": 0.0,
      "xag": 0.0,
      "xau": 0.0,
      "xdr": 0.0,
      "xlm": 0.0,
      "xrp": 0.0,
      "yfi": 0.0,
      "zar": 0.0,
      "bits": 0.0,
      "link": 0.0,
      "sats": 0.0
    },
    "total_supply": 250000000.0,
    "max_supply": null,
    "circulating_supply": 0.0,
    "last_updated": "2021-09-03T16:52:18.321Z"
  },
  "community_data": {
    "facebook_likes": null,
    "twitter_followers": 25449,
    "reddit_average_posts_48h": 0.0,
    "reddit_average_comments_48h": 0.0,
    "reddit_subscribers": 0,
    "reddit_accounts_active_48h": 0,
    "telegram_channel_user_count": 18060
  },
  "developer_data": {
    "forks": 220,
    "stars": 276,
    "subscribers": 35,
    "total_issues": 134,
    "closed_issues": 98,
    "pull_requests_merged": 612,
    "pull_request_contributors": 19,
    "code_additions_deletions_4_weeks": {
      "additions": 175753,
      "deletions": -923
    },
    "commit_count_4_weeks": 40,
    "last_4_weeks_commit_activity_series": [
      0,
      0,
      3,
      1,
      3,
      1,
      0,
      0,
      4,
      1,
      3,
      6,
      3,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      0,
      0,
      2,
      0,
      4,
      0,
      0,
      0
    ]
  },
  "public_interest_stats": {
    "alexa_rank": null,
    "bing_matches": null
  },
  "status_updates": [],
  "last_updated": "2021-09-03T16:52:18.321Z",
  "tickers": [
    {
      "base": "SWP",
      "target": "USDT",
      "market": {
        "name": "AscendEX (BitMax)",
        "identifier": "bitmax",
        "has_trading_incentive": false
      },
      "last": 2.21414,
      "volume": 2175278.0,
      "converted_last": {
        "btc": 4.369e-05,
        "eth": 0.00055674,
        "usd": 2.21
      },
      "converted_volume": {
        "btc": 95.03,
        "eth": 1211,
        "usd": 4808219
      },
      "trust_score": "green",
      "bid_ask_spread_percentage": 0.618299,
      "timestamp": "2021-09-03T16:52:15+00:00",
      "last_traded_at": "2021-09-03T16:52:15+00:00",
      "last_fetch_at": "2021-09-03T16:52:15+00:00",
      "is_anomaly": false,
      "is_stale": false,
      "trade_url": "https://ascendex.com/en/cashtrade-spottrading/usdt/swp",
      "token_info_url": null,
      "coin_id": "kava-swap",
      "target_coin_id": "tether"
    },
    {
      "base": "SWP",
      "target": "USDT",
      "market": {
        "name": "MEXC Global",
        "identifier": "mxc",
        "has_trading_incentive": false
      },
      "last": 2.183,
      "volume": 199412.16,
      "converted_last": {
        "btc": 4.307e-05,
        "eth": 0.00054891,
        "usd": 2.18
      },
      "converted_volume": {
        "btc": 8.58905,
        "eth": 109.459,
        "usd": 434703
      },
      "trust_score": "green",
      "bid_ask_spread_percentage": 0.045809,
      "timestamp": "2021-09-03T16:50:29+00:00",
      "last_traded_at": "2021-09-03T16:50:29+00:00",
      "last_fetch_at": "2021-09-03T16:50:29+00:00",
      "is_anomaly": false,
      "is_stale": false,
      "trade_url": "https://www.mexc.com/exchange/SWP_USDT",
      "token_info_url": null,
      "coin_id": "kava-swap",
      "target_coin_id": "tether"
    }
  ]
}

console.log('swpExternalMarketJson', swpExternalMarketJson)


const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const setConversionFactors = (denoms) => {
  const denomConversions = {}
  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) {
      denomConversions[denom] = FACTOR_SIX
    } else {
      denomConversions[denom] = FACTOR_EIGHT
    }
  }
  return denomConversions;
}

const setRewardsDates = (denoms) => {
  const rewardsStartDates = {}

  for (const denom of denoms) {
    let date;
    switch(denom) {
      case 'bnb-a':
        date = new Date("2020-07-29T14:00:14.333506701Z")
        break;
      case 'btcb-a':
        date = new Date("2020-11-16T14:00:14.333506701Z")
        break;
      case 'busd-a':
        date = new Date("2020-11-09T14:00:14.333506701Z")
        break;
      case 'xrpb-a':
        date = new Date("2020-12-02T14:00:14.333506701Z")
        break;
      case 'hbtc-a':
        date = new Date("2021-03-15T14:00:14.333506701Z")
        break;
      case 'hard-a':
        date = new Date("2021-01-15T14:00:14.333506701Z")
        break;
      case 'ukava-a':
        date = new Date("2020-12-14T14:00:14.333506701Z")
        break;
      default:
        date = new Date()
        break;
    }
    rewardsStartDates[denom] = date
  }
  return rewardsStartDates;
}

const commonDenomMapper = (denom) => {
  let formattedDenom;
  switch(denom.toLowerCase()) {
    case 'btc':
      formattedDenom = 'btcb-a';
      break;
    case 'usdx':
      formattedDenom = denom;
      break;
    case 'kava':
      formattedDenom = 'ukava-a';
      break;
    case 'xrp':
      formattedDenom = 'xrpb-a';
      break;
    default:
      formattedDenom = denom + '-a';
      break;
  }
  return formattedDenom
}

const emptyCoin = (denom) => { return { denom, amount: 0 } }

const formatCssId = (value, denom) => {
  let displayDenom;
  switch(denom) {
    case 'xrpb-a':
      displayDenom = denom.split('b-')[0]
      break;
    case 'ukava-a':
      displayDenom = 'kava'
      break;
    default:
      displayDenom = denom.split('-')[0]
      break;
  }

  return `${value}-${displayDenom}`.toUpperCase()
}

// used to format denom to match how it's used in the system
// Example:  ukava => ukava-a
const formatRewardDenom = (denom) => {
  let formattedDenom;
  switch(denom) {
    case 'ukava':
      formattedDenom = 'ukava-a'
      break;
    case 'hard':
      formattedDenom = 'hard-a'
      break;
    default:
      formattedDenom = denom;
      break;
  }
  return formattedDenom;
}

var formatMoneyMillions = (v) => {
  const valueBorrowedInMil = v/FACTOR_SIX
  const valueBorrowedFormatted = usdFormatter.format(valueBorrowedInMil)
  return valueBorrowedFormatted + "M"
}

var formatMoneyNoDecimalsOrLabels = (v) => {
  const fm = usdFormatter.format(v)
  return fm.slice(1, fm.length-3)
}

const noDollarSign = (value) => {
  return value.slice(1, value.length);
}

var isKavaNativeAsset = (d) => {
  return ['ukava-a', 'usdx', 'hard', 'ukava', 'hard-a', 'swp'].includes(d)
}

var denomLabel = (v) => {
  switch(v) {
    case 'xrpb-a':
      return 'XRP'
    case 'ukava-a':
      return 'KAVA'
    case 'btcb-a':
      return 'BTC'
    default:
      return v.split('-')[0].toUpperCase()
  }
}

var bnbAmountOnPlatform = (data) => {
  const denomData = data.result.find((d) => d.current_supply.denom === 'bnb')
  return Number(denomData.current_supply.amount)
}

var totalAmountOnPlatformByDenom = (data, denom) => {
  const denomData = data.result.find((d) => d.denom === denom)
  return Number(denomData.amount)
}

var supplyLimitByDenom = (denom, bep3ParamsDataOld) => {
  const assetParams = bep3ParamsDataOld.result.asset_params;

  const denomParams = assetParams.find(
    (item) => item.denom.toUpperCase() === denom.toUpperCase()
  );

  let hasSupplyLimit = denomParams && denomParams.supply_limit && denomParams.supply_limit.limit;
  return hasSupplyLimit ? (Number(denomParams.supply_limit.limit)/FACTOR_EIGHT) : 0
};

var setDenomTotalSupplied = (denomSupplyFromAcct, factor, denomPrice, denomLockedId) => {
  const denomTotalSupplyCoin = denomSupplyFromAcct/factor;
  const denomTotalSupplyValue = Number(denomTotalSupplyCoin * denomPrice);
  setDisplayValue(noDollarSign(denomTotalSupplyValue), denomLockedId);
  return denomTotalSupplyValue
}

const setDenomTotalSuppliedDisplayValues = async (denoms, siteData, cssIds) => {
  const totalSuppliedData = siteData['totalSuppliedData']

  for (const denom of denoms) {
    const totalSupplied = totalSuppliedData[denom]

    const formattedTotalSupplied = noDollarSign(usdFormatter.format(totalSupplied))

    const desktopCssId = cssIds[denom].totalSupplied['d']
    const mobileCssId = cssIds[denom].totalSupplied['m']

    setDisplayValueById(desktopCssId, formattedTotalSupplied)
    setDisplayValueById(mobileCssId, formattedTotalSupplied)
  }
}

const setAssetLimitUsdxDisplayValue = async (denoms, siteData, cssIds) => {
  const cdpParamsData = siteData['cdpParamsData'];

  for (const denom of denoms) {
    if (denom !== 'usdx') {continue; }
    const desktopCssId = cssIds[denom]['assetLimit']['d']
    const mobileCssId = cssIds[denom]['assetLimit']['m']

    const usdxDebtLimit = formatMoneyNoDecimalsOrLabels(cdpParamsData[denom].debtLimit)
    const formattedUsdxDebitLimit = usdxDebtLimit + ' ' + denomLabel('usdx')

    setDisplayValueById(desktopCssId, formattedUsdxDebitLimit)
    setDisplayValueById(mobileCssId, formattedUsdxDebitLimit)
  }
}

const setAssetLimitDisplayValues = async (denoms, siteData, cssIds) => {
  const bep3ParamsData = siteData['bep3ParamsData'];

  for (const denom of denoms) {
    if (isKavaNativeAsset(denom)) { continue; }
    const desktopCssId = cssIds[denom]['assetLimit']['d']
    const mobileCssId = cssIds[denom]['assetLimit']['m']

    const formattedAssetLimit = formatMoneyNoDecimalsOrLabels(bep3ParamsData[denom]) + ' ' + denomLabel(denom)
    setDisplayValueById(desktopCssId, formattedAssetLimit)
    setDisplayValueById(mobileCssId, formattedAssetLimit)
  }
}

const mapCssIds = (denoms) => {
  let ids = {}
  ids['totalAssetsSupplied'] = 't-a-s'
  ids['totalAssetsBorrowed'] = 't-a-b'
  ids['totalMarketCap'] = 't-m-c'

  // for the individual lending stats table
  for (const denom of denoms) {
    ids[denom] = {};
    ids[denom].totalSupplied = {
      d: formatCssId('ts', denom),
      m: formatCssId('ts-m', denom)
    }
    ids[denom].totalEarned = {
      d: formatCssId('te', denom),
      m: formatCssId('te-m', denom)
    }
    ids[denom].marketCap = {
      d: formatCssId('mc', denom),
      m: formatCssId('mc-m', denom)
    }
    ids[denom].supplied = {
      d: formatCssId('s', denom),
      m: formatCssId('s-m', denom)
    }
    ids[denom].price = {
      price: formatCssId('price', denom),
      d: formatCssId('price-d', denom),
      md: formatCssId('price-md', denom)
    }
    ids[denom].priceChangePercent = {
      pc: formatCssId('pc', denom),
      d: formatCssId('pc-d', denom),
      md: formatCssId('pc-md', denom)
    }
    ids[denom].totalBorrowed = formatCssId('tb', denom)
    ids[denom].borrowLimit = formatCssId('bl', denom)
    ids[denom].apy = {
      ea: formatCssId('ea', denom),
      m: formatCssId('ea-m', denom)
    }
    ids[denom].assetLimit = {
      d: formatCssId('al', denom),
      m: formatCssId('al-m', denom)
    }
    ids[denom].borrowApy = formatCssId('borrow-apy', denom)
  }
  return ids;
}

const mapPrices = async (denoms, pricefeedResult) => {
  // for now drop any of the usd:30 prices returned
  const nonThirtyPrices = pricefeedResult.filter(p => !p.market_id.includes('30'))
  let prices = {};

  let mappedPrices = {};
  for (const price of nonThirtyPrices) {
    const priceName = price.market_id.split(":")[0]
    mappedPrices[commonDenomMapper(priceName)] = { price: Number(price.price)}

    // hbtc doesn't have it's own price, it just uses btc's price
    if (commonDenomMapper(priceName) === 'btcb-a') {
      mappedPrices['hbtc-a'] = { price: Number(price.price)}
    }
  }

  for ( const denom of denoms) {
    let mappedPrice = mappedPrices[denom]
    let price = { price: 0 }

    if(mappedPrice) {
      price = { price: mappedPrice.price }
    }
    prices[denom] = price
  }
  return prices;
};

const mapMarketData = async (denoms, marketData) => {
  let prices = {}
  let mappedMarkets = {};

  for (const market in marketData) {
    mappedMarkets[market] = { priceChangePercent: marketData[market].priceChangePercent };
    if (market === 'swp') {
      mappedMarkets[market] = { priceChangePercent: marketData.swp.market_data.price_change_24h };
    }
  }

  for (const denom of denoms) {
    let priceChangePercent = mappedMarkets[denom] ? mappedMarkets[denom].priceChangePercent : ' '
    prices[denom] = { priceChangePercent: priceChangePercent }
  }

  return prices
}

const mapDenomTotalSupplied = async (denoms, siteData) => {
  const suppliedAmounts = siteData['suppliedAmounts']
  const denomConversions = siteData['denomConversions']
  const prices = siteData['prices']

  let coins = {}

  for (const denom of denoms) {
    const suppliedDenom = suppliedAmounts[denom].amount
    const factor = denomConversions[denom]
    const price = prices[denom].price

    const coinValue = suppliedDenom / factor
    const denomTotalSupplyValue = coinValue * price

    coins[denom] = denomTotalSupplyValue
  }

  return coins
}

const mapPlatformAmounts = async (denoms, platformAmounts) => {
  const coins = {};

  for (const denom of denoms) {
    const coin = { locked: 0, borrowed: 0, fees: 0 };
    const platformAmount = platformAmounts[denom];

    if(platformAmount) {
      const { collateral, principal, accumulated_fees } = platformAmount.reduce(function(accumulator, item) {
        Object.keys(item.cdp).forEach(function(key) {
          let c = ['collateral', 'principal', 'accumulated_fees'];
          if(c.includes(key)){
            accumulator[key] = Number((accumulator[key] || 0)) + Number(item.cdp[key].amount);
          }
        });
        return accumulator;
      }, {});

      coin['locked'] = isKavaNativeAsset(denom) ? Number(collateral/FACTOR_SIX) : Number(collateral/FACTOR_EIGHT)
      coin['borrowed'] = Number(principal/FACTOR_SIX)
      coin['fees'] = Number(accumulated_fees/FACTOR_SIX)
    }
    coins[denom] = coin;
  }
  return coins;
};

const mapCdpParams = async (denoms, cdpParamsData) => {
  const coins = {};

  const mappedLimits = {};
  const mappedStabilityFees = {};
  let usdxDebtLimit = 0;
  if(cdpParamsData) {
    for (const denom of cdpParamsData.collateral_params) {

      const debtLimit = denom.debt_limit ? Number(denom.debt_limit.amount)/FACTOR_SIX : 0;
      mappedLimits[denom.type] = { debtLimit }

      const secondsPerYear = 31536000;
      const stabilityFeePercentage = ((Number(denom.stability_fee) ** secondsPerYear - 1) * 100).toFixed(2);
      mappedStabilityFees[denom.type] = stabilityFeePercentage
    }

    usdxDebtLimit = Number(cdpParamsData.global_debt_limit.amount)/FACTOR_SIX;
  }

  for (const denom of denoms) {
    let limit = 0;
    let stabilityFee = ' ';

    if (denom === 'usdx') {
      limit = usdxDebtLimit
    } else {
      let cdpParam = mappedLimits[denom]
      if(cdpParam) { limit = cdpParam.debtLimit }
    }

    coins[denom] = { debtLimit: limit, stabilityFeePercentage: mappedStabilityFees[denom] }
  }
  return coins;
};


const mapUsdxBorrowed = async (denoms, siteData) => {
  const coins = { total: 0 }

  for (const denom of denoms) {
    const cdpParamsData = siteData['cdpParamsData'][denom];
    const platformData = siteData['platformAmounts'][denom];

    let usdxAmount = 0;
    if(cdpParamsData && platformData) {
      const usdxBorrowedAndFees = platformData.borrowed + platformData.fees;
      usdxAmount = usdxBorrowedAndFees > cdpParamsData.debtLimit ? cdpParamsData.debtLimit : usdxBorrowedAndFees;
      coins['total'] += usdxAmount;
    }
    coins[denom] = usdxAmount;
  }
  return coins;
}

const mapIncentiveParams = async (denoms, usdxMintingParams) => {
  let coins = {}

  let mappedParams = {}
  if (usdxMintingParams) {
    for(const param of usdxMintingParams) {
      const rewardPerSecond = param.rewards_per_second;
      mappedParams[param.collateral_type] = { denom: rewardPerSecond.denom, amount: Number(rewardPerSecond.amount) }
    }
  }

  for (const denom of denoms) {
    let coinParams = mappedParams[denom]
    // empty coin with 'ukava' assumes reward type is going to be in ukava
    let coin = emptyCoin('ukava')

    if(coinParams) {
      coin = { denom: coinParams.denom, amount: Number(coinParams.amount) }
    }
    coins[denom] = coin
  }
  return coins;
}

const mapSuppliedAmounts = (denoms, coins) => {
  let formattedCoins = {};

  let mappedCoins = {}
  for (const coin of coins) {
    mappedCoins[commonDenomMapper(coin.denom)] = { denom: coin.denom, amount: coin.amount }
  }

  for(const denom of denoms) {
    let coin = emptyCoin(denom);

    const accountCoin = mappedCoins[denom]
    if(accountCoin) {
      coin = { denom: commonDenomMapper(accountCoin.denom), amount: Number(accountCoin.amount) }
    }
    formattedCoins[denom] = coin
  }
  return formattedCoins
}

const mapBep3Supplies = async (denoms, bep3SupplyData) => {
  const coins = {};

  const mappedBep3Supplies = {};
  for (const denom of bep3SupplyData) {
    const currentSupply = denom.current_supply;
    const amount = currentSupply ? currentSupply.amount : 0
    mappedBep3Supplies[commonDenomMapper(currentSupply.denom)] = Number(amount)
  }

  for (const denom of denoms) {
    let bep3Supply = mappedBep3Supplies[denom]
    let amount = 0;

    if(bep3Supply) { amount = bep3Supply }
    coins[denom] = amount
  }
  return coins
}

const mapBep3Params = async (denoms, bep3ParamsData, siteData) => {
  const coins = {};

  const mappedBep3Params = {};
  for (const param of bep3ParamsData) {
    mappedBep3Params[commonDenomMapper(param.denom)] = Number(param.supply_limit.limit)
  }


  const denomConversions = siteData['denomConversions'];

  for (const denom of denoms) {
    let bep3SupplyLimit = mappedBep3Params[denom];

    let limit = 0;
    if (bep3SupplyLimit) { limit = bep3SupplyLimit / denomConversions[denom] }

    coins[denom] = limit
  }

  return coins
}

const mapSupplyAndMarket = async (denoms, siteData) => {
  const supplydata = siteData['supplyData']
  const bep3SupplyData = siteData['bep3SupplyData']
  const denomConversions = siteData['denomConversions']

  const coins = { }
  for (const denom of denoms) {
    // think we do this because of the double spend?
    const denomTotalSupply = denom === 'bnb-a' ? bep3SupplyData[denom] : supplydata[denom].amount
    const factor = denomConversions[denom]

    const denomTotalSupplyCoin = denomTotalSupply / factor
    coins[denom] = denomTotalSupplyCoin
  }
  return coins
}

const mapUsdxMarketData = async (usdxMarketJson) => {
  return usdxMarketJson.market_data.price_change_percentage_24h
}

const setSwpSupplyAmount = async (supplyTotalJson) => {
  const swpSupplyAmount = Number(supplyTotalJson.result.find(coin => coin.denom === 'swp').amount);

  return {
    denom: 'swp',
    amount: swpSupplyAmount
  }
};

const setSwpPoolPrice = async (swpMarketDataJson) => {
  const usdxReserveAmount =  swpMarketDataJson.result.coins.find(coin => coin.denom === 'usdx').amount / FACTOR_SIX;
  const swpReserveAmount =  swpMarketDataJson.result.coins.find(coin => coin.denom === 'swp').amount / FACTOR_SIX;

  const swpPrice = usdxReserveAmount / swpReserveAmount;

  return {
    price: swpPrice
  };
};


const setTotalEarningsDisplayValues = async (denoms, siteData, cssIds) => {
  const usdxMintingRewards = siteData['incentiveParamsData'];
  const rewardsStartDates = siteData['rewardsStartDates'];
  const denomConversions = siteData['denomConversions'];

  const rewards = {};
  for (const denom in usdxMintingRewards) {
    const rewardDenom = formatRewardDenom(usdxMintingRewards[denom].denom);

    const millisecondsRewardActive = Date.now() - rewardsStartDates[denom].getTime();

    const secondsRewardActive = millisecondsRewardActive / 1000;
    const factor = denomConversions[rewardDenom]

    const coinPerYear = (Number(usdxMintingRewards[denom].amount) * Number(secondsRewardActive)) / factor;
    const price = siteData['prices'][rewardDenom] ? siteData['prices'][rewardDenom].price : 0;
    rewards[denom] = usdFormatter.format(coinPerYear * price);
  }

  for (const denom of denoms) {
    let desktopCssId = cssIds[denom]['totalEarned']['d'];
    let mobileCssId = cssIds[denom]['totalEarned']['m'];

    let reward = rewards[denom]
    setDisplayValueById(desktopCssId, reward)
    setDisplayValueById(mobileCssId, reward)
  }
}

const setPriceDisplayValues = async (denoms, siteData, cssIds) => {
  const prices = siteData['prices'];
  for (const denom of denoms) {
    const price = prices[denom].price
    const kavaLendingCssId = cssIds[denom]['price']['price'];

    let kavaDefiDesktopCssId = cssIds[denom]['price']['d'];
    let kavaDefiMobileCssId = cssIds[denom]['price']['md'];
    const formattedPrice = usdFormatter.format(price)

    setDisplayValueById(kavaLendingCssId, formattedPrice)
    setDisplayValueById(kavaDefiDesktopCssId, formattedPrice)
    setDisplayValueById(kavaDefiMobileCssId, formattedPrice)
  }
}

const setPriceChangeDisplayValues = async (denoms, siteData, cssIds) => {
  const marketData = siteData['marketData'];
  for (const denom of denoms) {
    const priceChangePercent = Number(marketData[denom].priceChangePercent);
    const kavaLendingCssId = cssIds[denom]['priceChangePercent']['pc'];
    let kavaDefiDesktopCssId = cssIds[denom]['priceChangePercent']['d'];
    let kavaDefiMobileCssId = cssIds[denom]['priceChangePercent']['md'];

    let formattedChangePercent = noDollarSign(usdFormatter.format(priceChangePercent)) + "%";

    if(priceChangePercent > 0) {
      formattedChangePercent =  "+" + formattedChangePercent
      setDisplayColor(kavaLendingCssId, 'green')
      setDisplayColor(kavaDefiDesktopCssId, 'green')
      setDisplayColor(kavaDefiMobileCssId, 'green')
    } else if (priceChangePercent === 0) {
      setDisplayColor(kavaLendingCssId, 'grey')
      setDisplayColor(kavaDefiDesktopCssId, 'grey')
      setDisplayColor(kavaDefiMobileCssId, 'grey')
    } else {
      formattedChangePercent =  "-" + noDollarSign(formattedChangePercent)
      setDisplayColor(kavaLendingCssId, 'red')
      setDisplayColor(kavaDefiDesktopCssId, 'red')
      setDisplayColor(kavaDefiMobileCssId, 'red')
    }

    setDisplayValueById(kavaLendingCssId, formattedChangePercent)
    setDisplayValueById(kavaDefiDesktopCssId, formattedChangePercent)
    setDisplayValueById(kavaDefiMobileCssId, formattedChangePercent)
  }
}

const setTotalBorrowedBorrowLimitAndLimitBarDisplayValues = async (denoms, siteData, cssIds) => {
  const usdxBorrowed = siteData['usdxBorrowed'];
  const cdpParamsData = siteData['cdpParamsData']

  for (const denom of denoms) {
    const totalBorrowedCssId = cssIds[denom]['totalBorrowed']
    const borrowLimitCssId = cssIds[denom]['borrowLimit']

    const usdxAmount = usdxBorrowed[denom];
    const usdxLimit = cdpParamsData[denom].debtLimit;

    const formattedUsdxAmount = formatMoneyNoDecimalsOrLabels(usdxAmount);
    const formmatedUsdxLimit = formatMoneyNoDecimalsOrLabels(usdxLimit);
    setDisplayValueById(totalBorrowedCssId, formattedUsdxAmount)
    setDisplayValueById(borrowLimitCssId, formmatedUsdxLimit)

    // borrow limit bar
    let rawUsdxUtilization = 0;
    if(Number(usdxLimit.toFixed(0)) !== 0) {
      rawUsdxUtilization = Number(usdxAmount.toFixed(0)) / Number(usdxLimit.toFixed(0))
    }
    const percentUsdxUtilization = Number(rawUsdxUtilization.toFixed(3) * 100).toFixed(2) + "%";

    const element = $(`.percent-line-usdx-${denom}`)
    if (element) { element.css("width", percentUsdxUtilization); }
  }
}

const setBorrowApyDisplayValues = async (denoms, siteData, cssIds) => {
  const cdpParamsData = siteData['cdpParamsData'];

  for (const denom of denoms) {
    const borrowApy = cdpParamsData[denom].stabilityFeePercentage;
    const desktopCssId = cssIds[denom]['borrowApy'];
    setDisplayValueById(desktopCssId, borrowApy + "%")
  }
};

const setRewardsApyDisplayValues = async (denoms, siteData, cssIds) => {
  const denomConversions = siteData['denomConversions']

  for (const denom of denoms) {

    const denomPrice = siteData['prices'][denom].price;
    const desktopCssId = cssIds[denom]['apy']['ea'];
    const mobileCssId = cssIds[denom]['apy']['m'];

    const lockedAmount = siteData['platformAmounts'][denom].locked;
    const usdxMintingRewards = siteData['incentiveParamsData'][denom]

    let rewardsDenom = commonDenomMapper(usdxMintingRewards.denom);
    let rewardsAmountPerSecond = usdxMintingRewards.amount;


    const denomValueLocked = denomPrice * lockedAmount

    // 31536000 seconds in a year
    const rewardsPerYear = rewardsAmountPerSecond * 31536000 / denomConversions[rewardsDenom]
    const rewardPrice = siteData['prices'][rewardsDenom].price;
    const rewardsPerYearInUsd = rewardsPerYear * rewardPrice;
    const rawDenomApy = denomValueLocked === 0 ? 0 : rewardsPerYearInUsd/denomValueLocked

    const denomPercentageApy = rawDenomApy * 100;

    // use usdFormatter to truncate to 2 decimals and round
    const denomPercentDisplay = usdFormatter.format(denomPercentageApy);
    const commaSeparatedPercentDisplay = noDollarSign(denomPercentDisplay);

    setDisplayValueById(desktopCssId, commaSeparatedPercentDisplay + "%")
    setDisplayValueById(mobileCssId, commaSeparatedPercentDisplay + "%")
  }
}

const setTotalAssetsSuppliedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsSupplied'];
  let totalAssetsSupplied = 0;
  const totalSuppliedData = siteData['totalSuppliedData'];
  for (const denom in totalSuppliedData) {
    const denomSuppliedUsd = totalSuppliedData[denom]
    totalAssetsSupplied += denomSuppliedUsd
  }
  const totalAssetsSuppliedUsd = usdFormatter.format(totalAssetsSupplied);

  setDisplayValueById(cssId, noDollarSign(totalAssetsSuppliedUsd))
}

const setTotalAssetsBorrowedDisplayValue = async (siteData, cssIds) => {
  let cssId = cssIds['totalAssetsBorrowed'];
  const usdxBorrowed = siteData['usdxBorrowed'].total
  const totalAssetsBorrowedUsd = usdFormatter.format(usdxBorrowed);
  setDisplayValueById(cssId, noDollarSign(totalAssetsBorrowedUsd))
}

const setMarketCapDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply'];
  const prices = siteData['prices'];
  const cssId = cssIds['totalMarketCap'];

  let total = 0;

  for (const denom of denoms) {
    const price = prices[denom].price
    const suppliedCoin = defiCoinsSupply[denom]
    const suppliedDenomUsd = suppliedCoin * price;
    total += suppliedDenomUsd

    const desktopCssId = cssIds[denom]['marketCap']['d']
    const mobileCssId = cssIds[denom]['marketCap']['m']

    setDisplayValueById(desktopCssId, formatMoneyMillions(suppliedDenomUsd))
    setDisplayValueById(mobileCssId, formatMoneyMillions(suppliedDenomUsd))
  }
  setDisplayValueById(cssId, noDollarSign(usdFormatter.format(total)))
}

var setDenomTotalSupplyValue = async (supplyDataOld, denomPrice, platformDenom) => {
  let denomTotalSupply;
  platformDenom === 'bnb' ?
    denomTotalSupply = bnbAmountOnPlatform(supplyDataOld) :
    denomTotalSupply = totalAmountOnPlatformByDenom(supplyDataOld, platformDenom)
  let denomTotalSupplyConverted
  isKavaNativeAsset(platformDenom) ?
    denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_SIX :
    denomTotalSupplyConverted = Number(denomTotalSupply)/FACTOR_EIGHT
  let denomTotalSupplyValue =  Number(denomTotalSupplyConverted * denomPrice)

  let data = {}
  data[`${platformDenom}Usd`] = denomTotalSupplyValue
  data[`${platformDenom}MarketCap`] = formatMoneyMillions(denomTotalSupplyValue)
  data[`${platformDenom}Supply`] = formatMoneyNoDecimalsOrLabels(denomTotalSupplyConverted) + ' ' + denomLabel(platformDenom)

  return data;
};

const setSupplyDisplayValues = async (denoms, siteData, cssIds) => {
  const defiCoinsSupply = siteData['defiCoinsSupply']

  for (const denom of denoms) {
    const supply = defiCoinsSupply[denom]
    const formattedSupply = formatMoneyNoDecimalsOrLabels(supply) + ' ' + denomLabel(denom)

    const desktopCssId = cssIds[denom]['supplied']['d']
    const mobileCssId = cssIds[denom]['supplied']['m']

    setDisplayValueById(desktopCssId, formattedSupply)
    setDisplayValueById(mobileCssId, formattedSupply)
  }
}

const setDisplayColor = (cssId, color) => {
  $(`#${cssId}`).css({ color: color });
}

const setDisplayValueById = (cssId, value) => {
  const lastElement = $(`#${cssId}`).last();
  const firstElement = $(`#${cssId}`).first();
  if (lastElement) { lastElement.html(value) }
  if (firstElement) { firstElement.html(value) }
};

const updateDisplayValues = async (denoms) => {

  const [
    pricefeedResponse,
    incentiveParamsResponse,
    kavaMarketResponse,
    hardMarketResponse,
    bnbMarketResponse,
    busdMarketResponse,
    btcbMarketResponse,
    xrpbMarketResponse,
    usdxMarketResponse,
    swpMarketResponse,
    // swpExternalMarketResponse,
    supplyAccountResponse,
    supplyTotalResponse,
    bep3SupplyResponse,
    bep3ParamsResponse,
    cdpParamsResponse,
    btcbCdpResponse,
    busdCdpResponse,
    xrpbCdpResponse,
    bnbCdpResponse,
    kavaCdpResponse,
    hardCdpResponse,
    hbtcCdpResponse

  ] = await Promise.all([
    fetch(BASE_URL + "pricefeed/prices"),
    fetch(BASE_URL + "incentive/parameters"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=KAVAUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=HARDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BNBUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BUSDUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=BTCUSDT"),
    fetch(BINANACE_URL + "ticker/24hr?symbol=XRPUSDT"),
    fetch('https://api.coingecko.com/api/v3/coins/usdx'),
    fetch(BASE_URL + 'swap/pool?pool=swp:usdx'),
    // fetch('https://api.coingecko.com/api/v3/coins/kava-swap/'),
    fetch(BASE_URL + 'auth/accounts/kava1wq9ts6l7atfn45ryxrtg4a2gwegsh3xha9e6rp'),
    fetch(BASE_URL + "supply/total"),
    fetch(BASE_URL + "bep3/supplies"),
    fetch(BASE_URL + "bep3/parameters"),
    fetch(BASE_URL + "cdp/parameters"),
    fetch(BASE_URL + '/cdp/cdps/collateralType/btcb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/busd-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/xrpb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/bnb-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/ukava-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hard-a'),
    fetch(BASE_URL + '/cdp/cdps/collateralType/hbtc-a'),
  ]);


  const pricefeedPrices = await pricefeedResponse.json()
  const incentiveParamsJson = await incentiveParamsResponse.json();
  const suppliedAmountJson = await supplyAccountResponse.json();
  const supplyTotalJson = await supplyTotalResponse.json()
  const bep3SupplyJson = await bep3SupplyResponse.json();
  const bep3ParamsJson = await bep3ParamsResponse.json()

  const cdpParamsJson = await cdpParamsResponse.json();
  const btcPlatformAmountsJson = await btcbCdpResponse.json();
  const busdPlatformAmountsJson = await busdCdpResponse.json();
  const xrpPlatformAmountsJson = await xrpbCdpResponse.json();
  const bnbPlatformAmountsJson = await bnbCdpResponse.json();
  const ukavaPlatformAmountsJson = await kavaCdpResponse.json();
  const hardPlatformAmountsJson = await hardCdpResponse.json();
  const hbtcPlatformAmountsJson = await hbtcCdpResponse.json()

  const bnbMarketData = await bnbMarketResponse.json();
  const btcbMarketData = await btcbMarketResponse.json();
  const busdMarketData = await busdMarketResponse.json();
  const xrpbMarketData = await xrpbMarketResponse.json();
  const hardMarketData = await hardMarketResponse.json();
  const kavaMarketData = await kavaMarketResponse.json();
  const usdxMarketDataJson = await usdxMarketResponse.json();
  const swpMarketDataJson = await swpMarketResponse.json();
  // const swpExternalMarketJson = await swpExternalMarketResponse.json();

  // console.log('swpExternalMarketResponse', swpExternalMarketResponse)

  console.log('usdxMarketDataJson', usdxMarketDataJson)

  const platformAmounts = {
    'bnb-a': await bnbPlatformAmountsJson.result,
    'btcb-a': await btcPlatformAmountsJson.result,
    'busd-a': await busdPlatformAmountsJson.result,
    'hbtc-a': await hbtcPlatformAmountsJson.result,
    'xrpb-a': await xrpPlatformAmountsJson.result,
    'hard-a': await hardPlatformAmountsJson.result,
    'ukava-a': await ukavaPlatformAmountsJson.result
  }

  const markets = {
    'bnb-a': await bnbMarketData,
    'btcb-a': await btcbMarketData,
    'busd-a': await busdMarketData,
    'hbtc-a': await btcbMarketData,
    'xrpb-a': await xrpbMarketData,
    'hard-a': await hardMarketData,
    'ukava-a': await kavaMarketData,
    'swp': swpExternalMarketJson
  }
  // usdx market data comes from a different api so we don't want it to
  // map the same with the other markets


  let siteData = {}
  // fix cssIds
  const cssIds = mapCssIds(denoms)

  const denomConversions = setConversionFactors(denoms)
  siteData['denomConversions'] = denomConversions;

  const rewardsStartDates = setRewardsDates(denoms)
  siteData['rewardsStartDates'] = rewardsStartDates;

  const marketData = await mapMarketData(denoms, markets)
  siteData['marketData'] = marketData;

  const usdxMarketData = await mapUsdxMarketData(usdxMarketDataJson)
  siteData['marketData']['usdx']['priceChangePercent'] = usdxMarketData;

  const prices = await mapPrices(denoms, pricefeedPrices.result);
  siteData['prices'] = prices;

  const swpPoolPrice = await setSwpPoolPrice(swpMarketDataJson);
  siteData['prices']['swp'] = swpPoolPrice;

  const incentiveParamsData = await mapIncentiveParams(denoms, incentiveParamsJson.result.usdx_minting_reward_periods)
  siteData['incentiveParamsData'] = incentiveParamsData;

  const platformData = await mapPlatformAmounts(denoms, platformAmounts)
  siteData['platformAmounts'] = platformData

  const cdpParamsData = await mapCdpParams(denoms, cdpParamsJson.result);
  siteData['cdpParamsData'] = cdpParamsData

  const usdxBorrowed = await mapUsdxBorrowed(denoms, siteData)
  siteData['usdxBorrowed'] = usdxBorrowed;

  const suppliedAmounts = mapSuppliedAmounts(denoms, suppliedAmountJson.result.value.coins);
  siteData['suppliedAmounts'] = suppliedAmounts;

  const totalSuppliedData = await mapDenomTotalSupplied(denoms, siteData)
  siteData['totalSuppliedData'] = totalSuppliedData;

  const supplyData = mapSuppliedAmounts(denoms, supplyTotalJson.result);
  siteData['supplyData'] = supplyData;

  const suppliedSwpAmount = await setSwpSupplyAmount(supplyTotalJson);
  siteData['supplyData']['swp'] = suppliedSwpAmount;

  const bep3SupplyData = await mapBep3Supplies(denoms, bep3SupplyJson.result);
  siteData['bep3SupplyData'] = bep3SupplyData;

  const bep3ParamsData = await mapBep3Params(denoms, bep3ParamsJson.result.asset_params, siteData);
  siteData['bep3ParamsData'] = bep3ParamsData;

  const defiCoinsSupply = await mapSupplyAndMarket(denoms, siteData)
  siteData['defiCoinsSupply'] = defiCoinsSupply;

  console.log(siteData)

  // set display values
  await setTotalEarningsDisplayValues(denoms, siteData, cssIds)

  await setPriceDisplayValues(denoms, siteData, cssIds)

  await setPriceChangeDisplayValues(denoms, siteData, cssIds)

  await setTotalBorrowedBorrowLimitAndLimitBarDisplayValues(denoms, siteData, cssIds)

  await setRewardsApyDisplayValues(denoms, siteData, cssIds)

  await setAssetLimitDisplayValues(denoms, siteData, cssIds)

  await setAssetLimitUsdxDisplayValue(denoms, siteData, cssIds)

  await setDenomTotalSuppliedDisplayValues(denoms, siteData, cssIds)

  // denoms not needed here since totalSupplieData has already looped through the denoms
  await setTotalAssetsSuppliedDisplayValue(siteData, cssIds)
  await setTotalAssetsBorrowedDisplayValue(siteData, cssIds)

  await setMarketCapDisplayValues(denoms, siteData, cssIds)

  await setSupplyDisplayValues(denoms, siteData, cssIds)
  await setBorrowApyDisplayValues(denoms, siteData, cssIds);

  $(".metric-blur").css("background-color", "transparent")
  $(".metric-blur").addClass('without-after');
  $(".api-metric").css({"display": "block", "text-align": "center"})
};

var main = async () => {
  const denoms = [
    'bnb-a', 'btcb-a', 'busd-a',
    'hbtc-a', 'xrpb-a', 'hard-a',
    'ukava-a', 'usdx', 'swp'
  ]

  await updateDisplayValues(denoms);
  await sleep(30000);
  main()
}

var sleep = (ms = 10000) => { return new Promise(resolve => setTimeout(resolve, ms)); }

main();
