function upload() {
  const Crawler = require("crawler")

const fs = require('fs'),
    request = require('request');

const url = require("url");
const path = require("path");

const array = fs.readFileSync('file.txt').toString().split("\n").filter((val) => val !== '');
console.log(array);
const download = function(uri, filename, prefix, callback){
  request.head(uri, function(err, res, body){
    const p = path.join(__dirname, 'download', prefix);
    console.log(p);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
    request(uri).pipe(fs.createWriteStream(p + '/' + filename)).on('close', callback);
  });
};

array.forEach((item) => {
    const c = new Crawler({
      callback: function(error, res, done) {
          if (error) {
              console.error(error)
          } else {
              const images = res.$('a[href*="/media/catalog/product/cache/4/image"]')
              const srcs = Array.from(images.map(index =>  images[index].attribs.href));
              console.log(srcs);

              srcs
                .forEach((src) => {
                  const parsed = url.parse(src);

                  console.log(path.basename(item));

                  download(src, path.basename(parsed.pathname), path.basename(item), function(){
                    console.log(path.basename(parsed.pathname) + ' ---- done');
                  });

                });

          }
      }
  })

  c.queue(item)
  delete c;
});
}

module.exports = {
  upload
}