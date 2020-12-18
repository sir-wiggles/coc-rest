const axios = require("axios");
const curlizer = require("axios-curlirize");

curlizer(axios);

let test = await axios.get("http://ifconfig.me");
