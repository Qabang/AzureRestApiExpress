async function sendEmail(e) {
    e.preventDefault(); 
    let htmlbody = document.querySelector("#list-wrapper")
    let stringBody =`<html>
                        <head>
                            <meta http-equiv="Content-Type" content="text/html" charset="utf-8"/>
                            <title></title>   
                        </head>
                        <body>`
    stringBody += htmlbody.innerHTML;
    stringBody += "</body>";

    let input = document.querySelector("#htmlbody")
    input.value = stringBody

    e.target.submit();
}

