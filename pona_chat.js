
function compute_df(dic, qas){
    const df = new Array(dic.length).fill(0)
    qas.forEach(qa => {
        const qwords = new Set(qa.q.split(/\s+/).filter(Boolean));
        for(qword of qwords){
            var idx = dic.indexOf(qword);
            if(idx != -1) df[idx]++;
        }
    })
    return df;
}

function compute_idf(dfvec, qas){
    const N = qas.length;
    return dfvec.map(df => {
        return Math.log10(N/df);
    });
}

function compute_tf(dic, q){
    const tf = new Array(dic.length).fill(0)
    const qwords = q.split(/\s+/).filter(Boolean);
    qwords.forEach(qword => {
        const idx = dic.indexOf(qword);
        if(idx != -1) tf[idx]++;
    })
    return tf;
}

function add_tf_to_qas(tfs, qas){
    return qas.map((qa, i) => {
        qa.tfs = tfs[i];
        return qa;
    })
}

function add_tf_idf_to_qas(idfs, qas_with_tfs){
    return qas_with_tfs.map(qa => {
        qa.tf_idfs = qa.tfs.map((tf, i) => tf * idfs[i]);
        return qa;
    });
}

function vec_sumsq(vec){
    var sum = 0;
    vec.forEach(element => {
        sum += element*element;
    })
    return sum;
}

function vec_inner_product(vec1, vec2){
    if(vec1.length !== vec2.length) return false;
    var inner_product = 0;
    for(var i = 0; i < vec1.length; i++) inner_product += vec1[i]*vec2[i];
    return inner_product;
}

function cosine_similarity(vec1, vec2){
    return vec_inner_product(vec1, vec2) / (Math.sqrt(vec_sumsq(vec1))*Math.sqrt(vec_sumsq(vec2)))
}

function max_cosine_similarity_index(dic, idf, qas, your_q){
    const your_tfs = compute_tf(dic, your_q);
    const your_tf_idfs = your_tfs.map((tf, i) => tf * idf[i]);
    
    let max_index = 0;
    let max_cosine = -1;
    for(let i = 0; i < qas.length; i++){
        let current_cosine = cosine_similarity(qas[i].tf_idfs, your_tf_idfs);
        if(current_cosine > max_cosine){
            max_cosine = current_cosine;
            max_index = i;
        }
    }
    console.log(max_cosine);
    return max_index;
}

const dic = ["what", "is", "your", "name", "where", "do", "you", "live"];

const qas = [
    {q: "what is your name", a: "My name is GPT."},
    {q: "where do you live", a: "On the internet."}
];

const df = compute_df(dic, qas);
const idf = compute_idf(df, qas);
const tfs = qas.map(qa => compute_tf(dic, qa.q));
const qas_with_tfs = add_tf_to_qas(tfs, qas);
const qas_with_tf_idf = add_tf_idf_to_qas(idf, qas_with_tfs);

console.log(JSON.stringify(qas_with_tf_idf, null, 2));

var dictest = 0;

window.onload = function(){
    fetch('./tokipona_qas.csv')
        .then(response => response.text())
        .then(csvText => {
            const results = Papa.parse(csvText, {
                header: true,
                skipEmptyLinrs: true,
            });
            dictest = results.data;
            console.log("parsed csv data:", dictest[0].a);
        })
        .catch(error => {
            console.error('error loading csv', error);
        });
}
