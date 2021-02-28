import axios from 'axios'
import u from '../url';

function LoRoF( type, information) {
    let url;
    if(type === '注册'){
        url = `${ u }/R`;
    }
    else if(type==='登录'){
        url = `${ u }/L`;
    }
    else if(type==='忘记'){
        url = `${ u }/F`;
    }
    return axios.post(url,information)
}

function get_v(type,information) {
    let url = `${ u }/get_V`;
    return axios.post(url,information)
}



export { LoRoF, get_v }