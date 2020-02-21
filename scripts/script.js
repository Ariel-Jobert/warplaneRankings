const warplaneRankings = {};

warplaneRankings.apiKey = 'fb723aa882d3a2fa5be1190069572588';

warplaneRankings.maxResults = 8;
// warplaneRankings.modalOpen = false;

warplaneRankings.displayResults = function () {
    let htmlToAppend = '';
    warplaneRankings.planeResults.forEach(function(plane, i){
        if (i >= warplaneRankings.maxResults) {
            return;
        }
        htmlToAppend += `          
        <li tabindex="0" data-index=${i}>
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
};

warplaneRankings.setDetails = function(index) {
    const $planeDetails = warplaneRankings.$modal.find('.warplaneDetails');

    const htmlString = `
        <div class="pictureAndText">
            <div class="planePicture">
                <img src="${warplaneRankings.planeResults[index].images.large}" alt="${warplaneRankings.planeResults[index].name}"> <!-- plane image goes here-->
            </div>
            <div class="planeDescription">
                <h3>${warplaneRankings.planeResults[index].name}</h3>
                <p>${warplaneRankings.planeResults[index].description}</p>
            </div>
        </div>
        <div class="planeStats">
            <h3>Stats</h3>
            <ul>
                
            </ul>
        </div>
        `;

        $planeDetails.html(htmlString);

        // variable that holds the HTML for the stats
        let statString = '';

        // Generates blocks and assigns contents based on the options available to user
        $('#stats option').each(function() {
            statString += `
                <li>
                    <h4>${$(this).text()}</h4>
                    <p>${warplaneRankings.planeResults[index].features[$(this).val()]}</p>
                </li>
            `;
        });

        $('.planeStats ul').html(statString);

        // adds appropriate suffix to the stat numbers
        $('h4:contains("Fire Power")').next().append(' DPS');
        $('h4:contains("Max Speed")').next().append(' km/h');
        $('h4:contains("Weight")').next().append(' kg');
}

// Add event listeners to results
warplaneRankings.addListeners = function(element) {
    element.on('click', function() {
        warplaneRankings.$modal.addClass('isOpen');

        // sets modal information using index of the result clicked
        warplaneRankings.previousIndex = parseInt($(this).attr('data-index'));
        warplaneRankings.setDetails(warplaneRankings.previousIndex);
    });
};

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
    }).catch(function(error) {
        let htmlToAppend = `    
            <p class="errorNote">Your inquiry was not found.</p>
        `;

        $('.warplanesContainer').html(htmlToAppend);
    });
};

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
};

warplaneRankings.init = function () {
    warplaneRankings.$modal = $('.modal');
    warplaneRankings.$exit = $('.exit');

    const usingKeyboard = function(e) {
        if(warplaneRankings.$modal.hasClass('isOpen')) {
            if(e.keyCode === 9){
                warplaneRankings.$exit.focus();
            }
        } else if ($('.warplanesContainer li').is(':focus') && e.keyCode === 13) {
            warplaneRankings.previousIndex = parseInt($(':focus').attr('data-index'));
            warplaneRankings.setDetails(warplaneRankings.previousIndex);
            warplaneRankings.$modal.addClass('isOpen');
        } else if ($('label').is(':focus') && e.keyCode === 13) {
            const $id = $(':focus').attr('for');
            $(`#${$id}`).prop('checked',true);
        }
    }

    $(window).keydown(usingKeyboard);

    $('form').on('submit', function(e) {
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
            warplaneRankings.addListeners($('.warplanesContainer li'));
        }
    });

    // temporary for testing: hides modal when clicked
    warplaneRankings.$modal.on('click', function() {
        $(this).removeClass('isOpen');
        // warplaneRankings.modalOpen = false;
    });

    warplaneRankings.$modal.on('transitionend', function() {
        console.log("transition ended");
        warplaneRankings.$exit.focus();
    });

    warplaneRankings.$exit.on('click', function() {
        warplaneRankings.$modal.removeClass('isOpen');
        $(`li[data-index=${warplaneRankings.previousIndex}]`).focus();
    });
}

$(function () {
    warplaneRankings.init();
});

