export async function importImage(url) {
    return new Promise(function (resolve, reject) {

        const img = new Image();
        img.onload = function() {
            resolve(img);
        }
        img.onerror = function() {
            reject(img);
        }

        img.src = url;

    });
}
