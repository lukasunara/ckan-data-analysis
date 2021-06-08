const AnalysisResult = require('../../../models/data/AnalysisResult');

// update selected analysis
var updateAnalysis = async () => {
    debugger;
    let result = confirm('Depending on the amount of data given for analysis, this might take up to 30 minutes,'
        + 'maybe even an hour or more.\nBut, datasets and resources can be analysed in a few seconds.\n'
        + 'Are you sure you want to start a new analysis?'
    );
    if (result) {
        document.getElementById('spinner').style.display = 'visible';

        let result = JSON.parse(document.getElementById('typeOfObject').dataset.test);
        switch (result.typeOfObject) {
            case 'portal': await AnalysisResult.updateAnalysis(typeOfObject, result.portalName, result.id); break;
            case 'organization': await AnalysisResult.updateAnalysis(typeOfObject, result.portalName); break;
            case 'dataset': await AnalysisResult.updateAnalysis(typeOfObject, result.portalName, result.id); break;
            case 'resource': await AnalysisResult.updateAnalysis(typeOfObject, result.portalName, result.id); break;
            default: console.log('Cannot recognize given type of data: ' + result.typeOfObject);
        }
        location.reload();
    }
    document.getElementById('spinner').style.display = 'none';
};

document.getElementById('updateBtn').onclick = updateAnalysis();