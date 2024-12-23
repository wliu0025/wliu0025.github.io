// const fees = {
//     'Golden-30mins': { fee: 160, roomFee: 50, girlFee: 110, duration: 30 },
//     'Diamond-30mins': { fee: 170, roomFee: 50, girlFee: 120, duration: 30 },
//     'Diamond-45mins': { fee: 240, roomFee: 70, girlFee: 170, duration: 45 },
//     'Diamond-1hr': { fee: 280, roomFee: 70, girlFee: 210, duration: 60 },
//     'Dragon-1hr': { fee: 310, roomFee: 80, girlFee: 240, duration: 60 },
// };

// render the jobs list
function loadSessions() {
    const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
    $('#sessionTable').empty();
    sessions.forEach((session, index) => {
        const countdownId = `countdown-${index}`;
        $('#sessionTable').append(`
            <tr class="${session.isFinish ? 'table-success' : ''}">
                <td>${index + 1}</td>
                <td>${session.girl}</td>
                <td>${session.duration}</td>
                <td>${session.room}</td>
                <td><span class="${session.payment == 'card' || session.payment == 'cash_card' ? 'badge text-bg-warning' : ''}">${session.payment}</span></td>
                
                <td>${session.fee}</td>
                <td>${session.cashAmount== 0 ? '':session.cashAmount}</td>
                <td>${session.cardAmount == 0 ? '':session.cardAmount}</td>

                <td>${session.roomFee}</td>
                <td>${session.girlFee}</td>

                <td>${session.startTime}</td>
                <td>${session.endTime}</td>
                <td class="countdown green" id="${countdownId}" data-time="${session.remainingSeconds}">
                    ${session.remainingSeconds > 0 ? Math.floor(session.remainingSeconds / 60) + ':' + session.remainingSeconds % 60 : ''}
                </td>
                
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                    <button class="btn btn-success btn-sm finish-btn" data-index="${index}">Finish</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
                </td>
            </tr>
        `);
        startCountdown(countdownId);
    });
    updateReport();
}

function startCountdown(id) {
    const $countdown = $(`#${id}`);
    let remainingSeconds = parseInt($countdown.data('time'));
    

    const interval = setInterval(() => {
        const sessions = JSON.parse(sessionStorage.getItem('sessions'));
        const index = id.split('-')[1];

        if (remainingSeconds <= 0) {
            if(!sessions[index].isFinish) $countdown.text('0:00').removeClass('green yellow').addClass('red');
            
            // when countdown becomes 0, auto disappear and mark green
            // $countdown.text('')
            // $countdown.parent().addClass('table-success');
            // $('#alertSound')[0].play();
            clearInterval(interval);
            return;
        }
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        $countdown.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        if (remainingSeconds <= 5 * 60 && !$countdown.hasClass('yellow')) {
            $countdown.removeClass('green').addClass('yellow');
        }
        remainingSeconds--;
        $countdown.data('time', remainingSeconds);

        // Save updated countdown to sessionStorage
        sessions[index].remainingSeconds = remainingSeconds;
        sessionStorage.setItem('sessions', JSON.stringify(sessions));
    }, 1000);

    // Store interval ID to allow stopping later
    $countdown.data('interval-id', interval);
}

function addSession() {
    const girl = $('#girl').val();
    const duration = $('#duration').val();
    const room = $('#room').val();
    const payment = $('#payment').val();
    const isFinish = false;
    const discount = $('#discount').val() || 0;
    let cashAmount=0;
    let cardAmount=0;

    if (!girl || !duration || !room || !payment) return alert('Please fill girl,duration,room,payment fields.');

    const fees = getFeesFromLocalStorage();
    const feeData = fees[duration];
    if(payment=='cash') cashAmount=feeData.fee-discount;
    else if(payment=='card') cardAmount=feeData.fee-discount;
    else if(payment=='cash_card'){
        cashAmount=$('#cashAmount').val()
        cardAmount=$('#cardAmount').val()
    }
    const currentTime = new Date();
    const startTime = currentTime.toLocaleTimeString(); // Format Start Time
    const endTime = new Date(currentTime.getTime() + feeData.duration * 60 * 1000).toLocaleTimeString(); // Calculate End Time


    const session = {
        girl,
        duration,
        room,
        payment,
        fee: feeData.fee-discount,
        discount: parseInt(discount),
        roomFee: feeData.roomFee-discount/2,
        girlFee: feeData.girlFee-discount/2,
        startTime,
        endTime,
        remainingSeconds: feeData.duration * 60,
        isFinish,
        cashAmount,
        cardAmount
    };
    
    const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
    sessions.push(session);
    sessionStorage.setItem('sessions', JSON.stringify(sessions));
    loadSessions();
}

function updateReport() {
    const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
    let totalCashInHand = 0, totalPaidCards = 0 ,totalGirlsSalaries = 0,totalHouseProfits=0;
    const salaries = {};
    sessions.forEach(session => {
        totalCashInHand += parseInt(session.cashAmount);
        totalPaidCards += parseInt(session.cardAmount);
        totalGirlsSalaries += parseInt(session.girlFee);
        totalHouseProfits += parseInt(session.roomFee);
        salaries[session.girl] = parseInt(salaries[session.girl] || 0) + parseInt(session.girlFee);
    });
    $('#totalCash').text(`$${totalCashInHand} (不包含备用金)`);
    $('#totalCard').text("$"+totalPaidCards);
    $('#totalSalaries').text("$"+totalGirlsSalaries);
    let remainingBalance=totalCashInHand - totalGirlsSalaries
    $('#remainingBalance').text(`$${remainingBalance} (不包含备用金)`);
    // $('#roomEarnings').text(`$${totalCashInHand - totalGirlsSalaries + totalPaidCards} (包含接线工资)`);
    $('#roomEarnings').text(`$${totalHouseProfits} (包含接线工资)`);

    $('#salaryTable').empty();
    for (const [girl, salary] of Object.entries(salaries)) {
        $('#salaryTable').append(`<tr><td>${girl}</td><td>${salary}</td></tr>`);
    }
}


$(document).ready(() => {
    // Initial load
    loadSessions();
    loadGirls(); 
    loadServices();

    // manage services
    $('#addService').on('click', addService);

    $(document).on('click', '.delete-service', function () {
        const index = $(this).data('index');
        deleteService(index);
    });

    $(document).on('click', '.edit-service', function () {
        const index = $(this).data('index');
        editService(index);
    });

    $('#saveEditService').on('click', saveEditService);



    // manage girls
    $('#addGirl').on('click', addGirl);

    $(document).on('click', '.delete-girl', function () {
        const index = $(this).data('index');
        deleteGirl(index);
    });


    // Payment method
    $('#payment').on('change', function () {
        if ($(this).val() === 'cash_card') {
            $('.multipay').each(function(){
                $(this).removeClass('d-none')
            })
        }else{
            $('.multipay').addClass('d-none')  
          
        }
    });


    // 1.Add a job
    $('#addSession').on('click', addSession);
    // 2.Delete a job
    $(document).on('click', '.delete-btn', function () {
        if(!confirm("要删除这个工吗?")) return;
        const index = $(this).data('index')
        const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
        sessions.splice(index, 1);
        sessionStorage.setItem('sessions', JSON.stringify(sessions));
        loadSessions();
    });
    // 3.1 Edit a job
    $(document).on('click', '.edit-btn', function () {
        const index = $(this).data('index');
        const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
        const session = sessions[index];

        $('#editGirl').val(session.girl);
        $('#editDuration').val(session.duration);
        $('#editRoom').val(session.room);
        $('#editPayment').val(session.payment);
        $('#editIndex').val(index);
        $('#editDiscount').val(session.discount);
        $('#editCashAmount').val(session.cashAmount);
        $('#editCardAmount').val(session.cardAmount);
    });

    // 3.2 Click "Save" button on edit model
    $('#saveEdit').on('click', function () {
        const index = $('#editIndex').val();
        const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
        const session = sessions[index];

        const newDuration = $('#editDuration').val();

        const fees = getFeesFromLocalStorage();
        const feeData = fees[newDuration];

        session.girl = $('#editGirl').val();
        session.duration = newDuration;
        session.room = $('#editRoom').val();
        session.payment = $('#editPayment').val();
        session.discount=$('#editDiscount').val();
        session.fee = feeData.fee-session.discount;
        session.roomFee = feeData.roomFee-session.discount/2;
        session.girlFee = feeData.girlFee-session.discount/2;
        session.remainingSeconds = feeData.duration * 60;
        session.cashAmount=$('#editCashAmount').val();
        session.cardAmount=$('#editCardAmount').val();
        sessions[index] = session;
        sessionStorage.setItem('sessions', JSON.stringify(sessions));
        $('#editModal').modal('hide');
        loadSessions();
    });

    // 4. Click "Finish" button
    //为后续添加事件
    $(document).on('click', '.finish-btn',function () {
        const index = $(this).data('index');
        const sessions = JSON.parse(sessionStorage.getItem('sessions')) || [];
        const session = sessions[index];
        if (!session) return;

        // Set countdown to empty,and mark this job(row) as green
        const countdownId = `countdown-${index}`;
        const $countdown = $(`#${countdownId}`);
        $countdown.text('')
        $countdown.parent().addClass('table-success');
        // Optionally, update the session's remainingSeconds in sessionStorage
        session.remainingSeconds = 0;
        session.isFinish = true;
        sessionStorage.setItem('sessions', JSON.stringify(sessions));

        // Stop the countdown
        clearInterval($countdown.data('interval-id'));

        // loadSessions();

    });


});