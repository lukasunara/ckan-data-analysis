var spinner = document.getElementById('spinner');
spinner.style.display = 'none';

// update selected analysis
var updateAnalysis = async () => {
    let confirmed = confirm('Depending on the amount of data given for analysis, this might take up to 30 minutes,'
        + 'maybe even an hour or more.\nBut, datasets and resources can be analysed in a few seconds.\n'
        + 'Are you sure you want to start a new analysis?'
    );
    if (confirmed) {
        debugger;
        spinner.style.display = 'inline-block'

        let urlForUpdate = document.getElementById('urlForUpdate').dataset.test;
        await fetch(urlForUpdate);

        location.reload();
        spinner.style.display = 'none'
    }
};

window.onload = () => {
    document.getElementById('updateBtn').onclick = updateAnalysis;
}