function functionone(param){
    console.log(param)
}

function functiontwo(param){
    console.log(10)
    return 10;
}

functionone(functiontwo);