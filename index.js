const https = require("https");

const city = process.argv[2];

if (!city) {
  console.log("Please provide a city name.");
  process.exit(1);
}

const url = `https://wttr.in/${city}?format=j1`;

https.get(url, (res) => {
  let data = "";

  if (res.statusCode !== 200) {
    console.log("Unable to fetch weather data.");
    return;
  }

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const weather = JSON.parse(data);

      const temperature = weather.current_condition[0].temp_C;
      const condition =
        weather.current_condition[0].weatherDesc[0].value;

      console.log(`Weather in ${city}:`);
      console.log(`Temperature: ${temperature}°C`);
      console.log(`Condition: ${condition}`);
    } catch (error) {
      console.log("Error processing weather data.");
    }
  });
}).on("error", () => {
  console.log("Network error occurred.");
});
