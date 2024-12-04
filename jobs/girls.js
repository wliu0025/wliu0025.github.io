// Load girls from localStorage and render to the dropdown and list
function loadGirls() {
    const girls = JSON.parse(localStorage.getItem('girls')) || [];
    $('#girl').empty().append('<option value="">Select</option>');
    $('#editGirl').empty().append('<option value="">Select</option>');
    $('#girlsList').empty();

    girls.forEach((girl, index) => {
        // Populate dropdown
        $('#girl').append(`<option value="${girl}">${girl}</option>`);
        $('#editGirl').append(`<option value="${girl}">${girl}</option>`);

        // Populate girls list
        $('#girlsList').append(`
            <tr>
                <td>${index + 1}</td>
                <td>${girl}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-girl" data-index="${index}">Delete</button>
                </td>
            </tr>
        `);
    });
}

// Add a new girl
function addGirl() {
    const newGirl = $('#newGirlName').val().trim();
    if (!newGirl) {
        alert('Please enter a valid name.');
        return;
    }

    const girls = JSON.parse(localStorage.getItem('girls')) || [];
    if (girls.includes(newGirl)) {
        alert('This girl is already in the list.');
        return;
    }

    girls.push(newGirl);
    localStorage.setItem('girls', JSON.stringify(girls));
    $('#newGirlName').val(''); // Clear input field
    loadGirls(); // Re-render
}

// Delete a girl
function deleteGirl(index) {
    const girls = JSON.parse(localStorage.getItem('girls')) || [];
    girls.splice(index, 1);
    localStorage.setItem('girls', JSON.stringify(girls));
    loadGirls(); // Re-render
}