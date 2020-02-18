const warplaneRankings = {}

warplaneRankings.apiKey = 'fb723aa882d3a2fa5be1190069572588';

warplaneRankings.maxResults = 8;

warplaneRankings.displayResults = function () {
    let htmlToAppend = '';
    warplaneRankings.planeResults.forEach(function(plane, i){
        if (i >= warplaneRankings.maxResults) {
            return;
        }
        htmlToAppend += `          
        <li data-index=${i}>
            <div>
                <img src="${plane.images.large}" alt="${plane.name}">
            </div>
            <h3>${plane.name}</h3>
        </li>
    `
    })

    $('.warplanesContainer').html(htmlToAppend);
}

warplaneRankings.sortByStat = function(chosenStat) {
    // the array.sort() here is used to rearrange the planeResults array.
    warplaneRankings.planeResults.sort(function(planeA, planeB) {
        // The return checks to see if the difference of the stats are positive or negative.
        // A negative value puts planeA to an index further down from planeB.
        // So planeB.stats - planeA.stats will yield an array sorted from highest to lowest
        // planeA.stats - planeB.stats will yield an array sorted from lowest to highest
        // planeA.stats or planeB.stats doesn't actually exist, these are just pseudo code examples
        return planeB.features[chosenStat] - planeA.features[chosenStat];
    });
}

// Add event listeners to results
warplaneRankings.addListeners = function(element) {
    element.on('click', function() {
        // stores the index of the clicked plane
        const $planeIndex = parseInt($(this).attr('data-index'));
        console.log(warplaneRankings.planeResults[$planeIndex]);
    });
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
        
        warplaneRankings.sortByStat($('#stats').val());
        warplaneRankings.displayResults();
        warplaneRankings.addListeners($('.warplanesContainer li'));
        console.log(warplaneRankings.planeResults);
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
        const $userNation = $('input[name = nation]:checked').attr('id');
        const $userType = $('input[name = type]:checked').attr('id');
        warplaneRankings.getPlaneData($userNation, $userType);
    });

    // Attach event listener to selection menu to rearrange the planeResults array when there's a change.
    $('#stats').on('change', function() {
        // This conditional is to prevent an error.
        // Only do a sort and redisplay if the planeResults array exists.
        if(warplaneRankings.planeResults){
            warplaneRankings.sortByStat($(this).val());
            warplaneRankings.displayResults();
        }
    });
}

$(function () {
    warplaneRankings.init();
});

