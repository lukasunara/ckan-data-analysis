const mime = require('mime-types');

// let extension = mime.extension('content-type');

var fetchData = async (url) => {
    let fetchedData;
    let fetchedError;

    await fetch(url)
        .then(handleResponse)
        .then(data => fetchedData = data)
        .catch(error => fetchedError = error);

    if (fetchedError) {
        // TODO: do something with fetched error
        console.log(fetchedError);
    } else {
        // TODO: do something with fetched data
        console.log(fetchedData);
    }
}

var handleResponse = (response) => {
    let contentType = response.headers.get('content-type');

    if (contentType.includes('application/json')) {
        return handleJSONResponse(response);
    } else if (contentType.includes('application/pdf')) {
        // it's bad to only have a pdf file
    } else if (contentType.includes('text/html')) {
        return handleTextResponse(response);
    } else if (contentType.includes('image/png') || contentType.includes('image/jpg')) {
        return handleImageResponse(response);
    } else {
        // Other response types as necessary. I haven't found a need for them yet though.
        throw new Error(`Sorry, content-type ${contentType} not supported`);
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
                return URL.createObjectURL(blob); // imageURL
            } else {
                return handleError(response);
            }
        });
}

module.exports = {
    fetchData
}