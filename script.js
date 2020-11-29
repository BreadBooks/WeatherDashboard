$(document).ready(function () {
    const apiKey = `d562cbd8265941b5d14b93525f5bef9c`;

    $(`#search-button`).on(`click`, function () {
        var citySearch = $(`#search-value`).val();


        $(`#search-value`).val(``);

        searchWeather(citySearch);
    });

    $(`.history`).on(`click`, `li`, function () {
        searchWeather($(this).text());
    });

    function makeRow(text) {
        var li = $(`<li>`).addClass(`list-group-item list-group-item-action text-center`).text(text);
        $(`.history`).append(li);
    }

    function searchWeather(citySearch) {
        var queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${citySearch}&appid=${apiKey}`
        $.ajax({
            type: `GET`,
            url: queryURL,
            dataType: `json`,
            success: function (data) {
                if (history.indexOf(citySearch) === -1) {
                    history.push(citySearch);
                    window.localStorage.setItem(`history`, JSON.stringify(history));

                    makeRow(citySearch);
                }

                $(`#today`).empty();

                var title = $(`<h3>`).addClass(`card-title`).text(data.name + ` (` + new Date().toLocaleDateString() + `)`);
                var card = $(`<div>`).addClass(`card`);
                var wind = $(`<p>`).addClass(`card-text`).text(`Wind Speed: ` + data.wind.speed + ` MPH`);
                var humid = $(`<p>`).addClass(`card-text`).text(`Humidity: ` + data.main.humidity + `%`);
                var temp = $(`<p>`).addClass(`card-text`).text(`Temperature: ` + data.main.temp + ` °F`);
                var cardBody = $(`<div>`).addClass(`card-body`);
                var img = $(`<img>`).attr(`src`, `http://openweathermap.org/img/w/` + data.weather[0].icon + `.png`);


                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $(`#today`).append(card);

                getForecast(citySearch);
                getUVIndex(data.coord.lat, data.coord.lon);
            }
        });
    }

    function getForecast(citySearch) {
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/forecast?q=${citySearch}&appid=${apiKey}`,
            method: "GET",
            dataType: `json`,
            }).then(function(data){
                var fivedayFore = [];

                for (var i = 4; i < data.list.length && i < data.list.length; i += 8)
                    fivedayFore.push(data.list[i]);

                var cityForecast = $(".city-forecast");
                $(cityForecast).empty();

                for (var i = 0; i < fivedayFore.length; i++)
                {
                    var dayDate = new Date(fivedayFore[i].dt_txt);
                    var cityCard = $("<div>");
                    $(cityCard).addClass("card fluid bg-primary city-forecast-day");
                    var cityBody = $("<div>");
                    $(cityBody).addClass("card-body forecast-body");

                    var forecastDate = $("<h4>");

                    $(forecastDate).html(`${(dayDate.getMonth() + 1)}/${dayDate.getDate()}/${dayDate.getFullYear()}`);

                    var imgIcon = $("<img>");
                    $(imgIcon).addClass("forecast-icon");
                    $(imgIcon).attr("src", `https://openweathermap.org/img/wn/${fivedayFore[i].weather[0].icon}@2x.png`);
                    $(imgIcon).attr("alt", `city-forecast-icon-${(i + 1)}`);

                    var forecastTemp = $("<div>");

                    var tempK = fivedayFore[i].main.temp;
                    var tempF = (tempK - 273.15) * 9/5 + 32;

                    $(forecastTemp).addClass("forecast-item");
                    $(forecastTemp).html(`Temp: ${tempF.toFixed(2)} &deg;F`);

                    var forecastHumd = $("<div>");

                    $(forecastHumd).html(`Humidity: ${fivedayFore[i].main.humidity}%`);

                    $(cityBody).append(forecastDate, imgIcon, forecastTemp, forecastHumd);

                    $(cityCard).append(cityBody);

                    $(cityForecast).append(cityCard);
            }
        });

        };
    

function getUVIndex(lat, lon) {
    $.ajax({
        type: `GET`,
        url: `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
        dataType: `json`,
        success: function (data) {
            var uv = $(`<p>`).text(`UV Index: `);
            var btn = $(`<span>`).addClass(`btn btn-sm`).text(data.value);


            if (data.value < 3) {
                btn.addClass(`btn-success`);
            }
            else if (data.value < 7) {
                btn.addClass(`btn-warning`);
            }
            else {
                btn.addClass(`btn-danger`);
            }

            $(`#today .card-body`).append(uv.append(btn));
        }
    });
}


var history = JSON.parse(window.localStorage.getItem(`history`)) || [];

if (history.length > 0) {
    searchWeather(history[history.length - 1]);
}

for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
}
});