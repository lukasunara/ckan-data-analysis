const fetch = require('node-fetch');
const { URL } = require('url');
const mime = require('mime-types');

var fetchData = async (url) => {
    let fetchedData;
    let fetchedError;

    console.log(url);

    await fetch(url)
        .then(handleResponse)
        .then(data => fetchedData = data)
        .catch(error => fetchedError = error);

    if (fetchedError) {
        // TODO: do something with fetched error
        console.log(fetchedError.data + "\n");
        return fetchedError;
    } else {
        // TODO: do something with fetched data
        console.log(fetchedData.data + "\n");
        return fetchedData;
    }
}

var handleResponse = async (response) => {
    let contentType = response.headers.get('content-type');
    let extension = mime.extension(contentType);

    console.log(contentType);
    console.log(extension);

    var data;
    if (contentType.includes('application/json')) {
        data = await handleJSONResponse(response);
    } else if (extension == 'xls' || extension == 'xlsx') {
        data = await handleExcelResponse(response);
    } else if (contentType.includes('text/csv')) {
        data = await handleTextResponse(response);
    } else if (contentType.includes('image/')) {
        data = await handleImageResponse(response);
    } else if (contentType.includes('application/vnd.ogc.se_xml')) {
        extension = 'wms';
    } else {
        data = 'extension';
        // throw new Error(`Sorry, content-type ${contentType} is not supported.`);
    }

    return {
        data: data,
        status: {
            code: response.status,
            text: response.statusText
        },
        extension: extension
    }
}

// handles error response
var handleError = (response) => {
    return Promise.reject({
        status: response.status,
        statusText: response.statusText
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
                /*
                return Promise.reject(Object.assign({}, json, {
                    status: response.status,
                    statusText: response.statusText
                }));
                */
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

// handle response for content type json
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

// handle response for content type json
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

module.exports = {
    fetchData
}