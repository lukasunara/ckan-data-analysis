const fetch = require('node-fetch');
const mime = require('mime-types');
const AbortController = require("abort-controller");

var fetchData = async (url, time) => {
    var fetchedData;
    var fetchedError;

    // console.log('URL: ' + url);

    const controller = new AbortController();
    const timeout = setTimeout(
        () => { controller.abort(); },
        time ? time : 8000,
    );

    await fetch(url, { signal: controller.signal })
        .then(handleResponse)
        .then(data => fetchedData = data)
        .catch(error => {
            fetchedError = error
            if (error.name === 'AbortError') {
                fetchedError.error = 'Aborted fetch!';
            }
        })
        .finally(() => {
            clearTimeout(timeout)
        });

    if (fetchedError) {
        return fetchedError;
    } else {
        // console.log(fetchedData.data + "\n");
        return fetchedData;
    }
}

// handle response of fetchData function
var handleResponse = async (response) => {
    let contentType = response.headers.get('content-type');
    let lastModified = response.headers.get('last-modified');
    let extension = mime.extension(contentType);

    // console.log('Content-Type: ' + contentType);
    // console.log('Last-Modified: ' + lastModified);

    var data;
    if (contentType.includes('application/json')) {
        data = await handleJSONResponse(response);
    } else if (extension == 'xls' || extension == 'xlsx') {
        data = await handleExcelResponse(response);
    } else if (extension == 'csv' || extension == 'xml') {
        data = await handleTextResponse(response);
    } else if (contentType.includes('image/')) {
        data = await handleImageResponse(response);
    } else {
        if (contentType.includes('application/vnd.ogc.se_xml')) {
            extension = 'wms';
        } else if (contentType.includes('application/x-qgis')) {
            extension = 'shp'; // or 'shx'
        }
        data = 'extension';
    }

    // console.log('Extension: ' + extension);

    return {
        data: data, // contains returned response data (undefined if error)
        status: {
            code: response.status, // status code of response
            text: response.statusText // status text of response
        },
        extension: extension, // extension of response data
        lastModified: lastModified // date when the response data was last modified
    }
}

// handle error response
var handleError = (response) => {
    return Promise.reject({
        error: true,
        status: response.status,  // status code of response
        statusText: response.statusText  // status text of response
    });
}

// handle response for content type json
var handleJSONResponse = (response) => {
    return response.json()
        .then(json => {
            if (response.ok) {
                return json;
            } else {
                return handleError(response);
            }
        });
}

// handle response for content type text
var handleTextResponse = (response) => {
    return response.text()
        .then(text => {
            if (response.ok) {
                return text;
            } else {
                return handleError(response);
            }
        });
}

// handle response for content type image
var handleImageResponse = (response) => {
    return response.blob()
        .then(blob => {
            if (response.ok) {
                return blob;
            } else {
                return handleError(response);
            }
        });
}

// handle response for content type xlsx/xls
var handleExcelResponse = (response) => {
    return response.arrayBuffer()
        .then(array => {
            if (response.ok) {
                return array;
            } else {
                return handleError(response);
            }
        });
}

// method for redirection when error occures
var redirectToWithError = (res, req, path) => {
    res.redirect(path);
}

module.exports = {
    fetchData,
    redirectToWithError
}