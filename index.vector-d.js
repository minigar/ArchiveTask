function upload() {
  const Crawler = require("crawler")

var fs = require('fs'),
    request = require('request');

var url = require("url");
var path = require("path");

var fs = require('fs');
var array = fs.readFileSync('file.txt').toString().split("\n").filter((val) => val !== '');
console.log(array);
var download = function(uri, filename, prefix, callback){
  request.head(uri, function(err, res, body){
    var p = path.join(__dirname, 'download', prefix);
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
              // const images = res.$('img[src*="/media/catalog/product/"]')
              const images = res.$('a[href*="/media/catalog/product/cache/4/image"]')
              const srcs = Array.from(images.map(index =>  images[index].attribs.href));
              console.log(srcs);

              srcs
                // .filter(item => !String(item).includes('thumbnail'))
                // .map(item => String(item).replace(/thumbnail\/[0-9]+x[0-9]*\//, 'image/'))
                .forEach((src) => {
                  // console.log(src);
                  var parsed = url.parse(src);

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