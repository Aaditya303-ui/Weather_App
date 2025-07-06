const searchbtn = document.querySelector(".searchbtn");
const cityInput = document.querySelector(".cityInput");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-card");
const locationBtn = document.querySelector(".location-btn");

const API_KEY = "bd5e378503939ddaee76f12ad7a97608";

const createWeatherCard = (cityName ,weatherItem, index) => {
  if(index == 0){
    return `
    <div class="details">
      <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
      <h4>Temperature: ${weatherItem.main.temp.toFixed(2)}°C</h4>
      <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </div>
    <div class="icon">
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
      <h4>${weatherItem.weather[0].description}</h4>
    </div>
    `;
  }else{
    return `
    <li class="card">
      <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
      <h4>Temperature: ${weatherItem.main.temp.toFixed(2)}°C</h4>
      <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </li>
    `;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = [];

      console.log("Weather Data:", data);

      data.list.forEach((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          fiveDaysForecast.push(forecast);
        }
      });

      cityInput.value = "";
      weatherCardsDiv.innerHTML = "";
      currentWeatherDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem,index) => {
        if(index == 0){
          currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName ,weatherItem , index));
        }else{
          weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName ,weatherItem , index));
        }
      });
    })
    .catch(() => {
      alert("Error fetching weather details");
    });
};


const getCityCoordinates = (cityName) => {
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        alert("City not found!");
        return;
      }

      const { name, lat, lon } = data[0]; // ✅ Extract coordinates
      getWeatherDetails(name, lat, lon); // ✅ Pass them into the next function
    })
    .catch((err) => {
      alert("Error fetching coordinates");
    });
};

searchbtn.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  getCityCoordinates(cityName);
});

const getUserCoordinates = () =>{
  navigator.geolocation.getCurrentPosition(
    position =>{
    const { latitude , longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEOCODING_URL)
    .then((res) => res.json())
    .then((data) => {
      const cityName = data[0].name;
      getWeatherDetails(cityName, latitude, longitude);
    })
    .catch((err) => {
      alert("Error fetching coordinates");
    });
    },
    error =>{
      if(error.code === error.PERMISSION_DENIED){
        alert("Geolocation request denied .Please reset location permission is required...to grant access");
      }
    }
  );
}

locationBtn.addEventListener("click",getUserCoordinates);
