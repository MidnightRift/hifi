ERRORS = [
    {code: 1, text: "No numbers left in number pool"},
    {code: 2, text: "requested function does not exist."},
    {code: 3, text: "Bingo Number is out of range"}
];

function responder(data, json) {

    if (data.error) {
        print(JSON.stringify(data.error));
        if (!json) data = data.error.text;
    }
    if (json && data.string) {
        delete data.string;
        return JSON.stringify(data);
    }
    return data;
}


module.exports = {
    ERRORS: ERRORS,
    responder: responder
};