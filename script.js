$(document).ready(function () {
    // Api Key
    const apiKey = `d562cbd8265941b5d14b93525f5bef9c`;
// Search Button
    $(`#search-button`).on(`click`, function () {
        var citySearch = $(`#search-value`).val();
        $(`#search-value`).val(``);
        searchWeather(citySearch);
    });

    $(`.history`).on(`click`, `li`, function () {
        searchWeather($(this).text());
    });

    function makeRow(text) {
        var li = $(`<li>`).addClass(`list-group-item list-group-item-action text-center justify-content-md-center`).text(text);
        $(`.history`).append(li);
    }
    // Initial Weather Search
    function searchWeather(citySearch) {
        var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${citySearch}&appid=${apiKey}`
        $.ajax({
            type: `GET`,
            url: queryURL,
            dataType: `json`,
            success: function (data) {
                $(`#today`).empty();
                var title = $(`<h3>`).addClass(`card-title`).text(data.name + ` (` + new Date().toLocaleDateString() + `)`);
                var card = $(`<div>`).addClass(`card`);
                var wind = $(`<p>`).addClass(`card-text`).text(`Wind Speed: ` + data.wind.speed + ` MPH`);
                const newLocal = $(`<p>`).addClass(`card-text`).text(`Humidity: ` + data.main.humidity + `%`);
                var humid = newLocal;
                // Adjusting Tempature to be in Fahrenheit rather than Kelvin
                var temp = $(`<p>`).addClass(`card-text`).text(`Temperature: ` + Math.round(((parseFloat(data.main.temp) - 273.15) * 1.8) + 32) + ` °F`);
                var cardBody = $(`<div>`).addClass(`card-body`);
                var img = $(`<img>`).attr(`src`, `https://openweathermap.org/img/w/` + data.weather[0].icon + `.png`);

                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $(`#today`).append(card);

                fiveDayForecast(citySearch);
                fetchUV(data.coord.lat, data.coord.lon);
                if (history.indexOf(citySearch) === -1) {
                    history.push(citySearch);
                    window.localStorage.setItem(`history`, JSON.stringify(history));

                    makeRow(citySearch);
                }
            }
        });
    }
// UV Levels, Color change to show warning levels
    function fetchUV(lat, lon) {
        var queryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
        $.ajax({
            type: `GET`,
            url: queryURL,
            dataType: `json`,
            success: function (data) {
                var uv = $(`<p>`).text(`UV Level: `);
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
    // 5-Day Forecast
    function fiveDayForecast(citySearch) {
        var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${citySearch}&appid=${apiKey}`
        $.ajax({
            type: "GET",
            url: queryURL,
            dataType: "json",
            success: function (data) {

                $("#forecast").html("<h2 class=\"mx-auto text-center\">5-Day Forecast:</h2>").append("<div class=\"row justify-content-md-center\" >");
                for (var i = 0; i < data.list.length; i++) {
                    if (data.list[i].dt_txt.indexOf("8:00:00") !== -1) {

                        var col = $("<div>").addClass("col-md-offset-12 justify-content-md-center");

                        var card5 = $("<div>").addClass("card text-white align-center justify-content-md-center col-md-offset-6");
                        var body = $("<div>").addClass("card-body p-3");

                        var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

                        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
// Adjusting Tempature to be in Fahrenheit rather than Kelvin
                        var p1 = $("<p>").addClass("card-text").text("Temp: " + Math.round(((parseFloat(data.list[i].main.temp_max) - 273.15) * 1.8) + 32) + " °F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                        var p3 = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[i].wind.speed + "MPH");

                        col.append(card5.append(body.append(title, img, p1, p2, p3)));
                        $("#forecast .row").append(col);

                    }
                }
            }
        });
    }
    // Calling Clear All Button
    clearBtn();


    var history = JSON.parse(window.localStorage.getItem(`history`)) || [];

    if (history.length > 0) {
        searchWeather(history[history.length - 1]);
    }

    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }
});
// Clear All Button
function clearBtn() {
    const row1 = $(`<div class="row clearBtn justify-content-md-center">`);
    $(row1).append(`<div class="col-8 justify-content-md-center">`);
    $(row1).append(`<br>`)
    $(row1).append(`<button class="col-5 btn clearBtn btn-danger1 justify-content-md-center">Clear All Cities</button>`);
    $(".clearBtn").append(row1);
}
$(".clearBtn").on("click", function () {
    localStorage.clear();
    window.location.reload();
});
