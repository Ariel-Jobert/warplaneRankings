const warplaneRankings = {}

warplaneRankings.apiKey = 'fb723aa882d3a2fa5be1190069572588';

warplaneRankings.maxResults = 8;

warplaneRankings.displayResults = function () {
    let htmlToAppend = "";
    warplaneRankings.planeResults.forEach(function(plane, i){
        if (i >= warplaneRankings.maxResults) {
            return;
        }
        htmlToAppend += `          
        <li>
            <div>
                <img src="${plane.images.large}" alt="${plane.name}">
            </div>
            <h3>${plane.name}</h3>
        </li>
    `
    })

    $('.warplanesContainer').html(htmlToAppend);

}

warplaneRankings.getPlaneStats = function (planeIds) {
    $.ajax({
        url: 'https://api.worldofwarplanes.com/wowp/encyclopedia/planeinfo/',
        method: 'GET',
        dataType: 'json',
        data: {
            application_id: this.apiKey,
            plane_id: planeIds
        }
    }).then(function (response) {
        warplaneRankings.planeResults = Object.values(response.data);
        console.log(warplaneRankings.planeResults);
        warplaneRankings.displayResults();

    })
}

warplaneRankings.getPlaneData = function (nation, type) {
    $.ajax({
        url: 'https://api.worldofwarplanes.com/wowp/encyclopedia/planes/',
        method: 'GET',
        dataType: 'json',
        data: {
            application_id: this.apiKey,
            nation: nation,
            type: type
        }
    }).then(function (response) {
        const planeIds = Object.keys(response.data);
        warplaneRankings.getPlaneStats(planeIds.join(','));
    })
}

warplaneRankings.init = function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        const $userNation = $('input[name = nation]:checked').attr("id");
        const $userType = $('input[name = type]:checked').attr("id");
        warplaneRankings.getPlaneData($userNation, $userType);

    })

}

$(function () {
    warplaneRankings.init();
});

