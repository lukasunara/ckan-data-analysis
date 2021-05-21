document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementById('main').style.display = "hidden";
    } else if (state == 'complete') {
        setTimeout(function () {
            document.getElementById('spinner').style.display = "none";
            document.getElementById('main').style.visibility = "visible";
        }, 1000);
    }
}