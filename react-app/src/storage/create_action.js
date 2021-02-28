function login(data) {
    return {
        type : 'login',
        data
    }
}

function cet_4_update(data) {
    return {
        type : 'cet_4_update',
        data
    }
}

function cet_6_update(data) {
    return {
        type : 'cet_6_update',
        data
    }
}

function tem_4_update(data) {
    return {
        type : 'tem_4_update',
        data
    }
}

function tem_8_update(data) {
    return {
        type : 'tem_8_update',
        data
    }
}

export default { login
    , cet_4_update, cet_6_update, tem_4_update, tem_8_update
 }