var express = require('express');
const got = require('got');
const config = require('../configs/config');

/**
 * 
 * @param {Number} numb 
 * @param {String} filter 
 * @returns 
 */
async function getBlogs (numb, filter) {
    let data = null;
    try {
        data = apiBlog(`${config.acl}/posts?${filter}&_limit=${numb}`)
    } catch (error) {
        console.log(error);
    }

    return data;
}

function apiBlog(url) {
    return new Promise ((resolve, reject) => {
        got.get(url).then(res => {
            const responseBody = res.body;
            if (responseBody && responseBody.length) {
                resolve(responseBody);
            } else {
                resolve([]); // empty array
            }
        }, error => {
            reject (error.body);
        })
    })
}

function getAllCategories () {
    return new Promise ((resolve, reject) => {
        got.get(`${config.acl}/categories`).then(res => {
            let responseBody = res.body;
            if (responseBody && responseBody.length) {
                responseBody = JSON.parse(responseBody);
                for(let i = 0; i < responseBody.length ; i++ ) {
                    const cat = responseBody[i];
                    const rgba = hexToRgb(cat.colorCode);
                    responseBody[i].rgba = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
                }
                resolve (responseBody);
            } else {
                resolve([]);
            }
        }, error => {
            reject (error.body);
        })
    })
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: .25
    } : null;
  }

exports.getBlogs = getBlogs;
exports.getAllCategories = getAllCategories;