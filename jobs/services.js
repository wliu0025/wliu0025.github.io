function getFeesFromLocalStorage() {
    // Fetch services from localStorage
    const services = JSON.parse(localStorage.getItem('services')) || [];

    // Transform the services array into a fees object
    const fees = services.reduce((acc, service) => {
        acc[service.name] = {
            fee: service.fee,
            roomFee: service.roomFee,
            girlFee: service.girlFee,
            duration: service.duration,
        };
        return acc;
    }, {});

    return fees;
}


// Load services from localStorage and render to dropdown and table
function loadServices() {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    $('#duration').empty().append('<option value="">Select</option>');
    $('#editDuration').empty().append('<option value="">Select</option>');
    $('#servicesList').empty();

    services.forEach((service, index) => {
        // Populate dropdown
        $('#duration').append(`<option value="${service.name}">${service.name}</option>`);
        $('#editDuration').append(`<option value="${service.name}">${service.name}</option>`);

        // Populate services list
        $('#servicesList').append(`
            <tr>
                <td>${index + 1}</td>
                <td>${service.name}</td>
                <td>${service.fee}</td>
                <td>${service.roomFee}</td>
                <td>${service.girlFee}</td>
                <td>${service.duration}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-service" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-service" data-index="${index}">Delete</button>
                </td>
            </tr>
        `);
    });
}

// Add a new service
function addService() {
    const name = $('#serviceName').val().trim();
    const fee = parseInt($('#fee').val());
    const roomFee = parseInt($('#roomFee').val());
    const girlFee = parseInt($('#girlFee').val());
    const duration = parseInt($('#serviceTime').val());

    if (!name || isNaN(fee) || isNaN(roomFee) || isNaN(girlFee) || isNaN(duration)) {
        alert('Please fill all fields.');
        return;
    }

    const services = JSON.parse(localStorage.getItem('services')) || [];
    services.push({ name, fee, roomFee, girlFee, duration });
    localStorage.setItem('services', JSON.stringify(services));
    $('#serviceForm')[0].reset(); // Clear the form
    loadServices();
}

// Delete a service
function deleteService(index) {
    if(!confirm("要删除这项服务吗?")) return;
    const services = JSON.parse(localStorage.getItem('services')) || [];
    services.splice(index, 1);
    localStorage.setItem('services', JSON.stringify(services));
    loadServices();
}

// Edit a service (populate modal with existing data)
function editService(index) {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const service = services[index];
    $('#editServiceIndex').val(index);
    $('#editServiceName').val(service.name);
    $('#editFee').val(service.fee);
    $('#editRoomFee').val(service.roomFee);
    $('#editGirlFee').val(service.girlFee);
    $('#editTime').val(service.duration);
    $('#editServiceModal').modal('show');
}

// Save edited service
function saveEditService() {
    const index = $('#editServiceIndex').val();
    const name = $('#editServiceName').val().trim();
    const fee = parseInt($('#editFee').val());
    const roomFee = parseInt($('#editRoomFee').val());
    const girlFee = parseInt($('#editGirlFee').val());
    const duration = parseInt($('#editTime').val());

    if (!name || isNaN(fee) || isNaN(roomFee) || isNaN(girlFee) || isNaN(duration)) {
        alert('Please fill all fields.');
        return;
    }

    const services = JSON.parse(localStorage.getItem('services')) || [];
    services[index] = { name, fee, roomFee, girlFee, duration };
    localStorage.setItem('services', JSON.stringify(services));
    $('#editServiceModal').modal('hide');
    loadServices();
}


