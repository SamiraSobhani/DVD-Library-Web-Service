$(document).ready(function () {
    loadDVDs();
    $('#confirmationAlert').hide();
    updateDVD();
});

function loadDVDs() {
    $('#errorMessages').empty();
    clearLoadTable();
    var DVDdetails = $('#DVDdetails');

    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvds',
        success: function (DVDsArray) {
            $.each(DVDsArray, function (index, DVD) {
                var title = DVD.title;
                var releaseDate = DVD.releaseYear;
                var director = DVD.director;
                var rate = DVD.rating;
                var DVDId = DVD.id;

                var row = '<tr class="text-center">';
                row += '<td >' + '<a onclick="showDetails(' + DVDId + ')" href="#">' + `${title}` + '</a>' + '</td>';
                row += '<td>' + releaseDate + '</td>';
                row += '<td>' + director + '</td>';
                row += '<td>' + rate + '</td>';
                row += '<td>' + '<a onclick="showEditForm(' + DVDId + ')" href="#">Edit</a>' + ' | ' + '<a onclick="deleteDVD(' + DVDId + ')" href="#">Delete</a>' + '</td>';
                row += '</tr>'

                DVDdetails.append(row);
                $('#showDetails').hide();
                $('#EditDVD').hide();
                $('#creatFormDiv').hide();
                $('#searchDiv').hide();
                $('#mainPage').show();

            })
        },
        error: function () {
            $('.errorMessages')
                .append($('<li>')
                    .attr({class: 'list-group-item list-group-item-danger'})
                    .text('Error calling web service. Please try again later.'));
        }

    })
}

function showEditForm(DVDId) {
    hideEditForm();
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvd/' + DVDId,
        success: function (DVD, status) {
            $('#reqTitle').append(DVD.title);
            $('#editTitle').val(DVD.title);
            $('#editDirector').val(DVD.director);
            $('#editReleaseYear').val(DVD.releaseYear);
            $('#editRating').val(DVD.rating);
            $('#editNote').val(DVD.notes);
            $('#editDVDId').val(DVD.id);
            $('#mainPage').hide();
            $('#EditDVD').show();
            $('.errorMessages').empty();
            $('#validateEditYear').empty();
        },
        error: function () {
            $('.errorMessages')
                .append($('<li>')
                    .attr({class: 'list-group-item list-group-item-danger'})
                    .text('Error calling web service. Please try again later.'));
        }
    })
}

function searchDVD() {
    validateSearch();
    validateYear();
    var searchResult = $('#searchResult');
    var haveValidationErrors = checkAndDisplayValidationErrors($('#mainPage').find('input'));

    if (haveValidationErrors) {
        return false;
    }
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvds/' + $('#searchCategory').val() + '/' + $('#searchTerm').val(),
        success: function (DVDsArray) {
            $.each(DVDsArray, function (index, DVD) {
                var title = DVD.title;
                var releaseDate = DVD.releaseYear;
                var director = DVD.director;
                var rate = DVD.rating;
                var DVDId = DVD.id;
                var notes = DVD.notes;

                var row = '<tr class="text-center">';
                row += '<td>' + title + '</td>';
                row += '<td>' + releaseDate + '</td>';
                row += '<td>' + director + '</td>';
                row += '<td>' + rate + '</td>';
                row += '<td>' + notes + '</td>';
                row += '</tr>'

                searchResult.append(row);
                $('#mainPage').hide();
                $('#searchDiv').show();
            })
        },
        error: function () {
            $('.errorMessages')
                .append($('<li>')
                    .attr({class: 'list-group-item list-group-item-danger'})
                    .text('Error calling web service. Please try again later!!'));

        }
    })
}

function updateDVD(DVDId) {
    $('#saveChanges').click(function (event) {
        validateEditYear();
        validateEditTitle();
        var haveValidationErrors = checkAndDisplayValidationErrors($('#editForm').find('input'));

        if (haveValidationErrors) {
            return false;
        }
        $.ajax({
            type: 'PUT',
            url: 'https://tsg-dvds.herokuapp.com/dvd/' + $('#editDVDId').val(),
            data: JSON.stringify({
                id: $('#editDVDId').val(),
                title: $('#editTitle').val(),
                releaseYear: $('#editReleaseYear').val(),
                director: $('#editDirector').val(),
                rating: $('#editRating').val(),
                notes: $('#editNote').val(),
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function () {
                $('#EditDVD').hide();
                $('#errorMessages').empty();
                loadDVDs();
            },
            error: function () {
                $('.errorMessages')
                    .append($('<li>')
                        .attr({class: 'list-group-item list-group-item-danger'})
                        .text('Error calling web service. Please try again later...'))
            }
        })
    })
}

function createDVD() {
    $('.errorMessages').val('');
    var haveValidationErrors = checkAndDisplayValidationErrors($('#creatForm').find('input'));

    if (haveValidationErrors) {
        return false;
    }
    $.ajax({
        type: 'POST',
        url: 'https://tsg-dvds.herokuapp.com/dvd',
        data: JSON.stringify({
            title: $('#creatTitle').val(),
            releaseYear: $('#creatReleaseYear').val(),
            director: $('#creatDirector').val(),
            rating: $('#creatRating').val(),
            notes: $('#creatNote').val(),
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'dataType': 'json',
        success: function () {

            $('#creatTitle').val('');
            $('#creatReleaseYear').val('');
            $('#creatDirector').val('');
            $('#creatRating').val('');
            $('#creatNote').val('');
            $('.errorMessages').val('');
            loadDVDs();
        },
        error: function () {

            if ($('#creatTitle'.val().length == 0)) {
                $('.errorMessages')
                    .append($('<li>')
                        .attr({class: 'list-group-item list-group-item-danger'})
                        .text('Please enter a title for the DVD'));

            }
            if ($('#creatReleaseYear'.val().length == 0)) {
                $('.errorMessages')
                    .append($('<li>')
                        .attr({class: 'list-group-item list-group-item-danger'})
                        .text('Please enter a release year for the DVD'));

            } else
                $('.errorMessages')
                    .append($('<li>')
                        .attr({class: 'list-group-item list-group-item-danger'})
                        .text('Error calling web service. Please try again later'));
        }
    })
}

function deleteDVD(DVDId) {
    if (confirm('Are you sure you want to delete this Dvd from?')) {
        $.ajax({
            type: 'DELETE',
            url: 'https://tsg-dvds.herokuapp.com/dvd/' + DVDId,
            success: function () {

                loadDVDs();
            }
        })
    } else {
        return false;
    }
}

function showDetails(DVDId) {
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvd/' + DVDId,
        success: function (DVD, status) {
            $('#DVDTitle').append(DVD.title);
            $('#releaseYear').append(DVD.releaseYear);
            $('#director').append(DVD.director);
            $('#rating').append(DVD.rating);
            $('#note').append(DVD.notes);
            $('#mainPage').hide();
            $('#showDetails').show();

        },
        error: function () {
            $('.errorMessages')
                .append($('<li>')
                    .attr({class: 'list-group-item list-group-item-danger'})
                    .text('Error calling web service. Please try again later!!!!.'));
        }
    })
}

function validateYear() {
    if ($('#searchCategory').val() === 'year') {
        var year = $('#searchTerm')
        if (!/^\d{4}$/.test(year)) {
            $('#yearValidationError').append($('<li>').attr({class: 'list-group-item-danger'}).text('please enter 4 digit year!'));

        }
    }
}

function validateEditYear() {
    var year = $('#editReleaseYear').val()
    if (!/^\d{4}$/.test(year)) {
        $('#validateEditYear').append($('<li>').attr({class: 'list-group-item-danger'}).text('please enter 4 digit year!'));
        xhr.abort();
        showEditForm();
    }
}

function validateEditTitle() {
    var title = $('#editTitle').val();
    if (title === '') {
        $('#validateEditYear').append($('<li>').attr({class: 'list-group-item-danger'}).text('please enter a title for the DVD!'));
        xhr.abort();
    }
}

function validateSearch() {
    if ($('#searchCategory').val() !== '0' || $('#searchTerm') === '') {
        $('#validationError').append($('<li>').attr({class: 'list-group-item-danger'}).text('Both search category and search term are required.'));
    }
}

function showCreateForm() {
    $('#creatFormDiv').show();
    $('#mainPage').hide();
    $('.errorMessages').empty();
}

function hideDetails() {
    $('#DVDTitle').empty();
    $('#releaseYear').empty();
    $('#director').empty();
    $('#rating').empty();
    $('#note').empty();
    $('#mainPage').show();
    $('#showDetails').hide();
}

function clearLoadTable() {
    $('#DVDdetails').empty();
}

function hideSearchForm() {
    $('#validationError').empty();
    $('.errorMessages').empty();
    $('#searchResult').empty()
    $('#searchDiv').hide();
    $('#searchCategory').show();
    $('#searchTerm').val('');
    $('#mainPage').show();
}

function hideEditForm() {
    $('.errorMessages').empty();
    $('#reqTitle').empty();
    $('#editTitle').val('');
    $('#editReleaseYear').val('');
    $('#editDirector').val('');
    $('#editRating').val('');
    $('#editNote').val('');
}

function hideCreatForm() {
    $('#errorMessages').empty();
    $('#mainPage').show();
    $('#creatFormDiv').hide();
    $('#creatTitle').val('');
    $('#creatReleaseYear').val('');
    $('#creatDirector').val('');
    $('#creatRating').val('');
    $('#creatNote').val('');
}

function checkAndDisplayValidationErrors(input) {
    $('.errorMessages').empty();

    var errorMessages = [];

    input.each(function () {
        if (!this.validity.valid) {
            var errorField = $('label[for=' + this.id + ']').text();
            errorMessages.push(errorField + ' ' + this.validationMessage);
        }
    });
    if (errorMessages.length > 0) {
        $.each(errorMessages, function (index, message) {
            $('.errorMessages').append($('<li>').attr({class: 'list-group-item list-group-item-danger'}).text(message));
        });
        // return true, indicating that there were errors
        return true;
    } else {
        // return false, indicating that there were no errors
        return false;
    }
}
